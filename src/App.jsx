import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";
import FeedbackPage from "./components/FeedbackPage";
import WebsiteWidget from "./components/WebsiteWidget";
import Analytics from "./components/Analytics";

const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Reviews", icon: "★" },
  { name: "Analytics", icon: "◒" },
  { name: "Website Widget", icon: "▣" },
  { name: "Locations", icon: "⌖" },
  { name: "Automation", icon: "⚡" },
  { name: "Settings", icon: "⚙" },
];

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
    return <Auth />;
  }

  return <Dashboard session={session} />;
}

function LoadingScreen() {
  return (
    <main className="loading-page">
      <div className="loading-mark">R</div>
      <div className="loading-spinner" />
      <p>
        Loading your workspace...
      </p>
    </main>
  );
}

function Dashboard({ session }) {
  const [activePage, setActivePage] =
    useState("Dashboard");

  const [workspace, setWorkspace] =
    useState(null);

  const [automation, setAutomation] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [workspaceLoading, setWorkspaceLoading] =
    useState(true);

  const [reviewsLoading, setReviewsLoading] =
    useState(false);

  const [workspaceError, setWorkspaceError] =
    useState("");

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
          .eq(
            "owner_id",
            session.user.id
          )
          .order("created_at", {
            ascending: true,
          })
          .limit(1)
          .maybeSingle();

        if (businessError) {
          throw businessError;
        }

        if (!business) {
          throw new Error(
            "No business workspace was found for this account."
          );
        }

        const {
          data: automationSettings,
          error: automationError,
        } = await supabase
          .from("automation_settings")
          .select("*")
          .eq(
            "business_id",
            business.id
          )
          .maybeSingle();

        if (automationError) {
          throw automationError;
        }

        if (mounted) {
          setWorkspace(business);
          setAutomation(
            automationSettings
          );
        }

        await loadReviews(
          business.id,
          mounted
        );
      } catch (error) {
        console.error(
          "Workspace loading error:",
          error
        );

        if (mounted) {
          setWorkspaceError(
            error?.message ||
              "Unable to load your workspace."
          );
        }
      } finally {
        if (mounted) {
          setWorkspaceLoading(false);
        }
      }
    }

    loadWorkspace();

    return () => {
      mounted = false;
    };
  }, [session.user.id]);

  async function loadReviews(
    businessId,
    mounted = true
  ) {
    setReviewsLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("reviews")
      .select("*")
      .eq(
        "business_id",
        businessId
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Review loading error:",
        error
      );

      if (mounted) {
        setReviews([]);
      }
    } else if (mounted) {
      setReviews(data || []);
    }

    if (mounted) {
      setReviewsLoading(false);
    }
  }

  async function handleSignOut() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Sign out failed:",
        error
      );
    }
  }

  async function toggleAutomation() {
    if (!workspace) {
      return;
    }

    const currentValue =
      automation?.enabled || false;

    const newValue = !currentValue;

    if (!automation) {
      const {
        data,
        error,
      } = await supabase
        .from("automation_settings")
        .insert({
          business_id:
            workspace.id,
          enabled: newValue,
          updated_at:
            new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error(
          "Automation creation failed:",
          error
        );
        return;
      }

      setAutomation(data);
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("automation_settings")
      .update({
        enabled: newValue,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "business_id",
        workspace.id
      )
      .select()
      .single();

    if (error) {
      console.error(
        "Automation update failed:",
        error
      );
      return;
    }

    setAutomation(data);
  }

  async function updateFeedbackEnabled() {
    if (!workspace) {
      return;
    }

    const nextValue =
      workspace.feedback_enabled === false;

    const {
      data,
      error,
    } = await supabase
      .from("businesses")
      .update({
        feedback_enabled:
          nextValue,
      })
      .eq(
        "id",
        workspace.id
      )
      .select()
      .single();

    if (error) {
      console.error(
        "Feedback link update failed:",
        error
      );
      return;
    }

    setWorkspace(data);
  }

  async function copyFeedbackLink() {
    if (!workspace?.feedback_slug) {
      return false;
    }

    const feedbackUrl =
      `${window.location.origin}/f/${workspace.feedback_slug}`;

    return copyText(
      feedbackUrl,
      "feedback link"
    );
  }

  async function copyText(
    text,
    label = "text"
  ) {
    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          text
        );

        return true;
      }

      const textArea =
        document.createElement(
          "textarea"
        );

      textArea.value = text;

      textArea.setAttribute(
        "readonly",
        ""
      );

      textArea.style.position =
        "fixed";
      textArea.style.left =
        "-9999px";
      textArea.style.top = "0";
      textArea.style.opacity = "0";

      document.body.appendChild(
        textArea
      );

      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(
        0,
        textArea.value.length
      );

      const successful =
        document.execCommand(
          "copy"
        );

      document.body.removeChild(
        textArea
      );

      if (successful) {
        return true;
      }

      throw new Error(
        "Browser blocked clipboard access."
      );
    } catch (error) {
      console.error(
        `Failed to copy ${label}:`,
        error
      );

      window.prompt(
        `Copy your ${label}:`,
        text
      );

      return false;
    }
  }

  if (workspaceLoading) {
    return <LoadingScreen />;
  }

  if (workspaceError) {
    return (
      <WorkspaceError
        message={workspaceError}
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
        businessName={
          workspace?.name
        }
        onSignOut={handleSignOut}
        feedbackEnabled={
          workspace?.feedback_enabled !==
          false
        }
      />

      <main className="main">
        <Header
          activePage={activePage}
          businessName={
            workspace?.name
          }
        />

        {activePage ===
        "Dashboard" ? (
          <DashboardContent
            workspace={workspace}
            automation={automation}
            reviews={reviews}
            setReviews={setReviews}
            reviewsLoading={
              reviewsLoading
            }
            onToggleAutomation={
              toggleAutomation
            }
          />
        ) : activePage ===
          "Reviews" ? (
          <ReviewsPage
            reviews={reviews}
            setReviews={setReviews}
            loading={
              reviewsLoading
            }
          />
        ) : activePage ===
          "Analytics" ? (
          <AnalyticsPage
            reviews={reviews}
            loading={reviewsLoading}
          />
        ) : activePage ===
          "Website Widget" ? (
          <WebsiteWidget
            workspace={workspace}
          />
        ) : activePage ===
          "Settings" ? (
          <SettingsContent
            workspace={workspace}
            onToggleFeedback={
              updateFeedbackEnabled
            }
            onCopyFeedbackLink={
              copyFeedbackLink
            }
          />
        ) : (
          <PlaceholderPage
            page={activePage}
            onBack={() =>
              setActivePage(
                "Dashboard"
              )
            }
          />
        )}
      </main>
    </div>
  );
}

