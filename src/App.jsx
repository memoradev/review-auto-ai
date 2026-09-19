import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";
import FeedbackPage from "./components/FeedbackPage";
import WebsiteWidget from "./components/WebsiteWidget";
import AutomationPage from "./components/AutomationPage";

const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Reviews", icon: "★" },
  { name: "Analytics", icon: "◒" },
  { name: "Website Widget", icon: "▣" },
  { name: "Locations", icon: "⌖" },
  { name: "Automation", icon: "⚡" },
  { name: "Settings", icon: "⚙" },
];

/* -------------------------------------------------------------
   LANDING PAGE STYLES (LOGGED-OUT VISITORS)
------------------------------------------------------------- */
function LandingPageStyles() {
  return (
    <style>{`
      .lp-root {
        min-height: 100vh;
        background-color: #f8fafc;
        color: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.5;
        overflow-x: hidden;
      }

      /* NAV */
      .lp-nav {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(255, 255, 255, 0.88);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid #e2e8f0;
      }

      .lp-nav-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 14px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .lp-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: inherit;
        cursor: pointer;
      }

      .lp-brand-mark {
        width: 32px;
        height: 32px;
        background: #0f172a;
        color: #ffffff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 15px;
      }

      .lp-brand-text {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.02em;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .lp-brand-tag {
        font-size: 10px;
        font-weight: 700;
        background: #f1f5f9;
        color: #64748b;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .lp-nav-links {
        display: flex;
        align-items: center;
        gap: 28px;
      }

      .lp-nav-link {
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
        text-decoration: none;
        transition: color 0.15s ease;
      }

      .lp-nav-link:hover {
        color: #0f172a;
      }

      .lp-nav-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .lp-btn-ghost {
        background: transparent;
        border: 1px solid transparent;
        color: #334155;
        font-size: 13px;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .lp-btn-ghost:hover {
        background: #f1f5f9;
        color: #0f172a;
      }

      .lp-btn-primary {
        background: #0f172a;
        color: #ffffff;
        border: 1px solid #0f172a;
        font-size: 13px;
        font-weight: 600;
        padding: 9px 18px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s ease;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.1);
      }

      .lp-btn-primary:hover {
        background: #1e293b;
        border-color: #1e293b;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
      }

      /* HERO */
      .lp-hero {
        max-width: 1200px;
        margin: 0 auto;
        padding: 72px 24px 48px;
        text-align: center;
      }

      .lp-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #475569;
        margin-bottom: 24px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
      }

      .lp-eyebrow-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #2563eb;
      }

      .lp-hero-title {
        font-size: 54px;
        line-height: 1.1;
        font-weight: 800;
        letter-spacing: -0.035em;
        color: #0f172a;
        max-width: 900px;
        margin: 0 auto 20px;
      }

      .lp-hero-title span {
        color: #2563eb;
        display: block;
      }

      .lp-hero-description {
        font-size: 18px;
        line-height: 1.6;
        color: #475569;
        max-width: 640px;
        margin: 0 auto 32px;
      }

      .lp-hero-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .lp-hero-btn-main {
        padding: 13px 28px;
        font-size: 14px;
        font-weight: 700;
      }

      .lp-hero-btn-secondary {
        padding: 13px 24px;
        font-size: 14px;
        font-weight: 600;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        color: #334155;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .lp-hero-btn-secondary:hover {
        background: #f8fafc;
        border-color: #94a3b8;
        color: #0f172a;
      }

      .lp-hero-subtext {
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 48px;
      }

      /* PRODUCT PREVIEW FRAME */
      .lp-preview-wrapper {
        max-width: 1080px;
        margin: 0 auto 80px;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 16px;
        box-shadow: 0 20px 45px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.6);
        overflow: hidden;
        text-align: left;
      }

      .lp-preview-chrome {
        background: #f1f5f9;
        border-bottom: 1px solid #e2e8f0;
        padding: 12px 18px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .lp-preview-dots {
        display: flex;
        gap: 6px;
      }

      .lp-preview-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #cbd5e1;
      }

      .lp-preview-title {
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        letter-spacing: 0.02em;
        margin-left: 8px;
      }

      .lp-preview-content {
        padding: 24px;
        background: #f8fafc;
      }

      /* MOCK DASHBOARD ELEMENTS */
      .lp-mock-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        margin-bottom: 18px;
      }

      .lp-mock-stat {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 14px 16px;
      }

      .lp-mock-stat-label {
        font-size: 10px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .lp-mock-stat-value {
        font-size: 22px;
        font-weight: 800;
        color: #0f172a;
        margin: 6px 0 2px;
      }

      .lp-mock-stat-sub {
        font-size: 10px;
        color: #94a3b8;
      }

      .lp-mock-review-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 20px;
      }

      .lp-mock-left {
        display: flex;
        gap: 14px;
      }

      .lp-mock-rating-badge {
        width: 52px;
        min-width: 52px;
        height: 52px;
        background: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .lp-mock-rating-num {
        font-size: 16px;
        font-weight: 800;
        color: #b45309;
        line-height: 1;
      }

      .lp-mock-rating-stars {
        font-size: 9px;
        color: #f59e0b;
        margin-top: 3px;
      }

      .lp-mock-review-body strong {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
      }

      .lp-mock-review-body span {
        font-size: 11px;
        color: #64748b;
        margin-left: 6px;
      }

      .lp-mock-text {
        font-size: 12px;
        color: #334155;
        line-height: 1.5;
        margin: 8px 0 10px;
      }

      .lp-mock-pills {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .lp-pill {
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
      }

      .lp-pill-risk {
        background: #fee2e2;
        color: #b91c1c;
      }

      .lp-pill-sentiment {
        background: #fef3c7;
        color: #92400e;
      }

      .lp-pill-intent {
        background: #eff6ff;
        color: #1d4ed8;
      }

      .lp-mock-right {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .lp-mock-ai-header {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #2563eb;
        margin-bottom: 6px;
      }

      .lp-mock-ai-reply {
        font-size: 11px;
        line-height: 1.5;
        color: #334155;
        margin: 0 0 12px;
      }

      .lp-mock-actions {
        display: flex;
        gap: 8px;
      }

      .lp-mock-btn-approve {
        flex: 1;
        background: #0f172a;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        padding: 7px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
      }

      .lp-mock-btn-edit {
        flex: 1;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        color: #334155;
        border-radius: 6px;
        padding: 7px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
      }

      /* PROBLEM SECTION */
      .lp-section {
        padding: 80px 24px;
      }

      .lp-section-inner {
        max-width: 1080px;
        margin: 0 auto;
      }

      .lp-problem-header {
        text-align: center;
        max-width: 720px;
        margin: 0 auto 48px;
      }

      .lp-problem-header h2 {
        font-size: 36px;
        font-weight: 800;
        letter-spacing: -0.03em;
        line-height: 1.2;
        margin: 8px 0 14px;
      }

      .lp-problem-header p {
        font-size: 16px;
        color: #64748b;
      }

      .lp-quotes-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;
        margin-bottom: 36px;
      }

      .lp-quote-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 24px 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .lp-quote-text {
        font-size: 15px;
        font-style: italic;
        color: #334155;
        line-height: 1.5;
        margin-bottom: 16px;
      }

      .lp-quote-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
        color: #94a3b8;
        font-weight: 600;
      }

      .lp-problem-takeaway {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-left: 4px solid #2563eb;
        border-radius: 12px;
        padding: 24px 28px;
        text-align: center;
        max-width: 820px;
        margin: 0 auto;
      }

      .lp-problem-takeaway strong {
        display: block;
        font-size: 20px;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 6px;
        letter-spacing: -0.02em;
      }

      .lp-problem-takeaway p {
        margin: 0;
        font-size: 14px;
        color: #475569;
        line-height: 1.6;
      }

      /* HOW IT WORKS */
      .lp-how-bg {
        background: #ffffff;
        border-top: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
      }

      .lp-steps-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        margin-top: 40px;
        position: relative;
      }

      .lp-step-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 24px 20px;
      }

      .lp-step-num {
        font-size: 11px;
        font-weight: 800;
        color: #2563eb;
        background: #eff6ff;
        display: inline-block;
        padding: 3px 8px;
        border-radius: 6px;
        margin-bottom: 14px;
      }

      .lp-step-title {
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 8px;
      }

      .lp-step-desc {
        font-size: 12px;
        color: #64748b;
        line-height: 1.55;
        margin: 0;
      }

      /* PRODUCT IN DEPTH */
      .lp-product-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
        margin-top: 40px;
      }

      .lp-feature-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 28px;
      }

      .lp-feature-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: #0f172a;
        color: #ffffff;
        display: grid;
        place-items: center;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 16px;
      }

      .lp-feature-card h3 {
        font-size: 17px;
        font-weight: 700;
        margin: 0 0 8px;
        color: #0f172a;
      }

      .lp-feature-card p {
        font-size: 13px;
        color: #64748b;
        line-height: 1.6;
        margin: 0;
      }

      /* FINAL CTA */
      .lp-cta-section {
        background: #0f172a;
        color: #ffffff;
        border-radius: 20px;
        padding: 64px 32px;
        text-align: center;
        max-width: 1080px;
        margin: 60px auto 80px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
      }

      .lp-cta-section h2 {
        font-size: 38px;
        font-weight: 800;
        letter-spacing: -0.03em;
        line-height: 1.2;
        margin: 0 0 10px;
      }

      .lp-cta-section h3 {
        font-size: 22px;
        font-weight: 600;
        color: #94a3b8;
        margin: 0 0 28px;
      }

      .lp-cta-btn {
        background: #ffffff;
        color: #0f172a;
        border: none;
        font-size: 14px;
        font-weight: 700;
        padding: 14px 32px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .lp-cta-btn:hover {
        background: #f1f5f9;
        transform: translateY(-1px);
      }

      /* FOOTER */
      .lp-footer {
        border-top: 1px solid #e2e8f0;
        padding: 32px 24px;
        font-size: 12px;
        color: #94a3b8;
        text-align: center;
      }

      .lp-footer-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      /* RESPONSIVE */
      @media (max-width: 900px) {
        .lp-hero-title {
          font-size: 38px;
        }
        .lp-quotes-grid {
          grid-template-columns: 1fr;
        }
        .lp-steps-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .lp-product-grid {
          grid-template-columns: 1fr;
        }
        .lp-mock-stats {
          grid-template-columns: repeat(2, 1fr);
        }
        .lp-mock-review-card {
          grid-template-columns: 1fr;
        }
        .lp-nav-links {
          display: none;
        }
      }

      @media (max-width: 600px) {
        .lp-hero {
          padding: 48px 16px 36px;
        }
        .lp-hero-title {
          font-size: 30px;
        }
        .lp-hero-description {
          font-size: 15px;
        }
        .lp-steps-grid {
          grid-template-columns: 1fr;
        }
        .lp-cta-section {
          padding: 44px 20px;
          margin: 40px 16px 60px;
        }
        .lp-cta-section h2 {
          font-size: 26px;
        }
        .lp-cta-section h3 {
          font-size: 16px;
        }
        .lp-footer-container {
          flex-direction: column;
          gap: 12px;
        }
      }
    `}</style>
  );
}

