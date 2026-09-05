import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";
import FeedbackPage from "./components/FeedbackPage";

const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Reviews", icon: "★" },
  { name: "Locations", icon: "⌖" },
  { name: "Automation", icon: "⚡" },
  { name: "Settings", icon: "⚙" },
];

/*
 * ---------------------------------------------------------
 * APP ROUTER
 * ---------------------------------------------------------
 *
 * Public ReviewAuto feedback pages:
 *
 *   /f/business-slug
 *
 * Everything else uses the normal authenticated application.
 *
 * Keep this routing outside AuthenticatedApp so React hooks
 * are never conditionally executed.
 */

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

/*
 * ---------------------------------------------------------
 * AUTHENTICATED APPLICATION
 * ---------------------------------------------------------
 */

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

/*
 * ---------------------------------------------------------
 * LOADING
 * ---------------------------------------------------------
 */

function LoadingScreen() {
  return (
    <main className="loading-page">
      <div className="loading-mark">R</div>
      <div className="loading-spinner" />
      <p>Loading your workspace...</p>
    </main>
  );
}

/*
 * ---------------------------------------------------------
 * DASHBOARD
 * ---------------------------------------------------------
 */

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
    if (
      !workspace ||
      !automation
    ) {
      return;
    }

    const newValue =
      !automation.enabled;

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

  /*
   * -------------------------------------------------------
   * FEEDBACK LINK MANAGEMENT
   * -------------------------------------------------------
   */

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
        feedback_enabled: nextValue,
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
    if (
      !workspace?.feedback_slug
    ) {
      return false;
    }

    const feedbackUrl =
      `${window.location.origin}/f/${workspace.feedback_slug}`;

    try {
      /*
       * Primary method.
       *
       * Works on HTTPS deployments such as Vercel.
       */
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          feedbackUrl
        );

        return true;
      }

      /*
       * Fallback method for browsers where
       * Clipboard API is unavailable.
       */
      const textArea =
        document.createElement("textarea");

      textArea.value = feedbackUrl;

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
        "Failed to copy feedback link:",
        error
      );

      /*
       * Last-resort fallback.
       */
      window.prompt(
        "Copy your feedback link:",
        feedbackUrl
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
        businessName={workspace?.name}
        onSignOut={handleSignOut}
      />

      <main className="main">
        <Header
          activePage={activePage}
          businessName={workspace?.name}
        />

        {activePage === "Dashboard" ? (
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

/*
 * ---------------------------------------------------------
 * WORKSPACE ERROR
 * ---------------------------------------------------------
 */

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

/*
 * ---------------------------------------------------------
 * SIDEBAR
 * ---------------------------------------------------------
 */

function Sidebar({
  activePage,
  setActivePage,
  email,
  businessName,
  onSignOut,
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
          padding: "0 11px 12px",
          color: "#d8d8d2",
          fontSize: "10px",
          fontWeight: 700,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
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
              Feedback collection active
            </span>
          </div>
        </div>

        <div className="account-card">
          <div className="account-avatar">
            {getInitials(email)}
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
            onClick={
              onSignOut
            }
            title="Sign out"
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
  );
}

/*
 * ---------------------------------------------------------
 * HELPERS
 * ---------------------------------------------------------
 */

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

/*
 * ---------------------------------------------------------
 * HEADER
 * ---------------------------------------------------------
 */

function Header({
  activePage,
  businessName,
}) {
  const title =
    activePage ===
    "Dashboard"
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

/*
 * ---------------------------------------------------------
 * DASHBOARD CONTENT
 * ---------------------------------------------------------
 */

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
          ) / totalReviews
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
          value={
            totalReviews
          }
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
          value={
            repliesSent
          }
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
          setReviews={setReviews}
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

/*
 * ---------------------------------------------------------
 * STAT CARD
 * ---------------------------------------------------------
 */

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
 * ---------------------------------------------------------
 * AUTOMATION BANNER
 * ---------------------------------------------------------
 */

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

/*
 * ---------------------------------------------------------
 * REVIEWS PANEL
 * ---------------------------------------------------------
 */

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
              Customer feedback
              collected through
              ReviewAuto will appear
              here automatically.
            </span>
          </div>
        ) : (
          reviews.map(
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

/*
 * ---------------------------------------------------------
 * REVIEW ROW
 * ---------------------------------------------------------
 */

function ReviewRow({
  review,
  setReviews,
}) {
  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState("");

  const rating =
    Number(
      review.rating || 0
    );

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
                marginTop: "4px",
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
            background:
              "#999",
          }}
        />

        {status}
      </div>
    </article>
  );
}

/*
 * ---------------------------------------------------------
 * WORKFLOW
 * ---------------------------------------------------------
 */

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
            WORKFLOW
          </div>

          <h2>
            Review engine
          </h2>
        </div>
      </div>

      <div className="workflow-list">
        {steps.map(
          (step) => (
            <div
              className="workflow-step"
              key={
                step.number
              }
            >
              <div className="workflow-number">
                {step.number}
              </div>

              <div>
                <strong>
                  {step.title}
                </strong>

                <p>
                  {
                    step.description
                  }
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

/*
 * ---------------------------------------------------------
 * LOCATION
 * ---------------------------------------------------------
 */

function LocationPanel() {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">
            GOOGLE BUSINESS PROFILE
          </div>

          <h2>
            Location
          </h2>
        </div>

        <span className="status-pill">
          NOT CONNECTED
        </span>
      </div>

      <div className="location-content">
        <p>
          Google Business Profile
          will be available as an
          external review source.
        </p>

        <button
          type="button"
          className="secondary-button"
          disabled
        >
          Connect later
        </button>
      </div>
    </section>
  );
}

/*
 * ---------------------------------------------------------
 * SETTINGS
 * ---------------------------------------------------------
 */

function SettingsContent({
  workspace,
  onToggleFeedback,
  onCopyFeedbackLink,
}) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  const feedbackSlug =
    workspace?.feedback_slug ||
    "";

  const feedbackUrl =
    feedbackSlug
      ? `${window.location.origin}/f/${feedbackSlug}`
      : "";

  const enabled =
    workspace?.feedback_enabled !==
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
    <section className="content-grid">
      <div className="left-column">
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                FEEDBACK COLLECTION
              </div>

              <h2>
                ReviewAuto feedback link
              </h2>
            </div>

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

          <p
            style={{
              color: "#777",
              fontSize: "11px",
              lineHeight: 1.6,
              marginBottom: "14px",
            }}
          >
            Share this link with
            customers to collect
            feedback directly through
            ReviewAuto.
          </p>

          {feedbackUrl ? (
            <>
              <div
                style={{
                  padding:
                    "10px 12px",
                  background:
                    "#f5f5f2",
                  border:
                    "1px solid #e4e4df",
                  fontSize: "11px",
                  lineHeight: 1.5,
                  wordBreak:
                    "break-all",
                  marginBottom:
                    "10px",
                }}
              >
                {feedbackUrl}
              </div>

              <div
                style={{
                  display:
                    "flex",
                  gap: "8px",
                  flexWrap:
                    "wrap",
                }}
              >
                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    handleCopy
                  }
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
                  {enabled
                    ? "Disable feedback"
                    : "Enable feedback"}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <strong>
                Feedback link unavailable
              </strong>

              <span>
                This workspace does not
                have a feedback link
                configured yet.
              </span>
            </div>
          )}
        </section>
      </div>

      <div className="right-column">
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                CUSTOMER EXPERIENCE
              </div>

              <h2>
                How to use it
              </h2>
            </div>
          </div>

          <div className="workflow-list">
            <WorkflowStep
              number="01"
              title="Share your link"
              description="Send the ReviewAuto feedback link to customers after an interaction."
            />

            <WorkflowStep
              number="02"
              title="Customer responds"
              description="Customers submit a rating and describe their experience."
            />

            <WorkflowStep
              number="03"
              title="ReviewAuto analyzes"
              description="The Review Engine analyzes sentiment, risk and intent."
            />

            <WorkflowStep
              number="04"
              title="Take action"
              description="ReviewAuto generates the appropriate response and next step."
            />
          </div>
        </section>
      </div>
    </section>
  );
}

/*
 * ---------------------------------------------------------
 * WORKFLOW STEP
 * ---------------------------------------------------------
 */

function WorkflowStep({
  number,
  title,
  description,
}) {
  return (
    <div className="workflow-step">
      <div className="workflow-number">
        {number}
      </div>

      <div>
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

/*
 * ---------------------------------------------------------
 * PLACEHOLDER PAGES
 * ---------------------------------------------------------
 */

function PlaceholderPage({
  page,
  onBack,
}) {
  return (
    <section className="placeholder-page">
      <div className="panel">
        <div className="eyebrow">
          {page.toUpperCase()}
        </div>

        <h2>
          {page}
        </h2>

        <p>
          This section is part of
          the ReviewAuto workspace
          and will be connected in
          the next development stage.
        </p>

        <button
          type="button"
          className="secondary-button"
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      </div>
    </section>
  );
}

export default App;
