import React, { useState, useEffect } from "react";

/* ---------- Icons (unchanged, self-contained) ---------- */
const svg = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" };
const Icons = {
  Menu: () => (<svg {...svg} width="22" height="22"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>),
  Close: () => (<svg {...svg} width="22" height="22"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>),
  ShieldCheck: () => (<svg {...svg} width="13" height="13"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>),
  Star: ({ filled }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "#E4E4E7"} stroke={filled ? "#F59E0B" : "#D4D4D8"} strokeWidth="1" style={{ flexShrink: 0 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Dashboard: () => (<svg {...svg} width="20" height="20"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>),
  Reviews: () => (<svg {...svg} width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>),
  Automation: () => (<svg {...svg} width="20" height="20"><rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /></svg>),
  Settings: () => (<svg {...svg} width="20" height="20"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>),
  Copy: () => (<svg {...svg} width="14" height="14"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>),
  Check: () => (<svg {...svg} width="14" height="14" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>),
};

/* ---------- Viewport hook (SSR-safe) ---------- */
function useViewportWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 390);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);
  return w;
}

const SAFE_TOP = "env(safe-area-inset-top, 0px)";
const SAFE_BOTTOM = "env(safe-area-inset-bottom, 0px)";
const TAP = { WebkitTapHighlightColor: "transparent", touchAction: "manipulation" };
const NAV_ITEMS = ["Dashboard", "Reviews", "Analytics", "Website Widget", "Locations", "Automation", "Settings"];