function WorkspaceError({
  message,
  onSignOut,
}) {
  return (
    <main className="loading-page">
      <div className="auth-card">
        <div className="eyebrow">
          WORKSPACE ERROR
        </div>

        <h1>
          We couldn't load your workspace.
        </h1>

        <p
          style={{
            color: "#777",
            fontSize: "11px",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        <button
          type="button"
          className="auth-submit"
          onClick={onSignOut}
        >
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
        <div className="brand-mark">
          R
        </div>

        <div className="brand-name">
          <strong>
            ReviewAuto
          </strong>
          <span>AI</span>
        </div>
      </div>

      <div className="workspace-label">
        WORKSPACE
      </div>

      <div
        style={{
          padding:
            "0 11px 12px",
          color: "#d8d8d2",
          fontSize: "10px",
          fontWeight: 700,
          overflow: "hidden",
          textOverflow:
            "ellipsis",
          whiteSpace:
            "nowrap",
        }}
        title={businessName}
      >
        {businessName}
      </div>

      <nav className="navigation">
        {navigation.map(
          (item) => (
            <button
              key={item.name}
              type="button"
              className={
                activePage ===
                item.name
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                setActivePage(
                  item.name
                )
              }
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>
            </button>
          )
        )}
      </nav>

      <div className="sidebar-bottom">
        <div className="connection-card">
          <span className="connection-indicator" />

          <div>
            <strong>
              ReviewAuto feedback
            </strong>

            <span>
              {feedbackEnabled
                ? "Feedback collection active"
                : "Feedback collection paused"}
            </span>
          </div>
        </div>

        <div className="account-card">
          <div className="account-avatar">
            {getInitials(
              email
            )}
          </div>

          <div className="account-details">
            <strong>
              {email}
            </strong>

            <span>
              Authenticated
            </span>
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

function getInitials(
  email = ""
) {
  const first =
    email
      .trim()
      .charAt(0)
      .toUpperCase();

  return first || "U";
}

function Header({
  activePage,
  businessName,
}) {
  const title =
    activePage === "Dashboard"
      ? `Good morning, ${
          businessName ||
          "Business Owner"
        }.`
      : activePage;

  return (
    <header className="header">
      <div>
        <div className="eyebrow">
          {activePage.toUpperCase()}
        </div>

        <h1>{title}</h1>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="header-button"
          aria-label="Notifications"
        >
          ♧
        </button>

        <button
          type="button"
          className="header-button"
          aria-label="Help"
        >
          ?
        </button>
      </div>
    </header>
  );
}

function DashboardContent({
  workspace,
  automation,
  reviews,
  setReviews,
  reviewsLoading,
  onToggleAutomation,
}) {
  const totalReviews =
    reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (sum, review) =>
              sum +
              Number(
                review.rating ||
                  0
              ),
            0
          ) /
          totalReviews
        ).toFixed(1)
      : "—";

  const repliesSent =
    reviews.filter(
      (review) =>
        review.reply_status ===
        "published"
    ).length;

  const needsAttention =
    reviews.filter(
      (review) =>
        review.automation_status ===
          "awaiting_approval" ||
        review.ai_risk_level ===
          "high" ||
        review.ai_risk_level ===
          "critical"
    ).length;

  return (
    <>
      <section className="stats-grid">
        <StatCard
          label="Total reviews"
          value={totalReviews}
          detail={
            totalReviews > 0
              ? "Stored in your workspace"
              : "No reviews yet"
          }
        />

        <StatCard
          label="Average rating"
          value={
            averageRating
          }
          detail={
            totalReviews > 0
              ? "Based on stored reviews"
              : "Waiting for reviews"
          }
        />

        <StatCard
          label="Replies sent"
          value={repliesSent}
          detail={
            repliesSent > 0
              ? "Published replies"
              : "No replies published"
          }
        />

        <StatCard
          label="Needs attention"
          value={
            needsAttention
          }
          detail={
            needsAttention > 0
              ? "Requires review"
              : "Nothing requiring attention"
          }
        />
      </section>

      <AutomationBanner
        enabled={
          automation?.enabled ||
          false
        }
        setEnabled={
          onToggleAutomation
        }
      />

      <section className="content-grid">
        <ReviewsPanel
          reviews={reviews}
          setReviews={
            setReviews
          }
          loading={
            reviewsLoading
          }
        />

        <div className="right-column">
          <WorkflowPanel />
          <LocationPanel />
        </div>
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  detail,
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">
        {label}
      </span>

      <strong className="stat-value">
        {value}
      </strong>

      <span className="stat-detail">
        {detail}
      </span>
    </div>
  );
}

/*
 * PHASE 2D
 * Analytics page
 *
 * Uses the existing reviews state.
 * No new database query.
 * No new backend.
 * No new analytics table.
 */
function AnalyticsPage({
  reviews = [],
  loading,
}) {
  const total = reviews.length;

  const averageRating =
    total > 0
      ? (
          reviews.reduce(
            (sum, review) =>
              sum +
              Number(
                review.rating || 0
              ),
            0
          ) / total
        ).toFixed(1)
      : "—";

  const positive =
    reviews.filter(
      (review) =>
        review.ai_sentiment ===
        "positive"
    ).length;

  const neutral =
    reviews.filter(
      (review) =>
        review.ai_sentiment ===
        "neutral"
    ).length;

  const negative =
    reviews.filter(
      (review) =>
        review.ai_sentiment ===
        "negative"
    ).length;

  const mixed =
    reviews.filter(
      (review) =>
        review.ai_sentiment ===
        "mixed"
    ).length;

  const needsAttention =
    reviews.filter(
      (review) =>
        review.automation_status ===
          "awaiting_approval" ||
        review.ai_risk_level ===
          "high" ||
        review.ai_risk_level ===
          "critical"
    ).length;

  const approved =
    reviews.filter(
      (review) =>
        review.automation_status ===
        "approved"
    ).length;

  const rejected =
    reviews.filter(
      (review) =>
        review.automation_status ===
          "skipped" ||
        review.automation_status ===
          "rejected"
    ).length;

  const repliesPublished =
    reviews.filter(
      (review) =>
        review.reply_status ===
        "published"
    ).length;

  const sourceCounts = {
    reviewauto:
      reviews.filter(
        (review) =>
          review.source ===
          "reviewauto"
      ).length,

    google:
      reviews.filter(
        (review) =>
          review.source ===
          "google"
      ).length,

    manual:
      reviews.filter(
        (review) =>
          review.source ===
          "manual"
      ).length,
  };

  const ratingCounts = {
    5: reviews.filter(
      (review) =>
        Number(
          review.rating
        ) === 5
    ).length,

    4: reviews.filter(
      (review) =>
        Number(
          review.rating
        ) === 4
    ).length,

    3: reviews.filter(
      (review) =>
        Number(
          review.rating
        ) === 3
    ).length,

    2: reviews.filter(
      (review) =>
        Number(
          review.rating
        ) === 2
    ).length,

    1: reviews.filter(
      (review) =>
        Number(
          review.rating
        ) === 1
    ).length,
  };

  const lastSevenDays =
    getLastSevenDays(
      reviews
    );

  if (loading) {
    return (
      <section className="panel">
        <div className="empty-state">
          Loading analytics...
        </div>
      </section>
    );
  }

  return (
    <section>
      <section className="stats-grid">
        <StatCard
          label="Total feedback"
          value={total}
          detail={
            total > 0
              ? "All feedback in your workspace"
              : "No feedback yet"
          }
        />

        <StatCard
          label="Average rating"
          value={
            averageRating
          }
          detail={
            total > 0
              ? "Across all feedback"
              : "Waiting for feedback"
          }
        />

        <StatCard
          label="Needs attention"
          value={
            needsAttention
          }
          detail={
            needsAttention > 0
              ? "Requires human review"
              : "Nothing requiring attention"
          }
        />

        <StatCard
          label="Replies published"
          value={
            repliesPublished
          }
          detail={
            repliesPublished > 0
              ? "Published responses"
              : "No published replies"
          }
        />
      </section>

      <section
        className="content-grid"
        style={{
          marginTop: "18px",
        }}
      >
        <div>
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">
                  CUSTOMER SENTIMENT
                </div>

                <h2>
                  What customers are saying
                </h2>
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "20px",
              }}
            >
              <AnalyticsMetricRow
                label="Positive"
                value={
                  positive
                }
                total={total}
              />

              <AnalyticsMetricRow
                label="Neutral"
                value={
                  neutral
                }
                total={total}
              />

              <AnalyticsMetricRow
                label="Negative"
                value={
                  negative
                }
                total={total}
              />

              <AnalyticsMetricRow
                label="Mixed"
                value={
                  mixed
                }
                total={total}
              />
            </div>
          </section>

          <section
            className="panel"
            style={{
              marginTop:
                "18px",
            }}
          >
            <div className="panel-header">
              <div>
                <div className="eyebrow">
                  ACTIVITY
                </div>

                <h2>
                  Last 7 days
                </h2>
              </div>
            </div>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "flex-end",
                gap: "10px",
                height:
                  "150px",
                marginTop:
                  "24px",
              }}
            >
              {lastSevenDays.map(
                (day) => {
                  const maximum =
                    Math.max(
                      ...lastSevenDays.map(
                        (item) =>
                          item.count
                      ),
                      1
                    );

                  const height =
                    day.count ===
                    0
                      ? 3
                      : Math.max(
                          8,
                          (day.count /
                            maximum) *
                            110
                        );

                  return (
                    <div
                      key={
                        day.key
                      }
                      style={{
                        flex: 1,
                        height:
                          "100%",
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        justifyContent:
                          "flex-end",
                        alignItems:
                          "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize:
                            "9px",
                          color:
                            "#777",
                          marginBottom:
                            "6px",
                        }}
                      >
                        {
                          day.count
                        }
                      </span>

                      <div
                        style={{
                          width:
                            "100%",
                          maxWidth:
                            "34px",
                          height: `${height}px`,
                          background:
                            "#222",
                        }}
                      />

                      <span
                        style={{
                          marginTop:
                            "7px",
                          fontSize:
                            "8px",
                          color:
                            "#999",
                        }}
                      >
                        {
                          day.label
                        }
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        </div>

        <div className="right-column">
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">
                  WORKFLOW
                </div>

                <h2>
                  Review status
                </h2>
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "18px",
              }}
            >
              <AnalyticsSimpleCount
                label="Approved"
                value={
                  approved
                }
              />

              <AnalyticsSimpleCount
                label="Needs attention"
                value={
                  needsAttention
                }
              />

              <AnalyticsSimpleCount
                label="Rejected"
                value={
                  rejected
                }
              />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">
                  SOURCES
                </div>

                <h2>
                  Feedback sources
                </h2>
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "18px",
              }}
            >
              <AnalyticsSimpleCount
                label="ReviewAuto"
                value={
                  sourceCounts.reviewauto
                }
                detail={getAnalyticsPercentage(
                  sourceCounts.reviewauto,
                  total
                )}
              />

              <AnalyticsSimpleCount
                label="Google"
                value={
                  sourceCounts.google
                }
                detail={getAnalyticsPercentage(
                  sourceCounts.google,
                  total
                )}
              />

              <AnalyticsSimpleCount
                label="Manual"
                value={
                  sourceCounts.manual
                }
                detail={getAnalyticsPercentage(
                  sourceCounts.manual,
                  total
                )}
              />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">
                  RATINGS
                </div>

                <h2>
                  Rating distribution
                </h2>
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "18px",
              }}
            >
              {[5, 4, 3, 2, 1].map(
                (rating) => (
                  <AnalyticsSimpleCount
                    key={
                      rating
                    }
                    label={`${rating} stars`}
                    value={
                      ratingCounts[
                        rating
                      ]
                    }
                    detail={getAnalyticsPercentage(
                      ratingCounts[
                        rating
                      ],
                      total
                    )}
                  />
                )
              )}
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}

