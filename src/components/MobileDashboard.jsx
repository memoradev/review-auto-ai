import React, { useState, useEffect } from "react";

// Self-contained vector icons (No external npm packages needed)
const Icons = {
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),

  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  ),

  ShieldCheck: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),

  Star: ({ filled }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "#E4E4E7"} stroke={filled ? "#F59E0B" : "#D4D4D8"} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),

  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  ),

  Reviews: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),

  Automation: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
    </svg>
  ),

  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),

  Copy: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  ),

  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),

  Zap: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};

export default function MobileDashboard({
  activePage,
  setActivePage,
  workspace,
  automation,
  reviews = [],
  setReviews,
  reviewsLoading,
  onToggleAutomation,
  onOpenWebsiteWidget,
  onToggleFeedback,
  onCopyFeedbackLink,
  subscription,
  onUpgrade,
  checkoutLoading,
  paymentStatus,
  onSignOut,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Responsive viewport state.
  // This only controls presentation; it does not change application logic.
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 390
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const isVerySmall = viewportWidth <= 360;
  const isSmall = viewportWidth <= 480;
  const isTablet = viewportWidth > 768;

  // Lock scroll when drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function navigate(page) {
    setActivePage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCopy() {
    onCopyFeedbackLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Triage classification
  const needsAttention = reviews.filter(
    (r) =>
      r.rating === 1 ||
      r.ai_risk_level === "high" ||
      r.ai_risk_level === "critical" ||
      r.automation_status === "awaiting_approval" ||
      (r.reply_status === "not_replied" && r.ai_generated_reply)
  );

  const autoHandled = reviews.filter(
    (r) =>
      r.automation_status === "approved" ||
      (r.rating >= 4 && r.reply_status === "replied")
  );

  const displayedReviews =
    activeFilter === "attention"
      ? needsAttention
      : activeFilter === "autopilot"
      ? autoHandled
      : reviews;

  const feedbackSlug = workspace?.feedback_slug || "";

  const horizontalPadding = isVerySmall ? "10px" : isSmall ? "12px" : "16px";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        boxSizing: "border-box",
        backgroundColor: "#FAFAFA",
        color: "#09090B",
        paddingBottom: "88px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* 1. Header */}
      <header
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E4E4E7",
          position: "sticky",
          top: 0,
          zIndex: 40,
          padding: isVerySmall ? "10px 10px" : "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
            flex: 1,
          }}
        >
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              padding: "4px",
              cursor: "pointer",
              color: "#09090B",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Icons.Menu />
          </button>

          <div
            style={{
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: isVerySmall ? "13px" : "14px",
                fontWeight: "700",
                color: "#09090B",
                lineHeight: "1.2",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {workspace?.name || "ReviewAuto"}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#71717A",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {activePage}
            </div>
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            backgroundColor: "#F4F4F5",
            border: "1px solid #E4E4E7",
            padding: "4px 7px",
            borderRadius: "6px",
            fontSize: "10px",
            color: "#52525B",
            whiteSpace: "nowrap",
          }}
        >
          <Icons.ShieldCheck />
          <span style={{ fontWeight: "500" }}>
            {isVerySmall ? "1★" : "1★ Lock"}
          </span>
        </div>
      </header>

      {/* 2. Slide-out Navigation Drawer */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(2px)",
              zIndex: 90,
            }}
          />

          <aside
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "min(280px, 88vw)",
              maxWidth: "100vw",
              boxSizing: "border-box",
              backgroundColor: "#FFFFFF",
              borderRight: "1px solid #E4E4E7",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              padding: isVerySmall ? "16px 12px" : "20px 16px",
              boxShadow: "4px 0 24px rgba(0,0,0,0.08)",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontWeight: "800",
                  fontSize: "16px",
                  letterSpacing: "-0.02em",
                }}
              >
                ReviewAuto AI
              </span>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation menu"
                style={{
                  flexShrink: 0,
                  background: "none",
                  border: "none",
                  padding: "4px",
                  cursor: "pointer",
                  color: "#71717A",
                }}
              >
                <Icons.Close />
              </button>
            </div>

            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                flex: 1,
              }}
            >
              {[
                "Dashboard",
                "Reviews",
                "Analytics",
                "Website Widget",
                "Locations",
                "Automation",
                "Settings",
              ].map((name) => {
                const isActive = activePage === name;

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => navigate(name)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      textAlign: "left",
                      padding: "11px 12px",
                      minHeight: "44px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: isActive
                        ? "#F4F4F5"
                        : "transparent",
                      color: isActive ? "#09090B" : "#52525B",
                      fontSize: "13px",
                      fontWeight: isActive ? "600" : "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {name}
                    </span>

                    {name === "Reviews" && needsAttention.length > 0 && (
                      <span
                        style={{
                          flexShrink: 0,
                          backgroundColor: "#E11D48",
                          color: "#FFFFFF",
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "1px 6px",
                          borderRadius: "10px",
                        }}
                      >
                        {needsAttention.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div
              style={{
                borderTop: "1px solid #E4E4E7",
                paddingTop: "16px",
                marginTop: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#71717A",
                  marginBottom: "12px",
                }}
              >
                Plan:{" "}
                <strong>
                  {subscription?.plan === "pro" ? "Pro Plan" : "Free Plan"}
                </strong>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                style={{
                  width: "100%",
                  minHeight: "44px",
                  padding: "10px",
                  backgroundColor: "#F4F4F5",
                  border: "1px solid #E4E4E7",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#09090B",
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* 3. Main Body */}
      <main
        style={{
          width: "100%",
          maxWidth: isTablet ? "560px" : "560px",
          boxSizing: "border-box",
          margin: "0 auto",
          padding: `16px ${horizontalPadding}`,
          overflowX: "hidden",
        }}
      >
        {activePage === "Dashboard" ? (
          <>
            {/* Quick Share Endpoint Card */}
            <div
              style={{
                width: "100%",
                boxSizing: "border-box",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E4E7",
                borderRadius: "10px",
                padding: isVerySmall ? "10px" : "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "#71717A",
                    fontWeight: "700",
                    display: "block",
                  }}
                >
                  Feedback URL
                </span>

                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: "#18181B",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {feedbackSlug ? `/f/${feedbackSlug}` : "Set in Settings"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!feedbackSlug}
                style={{
                  flexShrink: 0,
                  backgroundColor: copied ? "#10B981" : "#09090B",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "7px 11px",
                  minHeight: "34px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {copied ? (
                  <>
                    <Icons.Check />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Icons.Copy />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Automation Triage Hero Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isVerySmall ? "1fr" : "1fr 1fr",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div
                onClick={() =>
                  setActiveFilter(
                    activeFilter === "attention" ? "all" : "attention"
                  )
                }
                style={{
                  backgroundColor: "#FFFFFF",
                  border:
                    activeFilter === "attention"
                      ? "2px solid #E11D48"
                      : "1px solid #E4E4E7",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  cursor: "pointer",
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#71717A",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    Attention
                  </span>

                  {needsAttention.length > 0 && (
                    <span
                      style={{
                        flexShrink: 0,
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#E11D48",
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#09090B",
                  }}
                >
                  {needsAttention.length}
                </div>

                <div style={{ fontSize: "11px", color: "#71717A" }}>
                  Requires sign-off
                </div>
              </div>

              <div
                onClick={() =>
                  setActiveFilter(
                    activeFilter === "autopilot" ? "all" : "autopilot"
                  )
                }
                style={{
                  backgroundColor: "#FFFFFF",
                  border:
                    activeFilter === "autopilot"
                      ? "2px solid #09090B"
                      : "1px solid #E4E4E7",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  cursor: "pointer",
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#71717A",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    Autopilot
                  </span>

                  <span
                    style={{
                      flexShrink: 0,
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#10B981",
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#09090B",
                  }}
                >
                  {autoHandled.length}
                </div>

                <div style={{ fontSize: "11px", color: "#71717A" }}>
                  Safe route
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  maxWidth: "100%",
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                  backgroundColor: "#F4F4F5",
                  padding: "2px",
                  borderRadius: "8px",
                  border: "1px solid #E4E4E7",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  style={{
                    flexShrink: 0,
                    background:
                      activeFilter === "all" ? "#FFFFFF" : "none",
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    fontSize: "12px",
                    fontWeight: activeFilter === "all" ? "600" : "500",
                    color:
                      activeFilter === "all" ? "#09090B" : "#71717A",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  All ({reviews.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter("attention")}
                  style={{
                    flexShrink: 0,
                    background:
                      activeFilter === "attention" ? "#FFFFFF" : "none",
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    fontSize: "12px",
                    fontWeight:
                      activeFilter === "attention" ? "600" : "500",
                    color:
                      activeFilter === "attention"
                        ? "#E11D48"
                        : "#71717A",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Needs Attention ({needsAttention.length})
                </button>
              </div>

              <span
                style={{
                  fontSize: "11px",
                  color: "#71717A",
                  whiteSpace: "nowrap",
                }}
              >
                Auto-sync active
              </span>
            </div>

            {/* Feed Cards */}
            {displayedReviews.length === 0 ? (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "10px",
                  border: "1px dashed #D4D4D8",
                  padding: "32px 16px",
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#18181B",
                    marginBottom: "2px",
                  }}
                >
                  No reviews to display
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#71717A",
                    lineHeight: "1.5",
                  }}
                >
                  Share your feedback link to start receiving customer
                  reviews.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  minWidth: 0,
                }}
              >
                {displayedReviews.map((review) => {
                  const isOneStar = review.rating === 1;

                  const isHighRisk =
                    review.ai_risk_level === "high" ||
                    review.ai_risk_level === "critical";

                  const requiresSignoff =
                    isOneStar ||
                    isHighRisk ||
                    review.automation_status === "awaiting_approval";

                  return (
                    <div
                      key={review.id}
                      style={{
                        width: "100%",
                        minWidth: 0,
                        boxSizing: "border-box",
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        border: requiresSignoff
                          ? "1px solid #FECDD3"
                          : "1px solid #E4E4E7",
                        padding: isVerySmall ? "12px" : "14px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "8px",
                          marginBottom: "8px",
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            minWidth: 0,
                            flex: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "600",
                              fontSize: "13px",
                              color: "#09090B",
                              minWidth: 0,
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {review.customer_name || "Customer"}
                          </span>

                          <div
                            style={{
                              display: "flex",
                              gap: "2px",
                              flexShrink: 0,
                            }}
                          >
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Icons.Star
                                key={s}
                                filled={s <= (review.rating || 5)}
                              />
                            ))}
                          </div>
                        </div>

                        {requiresSignoff ? (
                          <span
                            style={{
                              flexShrink: 0,
                              fontSize: "10px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              backgroundColor: "#FFF1F2",
                              color: "#E11D48",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Sign-off
                          </span>
                        ) : (
                          <span
                            style={{
                              flexShrink: 0,
                              fontSize: "10px",
                              color: "#A1A1AA",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Resolved
                          </span>
                        )}
                      </div>

                      <p
                        style={{
                          fontSize: "13px",
                          lineHeight: "1.5",
                          color: "#27272A",
                          margin: "0 0 10px 0",
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                      >
                        "{review.review_text}"
                      </p>

                      {/* AI Diagnostic Tags */}
                      {(review.ai_sentiment ||
                        review.ai_risk_level ||
                        review.ai_action_type) && (
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                            marginBottom: "10px",
                            minWidth: 0,
                          }}
                        >
                          {review.ai_risk_level && (
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "500",
                                padding: "3px 6px",
                                borderRadius: "4px",
                                backgroundColor: isHighRisk
                                  ? "#FFF1F2"
                                  : "#F4F4F5",
                                color: isHighRisk
                                  ? "#BE123C"
                                  : "#52525B",
                                maxWidth: "100%",
                                overflowWrap: "anywhere",
                              }}
                            >
                              Risk: {review.ai_risk_level}
                            </span>
                          )}

                          {review.ai_sentiment && (
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "500",
                                padding: "3px 6px",
                                borderRadius: "4px",
                                backgroundColor:
                                  review.ai_sentiment === "positive"
                                    ? "#F0FDF4"
                                    : "#F4F4F5",
                                color:
                                  review.ai_sentiment === "positive"
                                    ? "#15803D"
                                    : "#52525B",
                                maxWidth: "100%",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {review.ai_sentiment}
                            </span>
                          )}

                          {review.ai_action_type && (
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "500",
                                padding: "3px 6px",
                                borderRadius: "4px",
                                backgroundColor: "#EFF6FF",
                                color: "#1D4ED8",
                                maxWidth: "100%",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {review.ai_action_type.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Operational Reason */}
                      {review.ai_action_reason && (
                        <div
                          style={{
                            borderLeft: "2px solid #09090B",
                            paddingLeft: "8px",
                            margin: "0 0 10px 0",
                            fontSize: "12px",
                            color: "#52525B",
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          }}
                        >
                          <strong>Action Remedy:</strong>{" "}
                          {review.ai_action_reason}
                        </div>
                      )}

                      {/* AI Reply Box */}
                      {review.ai_generated_reply && (
                        <div
                          style={{
                            backgroundColor: "#F4F4F5",
                            borderRadius: "6px",
                            padding: isVerySmall ? "9px" : "10px",
                            marginTop: "8px",
                            border: "1px solid #E4E4E7",
                            minWidth: 0,
                            boxSizing: "border-box",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "10px",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              color: "#71717A",
                              fontWeight: "700",
                              marginBottom: "4px",
                            }}
                          >
                            AI Suggested Reply
                          </div>

                          <p
                            style={{
                              fontSize: "12px",
                              lineHeight: "1.45",
                              color: "#27272A",
                              margin: "0 0 10px 0",
                              overflowWrap: "anywhere",
                              wordBreak: "break-word",
                            }}
                          >
                            "{review.ai_generated_reply}"
                          </p>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => navigate("Reviews")}
                              style={{
                                flex: 1,
                                minWidth: 0,
                                minHeight: "38px",
                                backgroundColor: "#09090B",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "6px",
                                padding: "7px 12px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              Inspect & Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              border: "1px solid #E4E4E7",
              padding: isVerySmall ? "14px" : "20px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  margin: 0,
                  overflowWrap: "anywhere",
                }}
              >
                {activePage}
              </h2>

              <button
                type="button"
                onClick={() => navigate("Dashboard")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563EB",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  padding: "4px 0",
                  whiteSpace: "nowrap",
                }}
              >
                ← Dashboard
              </button>
            </div>

            {activePage === "Automation" && (
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#52525B",
                    lineHeight: "1.5",
                    marginBottom: "16px",
                  }}
                >
                  Automate review processing and AI drafted responses while
                  keeping 1-star reviews strictly locked for human sign-off.
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    borderTop: "1px solid #E4E4E7",
                    paddingTop: "14px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <strong>Auto-Pilot Status</strong>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#71717A",
                      }}
                    >
                      {automation?.enabled ? "Currently Active" : "Paused"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onToggleAutomation}
                    style={{
                      flexShrink: 0,
                      minHeight: "38px",
                      padding: "8px 14px",
                      backgroundColor: automation?.enabled
                        ? "#09090B"
                        : "#2563EB",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {automation?.enabled ? "Pause" : "Enable"}
                  </button>
                </div>
              </div>
            )}

            {activePage === "Settings" && (
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <strong>Feedback Intake</strong>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#71717A",
                      margin: "2px 0 8px 0",
                    }}
                  >
                    {workspace?.feedback_enabled !== false
                      ? "Active and receiving"
                      : "Paused"}
                  </div>

                  <button
                    type="button"
                    onClick={onToggleFeedback}
                    style={{
                      minHeight: "38px",
                      padding: "7px 12px",
                      backgroundColor: "#F4F4F5",
                      border: "1px solid #E4E4E7",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {workspace?.feedback_enabled !== false
                      ? "Pause Intake"
                      : "Resume Intake"}
                  </button>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #E4E4E7",
                    paddingTop: "14px",
                    marginBottom: "16px",
                  }}
                >
                  <strong>Workspace Subscription</strong>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#71717A",
                      margin: "2px 0 8px 0",
                    }}
                  >
                    Current Tier:{" "}
                    {subscription?.plan === "pro"
                      ? "Pro Plan"
                      : "Free Tier"}
                  </div>

                  {subscription?.plan !== "pro" && (
                    <button
                      type="button"
                      onClick={onUpgrade}
                      disabled={checkoutLoading}
                      style={{
                        minHeight: "38px",
                        padding: "8px 14px",
                        backgroundColor: "#2563EB",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {checkoutLoading ? "Opening..." : "Upgrade to Pro"}
                    </button>
                  )}

                  {paymentStatus && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#2563EB",
                        marginTop: "6px",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {paymentStatus}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    borderTop: "1px solid #E4E4E7",
                    paddingTop: "14px",
                  }}
                >
                  <button
                    type="button"
                    onClick={onSignOut}
                    style={{
                      width: "100%",
                      minHeight: "42px",
                      padding: "9px",
                      backgroundColor: "#FFF1F2",
                      color: "#E11D48",
                      border: "1px solid #FFE4E6",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Sign out of workspace
                  </button>
                </div>
              </div>
            )}

            {activePage !== "Automation" && activePage !== "Settings" && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    color: "#71717A",
                    lineHeight: "1.5",
                  }}
                >
                  You are viewing the {activePage} section.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("Dashboard")}
                  style={{
                    minHeight: "38px",
                    padding: "8px 14px",
                    backgroundColor: "#09090B",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. Native Mobile Bottom Tab Bar */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          boxSizing: "border-box",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid #E4E4E7",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: isVerySmall ? "7px 0 10px 0" : "8px 0 12px 0",
          paddingBottom:
            "max(10px, env(safe-area-inset-bottom))",
          zIndex: 50,
          minHeight: "64px",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("Dashboard")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            color:
              activePage === "Dashboard" ? "#09090B" : "#71717A",
            cursor: "pointer",
            minWidth: "54px",
            minHeight: "44px",
            padding: "2px 4px",
          }}
        >
          <Icons.Dashboard />

          <span
            style={{
              fontSize: "10px",
              fontWeight:
                activePage === "Dashboard" ? "700" : "500",
            }}
          >
            Home
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate("Reviews")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            color:
              activePage === "Reviews" ? "#09090B" : "#71717A",
            cursor: "pointer",
            position: "relative",
            minWidth: "54px",
            minHeight: "44px",
            padding: "2px 4px",
          }}
        >
          <Icons.Reviews />

          <span
            style={{
              fontSize: "10px",
              fontWeight:
                activePage === "Reviews" ? "700" : "500",
            }}
          >
            Reviews
          </span>

          {needsAttention.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-1px",
                right: "8px",
                backgroundColor: "#E11D48",
                color: "#FFFFFF",
                fontSize: "9px",
                fontWeight: "700",
                width: "15px",
                height: "15px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {needsAttention.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate("Automation")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            color:
              activePage === "Automation" ? "#09090B" : "#71717A",
            cursor: "pointer",
            minWidth: "54px",
            minHeight: "44px",
            padding: "2px 4px",
          }}
        >
          <Icons.Automation />

          <span
            style={{
              fontSize: "10px",
              fontWeight:
                activePage === "Automation" ? "700" : "500",
            }}
          >
            Auto
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate("Settings")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            color:
              activePage === "Settings" ? "#09090B" : "#71717A",
            cursor: "pointer",
            minWidth: "54px",
            minHeight: "44px",
            padding: "2px 4px",
          }}
        >
          <Icons.Settings />

          <span
            style={{
              fontSize: "10px",
              fontWeight:
                activePage === "Settings" ? "700" : "500",
            }}
          >
            Settings
          </span>
        </button>
      </nav>
    </div>
  );
}