export default function MobileDashboard({
  activePage, setActivePage, workspace, automation,
  reviews = [], setReviews, reviewsLoading,
  onToggleAutomation, onOpenWebsiteWidget, onToggleFeedback, onCopyFeedbackLink,
  subscription, onUpgrade, checkoutLoading, paymentStatus, onSignOut,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'attention' | 'autopilot'

  const width = useViewportWidth();
  const isNarrow = width < 360;
  const isWide = width >= 768;
  const pad = isNarrow ? 12 : 16;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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

  // Triage classification (logic unchanged)
  const needsAttention = reviews.filter(
    (r) =>
      r.rating === 1 ||
      r.ai_risk_level === "high" ||
      r.ai_risk_level === "critical" ||
      r.automation_status === "awaiting_approval" ||
      (r.reply_status === "not_replied" && r.ai_generated_reply)
  );
  const autoHandled = reviews.filter(
    (r) => r.automation_status === "approved" || (r.rating >= 4 && r.reply_status === "replied")
  );
  const displayedReviews =
    activeFilter === "attention" ? needsAttention : activeFilter === "autopilot" ? autoHandled : reviews;

  const feedbackSlug = workspace?.feedback_slug || "";
  const wrapText = { overflowWrap: "anywhere", wordBreak: "break-word" };
  const btnBase = { ...TAP, minHeight: "44px", cursor: "pointer", border: "none", borderRadius: "8px" };

  const tabs = [
    { page: "Dashboard", label: "Home", Icon: Icons.Dashboard },
    { page: "Reviews", label: "Reviews", Icon: Icons.Reviews },
    { page: "Automation", label: "Auto", Icon: Icons.Automation },
    { page: "Settings", label: "Settings", Icon: Icons.Settings },
  ];

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#FAFAFA", color: "#09090B", paddingBottom: `calc(84px + ${SAFE_BOTTOM})`, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", WebkitFontSmoothing: "antialiased", WebkitTextSizeAdjust: "100%", overflowX: "hidden", boxSizing: "border-box" }}>
      {/* 1. Header */}
      <header style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E4E4E7", position: "sticky", top: 0, zIndex: 40, padding: `calc(8px + ${SAFE_TOP}) ${pad}px 8px`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, flex: 1 }}>
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" aria-expanded={menuOpen}
            style={{ ...TAP, background: "none", border: "none", width: "44px", height: "44px", marginLeft: "-8px", cursor: "pointer", color: "#09090B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icons.Menu />
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: "700", lineHeight: "1.2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {workspace?.name || "ReviewAuto"}
            </div>
            <div style={{ fontSize: "11px", color: "#71717A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activePage}</div>
          </div>
        </div>
        <div title="1★ reviews are locked for human sign-off" style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F4F4F5", border: "1px solid #E4E4E7", padding: "6px 8px", borderRadius: "6px", fontSize: "11px", color: "#52525B", flexShrink: 0 }}>
          <Icons.ShieldCheck />
          {!isNarrow && <span style={{ fontWeight: "500" }}>1★ Lock</span>}
        </div>
      </header>

      {/* 2. Drawer */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", zIndex: 90 }} />
          <aside role="dialog" aria-modal="true" aria-label="Navigation"
            style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "min(300px, 85vw)", backgroundColor: "#FFFFFF", borderRight: "1px solid #E4E4E7", zIndex: 100, display: "flex", flexDirection: "column", padding: `calc(16px + ${SAFE_TOP}) 16px calc(16px + ${SAFE_BOTTOM})`, boxShadow: "4px 0 24px rgba(0,0,0,0.08)", overflowY: "auto", overscrollBehavior: "contain", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontWeight: "800", fontSize: "16px", letterSpacing: "-0.02em" }}>ReviewAuto AI</span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation menu"
                style={{ ...TAP, background: "none", border: "none", width: "44px", height: "44px", marginRight: "-10px", cursor: "pointer", color: "#71717A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.Close />
              </button>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
              {NAV_ITEMS.map((name) => {
                const isActive = activePage === name;
                return (
                  <button key={name} type="button" onClick={() => navigate(name)}
                    style={{ ...btnBase, width: "100%", textAlign: "left", padding: "10px 12px", backgroundColor: isActive ? "#F4F4F5" : "transparent", color: isActive ? "#09090B" : "#52525B", fontSize: "14px", fontWeight: isActive ? "600" : "500", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>{name}</span>
                    {name === "Reviews" && needsAttention.length > 0 && (
                      <span style={{ backgroundColor: "#E11D48", color: "#FFFFFF", fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "10px" }}>{needsAttention.length}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div style={{ borderTop: "1px solid #E4E4E7", paddingTop: "16px", marginTop: "12px" }}>
              <div style={{ fontSize: "12px", color: "#71717A", marginBottom: "12px" }}>
                Plan: <strong>{subscription?.plan === "pro" ? "Pro Plan" : "Free Plan"}</strong>
              </div>
              <button type="button" onClick={onSignOut}
                style={{ ...btnBase, width: "100%", padding: "10px", backgroundColor: "#F4F4F5", border: "1px solid #E4E4E7", fontSize: "13px", fontWeight: "600", color: "#09090B" }}>
                Sign out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* 3. Main */}
      <main style={{ maxWidth: isWide ? "720px" : "560px", margin: "0 auto", padding: `${pad}px`, boxSizing: "border-box", width: "100%" }}>
        {activePage === "Dashboard" ? (
          <>
            {/* Feedback URL */}
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: "10px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: "#71717A", fontWeight: "700", display: "block" }}>Feedback URL</span>
                <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#18181B", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {feedbackSlug ? `/f/${feedbackSlug}` : "Set in Settings"}
                </span>
              </div>
              <button type="button" onClick={handleCopy} disabled={!feedbackSlug}
                style={{ ...btnBase, backgroundColor: copied ? "#10B981" : "#09090B", color: "#FFFFFF", padding: "0 14px", fontSize: "12px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, opacity: feedbackSlug ? 1 : 0.5, cursor: feedbackSlug ? "pointer" : "not-allowed" }}>
                {copied ? <><Icons.Check /><span>Copied</span></> : <><Icons.Copy /><span>Copy</span></>}
              </button>
            </div>

            {/* Triage cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              {[
                { key: "attention", label: "Attention", count: needsAttention.length, sub: "Requires sign-off", ring: "#E11D48", dot: needsAttention.length > 0 ? "#E11D48" : null },
                { key: "autopilot", label: "Autopilot", count: autoHandled.length, sub: "Safe route", ring: "#09090B", dot: "#10B981" },
              ].map((c) => {
                const on = activeFilter === c.key;
                return (
                  <button key={c.key} type="button" aria-pressed={on} onClick={() => setActiveFilter(on ? "all" : c.key)}
                    style={{ ...TAP, textAlign: "left", font: "inherit", color: "inherit", backgroundColor: "#FFFFFF", border: on ? `2px solid ${c.ring}` : "1px solid #E4E4E7", borderRadius: "10px", padding: on ? "11px 13px" : "12px 14px", cursor: "pointer", minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#71717A", textTransform: "uppercase", letterSpacing: "0.03em" }}>{c.label}</span>
                      {c.dot && <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: c.dot }} />}
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "800", color: "#09090B" }}>{c.count}</div>
                    <div style={{ fontSize: "11px", color: "#71717A" }}>{c.sub}</div>
                  </button>
                );
              })}
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{ display: "flex", backgroundColor: "#F4F4F5", padding: "2px", borderRadius: "8px", border: "1px solid #E4E4E7", minWidth: 0, maxWidth: "100%" }}>
                {[
                  { key: "all", label: `All (${reviews.length})`, color: "#09090B" },
                  { key: "attention", label: `${isNarrow ? "Attention" : "Needs Attention"} (${needsAttention.length})`, color: "#E11D48" },
                ].map((t) => {
                  const on = activeFilter === t.key;
                  return (
                    <button key={t.key} type="button" onClick={() => setActiveFilter(t.key)}
                      style={{ ...TAP, background: on ? "#FFFFFF" : "none", border: "none", borderRadius: "6px", minHeight: "36px", padding: "0 10px", fontSize: "12px", fontWeight: on ? "600" : "500", color: on ? t.color : "#71717A", cursor: "pointer", whiteSpace: "nowrap" }}>
                      {t.label}
                    </button>
                  );
                })}
              </div>
              {!isNarrow && <span style={{ fontSize: "11px", color: "#71717A", whiteSpace: "nowrap" }}>Auto-sync active</span>}
            </div>

            {/* Feed */}
            {reviewsLoading && reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", fontSize: "13px", color: "#71717A" }}>Loading reviews…</div>
            ) : displayedReviews.length === 0 ? (
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px dashed #D4D4D8", padding: "32px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#18181B", marginBottom: "2px" }}>No reviews to display</div>
                <div style={{ fontSize: "12px", color: "#71717A" }}>Share your feedback link to start receiving customer reviews.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {displayedReviews.map((review) => {
                  const isOneStar = review.rating === 1;
                  const isHighRisk = review.ai_risk_level === "high" || review.ai_risk_level === "critical";
                  const requiresSignoff = isOneStar || isHighRisk || review.automation_status === "awaiting_approval";

                  return (
                    <div key={review.id} style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: requiresSignoff ? "1px solid #FECDD3" : "1px solid #E4E4E7", padding: isNarrow ? "12px" : "14px", boxShadow: "0 1px 2px rgba(0,0,0,0.02)", minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: "600", fontSize: "13px", ...wrapText }}>{review.customer_name || "Customer"}</span>
                          <div style={{ display: "flex", gap: "2px" }}>
                            {[1, 2, 3, 4, 5].map((s) => (<Icons.Star key={s} filled={s <= (review.rating || 5)} />))}
                          </div>
                        </div>
                        {requiresSignoff ? (
                          <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", backgroundColor: "#FFF1F2", color: "#E11D48", padding: "2px 6px", borderRadius: "4px", flexShrink: 0 }}>Sign-off</span>
                        ) : (
                          <span style={{ fontSize: "10px", color: "#A1A1AA", flexShrink: 0 }}>Resolved</span>
                        )}
                      </div>

                      <p style={{ fontSize: "13px", lineHeight: "1.5", color: "#27272A", margin: "0 0 10px 0", ...wrapText }}>"{review.review_text}"</p>

                      {(review.ai_sentiment || review.ai_risk_level || review.ai_action_type) && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                          {review.ai_risk_level && (
                            <span style={{ fontSize: "11px", fontWeight: "500", padding: "2px 6px", borderRadius: "4px", backgroundColor: isHighRisk ? "#FFF1F2" : "#F4F4F5", color: isHighRisk ? "#BE123C" : "#52525B" }}>Risk: {review.ai_risk_level}</span>
                          )}
                          {review.ai_sentiment && (
                            <span style={{ fontSize: "11px", fontWeight: "500", padding: "2px 6px", borderRadius: "4px", backgroundColor: review.ai_sentiment === "positive" ? "#F0FDF4" : "#F4F4F5", color: review.ai_sentiment === "positive" ? "#15803D" : "#52525B" }}>{review.ai_sentiment}</span>
                          )}
                          {review.ai_action_type && (
                            <span style={{ fontSize: "11px", fontWeight: "500", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>{review.ai_action_type.replace(/_/g, " ")}</span>
                          )}
                        </div>
                      )}

                      {review.ai_action_reason && (
                        <div style={{ borderLeft: "2px solid #09090B", paddingLeft: "8px", margin: "0 0 10px 0", fontSize: "12px", color: "#52525B", lineHeight: "1.45", ...wrapText }}>
                          <strong>Action Remedy:</strong> {review.ai_action_reason}
                        </div>
                      )}

                      {review.ai_generated_reply && (
                        <div style={{ backgroundColor: "#F4F4F5", borderRadius: "6px", padding: "10px", marginTop: "8px", border: "1px solid #E4E4E7" }}>
                          <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.04em", color: "#71717A", fontWeight: "700", marginBottom: "4px" }}>AI Suggested Reply</div>
                          <p style={{ fontSize: "12px", lineHeight: "1.45", color: "#27272A", margin: "0 0 10px 0", ...wrapText }}>"{review.ai_generated_reply}"</p>
                          <button type="button" onClick={() => navigate("Reviews")}
                            style={{ ...btnBase, width: "100%", backgroundColor: "#09090B", color: "#FFFFFF", padding: "0 12px", fontSize: "13px", fontWeight: "600", borderRadius: "6px" }}>
                            Inspect & Reply
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E4E4E7", padding: isNarrow ? "16px" : "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0, minWidth: 0, ...wrapText }}>{activePage}</h2>
              <button type="button" onClick={() => navigate("Dashboard")}
                style={{ ...TAP, background: "none", border: "none", color: "#2563EB", fontSize: "13px", fontWeight: "500", cursor: "pointer", minHeight: "44px", padding: "0 4px", whiteSpace: "nowrap", flexShrink: 0 }}>
                ← Dashboard
              </button>
            </div>

            {activePage === "Automation" && (
              <div>
                <p style={{ fontSize: "13px", color: "#52525B", lineHeight: "1.5", marginBottom: "16px" }}>
                  Automate review processing and AI drafted responses while keeping 1-star reviews strictly locked for human sign-off.
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", borderTop: "1px solid #E4E4E7", paddingTop: "14px" }}>
                  <div style={{ minWidth: 0 }}>
                    <strong>Auto-Pilot Status</strong>
                    <div style={{ fontSize: "12px", color: "#71717A" }}>{automation?.enabled ? "Currently Active" : "Paused"}</div>
                  </div>
                  <button type="button" onClick={onToggleAutomation}
                    style={{ ...btnBase, padding: "0 18px", backgroundColor: automation?.enabled ? "#09090B" : "#2563EB", color: "#FFFFFF", fontSize: "13px", fontWeight: "600", borderRadius: "6px", flexShrink: 0 }}>
                    {automation?.enabled ? "Pause" : "Enable"}
                  </button>
                </div>
              </div>
            )}

            {activePage === "Settings" && (
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <strong>Feedback Intake</strong>
                  <div style={{ fontSize: "12px", color: "#71717A", margin: "2px 0 8px 0" }}>{workspace?.feedback_enabled !== false ? "Active and receiving" : "Paused"}</div>
                  <button type="button" onClick={onToggleFeedback}
                    style={{ ...btnBase, padding: "0 14px", backgroundColor: "#F4F4F5", border: "1px solid #E4E4E7", fontSize: "13px", fontWeight: "600", borderRadius: "6px" }}>
                    {workspace?.feedback_enabled !== false ? "Pause Intake" : "Resume Intake"}
                  </button>
                </div>

                <div style={{ borderTop: "1px solid #E4E4E7", paddingTop: "14px", marginBottom: "16px" }}>
                  <strong>Workspace Subscription</strong>
                  <div style={{ fontSize: "12px", color: "#71717A", margin: "2px 0 8px 0" }}>Current Tier: {subscription?.plan === "pro" ? "Pro Plan" : "Free Tier"}</div>
                  {subscription?.plan !== "pro" && (
                    <button type="button" onClick={onUpgrade} disabled={checkoutLoading}
                      style={{ ...btnBase, padding: "0 16px", backgroundColor: "#2563EB", color: "#FFFFFF", fontSize: "13px", fontWeight: "600", borderRadius: "6px", opacity: checkoutLoading ? 0.7 : 1 }}>
                      {checkoutLoading ? "Opening..." : "Upgrade to Pro"}
                    </button>
                  )}
                  {paymentStatus && <div style={{ fontSize: "12px", color: "#2563EB", marginTop: "6px", ...wrapText }}>{paymentStatus}</div>}
                </div>

                <div style={{ borderTop: "1px solid #E4E4E7", paddingTop: "14px" }}>
                  <button type="button" onClick={onSignOut}
                    style={{ ...btnBase, width: "100%", padding: "0 9px", backgroundColor: "#FFF1F2", color: "#E11D48", border: "1px solid #FFE4E6", fontSize: "13px", fontWeight: "600", borderRadius: "6px" }}>
                    Sign out of workspace
                  </button>
                </div>
              </div>
            )}

            {activePage !== "Automation" && activePage !== "Settings" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontSize: "13px", color: "#71717A" }}>You are viewing the {activePage} section.</p>
                <button type="button" onClick={() => navigate("Dashboard")}
                  style={{ ...btnBase, padding: "0 16px", backgroundColor: "#09090B", color: "#FFFFFF", fontSize: "13px", fontWeight: "500", borderRadius: "6px" }}>
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. Bottom tab bar */}
      <nav aria-label="Primary"
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(255,255,255,0.94)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid #E4E4E7", display: "flex", justifyContent: "space-around", alignItems: "stretch", padding: `6px 4px calc(8px + ${SAFE_BOTTOM})`, zIndex: 50, boxSizing: "border-box" }}>
        {tabs.map(({ page, label, Icon }) => {
          const on = activePage === page;
          return (
            <button key={page} type="button" onClick={() => navigate(page)} aria-current={on ? "page" : undefined}
              style={{ ...TAP, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", color: on ? "#09090B" : "#71717A", cursor: "pointer", position: "relative", flex: 1, minWidth: 0, minHeight: "48px" }}>
              <Icon />
              <span style={{ fontSize: "10px", fontWeight: on ? "700" : "500" }}>{label}</span>
              {page === "Reviews" && needsAttention.length > 0 && (
                <span style={{ position: "absolute", top: "0", left: "calc(50% + 6px)", backgroundColor: "#E11D48", color: "#FFFFFF", fontSize: "9px", fontWeight: "700", minWidth: "15px", height: "15px", padding: "0 3px", boxSizing: "border-box", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {needsAttention.length > 99 ? "99+" : needsAttention.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