/* -------------------------------------------------------------
   LANDING PAGE COMPONENT (REVIEWAUTO PRD V1.0)
------------------------------------------------------------- */
function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="lp-root">
      <LandingPageStyles />

      {/* NAVIGATION */}
      <header className="lp-nav">
        <div className="lp-nav-container">
          <div className="lp-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="lp-brand-mark">R</div>
            <div className="lp-brand-text">
              ReviewAuto
              <span className="lp-brand-tag">AI</span>
            </div>
          </div>

          <nav className="lp-nav-links">
            <a href="#problem" className="lp-nav-link">The Problem</a>
            <a href="#how-it-works" className="lp-nav-link">How It Works</a>
            <a href="#product" className="lp-nav-link">Product</a>
          </nav>

          <div className="lp-nav-actions">
            <button type="button" className="lp-btn-ghost" onClick={onLogin}>
              Log In
            </button>
            <button type="button" className="lp-btn-primary" onClick={onGetStarted}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO */}
      <section className="lp-hero">
        <div className="lp-eyebrow">
          <span className="lp-eyebrow-dot" />
          AUTONOMOUS CUSTOMER FEEDBACK INTELLIGENCE
        </div>

        <h1 className="lp-hero-title">
          Your customers are already telling you what's wrong.
          <span>ReviewAuto helps you understand it and take action.</span>
        </h1>

        <p className="lp-hero-description">
          Stop reacting to scattered one-off ratings. ReviewAuto gathers customer feedback,
          decodes sentiment and operational risks in real-time, and drafts high-context responses autonomously.
        </p>

        <div className="lp-hero-actions">
          <button type="button" className="lp-btn-primary lp-hero-btn-main" onClick={onGetStarted}>
            Get Started Free
          </button>
          <button type="button" className="lp-hero-btn-secondary" onClick={onLogin}>
            Sign In to Workspace
          </button>
        </div>

        <div className="lp-hero-subtext">
          Instant setup • No card required • Direct QR & Web Deployment
        </div>

        {/* REAL PRODUCT VISUAL */}
        <div className="lp-preview-wrapper">
          <div className="lp-preview-chrome">
            <div className="lp-preview-dots">
              <span className="lp-preview-dot" />
              <span className="lp-preview-dot" />
              <span className="lp-preview-dot" />
            </div>
            <div className="lp-preview-title">reviewauto-workspace // autonomous-engine: active</div>
          </div>

          <div className="lp-preview-content">
            <div className="lp-mock-stats">
              <div className="lp-mock-stat">
                <span className="lp-mock-stat-label">Total Feedback</span>
                <div className="lp-mock-stat-value">248</div>
                <span className="lp-mock-stat-sub">Direct forms & QR codes</span>
              </div>
              <div className="lp-mock-stat">
                <span className="lp-mock-stat-label">Average Rating</span>
                <div className="lp-mock-stat-value">4.6 ★</div>
                <span className="lp-mock-stat-sub">Across all locations</span>
              </div>
              <div className="lp-mock-stat">
                <span className="lp-mock-stat-label">Needs Attention</span>
                <div className="lp-mock-stat-value" style={{ color: "#b45309" }}>2</div>
                <span className="lp-mock-stat-sub">Bottleneck detected</span>
              </div>
              <div className="lp-mock-stat">
                <span className="lp-mock-stat-label">Auto-Replies</span>
                <div className="lp-mock-stat-value" style={{ color: "#047857" }}>98.4%</div>
                <span className="lp-mock-stat-sub">Processed by AI pipeline</span>
              </div>
            </div>

            <div className="lp-mock-review-card">
              <div className="lp-mock-left">
                <div className="lp-mock-rating-badge">
                  <span className="lp-mock-rating-num">2/5</span>
                  <span className="lp-mock-rating-stars">★★☆☆☆</span>
                </div>
                <div className="lp-mock-review-body">
                  <strong>Marcus Sterling</strong>
                  <span>14 mins ago • Direct QR</span>
                  <p className="lp-mock-text">
                    “Great food, but we waited 35 minutes for our table on a Friday night. Nobody checked in while we were waiting.”
                  </p>
                  <div className="lp-mock-pills">
                    <span className="lp-pill lp-pill-risk">Risk: High</span>
                    <span className="lp-pill lp-pill-sentiment">Sentiment: Negative</span>
                    <span className="lp-pill lp-pill-intent">Intent: Service Delay</span>
                  </div>
                </div>
              </div>

              <div className="lp-mock-right">
                <div>
                  <div className="lp-mock-ai-header">✨ AI Generated Reply Draft</div>
                  <p className="lp-mock-ai-reply">
                    “Hi Marcus, thank you for praising our food, but a 35-minute wait without check-in is below our standard. I have shared this with our floor supervisor to improve peak-hour table pacing.”
                  </p>
                </div>
                <div className="lp-mock-actions">
                  <button type="button" className="lp-mock-btn-approve" onClick={onGetStarted}>
                    Approve Reply
                  </button>
                  <button type="button" className="lp-mock-btn-edit" onClick={onGetStarted}>
                    Edit Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section id="problem" className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-problem-header">
            <div className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              THE REALITY OF FEEDBACK
            </div>
            <h2>Reviews are noisy. Problems stay hidden.</h2>
            <p>Every business collects customer feedback, but individual complaints mask systemic operational issues.</p>
          </div>

          <div className="lp-quotes-grid">
            <div className="lp-quote-card">
              <div className="lp-quote-text">
                “Great food, but we waited 35 minutes.”
              </div>
              <div className="lp-quote-meta">
                <span>Direct Table QR</span>
                <span>★ ★ ☆ ☆ ☆</span>
              </div>
            </div>

            <div className="lp-quote-card">
              <div className="lp-quote-text">
                “Friendly staff, slow service.”
              </div>
              <div className="lp-quote-meta">
                <span>Customer Survey</span>
                <span>★ ★ ★ ☆ ☆</span>
              </div>
            </div>

            <div className="lp-quote-card">
              <div className="lp-quote-text">
                “Loved the coffee, but waiting 20 minutes for a pastry at lunch makes no sense.”
              </div>
              <div className="lp-quote-meta">
                <span>Website Widget</span>
                <span>★ ★ ★ ☆ ☆</span>
              </div>
            </div>
          </div>

          <div className="lp-problem-takeaway">
            <strong>You see individual reviews. ReviewAuto helps you see the pattern.</strong>
            <p>
              When complaints arrive one at a time, managers dismiss them as bad luck or an off day. ReviewAuto aggregates every channel, detects recurring root causes, and tells you exactly what operational adjustment to make.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="lp-section lp-how-bg">
        <div className="lp-section-inner">
          <div className="lp-problem-header">
            <div className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              STREAMLINED PIPELINE
            </div>
            <h2>How ReviewAuto Works</h2>
            <p>From customer submission to operational resolution in four clear stages.</p>
          </div>

          <div className="lp-steps-grid">
            <div className="lp-step-card">
              <span className="lp-step-num">STEP 01</span>
              <h3 className="lp-step-title">Collect feedback</h3>
              <p className="lp-step-desc">
                Deploy instant table QR codes, custom web forms, and embed widgets to capture impressions before they escalate to public negative reviews.
              </p>
            </div>

            <div className="lp-step-card">
              <span className="lp-step-num">STEP 02</span>
              <h3 className="lp-step-title">AI analyzes it</h3>
              <p className="lp-step-desc">
                ReviewAuto instantly parses sentiment, categorizes customer intent, and scores liability risks for every single submission.
              </p>
            </div>

            <div className="lp-step-card">
              <span className="lp-step-num">STEP 03</span>
              <h3 className="lp-step-title">Understand the problems</h3>
              <p className="lp-step-desc">
                Identify service bottlenecks, staff friction, or kitchen delays. Recurring patterns are flagged so you fix the root cause.
              </p>
            </div>

            <div className="lp-step-card">
              <span className="lp-step-num">STEP 04</span>
              <h3 className="lp-step-title">Take action</h3>
              <p className="lp-step-desc">
                Approve contextual AI responses, escalate high-risk complaints to management, and publish verified replies with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT */}
      <section id="product" className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-problem-header">
            <div className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              INTELLIGENCE IN ACTION
            </div>
            <h2>Built for business operators, not algorithms.</h2>
            <p>Everything you need to safeguard your reputation and improve your operations.</p>
          </div>

          <div className="lp-product-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-icon">★</div>
              <h3>Real-Time Sentiment</h3>
              <p>
                Identifies nuanced sentiment across positive, mixed, and negative reviews—flagging subtle passive dissatisfaction that ordinary rating averages miss.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">⚡</div>
              <h3>Automated Risk Detection</h3>
              <p>
                Flags critical issues such as food safety, extreme wait times, billing discrepancies, or staff misconduct so managers can intervene immediately.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">⌖</div>
              <h3>Customer Intent Recognition</h3>
              <p>
                Separates compliments from operational grievances, refund requests, and product inquiries. Know exactly why customers are reaching out.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">▣</div>
              <h3>Autonomous & Approved Replies</h3>
              <p>
                Let safe responses publish automatically while keeping delicate or high-risk feedback queued for one-click human review and editing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="lp-cta-section">
        <h2>Your customers are giving you the answers.</h2>
        <h3>ReviewAuto helps you find them.</h3>
        <button type="button" className="lp-cta-btn" onClick={onGetStarted}>
          Get Started with ReviewAuto
        </button>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-container">
          <div>
            <strong>ReviewAuto</strong> — Autonomous Feedback Intelligence & Operational Insights.
          </div>
          <div>
            © {new Date().getFullYear()} ReviewAuto. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------
   REVIEWAUTO MODERN DESIGN SYSTEM & COMPONENT STYLES
