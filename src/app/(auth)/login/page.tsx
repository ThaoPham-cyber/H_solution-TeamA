"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getClerkClient, getClerkErrorMessage } from "@/services/clerk-client";

const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function LoginPage() {
  const router = useRouter();
  
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
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
      let formattedIdentifier = phone.trim();
      if (/^\d+$/.test(formattedIdentifier) && formattedIdentifier.startsWith("0")) {
        formattedIdentifier = "+84" + formattedIdentifier.slice(1);
      }

      const signIn = clerk.client.signIn;
      const result = await signIn.create({
        identifier: formattedIdentifier,
        password,
      });

      if (result.status === "complete") {
        await clerk.setActive({ session: result.createdSessionId });
        router.push("/home");
      } else {
        setErrorMessage("Đăng nhập chưa hoàn tất. Vui lòng kiểm tra lại tài khoản!");
      }
    } catch (err: unknown) {
      console.error("Clerk Login Error:", err);
      setErrorMessage(getClerkErrorMessage(err, "Đăng nhập thất bại. Vui lòng thử lại!"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (strategy: "oauth_google" | "oauth_apple") => {
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

      await clerk.client.signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/home",
        redirectUrlComplete: "/home",
      });
    } catch (err: unknown) {
      console.error("Clerk Social Login Error:", err);
      setErrorMessage("Không thể kết nối với dịch vụ đăng nhập bên thứ ba.");
    }
  };

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
              Đăng nhập tài khoản
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

        {/* Login Form */}
        <form className="space-y-md" onSubmit={handleSubmit}>
          {/* Phone Input */}
          <div className="flex flex-col gap-xs">
            <label
              className="font-label-lg text-label-lg text-on-surface-variant ml-xs"
              htmlFor="phone"
            >
              Số điện thoại
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none">
                phone
              </span>
              <input
                className="w-full h-[56px] pl-[52px] pr-md bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface transition-all placeholder:text-outline/70"
                id="phone"
                placeholder="Số điện thoại"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-xs">
            <label
              className="font-label-lg text-label-lg text-on-surface-variant ml-xs"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none">
                lock
              </span>
              <input
                className="w-full h-[56px] pl-[52px] pr-[52px] bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface transition-all placeholder:text-outline/70"
                id="password"
                placeholder="Nhập mật khẩu của bạn"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors flex items-center justify-center w-10 h-10 rounded-full active:scale-90"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <div className="flex justify-end mt-xs">
              <a
                className="font-label-sm text-label-sm text-primary hover:underline transition-all"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Quên mật khẩu?
              </a>
            </div>
          </div>

          {/* Submit Button & Fingerprint Row */}
          <div className="flex gap-sm">
            <button
              className="flex-grow h-[56px] bg-primary text-on-primary font-headline-md text-headline-md rounded-xl shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-base hover:bg-primary/95 cursor-pointer"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>

            <button
              className="w-[56px] h-[56px] flex items-center justify-center border border-outline-variant bg-surface-container-lowest rounded-xl hover:bg-surface-container-low active:scale-95 transition-all text-primary cursor-pointer shrink-0"
              type="button"
              onClick={() => {
                setIsLoading(true);
                // Simulate fingerprint scan & login redirect
                setTimeout(() => {
                  setIsLoading(false);
                  router.push("/home");
                }, 1200);
              }}
              disabled={isLoading}
              title="Đăng nhập bằng vân tay"
            >
              <span className="material-symbols-outlined text-[32px]">
                fingerprint
              </span>
            </button>
          </div>
        </form>

        {/* Social section */}
        <div className="responsive-social-section">
          {/* Divider */}
          <div className="flex items-center gap-md my-lg responsive-divider">
            <div className="flex-grow h-px bg-outline-variant"></div>
            <span className="font-label-sm text-label-sm text-outline-variant uppercase tracking-widest text-[11px]">
              Hoặc tiếp tục với
            </span>
            <div className="flex-grow h-px bg-outline-variant"></div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-md mb-lg responsive-social-margin">
            <button
              onClick={() => handleSocialLogin("oauth_google")}
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
              onClick={() => handleSocialLogin("oauth_apple")}
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

        {/* Signup Link */}
        <div className="text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Chưa có tài khoản?{" "}
            <Link
              className="font-label-lg text-label-lg text-secondary font-bold hover:underline ml-xs transition-all"
              href="/register"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
