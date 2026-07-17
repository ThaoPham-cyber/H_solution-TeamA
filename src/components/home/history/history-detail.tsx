"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

interface JobItem {
  title: string;
  description?: string;
  price: string;
  isFree?: boolean;
}

interface RepairDetail {
  id: string;
  orderCode: string;
  title: string;
  status: "completed" | "cancelled" | "in_progress";
  dateTime: string;
  location: string;
  technician: {
    name: string;
    rating: number;
    reviews: number;
    avatar: string;
    verified: boolean;
  };
  jobs: JobItem[];
  paymentMethod: string;
  total: number;
  images: string[];
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return { label: "Completed", className: "rd-status--completed" };
    case "cancelled":
      return { label: "Cancelled", className: "rd-status--cancelled" };
    case "in_progress":
      return { label: "In Progress", className: "rd-status--progress" };
    default:
      return { label: status, className: "" };
  }
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export function HistoryDetail() {
  const params = useParams();
  const id = params?.id as string;
  
  const [detail, setDetail] = useState<RepairDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/history/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDetail(data);
        } else {
          setError("Repair record not found");
        }
      } catch (err) {
        console.error("Failed to fetch detail:", err);
        setError("An error occurred while loading repair details");
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="rd-container">
        <div className="rd-header">
          <Link href="/home/history" className="rd-back-btn">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="rd-header-title">Repair details</h1>
          <div style={{ width: 40 }} />
        </div>
        <div className="rd-not-found">
          <div className="rh-loading-spinner" />
          <p>Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="rd-container">
        <div className="rd-header">
          <Link href="/home/history" className="rd-back-btn">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="rd-header-title">Repair details</h1>
          <div style={{ width: 40 }} />
        </div>
        <div className="rd-not-found">
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: "#cbd5e1" }}>
            error_outline
          </span>
          <p>{error || "Repair record not found"}</p>
          <Link href="/home/history" className="rd-back-link">Back to history</Link>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusLabel(detail.status);
  const extraImages = detail.images.length > 3 ? detail.images.length - 3 : 0;

  return (
    <div className="rd-container">
      {/* Header */}
      <div className="rd-header">
        <Link href="/home/history" className="rd-back-btn" aria-label="Back to history">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="rd-header-title">Repair details</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Scrollable Content */}
      <div className="rd-scroll-content">
        {/* Order Code & Title */}
        <div className="rd-order-section">
          <span className="rd-order-code">ORDER CODE: #{detail.orderCode}</span>
          <div className="rd-title-row">
            <h2 className="rd-repair-title">{detail.title}</h2>
            <span className={`rd-status-pill ${statusBadge.className}`}>
              <span className="rd-status-dot" />
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Time & Location */}
        <div className="rd-info-card">
          <div className="rd-info-row">
            <div className="rd-info-icon-wrap">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#1565C0" }}>
                schedule
              </span>
            </div>
            <div className="rd-info-content">
              <span className="rd-info-label">Time</span>
              <span className="rd-info-value">{detail.dateTime}</span>
            </div>
          </div>
          <div className="rd-info-divider" />
          <div className="rd-info-row">
            <div className="rd-info-icon-wrap">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#1565C0" }}>
                location_on
              </span>
            </div>
            <div className="rd-info-content">
              <span className="rd-info-label">Location</span>
              <span className="rd-info-value">{detail.location}</span>
            </div>
          </div>
        </div>

        {/* Technician */}
        <div className="rd-technician-card">
          <span className="rd-section-label">TECHNICIAN</span>
          {detail.technician.verified && (
            <div className="rd-verification-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#16a34a" }}>
                verified
              </span>
              <span>VERIFICATION</span>
            </div>
          )}
          <div className="rd-tech-profile">
            <div className="rd-tech-avatar">
              {detail.technician.avatar || detail.technician.name.charAt(0)}
            </div>
            <div className="rd-tech-info">
              <span className="rd-tech-name">{detail.technician.name}</span>
              <div className="rd-tech-rating">
                <span className="material-symbols-outlined rd-star-icon">star</span>
                <span className="rd-rating-text">
                  {detail.technician.rating} ({detail.technician.reviews} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details */}
        {detail.jobs.length > 0 && (
          <div className="rd-jobs-section">
            <span className="rd-section-label">JOB DETAILS</span>
            <div className="rd-jobs-list">
              {detail.jobs.map((job, i) => (
                <div key={i} className="rd-job-row">
                  <div className="rd-job-info">
                    <span className="rd-job-title">{job.title}</span>
                    {job.description && (
                      <span className="rd-job-desc">{job.description}</span>
                    )}
                  </div>
                  <span className={`rd-job-price ${job.isFree ? "rd-job-price--free" : ""}`}>
                    {job.price}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment & Total */}
            <div className="rd-payment-section">
              <div className="rd-payment-row">
                <span className="rd-payment-label">Payment method</span>
                <span className="rd-payment-value">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {detail.paymentMethod === "Cash" ? "payments" : detail.paymentMethod === "Bank Transfer" ? "account_balance" : "account_balance_wallet"}
                  </span>
                  {detail.paymentMethod}
                </span>
              </div>
              <div className="rd-total-row">
                <span className="rd-total-label">Total</span>
                <span className="rd-total-value">{formatCurrency(detail.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Images After Repair */}
        {detail.images.length > 0 && (
          <div className="rd-images-section">
            <span className="rd-section-label">IMAGES AFTER REPAIR</span>
            <div className="rd-images-grid">
              {detail.images.slice(0, 3).map((src, i) => (
                <div key={i} className="rd-image-thumb">
                  <Image
                    src={src}
                    alt={`Repair photo ${i + 1}`}
                    width={120}
                    height={90}
                    className="rd-image-img"
                  />
                  {i === 2 && extraImages > 0 && (
                    <div className="rd-image-overlay">
                      +{extraImages} images
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="rd-actions">
          <button className="rd-action-primary" id="download-invoice">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              picture_as_pdf
            </span>
            Download PDF invoice
          </button>
          <button className="rd-action-secondary" id="send-support">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              support_agent
            </span>
            Send support request
          </button>
        </div>
      </div>
    </div>
  );
}
