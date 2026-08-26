```jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";

const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Reviews", icon: "★" },
  { name: "Locations", icon: "⌖" },
  { name: "Automation", icon: "⚡" },
  { name: "Settings", icon: "⚙" },
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

  async function refreshReviews() {
    if (!workspace?.id) {
      return;
    }

    await loadReviews(
      workspace.id,
      true
    );
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
        ) : activePage === "Reviews" ? (
          <ReviewsPage
            reviews={reviews}
            loading={reviewsLoading}
            onRefresh={refreshReviews}
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
            (
              sum,
              review
            ) =>
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
          value={
            totalReviews
          }
          detail={
            totalReviews >
            0
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
            totalReviews >
            0
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
            repliesSent >
            0
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
            needsAttention >
            0
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
          New eligible reviews
          will be analyzed and
          processed
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
        onClick={
          setEnabled
        }
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
          {reviews.length >
          0
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
              Connect Google
              Business Profile
              later to bring in
              real customer
              reviews.
            </span>
          </div>
        ) : (
          reviews
            .slice(0, 5)
            .map(
              (review) => (
                <ReviewRow
                  key={
                    review.id
                  }
                  review={
                    review
                  }
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

function ReviewRow({
  review,
  setReviews,
}) {
  const rating =
    Number(
      review.rating || 0
    );

  const stars =
    "★".repeat(
      Math.min(
        rating,
        5
      )
    ) +
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
      : (
          review.automation_status ||
          "PENDING"
        ).toUpperCase();

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
              display:
                "flex",
              gap: "6px",
              flexWrap:
                "wrap",
              marginTop:
                "8px",
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
              marginTop:
                "10px",
              padding:
                "10px 12px",
              background:
                "#f5f5f2",
              borderLeft:
                "2px solid #222",
              fontSize:
                "11px",
              lineHeight:
                1.6,
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

function ReviewsPage({
  reviews,
  loading,
  onRefresh,
}) {
  const [search, setSearch] =
    useState("");

  const [sentimentFilter, setSentimentFilter] =
    useState("all");

  const [riskFilter, setRiskFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [ratingFilter, setRatingFilter] =
    useState("all");

  const filteredReviews =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return reviews.filter(
        (review) => {
          const matchesSearch =
            !normalizedSearch ||
            [
              review.customer_name,
              review.review_text,
              review.ai_generated_reply,
            ]
              .filter(Boolean)
              .some((value) =>
                String(
                  value
                )
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  )
              );

          const matchesSentiment =
            sentimentFilter ===
              "all" ||
            review.ai_sentiment ===
              sentimentFilter;

          const matchesRisk =
            riskFilter ===
              "all" ||
            review.ai_risk_level ===
              riskFilter;

          const matchesStatus =
            statusFilter ===
              "all" ||
            getReviewStatus(
              review
            ) ===
              statusFilter;

          const matchesRating =
            ratingFilter ===
              "all" ||
            Number(
              review.rating
            ) ===
              Number(
                ratingFilter
              );

          return (
            matchesSearch &&
            matchesSentiment &&
            matchesRisk &&
            matchesStatus &&
            matchesRating
          );
        }
      );
    }, [
      reviews,
      search,
      sentimentFilter,
      riskFilter,
      statusFilter,
      ratingFilter,
    ]);

  const positiveCount =
    reviews.filter(
      (review) =>
        review.ai_sentiment ===
        "positive"
    ).length;

  const attentionCount =
    reviews.filter(
      (review) =>
        review.ai_risk_level ===
          "high" ||
        review.ai_risk_level ===
          "critical" ||
        review.automation_status ===
          "awaiting_approval"
    ).length;

  return (
    <section className="reviews-page">
      <div
        className="panel"
        style={{
          marginBottom:
            "16px",
        }}
      >
        <div
          className="panel-header"
          style={{
            alignItems:
              "flex-start",
          }}
        >
          <div>
            <div className="eyebrow">
              REVIEW ENGINE
            </div>

            <h2>
              All reviews
            </h2>

            <p
              style={{
                color:
                  "#777",
                fontSize:
                  "11px",
                lineHeight:
                  1.6,
                marginTop:
                  "6px",
              }}
            >
              Live reviews from
              your ReviewAuto
              database.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={
              onRefresh
            }
            disabled={
              loading
            }
          >
            {loading
              ? "Refreshing..."
              : "Refresh reviews"}
          </button>
        </div>

        <div
          className="stats-grid"
          style={{
            marginTop:
              "16px",
          }}
        >
          <StatCard
            label="Total"
            value={
              reviews.length
            }
            detail="All stored reviews"
          />

          <StatCard
            label="Positive"
            value={
              positiveCount
            }
            detail="AI classified positive"
          />

          <StatCard
            label="Attention"
            value={
              attentionCount
            }
            detail="High risk or approval"
          />

          <StatCard
            label="Showing"
            value={
              filteredReviews.length
            }
            detail="Matching filters"
          />
        </div>
      </div>

      <section className="panel">
        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "minmax(220px, 1fr) repeat(4, minmax(120px, 160px))",
            gap:
              "8px",
            marginBottom:
              "18px",
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search reviews..."
            style={{
              width:
                "100%",
              minHeight:
                "38px",
              border:
                "1px solid #ddd",
              background:
                "#fff",
              padding:
                "0 12px",
              fontSize:
                "11px",
              outline:
                "none",
            }}
          />

          <FilterSelect
            value={
              sentimentFilter
            }
            onChange={
              setSentimentFilter
            }
            options={[
              ["all", "All sentiment"],
              ["positive", "Positive"],
              ["neutral", "Neutral"],
              ["negative", "Negative"],
              ["mixed", "Mixed"],
            ]}
          />

          <FilterSelect
            value={
              riskFilter
            }
            onChange={
              setRiskFilter
            }
            options={[
              ["all", "All risk"],
              ["low", "Low risk"],
              ["medium", "Medium risk"],
              ["high", "High risk"],
              ["critical", "Critical"],
            ]}
          />

          <FilterSelect
            value={
              statusFilter
            }
            onChange={
              setStatusFilter
            }
            options={[
              ["all", "All status"],
              ["pending", "Pending"],
              ["analyzing", "Analyzing"],
              ["awaiting_approval", "Approval"],
              ["failed", "Failed"],
            ]}
          />

          <FilterSelect
            value={
              ratingFilter
            }
            onChange={
              setRatingFilter
            }
            options={[
              ["all", "All ratings"],
              ["5", "5 stars"],
              ["4", "4 stars"],
              ["3", "3 stars"],
              ["2", "2 stars"],
              ["1", "1 star"],
            ]}
          />
        </div>

        {loading ? (
          <div className="empty-state">
            Loading reviews...
          </div>
        ) : filteredReviews.length ===
          0 ? (
          <div className="empty-state">
            <strong>
              No matching reviews
            </strong>

            <span>
              Try changing the
              filters or search
              term.
            </span>
          </div>
        ) : (
          <div className="review-list">
            {filteredReviews.map(
              (review) => (
                <FullReviewCard
                  key={
                    review.id
                  }
                  review={
                    review
                  }
                />
              )
            )}
          </div>
        )}
      </section>
    </section>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      style={{
        width:
          "100%",
        minHeight:
          "38px",
        border:
          "1px solid #ddd",
        background:
          "#fff",
        padding:
          "0 9px",
        fontSize:
          "10px",
        color:
          "#444",
        outline:
          "none",
      }}
    >
      {options.map(
        ([optionValue, label]) => (
          <option
            key={
              optionValue
            }
            value={
              optionValue
            }
          >
            {label}
          </option>
        )
      )}
    </select>
  );
}

function FullReviewCard({
  review,
}) {
  const rating =
    Number(
      review.rating || 0
    );

  const stars =
    "★".repeat(
      Math.min(
        rating,
        5
      )
    ) +
    "☆".repeat(
      Math.max(
        0,
        5 - rating
      )
    );

  const status =
    getReviewStatus(
      review
    );

  return (
    <article
      className="review-row"
      style={{
        display:
          "block",
        padding:
          "18px 0",
      }}
    >
      <div
        style={{
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          gap:
            "16px",
        }}
      >
        <div
          style={{
            minWidth:
              0,
            flex:
              1,
          }}
        >
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

          <div
            className="rating"
            style={{
              marginTop:
                "6px",
            }}
          >
            {stars}
          </div>
        </div>

        <div
          style={{
            display:
              "flex",
            gap:
              "6px",
            flexWrap:
              "wrap",
            justifyContent:
              "flex-end",
          }}
        >
          <span className="status-pill">
            {status.toUpperCase()}
          </span>

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
      </div>

      <div
        style={{
          marginTop:
            "14px",
          fontSize:
            "12px",
          lineHeight:
            1.7,
          color:
            "#333",
        }}
      >
        {review.review_text ||
          "No written review."}
      </div>

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) minmax(0, 1fr)",
          gap:
            "12px",
          marginTop:
            "14px",
        }}
      >
        <ReviewDetail
          label="AI sentiment"
          value={
            review.ai_sentiment
              ? capitalize(
                  review.ai_sentiment
                )
              : "Not analyzed"
          }
        />

        <ReviewDetail
          label="AI risk level"
          value={
            review.ai_risk_level
              ? capitalize(
                  review.ai_risk_level
                )
              : "Not analyzed"
          }
        />

        <ReviewDetail
          label="Automation status"
          value={
            capitalizeStatus(
              review.automation_status
            )
          }
        />

        <ReviewDetail
          label="Reply status"
          value={
            capitalizeStatus(
              review.reply_status
            )
          }
        />
      </div>

      {review.ai_generated_reply && (
        <div
          style={{
            marginTop:
              "14px",
            padding:
              "13px 14px",
            background:
              "#f5f5f2",
            borderLeft:
              "2px solid #222",
          }}
        >
          <div
            className="eyebrow"
            style={{
              marginBottom:
                "6px",
            }}
          >
            AI GENERATED REPLY
          </div>

          <div
            style={{
              fontSize:
                "11px",
              lineHeight:
                1.7,
              color:
                "#333",
            }}
          >
            {
              review.ai_generated_reply
            }
          </div>
        </div>
      )}

      {review.existing_reply && (
        <div
          style={{
            marginTop:
              "10px",
            padding:
              "13px 14px",
            background:
              "#fafafa",
            borderLeft:
              "2px solid #aaa",
          }}
        >
          <div
            className="eyebrow"
            style={{
              marginBottom:
                "6px",
            }}
          >
            EXISTING REPLY
          </div>

          <div
            style={{
              fontSize:
                "11px",
              lineHeight:
                1.7,
              color:
                "#555",
            }}
          >
            {
              review.existing_reply
            }
          </div>
        </div>
      )}

      <div
        style={{
          marginTop:
            "12px",
          display:
            "flex",
          justifyContent:
            "space-between",
          gap:
            "10px",
          color:
            "#999",
          fontSize:
            "9px",
        }}
      >
        <span>
          ID: {review.id}
        </span>

        <span>
          Updated:{" "}
          {formatDateTime(
            review.updated_at
          )}
        </span>
      </div>
    </article>
  );
}

function ReviewDetail({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding:
          "10px 11px",
        background:
          "#fafaf8",
        border:
          "1px solid #eee",
      }}
    >
      <div
        style={{
          fontSize:
            "8px",
          textTransform:
            "uppercase",
          letterSpacing:
            "0.08em",
          color:
            "#999",
          fontWeight:
            700,
          marginBottom:
            "4px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize:
            "11px",
          color:
            "#333",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function getReviewStatus(
  review
) {
  if (
    review.reply_status ===
    "published"
  ) {
    return "published";
  }

  if (
    review.automation_status ===
    "awaiting_approval"
  ) {
    return "awaiting_approval";
  }

  if (
    review.automation_status ===
    "analyzing"
  ) {
    return "analyzing";
  }

  if (
    review.automation_status ===
    "failed"
  ) {
    return "failed";
  }

  return (
    review.automation_status ||
    "pending"
  );
}

function capitalize(
  value
) {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function capitalizeStatus(
  value
) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split("_")
    .map(
      (part) =>
        capitalize(part)
    )
    .join(" ");
}

function formatDate(
  value
) {
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

function formatDateTime(
  value
) {
  if (!value) {
    return "Unknown";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }

  return date.toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function WorkflowPanel() {
  const steps = [
    {
      number: "01",
      title: "New review",
      description:
        "Google sends a new-review event.",
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
        "Rules decide whether the review can be handled automatically.",
    },
    {
      number: "04",
      title: "Reply published",
      description:
        "An approved response is sent through Google.",
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
          (
            step,
            index
          ) => (
            <WorkflowStep
              key={
                step.number
              }
              {...step}
              last={
                index ===
                steps.length -
                  1
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
        Connect your Google
        Business Profile to
        bring real reviews
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
        This section will be
        connected during the
        next development
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
```
