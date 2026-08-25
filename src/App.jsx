import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";

const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Reviews", icon: "★" },
  { name: "Locations", icon: "⌖" },
  { name: "Automation", icon: "⚡" },
  { name: "Settings", icon: "⚙" }
];

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } =
        await supabase.auth.getSession();

      if (error) {
        console.error("Failed to load session:", error);
      }

      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: authListener
    } = supabase.auth.onAuthStateChange(
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
      <p>Loading your workspace...</p>
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
          error: businessError
        } = await supabase
          .from("businesses")
          .select("*")
          .eq("owner_id", session.user.id)
          .order("created_at", {
            ascending: true
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
          error: automationError
        } = await supabase
          .from("automation_settings")
          .select("*")
          .eq("business_id", business.id)
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
      error
    } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", {
        ascending: false
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
    if (!workspace || !automation) {
      return;
    }

    const newValue =
      !automation.enabled;

    const {
      data,
      error
    } = await supabase
      .from("automation_settings")
      .update({
        enabled: newValue,
        updated_at:
          new Date().toISOString()
      })
      .eq("business_id", workspace.id)
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
            reviewsLoading={
              reviewsLoading
            }
            onToggleAutomation={
              toggleAutomation
            }
          />
        ) : (
          <PlaceholderPage
            page={activePage}
            onBack={() =>
              setActivePage("Dashboard")
            }
          />
        )}
      </main>
    </div>
  );
}

function WorkspaceError({
  message,
  onSignOut
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
            lineHeight: 1.6
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
  onSignOut
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          R
        </div>

        <div className="brand-name">
          <strong>ReviewAuto</strong>
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
          whiteSpace: "nowrap"
        }}
        title={businessName}
      >
        {businessName}
      </div>

      <nav className="navigation">
        {navigation.map((item) => (
          <button
            key={item.name}
            type="button"
            className={
              activePage === item.name
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage(item.name)
            }
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="connection-card">
          <span className="connection-indicator" />

          <div>
            <strong>
              Google not connected
            </strong>

            <span>
              Connection coming next
            </span>
          </div>
        </div>

        <div className="account-card">
          <div className="account-avatar">
            {getInitials(email)}
          </div>

          <div className="account-details">
            <strong>{email}</strong>

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

function getInitials(email = "") {
  const first =
    email.trim().charAt(0).toUpperCase();

  return first || "U";
}

function Header({
  activePage,
  businessName
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
  reviewsLoading,
  onToggleAutomation
}) {
  const totalReviews =
    reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (sum, review) =>
              sum +
              Number(review.rating || 0),
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
          value={totalReviews}
          detail={
            totalReviews > 0
              ? "Stored in your workspace"
              : "No reviews yet"
          }
        />

        <StatCard
          label="Average rating"
          value={averageRating}
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
          value={needsAttention}
          detail={
            needsAttention > 0
              ? "Requires review"
              : "Nothing requiring attention"
          }
        />
      </section>

      <AutomationBanner
        enabled={
          automation?.enabled || false
        }
        setEnabled={
          onToggleAutomation
        }
      />

      <section className="content-grid">
        <ReviewsPanel
          reviews={reviews}
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

function StatCard({
  label,
  value,
  detail
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

function AutomationBanner({
  enabled,
  setEnabled
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
  loading
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
            fontSize: "8px"
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
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <strong>
              No reviews yet
            </strong>

            <span>
              Connect Google Business
              Profile later to bring in
              real customer reviews.
            </span>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewRow
              key={review.id}
              review={review}
            />
          ))
        )}
      </div>
    </section>
  );
}

function ReviewRow({ review }) {
  const rating =
    Number(review.rating || 0);

  const stars =
    "★".repeat(rating) +
    "☆".repeat(
      Math.max(0, 5 - rating)
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
      </div>

      <div
        className="review-status"
        style={{
          background: "#eeeeeb",
          color: "#777"
        }}
      >
        <span
          style={{
            background: "#999"
          }}
        />

        {status}
      </div>
    </article>
  );
}

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );
}

function WorkflowPanel() {
  const steps = [
    {
      number: "01",
      title: "New review",
      description:
        "Google sends a new-review event."
    },
    {
      number: "02",
      title: "AI analysis",
      description:
        "The system analyzes rating, sentiment and context."
    },
    {
      number: "03",
      title: "Safety check",
      description:
        "Rules decide whether the review can be handled automatically."
    },
    {
      number: "04",
      title: "Reply published",
      description:
        "An approved response is sent through Google."
    }
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
  last
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
  onBack
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
