import React, { useEffect } from "react";

const POLICIES = {
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "September 2026",
    content: (
      <>
        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            1. Overview
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            ReviewAuto AI ("we", "us", or "our") operates the customer feedback intelligence platform. This Privacy Policy outlines how we collect, store, process, and protect your information when you access our dashboard or submit feedback through our customer-facing review pages.
          </p>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            2. Information We Collect
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", marginBottom: "8px" }}>
            We collect information in two distinct contexts:
          </p>
          <ul style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "6px" }}>
              <strong>Business Accounts:</strong> When business owners create an account, we collect an email address and authentication credentials securely managed through Supabase Auth. We also store business settings, locations, and feedback slugs.
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong>Customer Feedback:</strong> When end-customers submit reviews via public links (/f/:slug), QR stands, or widgets, we collect star ratings (1–5), feedback comments, and optionally customer names and email addresses.
            </li>
            <li>
              <strong>Telemetry:</strong> Non-identifying, privacy-preserving performance metrics collected via Cloudflare Analytics.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            3. AI Processing Notice
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            Review text is processed by artificial intelligence through Groq Inc. APIs strictly on our backend servers to evaluate sentiment, assess operational risk, extract customer intent, and draft response suggestions. Customer feedback is never used to train public foundation models without consent. No sensitive credentials or payment data are ever transmitted to AI processors.
          </p>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            4. Third-Party Infrastructure Sub-Processors
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", marginBottom: "8px" }}>
            We do not sell personal data. We utilize trusted infrastructure partners solely to deliver our service:
          </p>
          <ul style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", paddingLeft: "20px", margin: 0 }}>
            <li><strong>Supabase Inc.</strong> — Encrypted Database & Authentication</li>
            <li><strong>Groq Inc.</strong> — Backend AI Inference Engine</li>
            <li><strong>Vercel Inc.</strong> — Application Hosting</li>
            <li><strong>Razorpay</strong> — Secure Subscription Billing & Payments</li>
            <li><strong>Cloudflare Inc.</strong> — Web Analytics & Security</li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            5. Data Rights & Deletion
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            Business owners may delete reviews or terminate workspaces at any time. End-consumers who wish to have their submitted feedback or email purged from a business workspace may contact the respective business owner or reach our privacy team.
          </p>
        </section>
      </>
    ),
  },

  terms: {
    title: "Terms and Conditions",
    lastUpdated: "September 2026",
    content: (
      <>
        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            1. Acceptance of Terms
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            By registering for or using ReviewAuto AI, you agree to be bound by these Terms and Conditions. If you are entering into this agreement on behalf of a company or legal entity, you represent that you have authority to bind such entity.
          </p>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            2. Nature of Service & Human Oversight
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", marginBottom: "8px" }}>
            ReviewAuto AI provides customer feedback collection, AI-powered sentiment analysis, operational risk triage, and response draft suggestions.
          </p>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            <strong>Human Approval Disclaimer:</strong> AI-generated outputs are recommendations, not professional legal or business advice. Business owners retain sole responsibility for reviewing and approving any reply before publishing. Under ReviewAuto AI safety guardrails, 1-star reviews and critical-severity feedback strictly require human approval.
          </p>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            3. Account Responsibilities & Acceptable Use
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            You are responsible for maintaining the confidentiality of your account credentials. You agree not to submit fraudulent reviews, abuse the public feedback endpoints, or use the service for defamatory or unlawful operations.
          </p>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            4. Third-Party Integrations
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            Any present or future integrations (including Google Business Profile) are subject to the terms of those third-party providers. ReviewAuto AI is an independent software provider not affiliated with or endorsed by Google LLC.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            5. Limitation of Liability
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            To the maximum extent permitted by applicable law, ReviewAuto AI shall not be liable for any indirect, consequential, or punitive damages arising from customer disputes, lost revenue, or operational decisions made from AI recommendations.
          </p>
        </section>
      </>
    ),
  },

  cookies: {
    title: "Cookies & Local Storage Policy",
    lastUpdated: "September 2026",
    content: (
      <>
        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            1. Minimal & Functional Usage
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            ReviewAuto AI maintains a minimal-tracking philosophy. We do not use third-party behavioral advertising cookies, nor do we track your web activity across external sites.
          </p>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            2. Technologies We Employ
          </h3>
          <ul style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              <strong>Essential Browser LocalStorage:</strong> We store standard Supabase Auth session tokens in your browser's Local Storage. This is technically essential to maintain your authenticated login session.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Privacy-Friendly Analytics:</strong> Cloudflare Analytics measures anonymous page hits and performance without setting tracking cookies or collecting personal identifiers.
            </li>
            <li>
              <strong>Payment Gateway Cookies:</strong> During checkout, Razorpay may set strictly necessary session cookies to prevent payment fraud and handle secure transactions.
            </li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            3. Managing Your Storage
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            You can clear your browser cookies and local storage at any time through your browser settings. Please note that clearing Local Storage will log you out of your active workspace.
          </p>
        </section>
      </>
    ),
  },

  refund: {
    title: "Refund & Cancellation Policy",
    lastUpdated: "September 2026",
    content: (
      <>
        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            1. 7-Day Money-Back Guarantee
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            We offer a full 7-day money-back guarantee for first-time paid plan upgrades. If ReviewAuto AI does not meet your operational needs, contact our support team within 7 calendar days of your initial payment for a full refund.
          </p>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            2. Subscription Cancellation
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            You may cancel your subscription at any time directly through your dashboard Settings. After cancellation, you will retain full access to your paid features until the end of your current billing period. No further charges will occur.
          </p>
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            3. Renewals
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            Recurring billing renewal fees are non-refundable once charged. To prevent renewal charges, please cancel your plan before your next scheduled invoice date.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
            4. Service Disruptions
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4B5563", margin: 0 }}>
            In the rare event of verified extended technical downtime on our infrastructure preventing core review operations, prorated billing credits or refunds may be granted upon review.
          </p>
        </section>
      </>
    ),
  },
};

export default function LegalModal({ policy, onClose }) {
  useEffect(() => {
    if (!policy) return;

    // Handle Escape key
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    // Lock background scroll while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [policy, onClose]);

  if (!policy || !POLICIES[policy]) return null;

  const data = POLICIES[policy];

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          animation: "legalModalFadeIn 0.18s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>
              {data.title}
            </h2>
            <p style={{ fontSize: "12px", color: "#6B7280", margin: "4px 0 0 0" }}>
              Effective Date: {data.lastUpdated}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "#F3F4F6",
              border: "none",
              borderRadius: "8px",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "18px",
              color: "#4B5563",
              fontWeight: "bold",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E5E7EB")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {data.content}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "flex-end",
            backgroundColor: "#F9FAFB",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 20px",
              backgroundColor: "#111827",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