function AnalyticsMetricRow({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) *
            100
        )
      : 0;

  return (
    <div
      style={{
        marginBottom:
          "16px",
      }}
    >
      <div
        style={{
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          fontSize:
            "10px",
          marginBottom:
            "6px",
        }}
      >
        <span>
          {label}
        </span>

        <span
          style={{
            color: "#777",
          }}
        >
          {value} ·{" "}
          {percentage}%
        </span>
      </div>

      <div
        style={{
          width:
            "100%",
          height:
            "5px",
          background:
            "#eeeeeb",
          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height:
              "100%",
            background:
              "#222",
          }}
        />
      </div>
    </div>
  );
}

function AnalyticsSimpleCount({
  label,
  value,
  detail,
}) {
  return (
    <div
      style={{
        display:
          "flex",
        justifyContent:
          "space-between",
        alignItems:
          "center",
        padding:
          "9px 0",
        borderBottom:
          "1px solid #eeeeeb",
        fontSize:
          "10px",
      }}
    >
      <span>
        {label}
      </span>

      <span
        style={{
          color: "#777",
        }}
      >
        {value}

        {detail
          ? ` · ${detail}`
          : ""}
      </span>
    </div>
  );
}

function getAnalyticsPercentage(
  value,
  total
) {
  if (!total) {
    return "0%";
  }

  return `${Math.round(
    (value / total) * 100
  )}%`;
}

