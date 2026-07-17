"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type SosStep = "PROBLEM" | "DETAILS" | "CAMERA" | "LOCATION" | "CALLING" | "TECHNICIAN";
type SosIssue = "battery" | "controller" | "wheel" | "motor" | "frame" | "other";

const ISSUE_OPTIONS: Array<{ id: SosIssue; label: string; icon: string }> = [
  { id: "battery", label: "Battery", icon: "battery_alert" },
  { id: "controller", label: "Controller", icon: "tune" },
  { id: "wheel", label: "Wheels", icon: "tire_repair" },
  { id: "motor", label: "Motor", icon: "bolt" },
  { id: "frame", label: "Frame/Brake", icon: "do_not_disturb_on" },
  { id: "other", label: "Other", icon: "build_circle" },
];

export default function SosPage() {
  const router = useRouter();
  const [step, setStep] = useState<SosStep>("PROBLEM");

  const [selectedIssue, setSelectedIssue] = useState<SosIssue | null>(null);
  const [problemDetails, setProblemDetails] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [locationMethod, setLocationMethod] = useState<"gps" | "manual" | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [formError, setFormError] = useState("");
  const [cameraFlash, setCameraFlash] = useState(false);

  const [connectingDots, setConnectingDots] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected">("connecting");
  const [smsStatus, setSmsStatus] = useState<"pending" | "sending" | "sent">("pending");
  const [technicianEta, setTechnicianEta] = useState("~8 mins");

  const dotsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoPreviewsRef = useRef<string[]>([]);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (step === "CALLING") {
      dotsTimerRef.current = setInterval(() => {
        setConnectingDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
      }, 500);

      const smsTimer = setTimeout(() => setSmsStatus("sending"), 2000);
      const smsSentTimer = setTimeout(() => setSmsStatus("sent"), 4000);
      const connectTimer = setTimeout(() => setConnectionStatus("connected"), 5000);
      const moveToTechnicianTimer = setTimeout(() => setStep("TECHNICIAN"), 7000);

      return () => {
        if (dotsTimerRef.current) clearInterval(dotsTimerRef.current);
        clearTimeout(smsTimer);
        clearTimeout(smsSentTimer);
        clearTimeout(connectTimer);
        clearTimeout(moveToTechnicianTimer);
      };
    }

    return () => {
      if (dotsTimerRef.current) clearInterval(dotsTimerRef.current);
    };
  }, [step]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  };

  useEffect(() => {
    if (step !== "CAMERA") {
      stopCamera();
      return;
    }

    let cancelled = false;

    const startCamera = async () => {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera is not supported on this device. Use Library to upload photos.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        setCameraError("Cannot access camera. Please allow camera permission or use Library to upload photos.");
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [step]);

  useEffect(() => {
    photoPreviewsRef.current = photoPreviews;
  }, [photoPreviews]);

  useEffect(() => {
    return () => {
      photoPreviewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const addPhoto = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setUploadedPhotos((prev) => [...prev, file].slice(0, 4));
    setPhotoPreviews((prev) => {
      const next = [...prev, previewUrl];
      if (next.length > 4) {
        next.slice(0, next.length - 4).forEach((url) => URL.revokeObjectURL(url));
      }
      return next.slice(0, 4);
    });
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectIssue = (issue: SosIssue) => {
    setSelectedIssue(issue);
    setFormError("");
  };

  const handleContinueFromProblem = () => {
    if (!selectedIssue) {
      setFormError("Choose a category to continue.");
      return;
    }
    setFormError("");
    setStep("CAMERA");
  };

  const handleContinueFromDetails = () => {
    if (problemDetails.trim().length < 10) {
      setFormError("Please enter at least 10 characters for the problem details.");
      return;
    }
    setFormError("");
    setStep("LOCATION");
  };

  const handleCaptureFromCamera = () => {
    const video = videoRef.current;
    if (!video || !cameraReady || video.videoWidth === 0) {
      setFormError("Camera is not ready. Please wait or use Library to upload photos.");
      return;
    }

    setFormError("");
    setCameraFlash(true);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCameraFlash(false);
      return;
    }

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraFlash(false);
          return;
        }

        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        addPhoto(file);

        transitionTimerRef.current = setTimeout(() => {
          setCameraFlash(false);
          setStep("DETAILS");
        }, 220);
      },
      "image/jpeg",
      0.92
    );
  };

  const handleLibrarySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        addPhoto(file);
      }
    });
    event.target.value = "";
    if (files.length > 0) {
      setStep("DETAILS");
    }
  };

  const handleUseGps = () => {
    setLocationMethod("gps");
    setManualAddress("123 Duong Bang Gia, Cau Giay, Ha Noi");
    setFormError("");
  };

  const handleContinueFromLocation = async () => {
    if (locationMethod === "manual" && manualAddress.trim().length < 5) {
      setFormError("Please enter your address.");
      return;
    }
    if (!locationMethod) {
      setFormError("Please choose location method.");
      return;
    }

    setFormError("");
    setConnectionStatus("connecting");
    setSmsStatus("pending");
    setConnectingDots("");
    setTechnicianEta("~8 mins");
    setStep("CALLING");

    try {
      await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedIssue,
          details: problemDetails,
          address: manualAddress || "GPS Shared Location",
          locationMethod,
        }),
      });
    } catch (err) {
      console.error("Failed to register SOS request", err);
    }
  };

  const handleCancel = () => {
    router.push("/home");
  };

  const selectedIssueLabel = ISSUE_OPTIONS.find((issue) => issue.id === selectedIssue)?.label || "Unknown";
  const canContinueDetails = problemDetails.trim().length >= 10;
  const canContinueLocation = locationMethod === "gps" || (locationMethod === "manual" && manualAddress.trim().length >= 5);

  return (
    <div className="sos-flow-page">
      <header className="sos-flow-header">
        <div className="sos-flow-logo">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="3" fill="#0D2137" />
            <line x1="14" y1="2" x2="14" y2="26" stroke="#0D2137" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="14" x2="26" y2="14" stroke="#0D2137" strokeWidth="2" strokeLinecap="round" />
            <line x1="5.5" y1="5.5" x2="22.5" y2="22.5" stroke="#0D2137" strokeWidth="2" strokeLinecap="round" />
            <line x1="22.5" y1="5.5" x2="5.5" y2="22.5" stroke="#0D2137" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="sos-flow-logo-text">GLACIER</span>
        </div>
        {(step === "CALLING" || step === "TECHNICIAN") && (
          <div className="sos-flow-header-badge">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>emergency</span>
            SOS
          </div>
        )}
      </header>

      {step === "PROBLEM" && (
        <section className="sos-step-panel">
          <div className="sos-step-head">
            <p className="sos-step-kicker">CHOOSE A PROBLEM</p>
            <h1 className="sos-step-title">What problem is your car experiencing?</h1>
          </div>

          <div className="sos-issue-grid">
            {ISSUE_OPTIONS.map((issue) => (
              <button
                key={issue.id}
                type="button"
                className={`sos-issue-card ${selectedIssue === issue.id ? "sos-issue-card--active" : ""}`}
                onClick={() => handleSelectIssue(issue.id)}
              >
                <span className="material-symbols-outlined">{issue.icon}</span>
                <span>{issue.label}</span>
              </button>
            ))}
          </div>

          {formError && <p className="sos-form-error">{formError}</p>}
          <p className="sos-step-note">Choose a category to continue.</p>
          <button className="sos-manual-submit" onClick={handleContinueFromProblem}>Continue</button>
        </section>
      )}

      {step === "DETAILS" && (
        <section className="sos-step-panel">
          <div className="sos-step-head sos-step-head--left">
            <h2 className="sos-section-title">Details of the problem</h2>
            <p className="sos-section-desc">
              Please tell us what is happening with your wheelchair so technician can prepare the right parts.
            </p>
          </div>

          <div className="sos-textarea-wrap">
            <textarea
              className="sos-detail-textarea"
              maxLength={500}
              value={problemDetails}
              onChange={(e) => {
                setProblemDetails(e.target.value);
                setFormError("");
              }}
              placeholder="For example: The left brake lever is loose and does not engage when squeezed..."
            />
            <span className="sos-counter">{problemDetails.length} / 500</span>
          </div>

          <h2 className="sos-section-title">Captured photos</h2>
          <p className="sos-section-desc">Photos you took will be shared securely with the assigned technician.</p>

          <div className="sos-photo-row">
            <button type="button" className="sos-photo-add" onClick={() => setStep("CAMERA")}>
              <span className="material-symbols-outlined">add_a_photo</span>
              More
            </button>

            {photoPreviews.slice(0, 2).map((preview, index) => (
              <div className="sos-photo-thumb" key={`${preview}-${index}`}>
                <img src={preview} alt="proof" width={96} height={74} />
                <button type="button" onClick={() => removePhoto(index)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ))}

            <div className="sos-photo-empty">
              <span className="material-symbols-outlined">image</span>
            </div>
          </div>

          <div className="sos-tip-box">
            Mo ta va hinh anh cua ban se chi duoc chia se bao mat voi ky thuat vien duoc phan cong.
          </div>

          {formError && <p className="sos-form-error">{formError}</p>}
          <div className="sos-inline-actions">
            <button type="button" className="sos-ghost-btn" onClick={() => setStep("CAMERA")}>Back</button>
            <button type="button" className="sos-manual-submit" disabled={!canContinueDetails} onClick={handleContinueFromDetails}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === "CAMERA" && (
        <section className="sos-step-panel sos-camera-panel">
          {cameraFlash && <div className="sos-camera-flash" />}
          <h2 className="sos-camera-title">Take photos of the vehicle&apos;s condition.</h2>
          <p className="sos-camera-desc">Please take photos of the area that needs repair so that we can assist you best.</p>

          <div className="sos-camera-frame">
            <video
              ref={videoRef}
              className="sos-camera-video"
              autoPlay
              playsInline
              muted
            />
            {!cameraReady && (
              <Image
                src="/wheelchair.png"
                alt="camera fallback"
                fill
                sizes="(max-width: 480px) 100vw, 480px"
                className="sos-camera-fallback"
              />
            )}
            <div className="sos-camera-focus" />
            <button type="button" className="sos-camera-mute" aria-label="Mute microphone">
              <span className="material-symbols-outlined">mic_off</span>
            </button>
            {cameraError && (
              <div className="sos-camera-error">
                <span className="material-symbols-outlined">videocam_off</span>
                <p>{cameraError}</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sos-camera-file-input"
            onChange={handleLibrarySelect}
          />

          <div className="sos-camera-actions">
            <button
              type="button"
              className="sos-camera-side-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Library
            </button>
            <button
              type="button"
              className="sos-camera-capture"
              onClick={handleCaptureFromCamera}
              disabled={!cameraReady}
              aria-label="Capture photo"
            >
              <span className="material-symbols-outlined">photo_camera</span>
            </button>
            <button type="button" className="sos-camera-side-btn" onClick={() => setStep("DETAILS")}>Skip</button>
          </div>
        </section>
      )}

      {step === "LOCATION" && (
        <section className="sos-step-panel sos-location-select-panel">
          <div className="sos-location-select-card">
            <h2>Determine location</h2>
            <p>Choose the most accurate method currently available.</p>

            <button type="button" className="sos-location-method sos-location-method--gps" onClick={handleUseGps}>
              <div>
                <strong>Use your phone&apos;s GPS.</strong>
                <span>High accuracy, automatic updates</span>
              </div>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <button
              type="button"
              className={`sos-location-method ${locationMethod === "manual" ? "sos-location-method--active" : ""}`}
              onClick={() => {
                setLocationMethod("manual");
                setFormError("");
              }}
            >
              <div>
                <strong>Enter the address manually</strong>
                <span>Enter house number and street name yourself.</span>
              </div>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            {locationMethod === "manual" && (
              <input
                type="text"
                className="sos-manual-input"
                placeholder="Enter your current address"
                value={manualAddress}
                onChange={(e) => {
                  setManualAddress(e.target.value);
                  setFormError("");
                }}
              />
            )}

            {formError && <p className="sos-form-error">{formError}</p>}

            <button className="sos-manual-submit" disabled={!canContinueLocation} onClick={handleContinueFromLocation}>
              Continue
            </button>

            <button className="sos-cancel-link" onClick={handleCancel}>
              Cancel the urgent request
            </button>
          </div>
        </section>
      )}

      {step === "CALLING" && (
        <section className="sos-calling-step">
          <div className="sos-signal-container">
            <div className="sos-signal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#1565C0">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
          </div>

          <h2 className="sos-calling-title">Calling for rescue{connectingDots}</h2>
          <p className="sos-calling-desc">Your location has been confirmed.</p>

          <div className="sos-status-cards">
            <div className={`sos-status-card sos-status-card--connection ${connectionStatus === "connected" ? "sos-status-card--done" : ""}`}>
              <div className="sos-status-card-icon">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <div>
                <div className="sos-status-card-label">CONNECTING</div>
                <div className="sos-status-card-text">Calling nearest roadside assistance store...</div>
              </div>
            </div>

            <div className={`sos-status-card sos-status-card--sms ${smsStatus === "sent" ? "sos-status-card--done" : ""}`}>
              <div className="sos-status-card-icon">
                <span className="material-symbols-outlined">sms</span>
              </div>
              <div>
                <div className="sos-status-card-label">NOTIFICATION</div>
                <div className="sos-status-card-text">We are sending you a confirmation SMS.</div>
              </div>
            </div>
          </div>

          <button className="sos-cancel-btn" onClick={handleCancel}>
            <span className="material-symbols-outlined">cancel</span>
            Cancel request
          </button>

          <div className="sos-location-card">
            <h3 className="sos-location-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>location_on</span>
              Your location
            </h3>
            <div className="sos-map-container">
              <div className="sos-map-mock">
                <Image
                  src="/wheelchair.png"
                  alt="location preview"
                  width={420}
                  height={150}
                  className="sos-location-preview-img"
                />
              </div>
              <div className="sos-map-address-badge">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#1565C0" }}>place</span>
                <span>{manualAddress}</span>
              </div>
            </div>
          </div>

          <div className="sos-safety-section">
            <h3 className="sos-safety-title">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#1565C0" }}>shield</span>
              Safety instructions
            </h3>
            <ul className="sos-safety-list">
              <li>
                <span className="material-symbols-outlined sos-safety-check">check_circle</span>
                Move your vehicle to the side of the road or safest lane possible.
              </li>
              <li>
                <span className="material-symbols-outlined sos-safety-check">check_circle</span>
                Turn on hazard lights if available.
              </li>
              <li>
                <span className="material-symbols-outlined sos-safety-check">check_circle</span>
                Keep your phone switched on for calls from emergency services.
              </li>
            </ul>
          </div>

          <div className="sos-bottom-info">
            <div className="sos-info-item">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>battery_5_bar</span>
              Pin: 85%
            </div>
            <div className="sos-info-item">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>signal_cellular_alt</span>
              Waves: Good
            </div>
          </div>
        </section>
      )}

      {step === "TECHNICIAN" && (
        <section className="sos-step-panel sos-tech-panel">
          <div className="sos-tech-found">TECHNICIAN FOUND</div>
          <h2 className="sos-tech-title">Your technician is waiting</h2>

          <article className="sos-tech-card">
            <div className="sos-tech-avatar">
              <span className="material-symbols-outlined">person</span>
            </div>
            <h3>Nguyen Van A</h3>
            <p>Electric wheelchair maintenance expert</p>

            <div className="sos-tech-meta">
              <span>4.9 (128 reviews)</span>
              <span>Verified</span>
            </div>

            <div className="sos-tech-stats">
              <div>
                <span>EXPERIENCE</span>
                <strong>8 Years</strong>
              </div>
              <div>
                <span>DISTANCE</span>
                <strong>1.2 km</strong>
              </div>
              <div>
                <span>TIME</span>
                <strong>{technicianEta}</strong>
              </div>
            </div>
          </article>

          <div className="sos-tech-issue-card">
            <Image src="/wheelchair.png" alt="issue" width={48} height={48} />
            <div>
              <strong>{selectedIssueLabel} issue</strong>
              <p>The system has recorded an issue and passed it to the technician.</p>
            </div>
          </div>

          <div className="sos-tech-actions">
            <button type="button" className="sos-tech-decline" onClick={handleCancel}>Decline</button>
            <button type="button" className="sos-tech-confirm" onClick={() => router.push("/home/history")}>Confirm</button>
          </div>
        </section>
      )}
    </div>
  );
}
