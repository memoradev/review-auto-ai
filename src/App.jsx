import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";

const demoReviews = [
  {
    id: 1,
    customer: "Sarah M.",
    rating: 5,
    time: "2 min ago",
    status: "Replied",
    text: "Absolutely loved the experience. The staff were amazing and the service was incredibly fast."
  },
  {
    id: 2,
    customer: "James R.",
    rating: 4,
    time: "18 min ago",
    status: "Replied",
    text: "Great service overall. The food was excellent, although we had to wait a little longer than expected."
  },
  {
    id: 3,
    customer: "Michael T.",
    rating: 2,
    time: "34 min ago",
    status: "Approval",
    text: "The food was cold when it arrived and we waited almost an hour. Very disappointing."
  },
  {
    id: 4,
    customer: "Emma W.",
    rating: 5,
    time: "1 hr ago",
    status: "Replied",
    text: "Fantastic place. Friendly team, beautiful atmosphere and excellent quality."
  }
];

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
      const {
        data,
        error
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

  return (
    <Dashboard
      session={session}
    />
  );
}

function LoadingScreen() {
  return (
    <main className="loading-page">
      <div className="loading-mark">
        R
      </div>

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

  const [autoReply, setAutoReply] =
    useState(true);

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

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        email={session.user.email}
        onSignOut={handleSignOut}
      />

      <main className="main">
        <Header activePage={activePage} />

        {activePage === "Dashboard" ? (
          <DashboardContent
            autoReply={autoReply}
            setAutoReply={setAutoReply}
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

function Sidebar({
  activePage,
  setActivePage,
  email,
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

function getInitials(email = "") {
  const first =
    email.trim().charAt(0).toUpperCase();

  return first || "U";
}

function Header({ activePage }) {
  const title =
    activePage === "Dashboard"
      ? "Good morning, Business Owner."
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
  autoReply,
  setAutoReply
}) {
  return (
    <>
      <section className="stats-grid">
        <StatCard
          label="Total reviews"
          value="247"
          detail="+12 this week"
        />

        <StatCard
          label="Average rating"
          value="4.7"
          detail="★★★★★"
        />

        <StatCard
          label="Replies sent"
          value="231"
          detail="93.5% response rate"
        />

        <StatCard
          label="Needs attention"
          value="16"
          detail="Requires approval"
        />
      </section>

      <AutomationBanner
        enabled={autoReply}
        setEnabled={setAutoReply}
      />

      <section className="content-grid">
        <ReviewsPanel />

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
          analyzed and processed automatically.
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
        onClick={() =>
          setAutoReply(!enabled)
        }
      >
        <span />
      </button>
    </section>
  );
}

function ReviewsPanel() {
  return (
    <section className="panel reviews-panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">
            LIVE ACTIVITY
          </div>

          <h2>
            Recent reviews
          </h2>
        </div>

        <button
          type="button"
          className="text-button"
        >
          View all →
        </button>
      </div>

      <div className="review-list">
        {demoReviews.map((review) => (
          <ReviewRow
            key={review.id}
            review={review}
          />
        ))}
      </div>
    </section>
  );
}

function ReviewRow({ review }) {
  const stars =
    "★".repeat(review.rating) +
    "☆".repeat(5 - review.rating);

  const approval =
    review.status === "Approval";

  return (
    <article className="review-row">
      <div className="review-information">
        <div className="review-meta">
          <strong>
            {review.customer}
          </strong>

          <span>
            {review.time}
          </span>
        </div>

        <div className="rating">
          {stars}
        </div>

        <p>
          {review.text}
        </p>
      </div>

      <div
        className={
          approval
            ? "review-status approval"
            : "review-status replied"
        }
      >
        <span />

        {review.status}
      </div>
    </article>
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
        {steps.map((step, index) => (
          <WorkflowStep
            key={step.number}
            {...step}
            last={
              index ===
              steps.length - 1
            }
          />
        ))}
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
        Connect your Google Business Profile
        after authentication is working.
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

      <h2>
        {page}
      </h2>

      <p>
        This section will be connected
        during the next development stage.
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