function getLastSevenDays(
  reviews
) {
  const result = [];

  for (
    let i = 6;
    i >= 0;
    i--
  ) {
    const date =
      new Date();

    date.setHours(
      0,
      0,
      0,
      0
    );

    date.setDate(
      date.getDate() - i
    );

    const key =
      date
        .toISOString()
        .slice(
          0,
          10
        );

    const count =
      reviews.filter(
        (review) => {
          const value =
            review.review_created_at ||
            review.created_at;

          if (!value) {
            return false;
          }

          const reviewDate =
            new Date(
              value
            );

          if (
            Number.isNaN(
              reviewDate.getTime()
            )
          ) {
            return false;
          }

          return (
            reviewDate
              .toISOString()
              .slice(
                0,
                10
              ) ===
            key
          );
        }
      ).length;

    result.push({
      key,
      count,
      label:
        date.toLocaleDateString(
          undefined,
          {
            weekday:
              "short",
          }
        ),
    });
  }

  return result;
}

function AutomationBanner({
  enabled,
  setEnabled,
}) {
  return (
    <section className="automation-banner">
      <div className="automation-mark">
        ⚡
      </div>

      <div className="automation-content">
        <div className="automation-title">
          <strong>
            Automatic replies
          </strong>

          <span
            className={
              enabled
                ? "status-pill active"
                : "status-pill paused"
            }
          >
            {enabled
              ? "ACTIVE"
              : "PAUSED"}
          </span>
        </div>

        <p>
          New eligible reviews will be
          analyzed and processed
          automatically.
        </p>
      </div>

      <button
        type="button"
        className={
          enabled
            ? "switch enabled"
            : "switch"
        }
        aria-label="Toggle automatic replies"
        aria-pressed={enabled}
        onClick={setEnabled}
      >
        <span />
      </button>
    </section>
  );
}

