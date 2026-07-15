"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeShell } from "@/components/home/home-shell";

type DriveMode = "eco" | "normal" | "sport";

type DiagnosticItem = {
  id: string;
  name: string;
  icon: string;
  status: "normal" | "scanning" | "error";
  message: string;
};

export default function MyDevicePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Device states
  const [isLocked, setIsLocked] = useState(false);
  const [driveMode, setDriveMode] = useState<DriveMode>("normal");
  const [headlights, setHeadlights] = useState(false);
  const [hazardLights, setHazardLights] = useState(false);
  const [geofenceEnabled, setGeofenceEnabled] = useState(true);
  const [simulateGeofenceWarning, setSimulateGeofenceWarning] = useState(false);

  // Horn ping simulation overlay
  const [hornActive, setHornActive] = useState(false);

  // Diagnostic states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([
    { id: "motor", name: "Động cơ (Motor)", icon: "settings", status: "normal", message: "Hoạt động tốt" },
    { id: "battery", name: "Hệ thống Pin (Battery)", icon: "battery_charging_full", status: "normal", message: "82% - Khỏe mạnh" },
    { id: "brake", name: "Phanh điện từ (Brakes)", icon: "lock", status: "normal", message: "Phản hồi tốt" },
    { id: "controller", name: "Mạch điều khiển (Controller)", icon: "memory", status: "normal", message: "Kết nối ổn định" },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulating sound horn beep for 1.5 seconds
  const triggerHorn = () => {
    setHornActive(true);
    setTimeout(() => {
      setHornActive(false);
    }, 1500);
  };

  // Diagnostic scan simulator
  const startDiagnosticScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    // Set all statuses to scanning
    setDiagnostics(prev =>
      prev.map(item => ({ ...item, status: "scanning", message: "Đang quét..." }))
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      if (progress >= 100) {
        clearInterval(interval);
        setScanProgress(100);
        
        // Wait a small bit, then finish scanning
        setTimeout(() => {
          setIsScanning(false);
          setDiagnostics([
            { id: "motor", name: "Động cơ (Motor)", icon: "settings", status: "normal", message: "Hoạt động tốt (100%)" },
            { id: "battery", name: "Hệ thống Pin (Battery)", icon: "battery_charging_full", status: "normal", message: "82% - Cell tốt" },
            { id: "brake", name: "Phanh điện từ (Brakes)", icon: "lock", status: "normal", message: "An toàn tuyệt đối" },
            { id: "controller", name: "Mạch điều khiển (Controller)", icon: "memory", status: "normal", message: "Hệ thống mượt mà" },
          ]);
        }, 300);
      } else {
        setScanProgress(progress);
        
        // Progressively update text status based on progress
        if (progress === 28) {
          setDiagnostics(prev =>
            prev.map(item => item.id === "motor" ? { ...item, status: "normal", message: "Động cơ OK" } : item)
          );
        } else if (progress === 52) {
          setDiagnostics(prev =>
            prev.map(item => item.id === "battery" ? { ...item, status: "normal", message: "Pin 82% OK" } : item)
          );
        } else if (progress === 76) {
          setDiagnostics(prev =>
            prev.map(item => item.id === "brake" ? { ...item, status: "normal", message: "Phanh OK" } : item)
          );
        } else if (progress === 92) {
          setDiagnostics(prev =>
            prev.map(item => item.id === "controller" ? { ...item, status: "normal", message: "Mạch OK" } : item)
          );
        }
      }
    }, 80);
  };

  const getSpeedDetails = (mode: DriveMode) => {
    switch (mode) {
      case "eco":
        return { label: "ECO", desc: "Tối ưu pin (Max 6km/h)", color: "text-emerald-600" };
      case "sport":
        return { label: "SPORT", desc: "Hiệu năng cao (Max 20km/h)", color: "text-red-600" };
      case "normal":
      default:
        return { label: "NORMAL", desc: "Hằng ngày (Max 12km/h)", color: "text-blue-600" };
    }
  };

  if (!mounted) return null;

  return (
    <HomeShell activeNav="device" title="Thiết bị của tôi">
      <div className="device-container">
        
        {/* Device Info Summary Card */}
        <section className="dev-card">
          <div className="flex justify-between items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#1565C0] shrink-0">
              <span className="material-symbols-outlined text-[26px]">devices</span>
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Xe lăn điện thông minh</span>
              <h2 className="text-xl font-extrabold text-slate-800 leading-tight">Glacier Model X-200</h2>
              <p className="text-xs text-slate-500 font-medium">S/N: GL-2026-X9930</p>
            </div>
            <div className="dev-connection-status">
              <div className="dev-connection-dot" />
              <span>Đang kết nối (4G)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1565C0]">
                <span className="material-symbols-outlined text-[24px]">battery_charging_full</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Dung lượng Pin</span>
                <span className="block font-extrabold text-slate-800 text-lg">82%</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined text-[24px]">map</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Quãng đường còn</span>
                <span className="block font-extrabold text-slate-800 text-lg">~18 km</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Controls Card */}
        <section className="dev-card">
          <h3 className="dev-card-title">
            <span className="dev-card-title-left">
              <span className="material-symbols-outlined">settings_remote</span>
              Điều khiển nhanh
            </span>
          </h3>

          <div className="dev-controls-row">
            {/* Lock/Unlock Switch */}
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`dev-control-btn ${isLocked ? "dev-control-btn--active" : ""}`}
              title={isLocked ? "Mở khóa xe lăn" : "Khóa xe lăn"}
            >
              <span className="material-symbols-outlined dev-control-btn-icon">
                {isLocked ? "lock" : "lock_open"}
              </span>
              <span className="dev-control-btn-label">
                {isLocked ? "Đã khóa xe" : "Khóa động cơ"}
              </span>
            </button>

            {/* Headlights button */}
            <button
              onClick={() => setHeadlights(!headlights)}
              className={`dev-control-btn ${headlights ? "dev-control-btn--active" : ""}`}
              title="Bật/Tắt đèn pha trước"
            >
              <span className="material-symbols-outlined dev-control-btn-icon">
                💡
              </span>
              <span className="dev-control-btn-label">Đèn pha trước</span>
            </button>

            {/* Horn sound trigger */}
            <button
              onClick={triggerHorn}
              className="dev-control-btn"
              title="Bấm còi xe"
            >
              <span className="material-symbols-outlined dev-control-btn-icon">
                volume_up
              </span>
              <span className="dev-control-btn-label">Bấm còi xe</span>
            </button>
          </div>

          {/* Additional Lights Row */}
          <div className="dev-toggle-row mt-1">
            <div className="dev-toggle-info">
              <span className="dev-toggle-label">Đèn cảnh báo Hazard</span>
              <span className="dev-toggle-desc">Nhấp nháy đồng thời cả 4 đèn xi-nhan</span>
            </div>
            <label className="dev-switch">
              <input
                type="checkbox"
                checked={hazardLights}
                onChange={() => setHazardLights(!hazardLights)}
              />
              <span className="dev-slider" />
            </label>
          </div>
        </section>

        {/* Speed / Drive Modes Selection */}
        <section className="dev-card">
          <h3 className="dev-card-title">
            <span className="dev-card-title-left">
              <span className="material-symbols-outlined">speed</span>
              Chế độ lái xe (Drive Mode)
            </span>
          </h3>

          <div className="dev-speed-selector">
            <div className="dev-speed-pills">
              <button
                onClick={() => setDriveMode("eco")}
                className={`dev-speed-pill ${driveMode === "eco" ? "dev-speed-pill--active" : ""}`}
              >
                <span>ECO</span>
                <span className="dev-speed-pill-desc">Tiết kiệm</span>
              </button>
              <button
                onClick={() => setDriveMode("normal")}
                className={`dev-speed-pill ${driveMode === "normal" ? "dev-speed-pill--active" : ""}`}
              >
                <span>NORMAL</span>
                <span className="dev-speed-pill-desc">Tiêu chuẩn</span>
              </button>
              <button
                onClick={() => setDriveMode("sport")}
                className={`dev-speed-pill ${driveMode === "sport" ? "dev-speed-pill--active" : ""}`}
              >
                <span>SPORT</span>
                <span className="dev-speed-pill-desc">Thể thao</span>
              </button>
            </div>
            <p className="text-xs text-center text-slate-500 font-bold mt-1 bg-slate-50 py-2 rounded-lg border border-slate-100/60">
              Chế độ hiện tại: <span className={getSpeedDetails(driveMode).color}>{getSpeedDetails(driveMode).label}</span> — {getSpeedDetails(driveMode).desc}
            </p>
          </div>
        </section>

        {/* Map Mock & Safe Zone geofence */}
        <section className="dev-card">
          <h3 className="dev-card-title">
            <span className="dev-card-title-left">
              <span className="material-symbols-outlined">explore</span>
              Vị trí & Vùng an toàn
            </span>
            <span className="text-xs text-slate-400 font-semibold">Cập nhật 5 giây trước</span>
          </h3>

          {/* Map Mock container */}
          <div className="dev-map-container">
            <div className="dev-map-street-h1" />
            <div className="dev-map-street-v1" />
            <div className="dev-map-street-h2" />
            
            {/* Geofence area circle */}
            {geofenceEnabled && (
              <div className={`dev-map-geofence ${simulateGeofenceWarning ? "dev-map-geofence--warning" : ""}`} />
            )}

            {/* Chair marker */}
            <div className={`dev-map-chair-marker ${simulateGeofenceWarning ? "dev-map-chair-marker--warning" : ""}`}>
              <div className="dev-marker-pulse" />
              <div className="dev-marker-icon-wrapper">
                <span className="material-symbols-outlined"></span>
              </div>
            </div>

            {/* Status overlay */}
            <div className="dev-map-info-overlay">
              <div className="dev-map-info-left">
                <span className="material-symbols-outlined dev-map-info-icon">
                  {simulateGeofenceWarning ? "warning" : "location_on"}
                </span>
                <span>
                  {simulateGeofenceWarning ? "Cảnh báo: Rời vùng an toàn!" : "144 Xuân Thủy, Cầu Giấy, Hà Nội"}
                </span>
              </div>
              <button
                className="dev-map-info-btn-location"
                onClick={() => {
                  setSimulateGeofenceWarning(false);
                  alert("Đã gửi tín hiệu cập nhật vị trí đến điện thoại.");
                }}
              >
                Cập nhật vị trí
              </button>
            </div>
          </div>

          {/* Geofence Toggle */}
          <div className="dev-toggle-row">
            <div className="dev-toggle-info">
              <span className="dev-toggle-label">Báo động Vùng an toàn</span>
              <span className="dev-toggle-desc">Thông báo khi xe lăn rời bán kính 50m</span>
            </div>
            <label className="dev-switch">
              <input
                type="checkbox"
                checked={geofenceEnabled}
                onChange={() => {
                  setGeofenceEnabled(!geofenceEnabled);
                  if (geofenceEnabled) setSimulateGeofenceWarning(false);
                }}
              />
              <span className="dev-slider" />
            </label>
          </div>

          {geofenceEnabled && (
            <button
              onClick={() => setSimulateGeofenceWarning(!simulateGeofenceWarning)}
              className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                simulateGeofenceWarning
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {simulateGeofenceWarning
                ? "Dừng mô phỏng vượt ranh giới"
                : "Mô phỏng xe đi ra ngoài Vùng an toàn"}
            </button>
          )}
        </section>

        {/* System Diagnostics Card */}
        <section className="dev-card">
          <h3 className="dev-card-title">
            <span className="dev-card-title-left">
              <span className="material-symbols-outlined">health_and_safety</span>
              Chẩn đoán hệ thống (Health Check)
            </span>
          </h3>

          <div className="dev-diagnostics-list">
            {diagnostics.map((diag) => (
              <div key={diag.id} className="dev-diag-item">
                <div className="dev-diag-left">
                  <span className="material-symbols-outlined dev-diag-icon">{diag.icon}</span>
                  <span className="dev-diag-name">{diag.name}</span>
                </div>
                <div className={`dev-diag-status ${diag.status === "scanning" ? "dev-diag-status--scanning" : ""}`}>
                  <span className="material-symbols-outlined dev-diag-status-icon">
                    {diag.status === "scanning" ? "autorenew" : "check_circle"}
                  </span>
                  <span>{diag.message}</span>
                </div>
              </div>
            ))}
          </div>

          {isScanning ? (
            <div className="dev-scan-progress-area mt-1">
              <div className="dev-scan-progress-labels">
                <span>Đang quét các cảm biến xe lăn...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="dev-scan-progress-track">
                <div className="dev-scan-progress-fill" style={{ width: `${scanProgress}%` }} />
              </div>
            </div>
          ) : (
            <button
              onClick={startDiagnosticScan}
              disabled={isScanning}
              className="dev-btn-scan mt-2"
            >
              <span className="material-symbols-outlined">health_and_safety</span>
              Chạy chẩn đoán lỗi xe (Scan)
            </button>
          )}
        </section>

      </div>

      {/* Simulated Horn beep sound overlay popup */}
      {hornActive && (
        <div className="dev-sound-wave-overlay">
          <div className="dev-sound-wave-card">
            <div className="dev-sound-wave-icon-box">
              <div className="dev-wave-ring" />
              <div className="dev-wave-ring dev-wave-ring--2" />
              <div className="dev-wave-ring dev-wave-ring--3" />
              <span className="material-symbols-outlined">volume_up</span>
            </div>
            <h4 className="dev-sound-wave-title">BEEP BEEP!</h4>
            <p className="dev-sound-wave-subtitle">Đang phát tín hiệu âm thanh cảnh báo trên xe lăn</p>
          </div>
        </div>
      )}

    </HomeShell>
  );
}
