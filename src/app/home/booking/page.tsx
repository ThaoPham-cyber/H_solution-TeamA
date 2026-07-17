"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeShell } from "@/components/home/home-shell";

type Category = "pin" | "wheel" | "motor" | "control" | "other";

type TimeSlot = {
  id: string;
  label: string;
  period: "sáng" | "chiều" | "tối";
};

const TIME_SLOTS: TimeSlot[] = [
  { id: "08:00", label: "08:00 - 09:30", period: "sáng" },
  { id: "09:30", label: "09:30 - 11:00", period: "sáng" },
  { id: "11:00", label: "11:00 - 12:30", period: "sáng" },
  { id: "13:30", label: "13:30 - 15:00", period: "chiều" },
  { id: "15:00", label: "15:00 - 16:30", period: "chiều" },
  { id: "16:30", label: "16:30 - 18:00", period: "chiều" },
  { id: "18:00", label: "18:00 - 19:30", period: "tối" },
  { id: "19:30", label: "19:30 - 21:00", period: "tối" },
];

export default function BookingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"FORM" | "SUCCESS">("FORM");

  // Form States
  const [wheelchairId, setWheelchairId] = useState<string>("1");
  const [category, setCategory] = useState<Category>("pin");
  const [notes, setNotes] = useState("");
  
  // Date Selection States
  const [dateType, setDateType] = useState<"today" | "tomorrow" | "nextday" | "custom">("today");
  const [customDate, setCustomDate] = useState("");
  const [finalDate, setFinalDate] = useState("");

  // Time Selection State
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("09:30");

  // Location State
  const [address, setAddress] = useState("");

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCode, setOrderCode] = useState("");

  useEffect(() => {
    setMounted(true);
    // Set customDate default to today's HTML date format YYYY-MM-DD
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setCustomDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Format date option label helper
  const getDateLabel = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dayNames = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const dayName = offset === 0 ? "Hôm nay" : offset === 1 ? "Ngày mai" : dayNames[d.getDay()];
    const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { dayName, dateStr, rawDate: d.toLocaleDateString("vi-VN") };
  };

  const todayInfo = getDateLabel(0);
  const tomorrowInfo = getDateLabel(1);
  const nextdayInfo = getDateLabel(2);

  // Determine final formatted date string to show/submit
  useEffect(() => {
    if (dateType === "today") {
      setFinalDate(`${todayInfo.dayName} (${todayInfo.dateStr})`);
    } else if (dateType === "tomorrow") {
      setFinalDate(`${tomorrowInfo.dayName} (${tomorrowInfo.dateStr})`);
    } else if (dateType === "nextday") {
      setFinalDate(`${nextdayInfo.dayName} (${nextdayInfo.dateStr})`);
    } else {
      if (customDate) {
        const [yyyy, mm, dd] = customDate.split("-");
        setFinalDate(`${dd}/${mm}/${yyyy}`);
      }
    }
  }, [dateType, customDate]);

  const handleBookRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      alert("Vui lòng nhập hoặc chọn vị trí sửa chữa");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wheelchairId,
          category,
          notes,
          date: finalDate,
          timeSlot: selectedTimeSlot,
          address,
        }),
      });
      if (response.ok) {
        const resData = await response.json();
        setOrderCode(resData.data.orderCode);
        setStep("SUCCESS");
      } else {
        const errData = await response.json();
        alert(errData.error || "Có lỗi xảy ra khi đặt lịch");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối đến server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryDetails = (cat: Category) => {

    switch (cat) {
      case "pin":
        return { label: "Hệ thống Pin / Nguồn", icon: "battery_charging_full", color: "text-[#004e9f] bg-[#d7e3ff]" };
      case "wheel":
        return { label: "Bánh xe & Lốp", icon: "tire", color: "text-[#006a6a] bg-[#7df5f5]/30" };
      case "motor":
        return { label: "Động cơ & Hộp số", icon: "construction", color: "text-amber-700 bg-amber-100" };
      case "control":
        return { label: "Bộ điều khiển & Remote", icon: "settings_input_hdmi", color: "text-purple-700 bg-purple-100" };
      case "other":
      default:
        return { label: "Vấn đề khác", icon: "handyman", color: "text-slate-700 bg-slate-100" };
    }
  };

  if (!mounted) return null;

  return (
    <HomeShell activeNav="wheelchair" hideHeader={true}>
      <div className="w-full max-w-[480px] mx-auto min-h-screen bg-slate-50 flex flex-col pb-24">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-30">
          <button
            onClick={() => {
              if (step === "SUCCESS") {
                setStep("FORM");
              } else {
                router.push("/home");
              }
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px] text-slate-800">arrow_back</span>
          </button>
          <h1 className="font-bold text-lg text-slate-900 tracking-tight">Đặt lịch sửa chữa</h1>
          <div className="w-10" /> {/* Balance spacer */}
        </header>

        {step === "FORM" ? (
          <form onSubmit={handleBookRepair} className="flex-1 p-5 space-y-6">
            
            {/* Step 1: Chọn Xe Lăn Cần Sửa (wheelchair là 1 mặc định) */}
            <div className="space-y-3">
              <label className="block font-bold text-sm text-slate-700 uppercase tracking-wider">
                1. Chọn xe cần sửa
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWheelchairId("1")}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    wheelchairId === "1"
                      ? "bg-white border-[#004e9f] ring-2 ring-[#004e9f]/20 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[26px] ${wheelchairId === "1" ? "text-[#004e9f]" : "text-slate-400"}`}>
                    accessible
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="block font-extrabold text-[13px] text-slate-800">Xe lăn số 1</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Model X-200 (Chính)</span>
                  </div>
                  {wheelchairId === "1" && (
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setWheelchairId("2")}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    wheelchairId === "2"
                      ? "bg-white border-[#004e9f] ring-2 ring-[#004e9f]/20 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[26px] ${wheelchairId === "2" ? "text-[#004e9f]" : "text-slate-400"}`}>
                    accessible
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="block font-extrabold text-[13px] text-slate-800">Xe lăn số 2</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Model S-100 (Phụ)</span>
                  </div>
                  {wheelchairId === "2" && (
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                  )}
                </button>
              </div>
            </div>

            {/* Step 2: Issue categories */}
            <div className="space-y-3">
              <label className="block font-bold text-sm text-slate-700 uppercase tracking-wider">
                2. Chọn vấn đề xe lăn
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["pin", "wheel", "motor", "control", "other"] as Category[]).map((cat) => {
                  const details = getCategoryDetails(cat);
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${
                        isSelected
                          ? "bg-white border-[#004e9f] ring-2 ring-[#004e9f]/20 shadow-md"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 ${details.color}`}>
                        <span className="material-symbols-outlined text-[28px]">{details.icon}</span>
                      </div>
                      <span className="font-bold text-[14px] text-slate-800 leading-tight">
                        {details.label.split(" & ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Date Selection */}
            <div className="space-y-3">
              <label className="block font-bold text-sm text-slate-700 uppercase tracking-wider">
                3. Chọn ngày hẹn sửa
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Today */}
                <button
                  type="button"
                  onClick={() => setDateType("today")}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                    dateType === "today"
                      ? "bg-[#004e9f] text-white border-[#004e9f]"
                      : "bg-white text-slate-800 border-slate-200"
                  }`}
                >
                  <span className="text-[11px] font-medium opacity-80">{todayInfo.dayName}</span>
                  <span className="text-[16px] font-extrabold mt-0.5">{todayInfo.dateStr}</span>
                </button>

                {/* Tomorrow */}
                <button
                  type="button"
                  onClick={() => setDateType("tomorrow")}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                    dateType === "tomorrow"
                      ? "bg-[#004e9f] text-white border-[#004e9f]"
                      : "bg-white text-slate-800 border-slate-200"
                  }`}
                >
                  <span className="text-[11px] font-medium opacity-80">{tomorrowInfo.dayName}</span>
                  <span className="text-[16px] font-extrabold mt-0.5">{tomorrowInfo.dateStr}</span>
                </button>

                {/* Next Day */}
                <button
                  type="button"
                  onClick={() => setDateType("nextday")}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                    dateType === "nextday"
                      ? "bg-[#004e9f] text-white border-[#004e9f]"
                      : "bg-white text-slate-800 border-slate-200"
                  }`}
                >
                  <span className="text-[11px] font-medium opacity-80">{nextdayInfo.dayName}</span>
                  <span className="text-[16px] font-extrabold mt-0.5">{nextdayInfo.dateStr}</span>
                </button>
              </div>

              {/* Custom Date selection option */}
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => setDateType("custom")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                    dateType === "custom"
                      ? "bg-white border-[#004e9f] ring-2 ring-[#004e9f]/20"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <span className="font-bold text-slate-800">Chọn ngày khác</span>
                  <input
                    type="date"
                    value={customDate}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDateType("custom");
                    }}
                    onChange={(e) => {
                      setCustomDate(e.target.value);
                      setDateType("custom");
                    }}
                    className="border-none bg-transparent font-bold text-slate-900 focus:outline-none"
                  />
                </button>
              </div>
            </div>

            {/* Step 4: Time Slot Grid Selection */}
            <div className="space-y-3">
              <label className="block font-bold text-sm text-slate-700 uppercase tracking-wider">
                4. Chọn khung giờ hẹn
              </label>

              {/* Morning slots */}
              <div className="space-y-1.5">
                <span className="text-[12px] font-semibold text-slate-500 block">Buổi sáng</span>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.filter(s => s.period === "sáng").map((slot) => {
                    const isSelected = selectedTimeSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.id)}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                          isSelected
                            ? "bg-[#004e9f]/10 border-[#004e9f] text-[#004e9f] ring-1 ring-[#004e9f]"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {slot.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Afternoon slots */}
              <div className="space-y-1.5">
                <span className="text-[12px] font-semibold text-slate-500 block">Buổi chiều</span>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.filter(s => s.period === "chiều").map((slot) => {
                    const isSelected = selectedTimeSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.id)}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                          isSelected
                            ? "bg-[#004e9f]/10 border-[#004e9f] text-[#004e9f] ring-1 ring-[#004e9f]"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {slot.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Evening slots */}
              <div className="space-y-1.5">
                <span className="text-[12px] font-semibold text-slate-500 block">Buổi tối</span>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.filter(s => s.period === "tối").map((slot) => {
                    const isSelected = selectedTimeSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.id)}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                          isSelected
                            ? "bg-[#004e9f]/10 border-[#004e9f] text-[#004e9f] ring-1 ring-[#004e9f]"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {slot.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 5: Address Input */}
            <div className="space-y-3">
              <label htmlFor="repair-address" className="block font-bold text-sm text-slate-700 uppercase tracking-wider">
                5. Địa chỉ sửa chữa
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004e9f]">
                  location_on
                </span>
                <input
                  id="repair-address"
                  type="text"
                  placeholder="Nhập địa chỉ nhà của bạn"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:border-[#004e9f] focus:ring-1 focus:ring-[#004e9f] outline-none text-slate-800 placeholder-slate-400 text-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Step 6: Notes */}
            <div className="space-y-3">
              <label htmlFor="repair-notes" className="block font-bold text-sm text-slate-700 uppercase tracking-wider">
                6. Ghi chú thêm
              </label>
              <textarea
                id="repair-notes"
                rows={3}
                placeholder="Mô tả cụ thể sự cố xe hoặc yêu cầu đặc biệt đối với kỹ thuật viên (tùy chọn)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:border-[#004e9f] focus:ring-1 focus:ring-[#004e9f] outline-none text-slate-800 placeholder-slate-400 text-sm transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-[#004e9f] text-white font-bold rounded-xl shadow-lg hover:bg-[#004e9f]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-400"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý đặt lịch...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">event_available</span>
                  Xác nhận & Đặt lịch ngay
                </>
              )}
            </button>

          </form>
        ) : (
          /* Step 5: Success Ticket details screen */
          <div className="flex-1 p-5 flex flex-col items-center justify-center text-center space-y-6 animate-[fadeIn_0.4s_ease-out]">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-md">
              <span className="material-symbols-outlined text-[40px]">check_circle</span>
            </div>
            
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Đặt Lịch Thành Công!</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-[280px] mx-auto">
                Yêu cầu sửa chữa của bạn đã được tiếp nhận. Dưới đây là thông tin chi tiết:
              </p>
            </div>

            {/* Ticket Card Details */}
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-left relative overflow-hidden shadow-sm">
              <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 border-r border-slate-200 rounded-full" />
              <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 border-l border-slate-200 rounded-full" />
              
              <div className="border-b border-dashed border-slate-200 pb-3.5 mb-3.5 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">MÃ LỊCH HẸN</span>
                <span className="text-sm font-extrabold text-[#004e9f] tracking-wider">{orderCode}</span>
              </div>

              <div className="space-y-3.5">
                {/* Xe lăn */}
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">XE LĂN ĐẶT LỊCH</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-[18px] text-slate-600">accessible</span>
                    <span className="text-sm font-bold text-slate-800">
                      {wheelchairId === "1" ? "Xe lăn số 1 (Model X-200)" : "Xe lăn số 2 (Model S-100)"}
                    </span>
                  </div>
                </div>

                {/* Vấn đề */}
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">VẤN ĐỀ SỰ CỐ</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-[18px] text-slate-600">
                      {getCategoryDetails(category).icon}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{getCategoryDetails(category).label}</span>
                  </div>
                </div>

                {/* Ngày giờ hẹn */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase">NGÀY HẸN</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="material-symbols-outlined text-[18px] text-slate-600">calendar_today</span>
                      <span className="text-sm font-bold text-slate-800">{finalDate}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase">GIỜ HẸN</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="material-symbols-outlined text-[18px] text-slate-600">schedule</span>
                      <span className="text-sm font-bold text-slate-800">
                        {TIME_SLOTS.find(s => s.id === selectedTimeSlot)?.label || selectedTimeSlot}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Địa chỉ */}
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">ĐỊA CHỈ SỬA CHỮA</span>
                  <div className="flex items-start gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[18px] text-slate-600 mt-0.5">location_on</span>
                    <span className="text-sm font-bold text-slate-800 leading-snug">{address}</span>
                  </div>
                </div>

                {/* Ghi chú */}
                {notes.trim() && (
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase">GHI CHÚ</span>
                    <p className="text-xs text-slate-600 mt-1 italic leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      "{notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full space-y-3 pt-4">
              <button
                onClick={() => router.push("/home")}
                className="w-full h-13 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">home</span>
                Quay về trang chủ
              </button>
              <button
                onClick={() => {
                  setStep("FORM");
                }}
                className="w-full h-13 bg-white border border-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                Đặt lịch khác
              </button>
            </div>
          </div>
        )}
      </div>
    </HomeShell>
  );
}