function ReviewsPanel({
  reviews,
  setReviews,
  loading,
}) {
  return (
    <section className="panel reviews-panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">
            REVIEW ENGINE
          </div>

          <h2>
            Recent reviews
          </h2>
        </div>

        <span
          style={{
            color: "#aaa",
            fontSize: "8px",
          }}
        >
          {reviews.length > 0
            ? "DATABASE"
            : "NO REVIEWS"}
        </span>
      </div>

      <div className="review-list">
        {loading ? (
          <div className="empty-state">
            Loading reviews...
          </div>
        ) : reviews.length ===
          0 ? (
          <div className="empty-state">
            <strong>
              No reviews yet
            </strong>

            <span>
              Customer feedback submitted
              through your ReviewAuto
              link will appear here.
            </span>
          </div>
        ) : (
          reviews
            .slice(0, 5)
            .map(
              (review) => (
                <ReviewRow
                  key={review.id}
                  review={review}
                  setReviews={
                    setReviews
                  }
                />
              )
            )
        )}
      </div>
    </section>
  );
}

function ReviewsPage({
  reviews,
  setReviews,
  loading,
}) {
  const awaitingApproval =
    reviews.filter(
      (review) =>
        review.automation_status ===
        "awaiting_approval"
    ).length;

  const approved =
    reviews.filter(
      (review) =>
        review.automation_status ===
        "approved"
    ).length;

  const rejected =
    reviews.filter(
      (review) =>
        review.automation_status ===
        "skipped"
    ).length;

  return (
    <section>
      <section className="stats-grid">
        <StatCard
          label="Total reviews"
          value={reviews.length}
          detail={
            reviews.length > 0
              ? "Stored in your workspace"
              : "No reviews yet"
          }
        />

        <StatCard
          label="Needs approval"
          value={
            awaitingApproval
          }
          detail={
            awaitingApproval > 0
              ? "Waiting for your decision"
              : "Nothing waiting"
          }
        />

        <StatCard
          label="Approved"
          value={approved}
          detail={
            approved > 0
              ? "Approved responses"
              : "No approvals yet"
          }
        />

        <StatCard
          label="Rejected"
          value={rejected}
          detail={
            rejected > 0
              ? "Skipped responses"
              : "No rejected reviews"
          }
        />
      </section>

      <section className="panel reviews-panel">
        <div className="panel-header">
          <div>
            <div className="eyebrow">
              REVIEW ENGINE
            </div>

            <h2>
              All reviews
            </h2>
          </div>

          <span
            style={{
              color: "#aaa",
              fontSize: "8px",
            }}
          >
            {reviews.length > 0
              ? `${reviews.length} REVIEW${
                  reviews.length ===
                  1
                    ? ""
                    : "S"
                }`
              : "NO REVIEWS"}
          </span>
        </div>

        <div className="review-list">
          {loading ? (
            <div className="empty-state">
              Loading reviews...
            </div>
          ) : reviews.length ===
            0 ? (
            <div className="empty-state">
              <strong>
                No reviews yet
              </strong>

              <span>
                Customer feedback submitted
                through your ReviewAuto
                link will appear here.
              </span>
            </div>
          ) : (
            reviews.map(
              (review) => (
                <ReviewWorkflowRow
                  key={review.id}
                  review={review}
                  setReviews={
                    setReviews
                  }
                />
              )
            )
          )}
        </div>
      </section>
    </section>
  );
}

