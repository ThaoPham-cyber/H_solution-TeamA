"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { HomeShell } from "@/components/home/home-shell";

export default function HomePage() {
  const router = useRouter();

  return (
    <HomeShell activeNav="home" mainClassName="home-content--dashboard">
      <div className="home-col-left">
        {/* SOS Section */}
        <section className="sos-section">
          <div className="sos-outer">
            <button
              className="sos-button"
              onClick={() => router.push("/home/sos")}
              aria-label="SOS Emergency Button"
            >
              <div className="sos-icon">
                {/* Medical asterisk */}
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="4" width="8" height="40" rx="4" fill="white"/>
                  <rect x="4" y="20" width="40" height="8" rx="4" fill="white"/>
                  <rect x="8.69" y="13.03" width="8" height="30" rx="4" transform="rotate(-45 8.69 13.03)" fill="white"/>
                  <rect x="13.03" y="34.24" width="8" height="30" rx="4" transform="rotate(-135 13.03 34.24)" fill="white"/>
                </svg>
              </div>
              <span className="sos-text">SOS</span>
              <span className="sos-subtext">1-TOUCH HELP</span>
            </button>
          </div>
          <p className="sos-hint">Tap for emergency help</p>
        </section>

        {/* Status Card */}
        <section className="status-card">
          <div className="status-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#1565C0"/>
              <path d="M9.5 16.5L5.5 12.5L6.91 11.09L9.5 13.67L17.09 6.08L18.5 7.5L9.5 16.5Z" fill="white"/>
            </svg>
          </div>
          <div className="status-info">
            <span className="status-title">All systems normal</span>
            <span className="status-subtitle">Last checkup: May, 12, 2026</span>
          </div>
        </section>
      </div>

      <div className="home-col-right">
        {/* Book Repair Button */}
        <button className="book-repair-btn" onClick={() => router.push("/home/booking")}>
          <div className="book-repair-left">
            <span className="material-symbols-outlined book-repair-icon">local_shipping</span>
            <span className="book-repair-text">Book Repair</span>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="white"/>
          </svg>
        </button>

        {/* My Chair Card */}
        <section className="chair-card">
          <div className="chair-card-image">
            <img src="/wheelchair.png" alt="My Wheelchair" />
            <div className="chair-label">
              <span className="chair-name">My Chair</span>
              <span className="chair-model">Model X-200</span>
            </div>
          </div>
          <div className="chair-card-info">
            <div className="battery-section">
              <div className="battery-icon-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.67 4H14V2H10V4H8.33C7.6 4 7 4.6 7 5.33V20.67C7 21.4 7.6 22 8.33 22H15.67C16.4 22 17 21.4 17 20.67V5.33C17 4.6 16.4 4 15.67 4Z" fill="#0D2137"/>
                </svg>
                <span className="battery-percent">82%</span>
              </div>
              <span className="battery-label">Battery</span>
              <span className="battery-range">Good for 12 miles</span>
            </div>
          </div>
        </section>

        {/* Repair History */}
        <button className="repair-history-btn" onClick={() => router.push("/home/history")}>
          <div className="repair-history-left">
            <span className="material-symbols-outlined repair-history-icon">history</span>
            <span className="repair-history-text">Repair History</span>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 5L21 12L14 19" stroke="#0D2137" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </HomeShell>
  );
}