------------------------------------------------------------- */
function DashboardReviewsStyles() {
  return (
    <style>{`
      /* RESET & BASE */
      :root {
        --bg-app: #f8fafc;
        --bg-surface: #ffffff;
        --bg-subtle: #f1f5f9;
        --border-color: #e2e8f0;
        --border-hover: #cbd5e1;
        --text-main: #0f172a;
        --text-muted: #64748b;
        --text-subtle: #94a3b8;
        --primary: #0f172a;
        --primary-hover: #1e293b;
        --primary-foreground: #ffffff;
        --accent: #2563eb;
        --success: #10b981;
        --warning: #f59e0b;
        --danger: #ef4444;
        --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
        background-color: var(--bg-app);
        color: var(--text-main);
        font-family: var(--font-sans);
        -webkit-font-smoothing: antialiased;
      }

      /* LAYOUT */
      .app {
        display: flex;
        min-height: 100vh;
        width: 100%;
        background-color: var(--bg-app);
      }

      .sidebar {
        width: 260px;
        min-width: 260px;
        background: #ffffff;
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        padding: 24px 16px;
        height: 100vh;
        position: sticky;
        top: 0;
      }

      .main {
        flex: 1;
        min-width: 0;
        padding: 32px 40px;
        max-width: 1400px;
        margin: 0 auto;
        overflow-y: auto;
      }

      /* BRAND & SIDEBAR */
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 8px 20px;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 20px;
      }

      .brand-mark {
        width: 36px;
        height: 36px;
        background: #0f172a;
        color: #ffffff;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 16px;
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
      }

      .brand-name {
        display: flex;
        align-items: baseline;
        gap: 6px;
      }

      .brand-name strong {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-main);
      }

      .brand-name span {
        font-size: 10px;
        font-weight: 700;
        background: var(--bg-subtle);
        color: var(--text-muted);
        padding: 2px 6px;
        border-radius: 4px;
      }

      .workspace-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--text-subtle);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0 10px;
        margin-bottom: 4px;
      }

      .workspace-pill {
        padding: 8px 10px;
        background: var(--bg-subtle);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-main);
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .navigation {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: var(--text-muted);
        font-size: 13px;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease-in-out;
      }

      .nav-item:hover {
        background: var(--bg-subtle);
        color: var(--text-main);
      }

      .nav-item.active {
        background: var(--primary);
        color: #ffffff;
      }

      .nav-icon {
        font-size: 15px;
        width: 20px;
        display: inline-grid;
        place-items: center;
      }

      .sidebar-bottom {
        padding-top: 16px;
        border-top: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .connection-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: #f8fafc;
        border: 1px solid var(--border-color);
        border-radius: 8px;
      }

      .connection-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--success);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
      }

      .connection-card strong {
        display: block;
        font-size: 11px;
        color: var(--text-main);
      }

      .connection-card span {
        display: block;
        font-size: 10px;
        color: var(--text-muted);
      }

      .account-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 4px;
      }

      .account-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #e2e8f0;
        color: #334155;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .account-details {
        flex: 1;
        min-width: 0;
      }

      .account-details strong {
        display: block;
        font-size: 12px;
        color: var(--text-main);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .account-details span {
        display: block;
        font-size: 10px;
        color: var(--text-muted);
      }

      .signout-button {
        background: transparent;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        width: 28px;
        height: 28px;
        cursor: pointer;
        display: grid;
        place-items: center;
        color: var(--text-muted);
        transition: all 0.15s ease;
      }

      .signout-button:hover {
        background: #fee2e2;
        color: #ef4444;
        border-color: #fecaca;
      }

      /* HEADER */
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 28px;
      }

      .header h1 {
        margin: 4px 0 0;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: -0.03em;
        color: var(--text-main);
      }

      .eyebrow {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-subtle);
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .header-button {
        width: 36px;
        height: 36px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 9px;
        cursor: pointer;
        display: grid;
        place-items: center;
        color: var(--text-muted);
        font-weight: 700;
        transition: all 0.15s ease;
      }

      .header-button:hover {
        background: var(--bg-subtle);
        color: var(--text-main);
      }

      /* BUTTONS */
      .primary-button {
        background: var(--primary);
        color: var(--primary-foreground);
        border: 1px solid var(--primary);
        border-radius: 8px;
        padding: 9px 15px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .primary-button:hover:not(:disabled) {
        background: var(--primary-hover);
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.15);
      }

      .primary-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .secondary-button {
        background: #ffffff;
        color: #334155;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 9px 15px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .secondary-button:hover:not(:disabled) {
        background: var(--bg-subtle);
        border-color: var(--border-hover);
      }

      .secondary-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .danger-button {
        background: #ffffff;
        color: #dc2626;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 9px 15px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .danger-button:hover:not(:disabled) {
        background: #fef2f2;
        border-color: #fca5a5;
      }

      /* CARDS & PANELS */
      .panel {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 22px 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .panel-header h2 {
        margin: 2px 0 0;
        font-size: 17px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-main);
      }

      .panel-count {
        background: var(--bg-subtle);
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 20px;
      }

      /* STATS GRID */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 18px 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: transform 0.15s ease;
      }

      .stat-card:hover {
        border-color: var(--border-hover);
      }

      .stat-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: var(--text-main);
        margin: 10px 0 4px;
      }

      .stat-detail {
        font-size: 11px;
        color: var(--text-subtle);
      }

      /* AUTOMATION BANNER */
      .automation-banner {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      }

      .automation-banner h2 {
        margin: 2px 0 0;
        font-size: 15px;
        font-weight: 700;
        color: var(--text-main);
      }

      .automation-banner p {
        margin: 3px 0 0;
        font-size: 12px;
        color: var(--text-muted);
      }

      .toggle-button {
        height: 32px;
        padding: 0 12px;
        border-radius: 20px;
        border: 1px solid var(--border-color);
        background: var(--bg-subtle);
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .toggle-button span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #94a3b8;
      }

      .toggle-button.active {
        background: #0f172a;
        color: #ffffff;
        border-color: #0f172a;
      }

      .toggle-button.active span {
        background: #22c55e;
        box-shadow: 0 0 6px #22c55e;
      }

      /* DASHBOARD ACTIVATION CARD */
      .dashboard-activation {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      }

      .dashboard-activation-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 22px;
      }

      .dashboard-activation h2 {
        margin: 3px 0 0;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-main);
      }

      .dashboard-activation-header p {
        margin: 4px 0 0;
        font-size: 13px;
        color: var(--text-muted);
      }

      .dashboard-activation-progress {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--bg-subtle);
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
      }

      .activation-check {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--success);
        color: #ffffff;
        display: grid;
        place-items: center;
        font-size: 9px;
        font-weight: 800;
      }

      .activation-pending {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid var(--border-color);
        background: #ffffff;
        color: var(--text-subtle);
        display: grid;
        place-items: center;
        font-size: 9px;
      }

      .activation-divider {
        color: var(--text-subtle);
      }

      .dashboard-activation-options {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
      }

      .activation-option {
        background: var(--bg-subtle);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: all 0.15s ease;
      }

      .activation-option:hover {
        border-color: var(--border-hover);
        background: #ffffff;
      }

      .activation-option.disabled {
        opacity: 0.65;
        background: #f8fafc;
      }

      .activation-option-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        display: grid;
        place-items: center;
        font-size: 14px;
        font-weight: 700;
        color: var(--text-main);
        margin-bottom: 12px;
      }

      .activation-option h3 {
        margin: 0;
        font-size: 13px;
        font-weight: 700;
        color: var(--text-main);
      }

      .activation-option p {
        margin: 6px 0 14px;
        font-size: 11px;
        color: var(--text-muted);
        line-height: 1.45;
        min-height: 48px;
      }

      .activation-button {
        width: 100%;
        padding: 8px 12px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid var(--primary);
        background: var(--primary);
        color: #ffffff;
        transition: all 0.15s ease;
      }

      .activation-button:hover:not(:disabled) {
        background: var(--primary-hover);
      }

      .activation-button.secondary {
        background: #ffffff;
        color: var(--text-muted);
        border-color: var(--border-color);
      }

      .activation-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .activation-error {
        font-size: 10px;
        color: var(--danger);
        margin-top: 6px;
      }

      .activation-option-title-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .activation-coming-soon {
        font-size: 8px;
        font-weight: 700;
        background: #e2e8f0;
        color: #475569;
        padding: 2px 5px;
        border-radius: 4px;
      }

      /* QR CODE PREVIEW PANEL */
      .activation-qr-panel {
        margin-top: 16px;
        padding: 16px 20px;
        background: #f8fafc;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 24px;
      }

      .activation-qr-preview {
        width: 120px;
        height: 120px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        display: grid;
        place-items: center;
        padding: 6px;
      }

      .activation-qr-preview img {
        width: 108px;
        height: 108px;
      }

      .activation-qr-details {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .activation-qr-eyebrow {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: var(--text-subtle);
        margin-bottom: 4px;
      }

      .activation-qr-details h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        color: var(--text-main);
      }

      .activation-qr-details p {
        margin: 4px 0 0;
        font-size: 11px;
        color: var(--text-muted);
      }

      .activation-qr-actions {
        display: flex;
        gap: 8px;
      }

      /* CONTENT GRID */
      .content-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;
      }

      .right-column {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* REVIEWS LIST & ROW (DASHBOARD) */
      .review-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .review-row {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 10px;
        transition: border-color 0.15s ease;
      }

      .review-row:hover {
        border-color: var(--border-hover);
      }

      /* REFINED REVIEW RATING */
      .review-rating-compact {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 5px 9px;
        border-radius: 8px;
        background: #fffbeb;
        border: 1px solid #fde68a;
        color: #b45309;
        font-size: 12px;
        font-weight: 800;
        flex-shrink: 0;
        align-self: flex-start;
      }

      /* MODERN RATING CARD FOR WORKFLOW ROWS */
      .review-rating-card {
        width: 56px;
        min-width: 56px;
        height: 56px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        flex-shrink: 0;
        align-self: flex-start;
        margin-top: 1px;
        user-select: none;
        transition: all 0.15s ease;
      }

      .review-rating-card:hover {
        border-color: #cbd5e1;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      }

      .rating-number-row {
        display: flex;
        align-items: baseline;
        gap: 1px;
        line-height: 1;
      }

      .rating-val {
        font-size: 17px;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.02em;
      }

      .rating-max {
        font-size: 10px;
        font-weight: 600;
        color: #94a3b8;
      }

      .rating-stars-row {
        display: flex;
        align-items: center;
        gap: 2px;
        margin-top: 5px;
        line-height: 1;
      }

      .star-glyph {
        font-size: 8px;
        line-height: 1;
      }

      .star-glyph.filled {
        color: #f59e0b;
      }

      .star-glyph.empty {
        color: #e2e8f0;
      }

      .review-content {
        flex: 1;
        min-width: 0;
      }

      .review-meta {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .review-meta strong {
        font-size: 13px;
        font-weight: 700;
        color: var(--text-main);
      }

      .review-meta span {
        font-size: 11px;
        color: var(--text-muted);
      }

      .review-text {
        margin: 6px 0;
        font-size: 12px;
        color: #334155;
        line-height: 1.5;
      }

      .review-ai-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 10px;
        color: var(--text-muted);
      }

      .review-ai-meta span {
        background: var(--bg-subtle);
        padding: 2px 7px;
        border-radius: 4px;
        font-weight: 600;
      }

      .review-status {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        padding: 4px 8px;
        border-radius: 6px;
        background: var(--bg-subtle);
        color: var(--text-muted);
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .review-status.replied {
        background: #ecfdf5;
        color: #047857;
      }

      .review-status.approval {
        background: #fef3c7;
        color: #b45309;
      }

      /* WORKFLOW ROWS (FULL REVIEWS PAGE) */
      .review-workflow-row {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 14px;
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 24px;
      }

      .review-main {
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }

      .review-workflow {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .workflow-status {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
      }

      .workflow-status span {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 6px;
        background: var(--bg-subtle);
        color: var(--text-muted);
      }

      .workflow-status span[data-status="awaiting_approval"] {
        background: #fef3c7;
        color: #b45309;
      }

      .workflow-status span[data-status="approved"] {
        background: #ecfdf5;
        color: #047857;
      }

      .ai-reply {
        background: #f8fafc;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px 14px;
      }

      .ai-reply p {
        margin: 6px 0 0;
        font-size: 12px;
        color: #334155;
        line-height: 1.55;
      }

      .workflow-actions {
        display: flex;
        gap: 8px;
        margin-top: 14px;
      }

      .workflow-actions button {
        flex: 1;
      }

      /* EMPTY STATE */
      .empty-state {
        text-align: center;
        padding: 48px 20px;
        color: var(--text-muted);
      }

      .empty-state-icon {
        font-size: 32px;
        color: var(--text-subtle);
        margin-bottom: 12px;
      }

      .empty-state h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: var(--text-main);
      }

      .empty-state p {
        margin: 6px 0 0;
        font-size: 12px;
        color: var(--text-muted);
      }

      /* WORKFLOW PANEL */
      .workflow {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .workflow-step {
        display: flex;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-color);
      }

      .workflow-step.last {
        border-bottom: none;
        padding-bottom: 0;
      }

      .step-number {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: var(--bg-subtle);
        color: var(--text-main);
        font-size: 10px;
        font-weight: 800;
        display: grid;
        place-items: center;
      }

      .step-content strong {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-main);
      }

      .step-content p {
        margin: 2px 0 0;
        font-size: 11px;
        color: var(--text-muted);
        line-height: 1.4;
      }

      /* LOCATION PANEL */
      .location-panel {
        background: #ffffff;
      }

      .location-top {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .google-mark {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #ea4335;
        color: #ffffff;
        font-weight: 800;
        display: grid;
        place-items: center;
        font-size: 15px;
      }

      .location-title {
        flex: 1;
      }

      .location-title h3 {
        margin: 0;
        font-size: 13px;
        font-weight: 700;
      }

      .connected-badge {
        font-size: 9px;
        font-weight: 700;
        padding: 3px 7px;
        border-radius: 4px;
        background: #f1f5f9;
        color: #64748b;
      }

      .location-description {
        margin: 12px 0;
        font-size: 11px;
        color: var(--text-muted);
        line-height: 1.5;
      }

      /* SETTINGS / STATUS PILL */
      .status-pill {
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 20px;
      }

      .status-pill.active {
        background: #dcfce7;
        color: #15803d;
      }

      .status-pill.paused {
        background: #f1f5f9;
        color: #64748b;
      }

      /* ONBOARDING & AUTH PAGES */
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-app);
        padding: 24px;
      }

      .auth-card {
        width: 100%;
        max-width: 420px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      }

      .auth-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 24px;
      }

      .auth-brand-mark {
        width: 36px;
        height: 36px;
        background: #0f172a;
        color: #ffffff;
        border-radius: 8px;
        font-weight: 800;
        display: grid;
        place-items: center;
      }

      .auth-heading h1 {
        margin: 4px 0 0;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.02em;
      }

      .auth-heading p {
        margin: 6px 0 20px;
        font-size: 13px;
        color: var(--text-muted);
      }

      .auth-form label {
        display: block;
        margin-bottom: 16px;
      }

      .auth-form label span {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-main);
        margin-bottom: 6px;
      }

      .auth-form input {
        width: 100%;
        padding: 10px 14px;
        font-size: 13px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        outline: none;
        transition: border 0.15s ease;
      }

      .auth-form input:focus {
        border-color: #0f172a;
      }

      .auth-submit {
        width: 100%;
        padding: 10px;
        background: #0f172a;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .auth-submit:hover:not(:disabled) {
        background: #1e293b;
      }

      .auth-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .auth-message {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        margin-bottom: 14px;
      }

      .auth-message.error {
        background: #fee2e2;
        color: #dc2626;
      }

      .auth-note {
        margin-top: 16px;
        font-size: 11px;
        color: var(--text-subtle);
        text-align: center;
      }

      /* LOADING PAGE */
      .loading-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--bg-app);
      }

      .loading-mark {
        width: 44px;
        height: 44px;
        background: #0f172a;
        color: #ffffff;
        border-radius: 12px;
        font-weight: 800;
        font-size: 20px;
        display: grid;
        place-items: center;
        margin-bottom: 20px;
      }

      .loading-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #e2e8f0;
        border-top-color: #0f172a;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: 12px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .loading-page p {
        font-size: 12px;
        color: var(--text-muted);
      }

      /* PLACEHOLDER PAGE */
      .placeholder-page {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 60px 24px;
        text-align: center;
      }

      .placeholder-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }

      .placeholder-page h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }

      .placeholder-page p {
        margin: 6px 0 20px;
        font-size: 12px;
        color: var(--text-muted);
      }

      /* MOBILE PRESENTATION & RESPONSIVE REFINEMENTS */
      .mobile-app {
        min-height: 100vh;
        background: var(--bg-app);
        width: 100%;
        overflow-x: hidden;
      }

      .mobile-header {
        position: sticky;
        top: 0;
        z-index: 40;
        height: 58px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        border-bottom: 1px solid var(--border-color);
        padding: 0 16px;
        display: flex;
        align-items: center;
        padding-top: env(safe-area-inset-top, 0);
      }

      .mobile-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        flex: 1;
      }

      .mobile-menu-button {
        width: 38px;
        height: 38px;
        border: 1px solid var(--border-color);
        background: #ffffff;
        border-radius: 8px;
        display: grid;
        place-items: center;
        font-size: 16px;
        cursor: pointer;
        flex-shrink: 0;
        color: var(--text-main);
      }

      .mobile-brand {
        display: flex;
        align-items: baseline;
        min-width: 0;
        overflow: hidden;
      }

      .mobile-brand strong {
        font-size: 14px;
        font-weight: 700;
        flex-shrink: 0;
      }

      .mobile-brand span {
        font-size: 11px;
        color: var(--text-muted);
        margin-left: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .mobile-main {
        padding: 16px;
        width: 100%;
        max-width: 100vw;
        overflow-x: hidden;
      }

      .mobile-drawer-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.4);
        z-index: 90;
        border: none;
        cursor: pointer;
      }

      .mobile-drawer {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 280px;
        max-width: 85vw;
        background: #ffffff;
        z-index: 100;
        padding: 20px 16px;
        display: flex;
        flex-direction: column;
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding-bottom: max(20px, env(safe-area-inset-bottom, 0));
      }

      .mobile-drawer-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .mobile-drawer-title {
        font-size: 16px;
        font-weight: 700;
      }

      .mobile-nav {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
      }

      .mobile-nav-button {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 12px;
        border-radius: 8px;
        border: none;
        background: transparent;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
        cursor: pointer;
        text-align: left;
        min-height: 42px;
      }

      .mobile-nav-button.active {
        background: #0f172a;
        color: #ffffff;
      }

      .mobile-signout {
        width: 100%;
        padding: 11px;
        background: transparent;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        min-height: 42px;
      }

      /* RESPONSIVE LAYOUTS */
      @media (max-width: 1100px) {
        .mobile-app .dashboard-activation-options {
          grid-template-columns: repeat(2, 1fr);
        }
        .mobile-app .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .mobile-app .content-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .mobile-app .dashboard-activation-options {
          grid-template-columns: 1fr;
        }
        .mobile-app .activation-option p {
          min-height: auto;
          margin: 4px 0 12px;
        }
        .mobile-app .dashboard-activation-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
        }
        .mobile-app .dashboard-activation-progress {
          width: 100%;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
        }
        .mobile-app .review-workflow-row {
          grid-template-columns: 1fr;
          padding: 16px;
          gap: 16px;
        }
        .mobile-app .activation-qr-panel {
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          padding: 16px;
        }
        .mobile-app .activation-qr-details {
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          gap: 14px;
        }
        .mobile-app .activation-qr-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mobile-app .activation-qr-actions button {
          width: 100%;
        }
        .mobile-app .review-rating-card {
          width: 48px;
          min-width: 48px;
          height: 48px;
          border-radius: 10px;
        }
        .mobile-app .rating-val {
          font-size: 14px;
        }
        .mobile-app .rating-max {
          font-size: 9px;
        }
        .mobile-app .rating-stars-row {
          gap: 1px;
          margin-top: 3px;
        }
        .mobile-app .star-glyph {
          font-size: 7px;
        }
        .mobile-app .auth-form input,
        .mobile-app textarea {
          font-size: 16px !important;
        }
      }

      @media (max-width: 640px) {
        .mobile-app .mobile-main {
          padding: 14px 12px;
        }
        .mobile-app .panel {
          padding: 16px 14px;
          border-radius: 12px;
        }
        .mobile-app .panel-header {
          flex-wrap: wrap;
          gap: 8px;
          align-items: flex-start;
        }
        .mobile-app .automation-banner {
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 16px;
        }
        .mobile-app .automation-banner .toggle-button {
          align-self: flex-start;
        }
        .mobile-app .workflow-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .mobile-app .workflow-actions button {
          width: 100%;
          padding: 9px 6px;
          font-size: 11px;
        }
        .mobile-app .review-row {
          flex-wrap: wrap;
          gap: 8px 12px;
          padding: 12px;
        }
        .mobile-app .review-rating-compact {
          order: 1;
        }
        .mobile-app .review-status {
          order: 2;
          margin-left: auto;
        }
        .mobile-app .review-content {
          order: 3;
          width: 100%;
        }
        .mobile-app .review-meta {
          flex-wrap: wrap;
          gap: 6px;
        }
        .mobile-app .review-ai-meta {
          flex-wrap: wrap;
          gap: 6px;
        }
        .mobile-app .analytics-velocity-chart {
          gap: 6px !important;
        }
        .mobile-app .settings-actions {
          flex-direction: column !important;
          gap: 8px !important;
        }
        .mobile-app .settings-actions button {
          width: 100% !important;
        }
      }

      @media (max-width: 480px) {
        .mobile-app .stats-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .mobile-app .stat-card {
          padding: 12px;
          border-radius: 10px;
        }
        .mobile-app .stat-label {
          font-size: 10px;
        }
        .mobile-app .stat-value {
          font-size: 20px;
          margin: 6px 0 2px;
        }
        .mobile-app .stat-detail {
          font-size: 10px;
          line-height: 1.3;
        }
        .mobile-app .auth-page {
          padding: 16px 12px;
        }
        .mobile-app .auth-card {
          padding: 20px 16px;
          border-radius: 12px;
        }
        .mobile-app .auth-heading h1 {
          font-size: 20px;
        }
        .mobile-app .placeholder-page {
          padding: 40px 16px;
        }
      }
    `}</style>
  );
}