function ReviewWorkflowRow({
  review,
  setReviews,
}) {
  const [editing, setEditing] =
    useState(false);

  const [reply, setReply] =
    useState(
      review.ai_generated_reply ||
        ""
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const rating =
    Number(review.rating || 0);

  const stars =
    "★".repeat(rating) +
    "☆".repeat(
      Math.max(
        0,
        5 - rating
      )
    );

  const needsApproval =
    review.automation_status ===
      "awaiting_approval" ||
    review.reply_status ===
      "draft";

  async function updateReview(
    updates
  ) {
    setSaving(true);
    setError("");

    try {
      const {
        data,
        error: updateError,
      } = await supabase
        .from("reviews")
        .update({
          ...updates,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          review.id
        )
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setReviews(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              review.id
                ? data
                : item
          )
      );

      setEditing(false);

      setReply(
        data.ai_generated_reply ||
          ""
      );
    } catch (err) {
      console.error(
        "Review update failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to update review."
      );
    } finally {
      setSaving(false);
    }
  }

  async function approveReview() {
    if (!reply.trim()) {
      setError(
        "A response is required before approval."
      );
      return;
    }

    await updateReview({
      ai_generated_reply:
        reply.trim(),

      automation_status:
        "approved",

      reply_status:
        "draft",
    });
  }

  async function saveEdit() {
    if (!reply.trim()) {
      setError(
        "Response cannot be empty."
      );
      return;
    }

    await updateReview({
      ai_generated_reply:
        reply.trim(),

      automation_status:
        "approved",

      reply_status:
        "draft",
    });
  }

  async function rejectReview() {
    await updateReview({
      automation_status:
        "skipped",

      reply_status:
        "not_replied",
    });
  }

  const status =
    review.reply_status ===
    "published"
      ? "REPLIED"
      : review.automation_status ===
        "awaiting_approval"
      ? "APPROVAL"
      : review.automation_status ===
        "approved"
      ? "APPROVED"
      : review.automation_status ===
        "skipped"
      ? "REJECTED"
      : review.automation_status
          ?.toUpperCase() ||
        "PENDING";

  return (
    <article className="review-row">
      <div className="review-information">
        <div className="review-meta">
          <strong>
            {review.customer_name ||
              "Anonymous customer"}
          </strong>

          <span>
            {formatDate(
              review.review_created_at ||
                review.created_at
            )}
          </span>
        </div>

        <div className="rating">
          {stars}
        </div>

        <p>
          {review.review_text ||
            "No review text provided."}
        </p>

        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginTop: "8px",
          }}
        >
          {review.source && (
            <span className="status-pill">
              {review.source.toUpperCase()}
            </span>
          )}

          {review.ai_sentiment && (
            <span className="status-pill active">
              {review.ai_sentiment.toUpperCase()}
            </span>
          )}

          {review.ai_risk_level && (
            <span
              className={
                review.ai_risk_level ===
                  "high" ||
                review.ai_risk_level ===
                  "critical"
                  ? "status-pill paused"
                  : "status-pill"
              }
            >
              RISK:{" "}
              {review.ai_risk_level.toUpperCase()}
            </span>
          )}
        </div>

        {review.ai_generated_reply && (
          <div
            style={{
              marginTop: "10px",
              padding:
                "10px 12px",
              background:
                "#f5f5f2",
              borderLeft:
                "2px solid #222",
              fontSize: "11px",
              lineHeight: 1.6,
            }}
          >
            <strong>
              AI response:
            </strong>

            {editing ? (
              <textarea
                value={reply}
                onChange={(
                  event
                ) =>
                  setReply(
                    event.target
                      .value
                  )
                }
                rows={5}
                style={{
                  width:
                    "100%",
                  marginTop:
                    "7px",
                  padding:
                    "8px",
                  border:
                    "1px solid #ccc",
                  resize:
                    "vertical",
                  fontFamily:
                    "inherit",
                  fontSize:
                    "11px",
                  boxSizing:
                    "border-box",
                }}
              />
            ) : (
              <div
                style={{
                  marginTop:
                    "4px",
                }}
              >
                {
                  review.ai_generated_reply
                }
              </div>
            )}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "8px",
              color: "#b42318",
              fontSize: "10px",
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {needsApproval && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              marginTop: "10px",
            }}
          >
            {editing ? (
              <>
                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    saveEdit
                  }
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Save & approve"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setEditing(
                      false
                    );
                    setReply(
                      review.ai_generated_reply ||
                        ""
                    );
                    setError("");
                  }}
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    approveReview
                  }
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Approve"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setEditing(
                      true
                    );
                    setError("");
                  }}
                  disabled={
                    saving
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    rejectReview
                  }
                  disabled={
                    saving
                  }
                >
                  Reject
                </button>
              </>
            )}
          </div>
        )}

        {review.automation_status ===
          "approved" && (
          <div
            style={{
              marginTop: "10px",
              fontSize: "10px",
              color: "#777",
            }}
          >
            Approved. Ready for the
            appropriate response
            destination.
          </div>
        )}
      </div>

      <div
        className="review-status"
        style={{
          background:
            status === "REJECTED"
              ? "#eeeeeb"
              : status ===
                "APPROVAL"
              ? "#e8e8e3"
              : "#eeeeeb",
          color: "#777",
        }}
      >
        <span
          style={{
            background: "#999",
          }}
        />

        {status}
      </div>
    </article>
  );
}

