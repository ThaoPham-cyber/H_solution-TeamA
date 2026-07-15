"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getClerkClient, getClerkErrorMessage } from "@/services/clerk-client";

const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Verification code states
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Bạn phải đồng ý với Điều khoản & Chính sách bảo mật!");
      return;
    }

    setIsLoading(true);

    if (!isClerkConfigured) {
      // Mock Mode — no Clerk keys configured
      setTimeout(() => {
        setIsLoading(false);
        router.push("/home");
      }, 1000);
      return;
    }

    try {
      const clerk = getClerkClient();
      if (!clerk?.client) {
        setErrorMessage("Clerk chưa sẵn sàng. Vui lòng thử lại!");
        setIsLoading(false);
        return;
      }

      // Format phone number to E.164 (+84...)
      let formattedPhone = phone.trim();
      if (/^\d+$/.test(formattedPhone) && formattedPhone.startsWith("0")) {
        formattedPhone = "+84" + formattedPhone.slice(1);
      }

      // Split full name into first and last name
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const signUp = clerk.client.signUp;
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        phoneNumber: formattedPhone || undefined,
      });

      // Send the email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      console.error("Clerk Signup Error:", err);
      setErrorMessage(getClerkErrorMessage(err, "Đăng ký thất bại. Vui lòng thử lại!"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const clerk = getClerkClient();
      if (!clerk?.client) {
        setErrorMessage("Clerk chưa sẵn sàng. Vui lòng thử lại!");
        setIsLoading(false);
        return;
      }

      const signUp = clerk.client.signUp;
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await clerk.setActive({ session: completeSignUp.createdSessionId });
        router.push("/home");
      } else {
        console.error("Clerk verification incomplete:", completeSignUp);
        setErrorMessage("Xác thực chưa hoàn tất. Vui lòng nhập đúng mã!");
      }
    } catch (err: unknown) {
      console.error("Clerk Verification Error:", err);
      setErrorMessage(getClerkErrorMessage(err, "Mã xác thực không hợp lệ hoặc đã hết hạn!"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = async (strategy: "oauth_google" | "oauth_apple") => {
    setErrorMessage("");

    if (!isClerkConfigured) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        router.push("/home");
      }, 1000);
      return;
    }

    try {
      const clerk = getClerkClient();
      if (!clerk?.client) return;

      await clerk.client.signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/home",
        redirectUrlComplete: "/home",
      });
    } catch (err: unknown) {
      console.error("Clerk Social Register Error:", err);
      setErrorMessage("Không thể kết nối với dịch vụ đăng ký bên thứ ba.");
    }
  };

  if (pendingVerification) {
    return (
      <div className="responsive-container bg-background text-on-background font-sans selection:bg-primary/20 selection:text-primary">
        <main className="responsive-card px-margin-mobile py-lg md:py-xl">
          {/* Header Branding */}
          <div className="flex flex-col items-center mb-lg text-center responsive-header">
            {/* Logo */}
            <div className="w-64 h-32 overflow-hidden flex items-center justify-center mb-xs -mt-sm relative">
              <img
                src="/logo.jpg"
                alt="H-solutions Logo"
                className="w-full h-full scale-[1.8] object-contain"
              />
            </div>
            <div className="space-y-xs">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Xác thực tài khoản
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-xs">
                Chúng tôi đã gửi mã xác nhận đến địa chỉ email: <strong className="text-primary">{email}</strong>. Vui lòng nhập mã để kích hoạt tài khoản.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-md p-sm bg-error-container text-on-error-container border border-error/20 rounded-xl text-xs font-semibold flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Verification Code Form */}
          <form className="space-y-md" onSubmit={handleVerify}>
            <div className="flex flex-col gap-xs">
              <label
                className="font-label-lg text-label-lg text-on-surface-variant ml-xs"
                htmlFor="code"
              >
                Mã xác nhận (Email Code)
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none">
                  vpn_key
                </span>
                <input
                  className="w-full h-[56px] pl-[52px] pr-md bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface transition-all placeholder:text-outline/70"
                  id="code"
                  placeholder="Nhập mã xác nhận của bạn"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            <button
              className="w-full h-[56px] bg-primary text-on-primary font-headline-md text-headline-md rounded-xl shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-base hover:bg-primary/95 mt-md cursor-pointer"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang xác thực..." : "Kích hoạt tài khoản"}
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="responsive-container bg-background text-on-background font-sans selection:bg-primary/20 selection:text-primary">
      <main className="responsive-card px-margin-mobile py-lg md:py-xl">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-lg text-center responsive-header">
          {/* Logo */}
          <div className="w-64 h-32 overflow-hidden flex items-center justify-center mb-xs -mt-sm relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="H-solutions Logo"
              className="w-full h-full scale-[1.8] object-contain"
            />
          </div>

          <div className="space-y-xs">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Đăng ký tài khoản
            </h2>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-md p-sm bg-error-container text-on-error-container border border-error/20 rounded-xl text-xs font-semibold flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Register Form */}
        <form className="space-y-md" onSubmit={handleSubmit}>
          {/* Row 1: Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            {/* Full Name Input */}
            <div className="flex flex-col gap-xs">
              <label
                className="font-label-lg text-label-lg text-on-surface-variant ml-xs"
                htmlFor="name"
              >
                Họ và tên
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none responsive-icon">
                  person
                </span>
                <input
                  className="w-full h-[56px] pl-[52px] pr-md bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface transition-all placeholder:text-outline/70 responsive-input"
                  id="name"
                  placeholder="Họ và tên"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="flex flex-col gap-xs">
              <label
                className="font-label-lg text-label-lg text-on-surface-variant ml-xs"
                htmlFor="phone"
              >
                Số điện thoại
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none responsive-icon">
                  phone
                </span>
                <input
                  className="w-full h-[56px] pl-[52px] pr-md bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface transition-all placeholder:text-outline/70 responsive-input"
                  id="phone"
                  placeholder="Số điện thoại"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-xs">
            <label
              className="font-label-lg text-label-lg text-on-surface-variant ml-xs"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none responsive-icon">
                mail
              </span>
              <input
                className="w-full h-[56px] pl-[52px] pr-md bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface transition-all placeholder:text-outline/70 responsive-input"
                id="email"
                placeholder="Nhập địa chỉ email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            {/* Password Input */}
            <div className="flex flex-col gap-xs">
              <label
                className="font-label-lg text-label-lg text-on-surface-variant ml-xs"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none responsive-icon">
                  lock
                </span>
                <input
                  className="w-full h-[56px] pl-[52px] pr-[52px] bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface transition-all placeholder:text-outline/70 responsive-input-password"
                  id="password"
                  placeholder="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors flex items-center justify-center w-10 h-10 rounded-full active:scale-90 responsive-eye-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="flex flex-col gap-xs">
              <label
                className="font-label-lg text-label-lg text-on-surface-variant ml-xs"
                htmlFor="confirmPassword"
              >
                Xác nhận
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none responsive-icon">
                  lock
                </span>
                <input
                  className="w-full h-[56px] pl-[52px] pr-[52px] bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface transition-all placeholder:text-outline/70 responsive-input-password"
                  id="confirmPassword"
                  placeholder="Xác nhận"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors flex items-center justify-center w-10 h-10 rounded-full active:scale-90 responsive-eye-btn"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start gap-xs ml-xs mt-xs">
            <input
              type="checkbox"
              id="agreeTerms"
              className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary focus:ring-1 accent-primary"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label
              htmlFor="agreeTerms"
              className="font-body-md text-sm text-on-surface-variant leading-relaxed select-none cursor-pointer"
            >
              Tôi đồng ý với{" "}
              <a href="#" onClick={(e) => e.preventDefault()} className="text-primary hover:underline">
                Điều khoản sử dụng
              </a>{" "}
              và{" "}
              <a href="#" onClick={(e) => e.preventDefault()} className="text-primary hover:underline">
                Chính sách bảo mật
              </a>{" "}
              của H-solutions.
            </label>
          </div>

          {/* Submit Button */}
          <button
            className="w-full h-[56px] bg-primary text-on-primary font-headline-md text-headline-md rounded-xl shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-base hover:bg-primary/95 mt-md cursor-pointer"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
          </button>
        </form>

        {/* Social section */}
        <div className="responsive-social-section">
          {/* Divider */}
          <div className="flex items-center gap-md my-lg responsive-divider">
            <div className="flex-grow h-px bg-outline-variant"></div>
            <span className="font-label-sm text-label-sm text-outline-variant uppercase tracking-widest text-[11px]">
              Hoặc đăng ký bằng
            </span>
            <div className="flex-grow h-px bg-outline-variant"></div>
          </div>

          {/* Social Register */}
          <div className="grid grid-cols-2 gap-md mb-lg responsive-social-margin">
            <button
              onClick={() => handleSocialRegister("oauth_google")}
              disabled={isLoading}
              className="flex items-center justify-center gap-sm h-[56px] border border-outline-variant rounded-xl hover:bg-surface-container-low active:scale-95 transition-all bg-surface-container-lowest cursor-pointer"
            >
              <svg
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                ></path>
              </svg>
              <span className="font-label-lg text-label-lg text-on-surface">
                Google
              </span>
            </button>
            
            <button
              onClick={() => handleSocialRegister("oauth_apple")}
              disabled={isLoading}
              className="flex items-center justify-center gap-sm h-[56px] border border-outline-variant rounded-xl hover:bg-surface-container-low active:scale-95 transition-all bg-surface-container-lowest cursor-pointer"
            >
              <img
                className="w-6 h-6"
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                alt="Apple logo"
              />
              <span className="font-label-lg text-label-lg text-on-surface">
                Apple
              </span>
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Đã có tài khoản?{" "}
            <Link
              className="font-label-lg text-label-lg text-secondary font-bold hover:underline ml-xs transition-all"
              href="/login"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