function App() {
  const feedbackMatch =
    window.location.pathname.match(
      /^\/f\/([^/]+)\/?$/
    );

  if (feedbackMatch) {
    return (
      <FeedbackPage
        slug={decodeURIComponent(
          feedbackMatch[1]
        )}
      />
    );
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Preserve direct auth routes like /reset-password or Supabase access token links
  const [showAuth, setShowAuth] = useState(() => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname;
    const hash = window.location.hash || "";
    return (
      path === "/reset-password" ||
      path === "/login" ||
      path === "/signup" ||
      hash.includes("access_token") ||
      hash.includes("type=recovery")
    );
  });

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data,
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error(
          "Failed to load session:",
          error
        );
      }

      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          setSession(newSession);
        }
      );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    if (showAuth) {
      return (
        <div style={{ position: "relative" }}>
          {window.location.pathname !== "/reset-password" && (
            <button
              type="button"
              onClick={() => setShowAuth(false)}
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                zIndex: 50,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              ← Back to Overview
            </button>
          )}
          <Auth />
        </div>
      );
    }

    return (
      <LandingPage
        onGetStarted={() => setShowAuth(true)}
        onLogin={() => setShowAuth(true)}
      />
    );
  }

  return <Dashboard session={session} />;
}

function LoadingScreen() {
  return (
    <main className="loading-page">
      <div className="loading-mark">R</div>
      <div className="loading-spinner" />
      <p>Loading your workspace...</p>
    </main>
  );
}