function ReviewRow({
  review,
  setReviews,
}) {
  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState("");

  const rating =
    Number(review.rating || 0);

  const stars =
    "★".repeat(rating) +
    "☆".repeat(
      Math.max(
        0,
        5 - rating
      )
    );

  const status =
    review.reply_status ===
    "published"
      ? "REPLIED"
      : review.automation_status ===
        "awaiting_approval"
      ? "APPROVAL"
      : review.automation_status ===
        "approved"
      ? "APPROVED"
      : review.automation_status ===
        "skipped"
      ? "REJECTED"
      : review.automation_status
          ?.toUpperCase() ||
        "PENDING";

  async function analyzeReview() {
    setAnalyzing(true);
    setError("");

    try {
      const {
        data: {
          session,
        },
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (
        !session?.access_token
      ) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const {
        data,
        error: functionError,
      } =
        await supabase.functions.invoke(
          "analyze-review",
          {
            body: {
              review_id:
                review.id,
            },
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      if (functionError) {
        throw functionError;
      }

      if (!data?.success) {
        throw new Error(
          data?.error ||
            "AI analysis failed."
        );
      }

      const updatedReview =
        data.review;

      setReviews(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              review.id
                ? updatedReview
                : item
          )
      );
    } catch (err) {
      console.error(
        "AI analysis failed:",
        err
      );

      setError(
        err?.message ||
          "AI analysis failed."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <article className="review-row">
      <div className="review-information">
        <div className="review-meta">
          <strong>
            {review.customer_name ||
              "Anonymous customer"}
          </strong>

          <span>
            {formatDate(
              review.review_created_at ||
                review.created_at
            )}
          </span>
        </div>

        <div className="rating">
          {stars}
        </div>

        <p>
          {review.review_text ||
            "No review text provided."}
        </p>

        {review.ai_sentiment && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              marginTop: "8px",
            }}
          >
            <span className="status-pill active">
              {review.ai_sentiment.toUpperCase()}
            </span>

            {review.ai_risk_level && (
              <span
                className={
                  review.ai_risk_level ===
                    "high" ||
                  review.ai_risk_level ===
                    "critical"
                    ? "status-pill paused"
                    : "status-pill"
                }
              >
                RISK:{" "}
                {review.ai_risk_level.toUpperCase()}
              </span>
            )}
          </div>
        )}

        {review.ai_generated_reply && (
          <div
            style={{
              marginTop: "10px",
              padding:
                "10px 12px",
              background:
                "#f5f5f2",
              borderLeft:
                "2px solid #222",
              fontSize: "11px",
              lineHeight: 1.6,
            }}
          >
            <strong>
              AI draft:
            </strong>

            <div
              style={{
                marginTop:
                  "4px",
              }}
            >
              {
                review.ai_generated_reply
              }
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "8px",
              color: "#b42318",
              fontSize: "10px",
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          className="secondary-button"
          onClick={
            analyzeReview
          }
          disabled={analyzing}
          style={{
            marginTop: "10px",
          }}
        >
          {analyzing
            ? "Analyzing..."
            : review.ai_generated_reply
            ? "Analyze again"
            : "Analyze with AI"}
        </button>
      </div>

      <div
        className="review-status"
        style={{
          background:
            "#eeeeeb",
          color: "#777",
        }}
      >
        <span
          style={{
            background: "#999",
          }}
        />

        {status}
      </div>
    </article>
  );
}

function SettingsContent({
  workspace,
  onToggleFeedback,
  onCopyFeedbackLink,
}) {
  const [copied, setCopied] =
    useState(false);

  if (!workspace) {
    return null;
  }

  const feedbackUrl =
    workspace.feedback_slug
      ? `${window.location.origin}/f/${workspace.feedback_slug}`
      : "";

  const feedbackEnabled =
    workspace.feedback_enabled !==
    false;

  async function handleCopy() {
    const success =
      await onCopyFeedbackLink();

    if (success) {
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">
            SETTINGS
          </div>

          <h2>
            ReviewAuto feedback
          </h2>
        </div>

        <span
          className={
            feedbackEnabled
              ? "status-pill active"
              : "status-pill paused"
          }
        >
          {feedbackEnabled
            ? "ACTIVE"
            : "PAUSED"}
        </span>
      </div>

      <div
        style={{
          marginTop: "20px",
        }}
      >
        <div className="eyebrow">
          FEEDBACK LINK
        </div>

        <p
          style={{
            color: "#777",
            fontSize: "11px",
            lineHeight: 1.6,
            maxWidth: "620px",
          }}
        >
          Share this link with customers
          to collect direct feedback through
          ReviewAuto.
        </p>

        <div
          style={{
            marginTop: "14px",
            padding:
              "12px 14px",
            background:
              "#f5f5f2",
            border:
              "1px solid #e3e3de",
            fontSize: "11px",
            wordBreak:
              "break-all",
          }}
        >
          {feedbackUrl ||
            "Feedback link unavailable"}
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginTop: "12px",
          }}
        >
          <button
            type="button"
            className="primary-button"
            onClick={
              handleCopy
            }
            disabled={!feedbackUrl}
          >
            {copied
              ? "Copied"
              : "Copy feedback link"}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={
              onToggleFeedback
            }
          >
            {feedbackEnabled
              ? "Disable feedback"
              : "Enable feedback"}
          </button>
        </div>

        <div
          style={{
            marginTop: "14px",
            fontSize: "10px",
            color: "#777",
          }}
        >
          {feedbackEnabled
            ? "Customers can currently submit feedback through this link."
            : "Customer submissions are currently paused."}
        </div>
      </div>
    </section>
  );
}

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown date";
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function WorkflowPanel() {
  const steps = [
    {
      number: "01",
      title: "New feedback",
      description:
        "ReviewAuto receives customer feedback from a connected source.",
    },
    {
      number: "02",
      title: "AI analysis",
      description:
        "The system analyzes rating, sentiment and context.",
    },
    {
      number: "03",
      title: "Safety check",
      description:
        "Rules decide whether the feedback can be handled automatically.",
    },
    {
      number: "04",
      title: "Response",
      description:
        "An approved response is prepared for the appropriate source.",
    },
  ];

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">
            AUTOMATION
          </div>

          <h2>
            How it works
          </h2>
        </div>
      </div>

      <div className="workflow">
        {steps.map(
          (step, index) => (
            <WorkflowStep
              key={step.number}
              {...step}
              last={
                index ===
                steps.length - 1
              }
            />
          )
        )}
      </div>
    </section>
  );
}

function WorkflowStep({
  number,
  title,
  description,
  last,
}) {
  return (
    <div
      className={
        last
          ? "workflow-step last"
          : "workflow-step"
      }
    >
      <div className="step-number">
        {number}
      </div>

      <div className="step-content">
        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>
      </div>
    </div>
  );
}

function LocationPanel() {
  return (
    <section className="panel location-panel">
      <div className="location-top">
        <div className="google-mark">
          G
        </div>

        <div className="location-title">
          <div className="eyebrow">
            GOOGLE BUSINESS PROFILE
          </div>

          <h3>
            Not connected
          </h3>
        </div>

        <span className="connected-badge disconnected">
          NEXT
        </span>
      </div>

      <p className="location-description">
        Connect your Google Business
        Profile to bring real reviews
        into ReviewAuto.
      </p>

      <button
        type="button"
        className="secondary-button"
        disabled
      >
        Connect Google
      </button>
    </section>
  );
}

function PlaceholderPage({
  page,
  onBack,
}) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-icon">
        ✦
      </div>

      <h2>{page}</h2>

      <p>
        This section will be connected
        during the next development
        stage.
      </p>

      <button
        type="button"
        className="primary-button"
        onClick={onBack}
      >
        Back to dashboard
      </button>
    </section>
  );
}

export default App;