function useIsMobile() {
  const getValue = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1023px)").matches;

  const [isMobile, setIsMobile] = useState(getValue);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const handleChange = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

function MobileDashboard({
  activePage,
  setActivePage,
  workspace,
  automation,
  reviews,
  setReviews,
  reviewsLoading,
  onToggleAutomation,
  onOpenWebsiteWidget,
  onToggleFeedback,
  onCopyFeedbackLink,
  onSignOut,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function navigate(page) {
    setActivePage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const pageTitle =
    activePage === "Dashboard"
      ? workspace?.name || "Dashboard"
      : activePage;

  return (
    <div className="mobile-app">
      <header className="mobile-header">
        <div className="mobile-header-left">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </button>
          <div className="mobile-brand">
            <strong>ReviewAuto</strong>
            <span>{pageTitle}</span>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="mobile-drawer-backdrop"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="mobile-drawer" aria-label="Mobile navigation">
            <div className="mobile-drawer-top">
              <div className="mobile-drawer-title">ReviewAuto</div>
              <button
                type="button"
                className="mobile-menu-button"
                aria-label="Close navigation"
                onClick={() => setMenuOpen(false)}
              >
                ×
              </button>
            </div>

            <nav className="mobile-nav">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={`mobile-nav-button ${
                    activePage === item.name ? "active" : ""
                  }`}
                  onClick={() => navigate(item.name)}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            <div style={{ marginTop: "auto", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="connection-card">
                <span className="connection-indicator" />
                <div>
                  <strong>Feedback Status</strong>
                  <span>{workspace?.feedback_enabled !== false ? "Active & receiving" : "Paused"}</span>
                </div>
              </div>
              <button
                type="button"
                className="mobile-signout"
                onClick={onSignOut}
              >
                Sign out
              </button>
            </div>
          </aside>
        </>
      ) : null}

      <main className="mobile-main">
        <DashboardReviewsStyles />

        {activePage === "Dashboard" ? (
          <DashboardContent
            workspace={workspace}
            automation={automation}
            reviews={reviews}
            setReviews={setReviews}
            reviewsLoading={reviewsLoading}
            onToggleAutomation={onToggleAutomation}
            onOpenWebsiteWidget={onOpenWebsiteWidget}
          />
        ) : activePage === "Reviews" ? (
          <ReviewsPage
            reviews={reviews}
            setReviews={setReviews}
            loading={reviewsLoading}
          />
        ) : activePage === "Analytics" ? (
          <AnalyticsPage reviews={reviews} loading={reviewsLoading} />
        ) : activePage === "Website Widget" ? (
          <WebsiteWidget workspace={workspace} />
        ) : activePage === "Automation" ? (
          <AutomationPage
            automation={automation}
            reviews={reviews}
            onToggleAutomation={onToggleAutomation}
          />
        ) : activePage === "Settings" ? (
          <SettingsContent
            workspace={workspace}
            onToggleFeedback={onToggleFeedback}
            onCopyFeedbackLink={onCopyFeedbackLink}
          />
        ) : activePage === "Locations" ? (
          <LocationsPage />
        ) : (
          <PlaceholderPage
            page={activePage}
            onBack={() => navigate("Dashboard")}
          />
        )}
      </main>
    </div>
  );
}

function Dashboard({ session }) {
  const isMobile = useIsMobile();

  const [activePage, setActivePage] = useState("Dashboard");
  const [workspace, setWorkspace] = useState(null);
  const [automation, setAutomation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState("");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadWorkspace() {
      setWorkspaceLoading(true);
      setWorkspaceError("");

      try {
        const {
          data: business,
          error: businessError,
        } = await supabase
          .from("businesses")
          .select("*")
          .eq("owner_id", session.user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (businessError) throw businessError;

        if (!business) {
          if (mounted) setNeedsOnboarding(true);
          return;
        }

        let initializedBusiness = business;

        if (!initializedBusiness.feedback_slug) {
          const baseSlug =
            (initializedBusiness.name || "business")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
              .slice(0, 50) || "business";

          const uniqueSuffix =
            typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
              ? crypto.randomUUID().slice(0, 8)
              : `${Date.now()}`.slice(-8);

          const feedbackSlug = `${baseSlug}-${uniqueSuffix}`;

          const {
            data: updatedBusiness,
            error: feedbackSlugError,
          } = await supabase
            .from("businesses")
            .update({
              feedback_slug: feedbackSlug,
              feedback_enabled: true,
            })
            .eq("id", initializedBusiness.id)
            .eq("owner_id", session.user.id)
            .select("*")
            .single();

          if (feedbackSlugError) throw feedbackSlugError;
          initializedBusiness = updatedBusiness;
        }

        const {
          data: existingAutomationSettings,
          error: automationLookupError,
        } = await supabase
          .from("automation_settings")
          .select("*")
          .eq("business_id", initializedBusiness.id)
          .maybeSingle();

        if (automationLookupError) throw automationLookupError;

        let automationSettings = existingAutomationSettings;

        if (!automationSettings) {
          const {
            data: createdAutomationSettings,
            error: automationCreateError,
          } = await supabase
            .from("automation_settings")
            .insert({
              business_id: initializedBusiness.id,
              enabled: true,
              updated_at: new Date().toISOString(),
            })
            .select("*")
            .single();

          if (automationCreateError) throw automationCreateError;
          automationSettings = createdAutomationSettings;
        }

        if (mounted) {
          setNeedsOnboarding(false);
          setWorkspace(initializedBusiness);
          setAutomation(automationSettings);
        }

        await loadReviews(initializedBusiness.id, mounted);
      } catch (error) {
        console.error("Workspace loading error:", error);
        if (mounted) {
          setWorkspaceError(error?.message || "Unable to load your workspace.");
        }
      } finally {
        if (mounted) setWorkspaceLoading(false);
      }
    }

    loadWorkspace();

    return () => {
      mounted = false;
    };
  }, [session.user.id]);

  async function loadReviews(businessId, mounted = true) {
    setReviewsLoading(true);

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Review loading error:", error);
      if (mounted) setReviews([]);
    } else if (mounted) {
      setReviews(data || []);
    }

    if (mounted) setReviewsLoading(false);
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign out failed:", error);
  }

  async function toggleAutomation() {
    if (!workspace) return;

    const currentValue = automation?.enabled || false;
    const newValue = !currentValue;

    if (!automation) {
      const { data, error } = await supabase
        .from("automation_settings")
        .insert({
          business_id: workspace.id,
          enabled: newValue,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Automation creation failed:", error);
        return;
      }

      setAutomation(data);
      return;
    }

    const { data, error } = await supabase
      .from("automation_settings")
      .update({
        enabled: newValue,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", workspace.id)
      .select()
      .single();

    if (error) {
      console.error("Automation update failed:", error);
      return;
    }

    setAutomation(data);
  }

  async function updateFeedbackEnabled() {
    if (!workspace) return;

    const nextValue = workspace.feedback_enabled === false;

    const { data, error } = await supabase
      .from("businesses")
      .update({ feedback_enabled: nextValue })
      .eq("id", workspace.id)
      .select()
      .single();

    if (error) {
      console.error("Feedback link update failed:", error);
      return;
    }

    setWorkspace(data);
  }

  async function copyFeedbackLink() {
    if (!workspace?.feedback_slug) return false;
    const feedbackUrl = `${window.location.origin}/f/${workspace.feedback_slug}`;
    return copyText(feedbackUrl, "feedback link");
  }

  async function copyText(text, label = "text") {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      textArea.style.opacity = "0";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, textArea.value.length);

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) return true;
      throw new Error("Browser blocked clipboard access.");
    } catch (error) {
      console.error(`Failed to copy ${label}:`, error);
      window.prompt(`Copy your ${label}:`, text);
      return false;
    }
  }

  if (workspaceLoading) return <LoadingScreen />;

  if (needsOnboarding) {
    return (
      <WorkspaceOnboarding
        session={session}
        onCreated={async (business, automationSettings) => {
          setNeedsOnboarding(false);
          setWorkspaceError("");
          setWorkspace(business);
          setAutomation(automationSettings);
          await loadReviews(business.id, true);
        }}
      />
    );
  }

  if (workspaceError) {
    return (
      <WorkspaceError message={workspaceError} onSignOut={handleSignOut} />
    );
  }

  if (isMobile) {
    return (
      <MobileDashboard
        activePage={activePage}
        setActivePage={setActivePage}
        workspace={workspace}
        automation={automation}
        reviews={reviews}
        setReviews={setReviews}
        reviewsLoading={reviewsLoading}
        onToggleAutomation={toggleAutomation}
        onOpenWebsiteWidget={() => setActivePage("Website Widget")}
        onToggleFeedback={updateFeedbackEnabled}
        onCopyFeedbackLink={copyFeedbackLink}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        email={session.user.email}
        businessName={workspace?.name}
        onSignOut={handleSignOut}
        feedbackEnabled={workspace?.feedback_enabled !== false}
      />

      <main className="main">
        <DashboardReviewsStyles />

        <Header activePage={activePage} businessName={workspace?.name} />

        {activePage === "Dashboard" ? (
          <DashboardContent
            workspace={workspace}
            automation={automation}
            reviews={reviews}
            setReviews={setReviews}
            reviewsLoading={reviewsLoading}
            onToggleAutomation={toggleAutomation}
            onOpenWebsiteWidget={() => setActivePage("Website Widget")}
          />
        ) : activePage === "Reviews" ? (
          <ReviewsPage
            reviews={reviews}
            setReviews={setReviews}
            loading={reviewsLoading}
          />
        ) : activePage === "Analytics" ? (
          <AnalyticsPage reviews={reviews} loading={reviewsLoading} />
        ) : activePage === "Website Widget" ? (
          <WebsiteWidget workspace={workspace} />
        ) : activePage === "Automation" ? (
          <AutomationPage
            automation={automation}
            reviews={reviews}
            onToggleAutomation={toggleAutomation}
          />
        ) : activePage === "Settings" ? (
          <SettingsContent
            workspace={workspace}
            onToggleFeedback={updateFeedbackEnabled}
            onCopyFeedbackLink={copyFeedbackLink}
          />
        ) : activePage === "Locations" ? (
          <LocationsPage />
        ) : (
          <PlaceholderPage
            page={activePage}
            onBack={() => setActivePage("Dashboard")}
          />
        )}
      </main>
    </div>
  );
}

function WorkspaceOnboarding({ session, onCreated }) {
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateWorkspace(event) {
    event.preventDefault();
    const name = businessName.trim();

    if (!name) {
      setError("Please enter your business name.");
      return;
    }

    if (name.length > 120) {
      setError("Business name must be 120 characters or less.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const baseSlug =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 50) || "business";

      const uniqueSuffix =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID().slice(0, 8)
          : `${Date.now()}`.slice(-8);

      const uniqueSlug = `${baseSlug}-${uniqueSuffix}`;

      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert({
          owner_id: session.user.id,
          name,
          feedback_slug: uniqueSlug,
          feedback_enabled: true,
        })
        .select("*")
        .single();

      if (businessError) throw businessError;

      const { data: automationSettings, error: automationError } = await supabase
        .from("automation_settings")
        .insert({
          business_id: business.id,
          enabled: true,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (automationError) {
        await supabase
          .from("businesses")
          .delete()
          .eq("id", business.id)
          .eq("owner_id", session.user.id);
        throw automationError;
      }

      onCreated(business, automationSettings);
    } catch (createError) {
      console.error("Workspace creation failed:", createError);
      setError(
        createError?.message ||
          "Unable to create your workspace. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">R</div>
          <div>
            <strong>ReviewAuto</strong>
            <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "4px" }}>AI</span>
          </div>
        </div>

        <div className="auth-heading">
          <div className="eyebrow">GET STARTED</div>
          <h1>Create your workspace.</h1>
          <p>
            Start collecting customer feedback and let ReviewAuto handle the rest.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleCreateWorkspace}>
          <label>
            <span>Business name</span>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Acme Coffee Roasters"
              autoComplete="organization"
              maxLength={120}
              required
              autoFocus
            />
          </label>

          {error && <div className="auth-message error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating workspace..." : "Create workspace"}
          </button>
        </form>

        <div className="auth-note">
          Your feedback link and automation settings will be created automatically.
        </div>
      </section>
    </main>
  );
}

function WorkspaceError({ message, onSignOut }) {
  return (
    <main className="loading-page">
      <div className="auth-card">
        <div className="eyebrow">WORKSPACE ERROR</div>
        <h1 style={{ fontSize: "18px", margin: "8px 0" }}>We couldn't load your workspace.</h1>
        <p style={{ color: "#64748b", fontSize: "12px", lineHeight: 1.6, marginBottom: "16px" }}>
          {message}
        </p>
        <button type="button" className="auth-submit" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </main>
  );
}

function Sidebar({
  activePage,
  setActivePage,
  email,
  businessName,
  onSignOut,
  feedbackEnabled,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">R</div>
        <div className="brand-name">
          <strong>ReviewAuto</strong>
          <span>AI</span>
        </div>
      </div>

      <div className="workspace-label">Workspace</div>
      <div className="workspace-pill" title={businessName}>
        {businessName || "My Workspace"}
      </div>

      <nav className="navigation">
        {navigation.map((item) => (
          <button
            key={item.name}
            type="button"
            className={activePage === item.name ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage(item.name)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="connection-card">
          <span className="connection-indicator" />
          <div>
            <strong>Feedback Status</strong>
            <span>{feedbackEnabled ? "Active & receiving" : "Paused"}</span>
          </div>
        </div>

        <div className="account-card">
          <div className="account-avatar">{getInitials(email)}</div>
          <div className="account-details">
            <strong>{email}</strong>
            <span>Authenticated</span>
          </div>
          <button
            type="button"
            className="signout-button"
            onClick={onSignOut}
            title="Sign out"
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
  );
}

function getInitials(email = "") {
  const first = email.trim().charAt(0).toUpperCase();
  return first || "U";
}

function Header({ activePage, businessName }) {
  const title =
    activePage === "Dashboard"
      ? `Good morning, ${businessName || "Business Owner"}.`
      : activePage;

  return (
    <header className="header">
      <div>
        <div className="eyebrow">{activePage.toUpperCase()}</div>
        <h1>{title}</h1>
      </div>

      <div className="header-actions">
        <button type="button" className="header-button" aria-label="Notifications">
          🔔
        </button>
        <button type="button" className="header-button" aria-label="Help">
          ?
        </button>
      </div>
    </header>
  );
}

function DashboardActivationCard({ workspace, onOpenWebsiteWidget }) {
  const [activated, setActivated] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  const feedbackUrl = workspace?.feedback_slug
    ? `${window.location.origin}/f/${workspace.feedback_slug}`
    : "";

  async function handleCopyLink() {
    if (!feedbackUrl) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(feedbackUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = feedbackUrl;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, textArea.value.length);

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!successful) throw new Error("Browser blocked clipboard access.");
      }
      setActivated(true);
    } catch (error) {
      console.error("Feedback link copy failed:", error);
      window.prompt("Copy your feedback link:", feedbackUrl);
      setActivated(true);
    }
  }

  async function handleGenerateQr() {
    if (!feedbackUrl || qrLoading) return;

    setQrLoading(true);
    setQrError("");

    try {
      const dataUrl = await QRCode.toDataURL(feedbackUrl, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: "M",
      });

      setQrCode(dataUrl);
      setActivated(true);
    } catch (error) {
      console.error("QR code generation failed:", error);
      setQrError("Couldn't generate QR code. Link is still active.");
    } finally {
      setQrLoading(false);
    }
  }

  function handleDownloadQr() {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `${workspace?.name || "reviewauto"}-feedback-qr.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function handlePrintQr() {
    if (!qrCode) return;
    const printWindow = window.open("", "_blank", "width=700,height=800");
    if (!printWindow) return;

    const businessName = workspace?.name || "Your business";

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Feedback QR Code - ${businessName}</title>
          <style>
            body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; }
            .sheet { text-align: center; padding: 40px; }
            img { width: 300px; height: 300px; }
            h1 { margin: 20px 0 8px; font-size: 24px; font-weight: 700; }
            p { margin: 0; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <img src="${qrCode}" alt="QR code" />
            <h1>${businessName}</h1>
            <p>Scan to send us direct feedback</p>
          </div>
          <script>window.onload = function () { window.print(); };<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  function handleWebsiteWidget() {
    setActivated(true);
    if (typeof onOpenWebsiteWidget === "function") {
      onOpenWebsiteWidget();
    }
  }

  return (
    <section className="dashboard-activation">
      <div className="dashboard-activation-header">
        <div>
          <div className="eyebrow">Setup & Deployment</div>
          <h2>
            {activated
              ? "You're ready to collect customer feedback."
              : "Start collecting feedback seamlessly."}
          </h2>
          <p>
            {activated
              ? "Share your custom feedback link or download your brand QR code."
              : "Choose how customers will submit feedback to your workspace."}
          </p>
        </div>

        <div className="dashboard-activation-progress">
          <span className="activation-check">✓</span>
          <span>Workspace</span>
          <span className="activation-divider">→</span>
          <span className="activation-check">✓</span>
          <span>Link</span>
          <span className="activation-divider">→</span>
          <span className={activated ? "activation-check" : "activation-pending"}>
            {activated ? "✓" : "○"}
          </span>
          <span>Deployment</span>
        </div>
      </div>

      <div className="dashboard-activation-options">
        <div className="activation-option">
          <div className="activation-option-icon">↗</div>
          <div className="activation-option-content">
            <h3>Direct Link</h3>
            <p>Share with customers via SMS, WhatsApp, Email or receipt slips.</p>
            <button
              type="button"
              className="activation-button"
              onClick={handleCopyLink}
              disabled={!feedbackUrl}
            >
              Copy link
            </button>
          </div>
        </div>

        <div className="activation-option">
          <div className="activation-option-icon">#</div>
          <div className="activation-option-content">
            <h3>QR Code</h3>
            <p>Generate high-res QR for menus, tables, packaging or counter stands.</p>
            <button
              type="button"
              className="activation-button"
              onClick={handleGenerateQr}
              disabled={!feedbackUrl || qrLoading}
            >
              {qrLoading ? "Generating..." : qrCode ? "Regenerate QR" : "Generate QR"}
            </button>
            {qrError && <div className="activation-error">{qrError}</div>}
          </div>
        </div>

        <div className="activation-option">
          <div className="activation-option-icon">▣</div>
          <div className="activation-option-content">
            <h3>Embed Widget</h3>
            <p>Embed an elegant feedback component into your website.</p>
            <button
              type="button"
              className="activation-button secondary"
              onClick={handleWebsiteWidget}
            >
              Configure widget
            </button>
          </div>
        </div>

        <div className="activation-option disabled">
          <div className="activation-option-icon">⌖</div>
          <div className="activation-option-content">
            <div className="activation-option-title-row">
              <h3>Google Reviews</h3>
              <span className="activation-coming-soon">SOON</span>
            </div>
            <p>Sync and automatically reply to Google Business Profile reviews.</p>
            <button
              type="button"
              className="activation-button secondary"
              disabled
            >
              Coming soon
            </button>
          </div>
        </div>
      </div>

      {qrCode ? (
        <div className="activation-qr-panel">
          <div className="activation-qr-preview">
            <img src={qrCode} alt="ReviewAuto feedback QR code" />
          </div>
          <div className="activation-qr-details">
            <div>
              <div className="activation-qr-eyebrow">QR READY FOR PRINT & DIGITAL</div>
              <h3>Scan-ready customer feedback code</h3>
              <p>Customers can point their camera to leave direct ratings and reviews.</p>
            </div>
            <div className="activation-qr-actions">
              <button type="button" className="secondary-button" onClick={handleDownloadQr}>
                Download PNG
              </button>
              <button type="button" className="primary-button" onClick={handlePrintQr}>
                Print Code
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function DashboardContent({
  workspace,
  automation,
  reviews,
  setReviews,
  reviewsLoading,
  onToggleAutomation,
  onOpenWebsiteWidget,
}) {
  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
          totalReviews
        ).toFixed(1)
      : "—";

  const repliesSent = reviews.filter(
    (review) => review.reply_status === "published"
  ).length;

  const needsAttention = reviews.filter(
    (review) =>
      review.automation_status === "awaiting_approval" ||
      review.ai_risk_level === "high" ||
      review.ai_risk_level === "critical"
  ).length;

  return (
    <>
      <DashboardActivationCard
        workspace={workspace}
        onOpenWebsiteWidget={onOpenWebsiteWidget}
      />

      <section className="stats-grid">
        <StatCard
          label="Total Reviews"
          value={totalReviews}
          detail={totalReviews > 0 ? "Stored in workspace" : "No feedback collected yet"}
        />

        <StatCard
          label="Average Rating"
          value={averageRating !== "—" ? `${averageRating} ★` : "—"}
          detail={totalReviews > 0 ? "Overall satisfaction score" : "Awaiting first rating"}
        />

        <StatCard
          label="Replies Published"
          value={repliesSent}
          detail={repliesSent > 0 ? "Sent to customers" : "No automated replies sent"}
        />

        <StatCard
          label="Needs Attention"
          value={needsAttention}
          detail={needsAttention > 0 ? "Requires owner approval" : "All clean & processed"}
        />
      </section>

      <AutomationBanner
        enabled={automation?.enabled || false}
        setEnabled={onToggleAutomation}
      />

      <section className="content-grid">
        <ReviewsPanel
          reviews={reviews}
          setReviews={setReviews}
          loading={reviewsLoading}
        />

        <div className="right-column">
          <WorkflowPanel />
          <LocationPanel />
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value, detail }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </div>
  );
}

function AnalyticsPage({ reviews = [], loading }) {
  const total = reviews.length;

  const averageRating =
    total > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / total
        ).toFixed(1)
      : "—";

  const positive = reviews.filter((r) => r.ai_sentiment === "positive").length;
  const neutral = reviews.filter((r) => r.ai_sentiment === "neutral").length;
  const negative = reviews.filter((r) => r.ai_sentiment === "negative").length;
  const mixed = reviews.filter((r) => r.ai_sentiment === "mixed").length;

  const needsAttention = reviews.filter(
    (r) =>
      r.automation_status === "awaiting_approval" ||
      r.ai_risk_level === "high" ||
      r.ai_risk_level === "critical"
  ).length;

  const approved = reviews.filter((r) => r.automation_status === "approved").length;
  const rejected = reviews.filter(
    (r) => r.automation_status === "skipped" || r.automation_status === "rejected"
  ).length;

  const repliesPublished = reviews.filter((r) => r.reply_status === "published").length;

  const sourceCounts = {
    reviewauto: reviews.filter((r) => r.source === "reviewauto").length,
    google: reviews.filter((r) => r.source === "google").length,
    manual: reviews.filter((r) => r.source === "manual").length,
  };

  const ratingCounts = {
    5: reviews.filter((r) => Number(r.rating) === 5).length,
    4: reviews.filter((r) => Number(r.rating) === 4).length,
    3: reviews.filter((r) => Number(r.rating) === 3).length,
    2: reviews.filter((r) => Number(r.rating) === 2).length,
    1: reviews.filter((r) => Number(r.rating) === 1).length,
  };

  const lastSevenDays = getLastSevenDays(reviews);

  if (loading) {
    return (
      <section className="panel">
        <div className="empty-state">Loading analytics...</div>
      </section>
    );
  }

  return (
    <section>
      <section className="stats-grid">
        <StatCard
          label="Total Feedback"
          value={total}
          detail={total > 0 ? "Lifetime customer submissions" : "No feedback yet"}
        />
        <StatCard
          label="Average Rating"
          value={averageRating !== "—" ? `${averageRating} ★` : "—"}
          detail={total > 0 ? "Across all channels" : "Waiting for reviews"}
        />
        <StatCard
          label="Needs Attention"
          value={needsAttention}
          detail={needsAttention > 0 ? "High risk or pending" : "All clean"}
        />
        <StatCard
          label="Replies Published"
          value={repliesPublished}
          detail={repliesPublished > 0 ? "Delivered to clients" : "No replies published"}
        />
      </section>

      <section className="content-grid" style={{ marginTop: "24px" }}>
        <div>
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">Customer Sentiment</div>
                <h2>Sentiment Breakdown</h2>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <AnalyticsMetricRow label="Positive" value={positive} total={total} color="#10b981" />
              <AnalyticsMetricRow label="Neutral" value={neutral} total={total} color="#64748b" />
              <AnalyticsMetricRow label="Negative" value={negative} total={total} color="#ef4444" />
              <AnalyticsMetricRow label="Mixed" value={mixed} total={total} color="#f59e0b" />
            </div>
          </section>

          <section className="panel" style={{ marginTop: "24px" }}>
            <div className="panel-header">
              <div>
                <div className="eyebrow">Activity Velocity</div>
                <h2>Last 7 Days</h2>
              </div>
            </div>

            <div
              className="analytics-velocity-chart"
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "14px",
                height: "160px",
                marginTop: "20px",
                padding: "10px 0",
              }}
            >
              {lastSevenDays.map((day) => {
                const maximum = Math.max(...lastSevenDays.map((i) => i.count), 1);
                const height =
                  day.count === 0 ? 4 : Math.max(12, (day.count / maximum) * 110);

                return (
                  <div
                    key={day.key}
                    style={{
                      flex: 1,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
                      {day.count}
                    </span>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "36px",
                        height: `${height}px`,
                        background: "#0f172a",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.3s ease",
                      }}
                    />
                    <span style={{ marginTop: "8px", fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="right-column">
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">Workflow Progress</div>
                <h2>Review Status</h2>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <AnalyticsSimpleCount label="Approved" value={approved} />
              <AnalyticsSimpleCount label="Needs Attention" value={needsAttention} />
              <AnalyticsSimpleCount label="Skipped / Rejected" value={rejected} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">Channels</div>
                <h2>Feedback Sources</h2>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <AnalyticsSimpleCount
                label="Direct Web Form"
                value={sourceCounts.reviewauto}
                detail={getAnalyticsPercentage(sourceCounts.reviewauto, total)}
              />
              <AnalyticsSimpleCount
                label="Google Reviews"
                value={sourceCounts.google}
                detail={getAnalyticsPercentage(sourceCounts.google, total)}
              />
              <AnalyticsSimpleCount
                label="Manual Import"
                value={sourceCounts.manual}
                detail={getAnalyticsPercentage(sourceCounts.manual, total)}
              />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">Ratings</div>
                <h2>Rating Distribution</h2>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <AnalyticsSimpleCount
                  key={rating}
                  label={`${rating} Stars`}
                  value={ratingCounts[rating]}
                  detail={getAnalyticsPercentage(ratingCounts[rating], total)}
                />
              ))}
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}

function AnalyticsMetricRow({ label, value, total, color = "#0f172a" }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          marginBottom: "6px",
        }}
      >
        <span style={{ fontWeight: 600, color: "#334155" }}>{label}</span>
        <span style={{ color: "#64748b", fontWeight: 700 }}>
          {value} ({percentage}%)
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: "6px",
          background: "#f1f5f9",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: color,
            borderRadius: "4px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function AnalyticsSimpleCount({ label, value, detail }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #f1f5f9",
        fontSize: "12px",
      }}
    >
      <span style={{ color: "#475569", fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 700, color: "#0f172a" }}>
        {value} {detail ? <span style={{ color: "#94a3b8", fontWeight: 500 }}>({detail})</span> : ""}
      </span>
    </div>
  );
}

function getAnalyticsPercentage(value, total) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function getLastSevenDays(reviews) {
  const days = [];

  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);

    const key = date.toISOString().slice(0, 10);

    const count = reviews.filter((review) => {
      const value = review.created_at || review.review_created_at;
      if (!value) return false;

      const reviewDate = new Date(value);
      if (Number.isNaN(reviewDate.getTime())) return false;

      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate.toISOString().slice(0, 10) === key;
    }).length;

    days.push({
      key,
      count,
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
    });
  }

  return days;
}

function AutomationBanner({ enabled, setEnabled }) {
  return (
    <section className="automation-banner">
      <div>
        <div className="eyebrow">AI AUTOMATION ENGINE</div>
        <h2>System status: {enabled ? "Running & Autonomous" : "Paused"}</h2>
        <p>
          {enabled
            ? "Incoming reviews undergo automatic sentiment, safety checks, and response drafting."
            : "Automatic processing is paused. New customer reviews require manual handling."}
        </p>
      </div>

      <button
        type="button"
        className={enabled ? "toggle-button active" : "toggle-button"}
        onClick={setEnabled}
        aria-label={enabled ? "Turn automation off" : "Turn automation on"}
      >
        <span />
        {enabled ? "ACTIVE" : "PAUSED"}
      </button>
    </section>
  );
}

function ReviewsPanel({ reviews, setReviews, loading }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Recent Activity</div>
          <h2>Latest Customer Feedback</h2>
        </div>
        <span className="panel-count">{reviews.length}</span>
      </div>

      {loading ? (
        <div className="empty-state">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">★</div>
          <h3>No reviews yet</h3>
          <p>Your incoming feedback will appear here in real-time.</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.slice(0, 5).map((review) => (
            <ReviewRow key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewsPage({ reviews, setReviews, loading }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Inbox</div>
          <h2>All Reviews & Feedback</h2>
        </div>
        <span className="panel-count">{reviews.length}</span>
      </div>

      {loading ? (
        <div className="empty-state">Loading feedback stream...</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">★</div>
          <h3>No customer reviews found</h3>
          <p>Share your feedback link or embed the website widget to get started.</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <ReviewWorkflowRow
              key={review.id}
              review={review}
              setReviews={setReviews}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewWorkflowRow({ review, setReviews }) {
  const [reply, setReply] = useState(review.ai_generated_reply || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  async function saveApproval() {
    if (!reply.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("reviews")
      .update({
        ai_generated_reply: reply.trim(),
        automation_status: "approved",
        reply_status: "draft",
      })
      .eq("id", review.id)
      .select()
      .single();

    if (error) {
      console.error("Review approval failed:", error);
      setSaving(false);
      return;
    }

    setReviews((current) =>
      current.map((item) => (item.id === review.id ? data : item))
    );

    setEditing(false);
    setSaving(false);
  }

  async function approve() {
    if (!reply.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("reviews")
      .update({
        ai_generated_reply: reply.trim(),
        automation_status: "approved",
        reply_status: "draft",
      })
      .eq("id", review.id)
      .select()
      .single();

    if (error) {
      console.error("Review approval failed:", error);
      setSaving(false);
      return;
    }

    setReviews((current) =>
      current.map((item) => (item.id === review.id ? data : item))
    );

    setSaving(false);
  }

  async function reject() {
    setSaving(true);

    const { data, error } = await supabase
      .from("reviews")
      .update({
        automation_status: "skipped",
        reply_status: "not_replied",
      })
      .eq("id", review.id)
      .select()
      .single();

    if (error) {
      console.error("Review rejection failed:", error);
      setSaving(false);
      return;
    }

    setReviews((current) =>
      current.map((item) => (item.id === review.id ? data : item))
    );

    setSaving(false);
  }

  async function analyze() {
    setAnalyzing(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("You are not authenticated.");
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-review`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ review_id: review.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "AI analysis failed.");
      }

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", review.id)
        .single();

      if (error) throw error;

      setReply(data.ai_generated_reply || "");
      setReviews((current) =>
        current.map((item) => (item.id === review.id ? data : item))
      );
    } catch (error) {
      console.error("AI analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  }

  const status = review.automation_status || "pending";

  return (
    <article className="review-workflow-row">
      <div className="review-main">
        <div className="review-rating-card" title={`${review.rating || 0} out of 5 stars`}>
          <div className="rating-number-row">
            <span className="rating-val">{review.rating || "—"}</span>
            <span className="rating-max">/5</span>
          </div>
          <div className="rating-stars-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={
                  star <= Number(review.rating)
                    ? "star-glyph filled"
                    : "star-glyph empty"
                }
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="review-content">
          <div className="review-meta">
            <strong>{review.customer_name || "Anonymous Customer"}</strong>
            <span>{formatDate(review.review_created_at || review.created_at)}</span>
            {review.source && (
              <span style={{ textTransform: "capitalize", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px" }}>
                {review.source}
              </span>
            )}
          </div>

          <p className="review-text">{review.review_text || "No text feedback provided."}</p>

          <div className="review-ai-meta">
            <span style={{ color: review.ai_sentiment === "negative" ? "#ef4444" : "#10b981" }}>
              Sentiment: {review.ai_sentiment || "Not analyzed"}
            </span>
            <span>Risk: {review.ai_risk_level || "low"}</span>
            <span>Intent: {review.ai_intent || "feedback"}</span>
          </div>
        </div>
      </div>

      <div className="review-workflow">
        <div className="workflow-status">
          <span data-status={status}>{status}</span>
        </div>

        {editing ? (
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              resize: "vertical",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "12px",
              lineHeight: 1.5,
              fontFamily: "inherit",
              color: "#334155",
              background: "#ffffff",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        ) : (
          <div className="ai-reply">
            <div className="eyebrow" style={{ color: "#2563eb", marginBottom: "4px" }}>
              ✨ AI Draft Response
            </div>
            <p>{reply || "No response generated. Click Analyze to create one."}</p>
          </div>
        )}

        <div className="workflow-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={editing ? saveApproval : () => setEditing(true)}
            disabled={saving || analyzing}
          >
            {saving ? "Saving..." : editing ? "Save & Approve" : "Edit Response"}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={approve}
            disabled={saving || !reply.trim() || analyzing}
          >
            Approve
          </button>

          <button
            type="button"
            className="danger-button"
            onClick={reject}
            disabled={saving || analyzing}
          >
            Reject
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={analyze}
            disabled={saving || analyzing}
          >
            {analyzing ? "Analyzing..." : "Analyze AI"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ReviewRow({ review }) {
  const status = review.automation_status || "pending";

  const statusClass =
    status === "approved" || status === "published"
      ? "review-status replied"
      : status === "awaiting_approval"
      ? "review-status approval"
      : "review-status";

  return (
    <article className="review-row">
      <div className="review-rating-compact">
        <span style={{ color: "#f59e0b" }}>★</span>
        <span>{review.rating || "—"}</span>
      </div>

      <div className="review-content">
        <div className="review-meta">
          <strong>{review.customer_name || "Customer"}</strong>
          <span>{formatDate(review.review_created_at || review.created_at)}</span>
          {review.source && (
            <span style={{ textTransform: "capitalize" }}>{review.source}</span>
          )}
        </div>

        <p className="review-text">{review.review_text || "No review text."}</p>

        <div className="review-ai-meta">
          <span>{review.ai_sentiment || "neutral"}</span>
          <span>Risk: {review.ai_risk_level || "low"}</span>
        </div>
      </div>

      <div className={statusClass}>{status}</div>
    </article>
  );
}

function SettingsContent({ workspace, onToggleFeedback, onCopyFeedbackLink }) {
  const [copied, setCopied] = useState(false);

  if (!workspace) return null;

  const feedbackUrl = workspace.feedback_slug
    ? `${window.location.origin}/f/${workspace.feedback_slug}`
    : "";

  const feedbackEnabled = workspace.feedback_enabled !== false;

  async function handleCopy() {
    const success = await onCopyFeedbackLink();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Configuration</div>
          <h2>Customer Feedback Form</h2>
        </div>

        <span className={feedbackEnabled ? "status-pill active" : "status-pill paused"}>
          {feedbackEnabled ? "ACTIVE" : "PAUSED"}
        </span>
      </div>

      <div style={{ marginTop: "20px" }}>
        <div className="eyebrow">FEEDBACK DESTINATION URL</div>
        <p style={{ color: "#64748b", fontSize: "12px", lineHeight: 1.6, maxWidth: "620px" }}>
          Share this direct URL with customers to collect ratings, comments, and survey feedback.
        </p>

        <div
          style={{
            marginTop: "14px",
            padding: "12px 14px",
            background: "#f8fafc",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            wordBreak: "break-all",
            color: "#0f172a",
          }}
        >
          {feedbackUrl || "Feedback link unavailable"}
        </div>

        <div className="settings-actions" style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
          <button
            type="button"
            className="primary-button"
            onClick={handleCopy}
            disabled={!feedbackUrl}
          >
            {copied ? "Copied to clipboard!" : "Copy feedback link"}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={onToggleFeedback}
          >
            {feedbackEnabled ? "Disable form access" : "Enable form access"}
          </button>
        </div>

        <div style={{ marginTop: "16px", fontSize: "11px", color: "#94a3b8" }}>
          {feedbackEnabled
            ? "Your public feedback endpoint is accepting new submissions."
            : "Customer submissions are temporarily paused for this workspace."}
        </div>
      </div>
    </section>
  );
}

function formatDate(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function WorkflowPanel() {
  const steps = [
    {
      number: "01",
      title: "Receive Feedback",
      description: "ReviewAuto captures customer submissions and reviews.",
    },
    {
      number: "02",
      title: "Context & Safety AI",
      description: "Analyzes sentiment, intent, and flags safety risks.",
    },
    {
      number: "03",
      title: "Autonomous Decision",
      description: "Approves safe responses or requests owner approval.",
    },
    {
      number: "04",
      title: "Public Response",
      description: "Delivers the verified response directly to the platform.",
    },
  ];

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Pipeline</div>
          <h2>AI Workflow</h2>
        </div>
      </div>

      <div className="workflow">
        {steps.map((step, index) => (
          <WorkflowStep
            key={step.number}
            {...step}
            last={index === steps.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function WorkflowStep({ number, title, description, last }) {
  return (
    <div className={last ? "workflow-step last" : "workflow-step"}>
      <div className="step-number">{number}</div>
      <div className="step-content">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}

function LocationPanel() {
  return (
    <section className="panel location-panel">
      <div className="location-top">
        <div className="google-mark">G</div>
        <div className="location-title">
          <div className="eyebrow">Google Business Profile</div>
          <h3>Google Sync</h3>
        </div>
        <span className="connected-badge">SOON</span>
      </div>

      <p className="location-description">
        Connect your verified Google location to automatically monitor and answer Google Maps reviews.
      </p>

      <button type="button" className="secondary-button" style={{ width: "100%" }} disabled>
        Connect Location
      </button>
    </section>
  );
}

function LocationsPage() {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Google Sync</div>
          <h2>Connected Locations</h2>
        </div>
        <span className="status-pill paused">NOT CONNECTED</span>
      </div>

      <div className="empty-state" style={{ marginTop: "24px" }}>
        <div className="empty-state-icon">⌖</div>
        <h3>No locations linked</h3>
        <p>Google Business Profile sync will become available in the next release.</p>
        <div style={{ marginTop: "16px" }}>
          <button type="button" className="secondary-button" disabled>
            Connect Google Business Profile
          </button>
        </div>
      </div>
    </section>
  );
}

function PlaceholderPage({ page, onBack }) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-icon">✦</div>
      <h2>{page}</h2>
      <p>This module will be connected during the upcoming development cycle.</p>
      <button type="button" className="primary-button" onClick={onBack}>
        Back to dashboard
      </button>
    </section>
  );
}

export default App;
