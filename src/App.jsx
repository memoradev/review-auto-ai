import { useEffect, useState, useCallback } from "react";
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
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (error) {
          console.error(
            "Failed to load session:",
            error
          );
        }

        if (mounted) {
          setSession(data?.session || null);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Session loading error:",
          error
        );

        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      }
    }

    loadSession();

    const { data: authListener } =
      supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          if (mounted) {
            setSession(newSession);
          }
        }
      );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
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
    useState(true);

  const [workspaceError, setWorkspaceError] =
    useState("");

  const loadReviews = useCallback(
    async (businessId, showLoading = false) => {
      if (!businessId) {
        return;
      }

      if (showLoading) {
        setReviewsLoading(true);
      }

      try {
        const { data, error } =
          await supabase
            .from("reviews")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", {
              ascending: false,
            });

        if (error) {
          console.error(
            "Review loading error:",
            error
          );
          return;
        }

        setReviews(data || []);
      } catch (error) {
        console.error(
          "Unexpected review loading error:",
          error
        );
      } finally {
        if (showLoading) {
          setReviewsLoading(false);
        }
      }
    },
    []
  );

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
          .eq("business_id", business.id)
          .maybeSingle();

        if (automationError) {
          throw automationError;
        }

        if (!mounted) {
          return;
        }

        setWorkspace(business);
        setAutomation(
          automationSettings
        );

        await loadReviews(
          business.id,
          true
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
  }, [
    session.user.id,
    loadReviews,
  ]);

  useEffect(() => {
    if (!workspace?.id) {
      return undefined;
    }

    const interval = setInterval(() => {
      loadReviews(
        workspace.id,
        false
      );
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [
    workspace?.id,
    loadReviews,
  ]);

  useEffect(() => {
    if (!workspace?.id) {
      return undefined;
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        loadReviews(
          workspace.id,
          false
        );
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    workspace?.id,
    loadReviews,
  ]);

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
      automation?.enabled === true;

    const newValue =
      !currentValue;

    try {
      /*
       * If settings don't exist yet,
       * create them.
       */
      if (!automation?.id) {
        const {
          data,
          error,
        } = await supabase
          .from("automation_settings")
          .insert({
            business_id:
              workspace.id,
            enabled:
              newValue,
            updated_at:
              new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error(
            "Automation insert failed:",
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
          enabled:
            newValue,
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
    } catch (error) {
      console.error(
        "Automation toggle error:",
        error
      );
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

        {activePage === "Dashboard" && (
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
        )}

        {activePage === "Reviews" && (
          <FullReviewsPage
            reviews={reviews}
            setReviews={setReviews}
            loading={reviewsLoading}
          />
        )}

        {activePage === "Locations" && (
          <LocationsPage
            workspace={workspace}
          />
        )}

        {activePage === "Automation" && (
          <AutomationPage
            automation={automation}
            reviews={reviews}
            onToggleAutomation={
              toggleAutomation
            }
          />
        )}

        {activePage === "Settings" && (
          <SettingsPage
            workspace={workspace}
            automation={automation}
            reviews={reviews}
            onToggleAutomation={
              toggleAutomation
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

function getInitials(email) {
  const first =
    String(email || "")
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
      ? "Good morning, " +
        (businessName ||
          "Business Owner") +
        "."
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

/* =========================================================
   DASHBOARD
   ========================================================= */

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
                review.rating || 0
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
          automation?.enabled ===
          true
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
          New eligible reviews will
          be analyzed and processed
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

/* =========================================================
   REVIEWS
   ========================================================= */

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
              Connect Google Business
              Profile later to bring in
              real customer reviews.
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

function FullReviewsPage({
  reviews,
  setReviews,
  loading,
}) {
  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const filteredReviews =
    reviews.filter((review) => {
      const query =
        search
          .trim()
          .toLowerCase();

      const customerName =
        String(
          review.customer_name ||
            ""
        ).toLowerCase();

      const reviewText =
        String(
          review.review_text ||
            ""
        ).toLowerCase();

      const matchesSearch =
        query === "" ||
        customerName.includes(
          query
        ) ||
        reviewText.includes(
          query
        );

      if (!matchesSearch) {
        return false;
      }

      if (
        filter ===
        "positive"
      ) {
        return (
          review.ai_sentiment ===
            "positive" ||
          Number(
            review.rating || 0
          ) >= 4
        );
      }

      if (
        filter ===
        "negative"
      ) {
        return (
          review.ai_sentiment ===
            "negative" ||
          Number(
            review.rating || 0
          ) <= 2
        );
      }

      if (
        filter ===
        "attention"
      ) {
        return (
          review.automation_status ===
            "awaiting_approval" ||
          review.ai_risk_level ===
            "high" ||
          review.ai_risk_level ===
            "critical"
        );
      }

      if (
        filter ===
        "analyzed"
      ) {
        return Boolean(
          review.ai_sentiment ||
            review.ai_risk_level ||
            review.ai_generated_reply
        );
      }

      return true;
    });

  const total =
    reviews.length;

  const analyzed =
    reviews.filter(
      (review) =>
        review.ai_sentiment ||
        review.ai_risk_level ||
        review.ai_generated_reply
    ).length;

  const positive =
    reviews.filter(
      (review) =>
        review.ai_sentiment ===
          "positive" ||
        Number(
          review.rating || 0
        ) >= 4
    ).length;

  const attention =
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
    <section className="reviews-page">
      <div
        className="panel"
        style={{
          marginBottom: "16px",
        }}
      >
        <div className="panel-header">
          <div>
            <div className="eyebrow">
              REVIEW ENGINE
            </div>

            <h2>
              All reviews
            </h2>

            <p
              style={{
                marginTop: "6px",
                color: "#888",
                fontSize: "11px",
                lineHeight: 1.6,
              }}
            >
              View, search and analyze
              every review stored in
              your workspace.
            </p>
          </div>

          <span
            style={{
              color: "#777",
              fontSize: "9px",
              fontWeight: 700,
            }}
          >
            {filteredReviews.length}{" "}
            OF {total}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: "10px",
            marginTop: "18px",
          }}
        >
          <ReviewMetric
            label="Total"
            value={total}
          />

          <ReviewMetric
            label="Analyzed"
            value={analyzed}
          />

          <ReviewMetric
            label="Positive"
            value={positive}
          />

          <ReviewMetric
            label="Attention"
            value={attention}
          />
        </div>
      </div>

      <div
        className="panel"
        style={{
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search reviews..."
            style={{
              flex:
                "1 1 240px",
              minWidth: "200px",
              padding:
                "11px 12px",
              border:
                "1px solid #deded9",
              background:
                "#fafaf8",
              outline: "none",
              fontSize: "11px",
              color: "#222",
            }}
          />

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value
              )
            }
            style={{
              padding:
                "11px 12px",
              border:
                "1px solid #deded9",
              background:
                "#fafaf8",
              outline: "none",
              fontSize: "11px",
              color: "#222",
            }}
          >
            <option value="all">
              All reviews
            </option>

            <option value="analyzed">
              Analyzed
            </option>

            <option value="positive">
              Positive
            </option>

            <option value="negative">
              Negative
            </option>

            <option value="attention">
              Needs attention
            </option>
          </select>
        </div>
      </div>

      <section className="panel reviews-panel">
        <div className="panel-header">
          <div>
            <div className="eyebrow">
              DATABASE
            </div>

            <h2>
              {filteredReviews.length}{" "}
              {filteredReviews.length ===
              1
                ? "review"
                : "reviews"}
            </h2>
          </div>
        </div>

        <div className="review-list">
          {loading ? (
            <div className="empty-state">
              Loading reviews...
            </div>
          ) : filteredReviews.length ===
            0 ? (
            <div className="empty-state">
              <strong>
                {reviews.length === 0
                  ? "No reviews yet"
                  : "No matching reviews"}
              </strong>

              <span>
                {reviews.length ===
                0
                  ? "Reviews created in your workspace will appear here."
                  : "Try changing your search or filter."}
              </span>
            </div>
          ) : (
            filteredReviews.map(
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
    </section>
  );
}

function ReviewMetric({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "13px",
        border:
          "1px solid #e3e3de",
        background:
          "#fafaf8",
      }}
    >
      <div
        style={{
          color: "#999",
          fontSize: "8px",
          fontWeight: 700,
          textTransform:
            "uppercase",
          letterSpacing:
            "0.08em",
        }}
      >
        {label}
      </div>

      <strong
        style={{
          display: "block",
          marginTop: "5px",
          fontSize: "20px",
          lineHeight: 1,
        }}
      >
        {value}
      </strong>
    </div>
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

  const safeRating = Math.max(
    0,
    Math.min(5, rating)
  );

  const stars =
    "★".repeat(
      safeRating
    ) +
    "☆".repeat(
      5 - safeRating
    );

  let status = "PENDING";

  if (
    review.reply_status ===
    "published"
  ) {
    status = "REPLIED";
  } else if (
    review.automation_status ===
    "awaiting_approval"
  ) {
    status = "APPROVAL";
  } else if (
    review.automation_status
  ) {
    status =
      review.automation_status.toUpperCase();
  }

  async function getFunctionErrorMessage(
    functionError
  ) {
    if (!functionError) {
      return "AI analysis failed.";
    }

    let message =
      functionError.message ||
      "AI analysis failed.";

    try {
      const context =
        functionError.context;

      if (
        context &&
        typeof context.json ===
          "function"
      ) {
        const body =
          await context.json();

        if (body?.error) {
          message =
            body.error;
        } else if (
          body?.message
        ) {
          message =
            body.message;
        } else if (
          body?.details
        ) {
          message =
            body.details;
        }
      }
    } catch {
      // Ignore response parsing errors.
    }

    return message;
  }

  async function analyzeReview() {
    if (analyzing) {
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      const {
        data,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          sessionError.message ||
            "Unable to verify your session."
        );
      }

      const currentSession =
        data?.session;

      if (
        !currentSession?.access_token
      ) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      if (!review?.id) {
        throw new Error(
          "This review does not have a valid review ID."
        );
      }

      const {
        data: result,
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
                `Bearer ${currentSession.access_token}`,
            },
          }
        );

      if (functionError) {
        const readableError =
          await getFunctionErrorMessage(
            functionError
          );

        throw new Error(
          readableError
        );
      }

      if (!result) {
        throw new Error(
          "The AI function returned an empty response."
        );
      }

      if (
        result.success ===
        false
      ) {
        throw new Error(
          result.error ||
            result.message ||
            "AI analysis failed."
        );
      }

      if (result.review) {
        setReviews(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                review.id
                  ? {
                      ...item,
                      ...result.review,
                    }
                  : item
            )
        );

        return;
      }

      const {
        data: updatedReview,
        error: refreshError,
      } =
        await supabase
          .from("reviews")
          .select("*")
          .eq(
            "id",
            review.id
          )
          .maybeSingle();

      if (refreshError) {
        console.error(
          "Updated review fetch failed:",
          refreshError
        );

        return;
      }

      if (updatedReview) {
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
      }
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

        {(review.ai_sentiment ||
          review.ai_risk_level) && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap:
                "wrap",
              marginTop: "8px",
            }}
          >
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
          disabled={
            analyzing
          }
          style={{
            marginTop:
              "10px",
            opacity:
              analyzing
                ? 0.6
                : 1,
            cursor:
              analyzing
                ? "wait"
                : "pointer",
          }}
        >
          {analyzing
            ? "Analyzing..."
            : review.ai_generated_reply
            ? "Analyze again"
            : "Analyze with AI"}
        </button>

        {!review.ai_generated_reply &&
          review.automation_status ===
            "pending" && (
            <div
              style={{
                marginTop:
                  "10px",
                color:
                  "#888",
                fontSize:
                  "10px",
              }}
            >
              AI analysis is being
              processed automatically...
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

/* =========================================================
   WORKFLOW
   ========================================================= */

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
          (step, index) => (
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
        Business Profile to bring
        real reviews into
        ReviewAuto.
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

/* =========================================================
   AUTOMATION PAGE
   ========================================================= */

function AutomationPage({
  automation,
  reviews,
  onToggleAutomation,
}) {
  const enabled =
    automation?.enabled === true;

  const analyzed =
    reviews.filter(
      (review) =>
        review.ai_sentiment ||
        review.ai_risk_level ||
        review.ai_generated_reply
    ).length;

  const pending =
    reviews.filter(
      (review) =>
        review.automation_status ===
        "pending"
    ).length;

  const approval =
    reviews.filter(
      (review) =>
        review.automation_status ===
        "awaiting_approval"
    ).length;

  const replied =
    reviews.filter(
      (review) =>
        review.reply_status ===
        "published" ||
        review.automation_status ===
        "replied"
    ).length;

  return (
    <section className="reviews-page">
      <section className="automation-banner">
        <div className="automation-mark">
          ⚡
        </div>

        <div className="automation-content">
          <div className="automation-title">
            <strong>
              Review automation
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
            {enabled
              ? "Eligible reviews can move through the analysis and automation pipeline."
              : "Automation is paused. Reviews can still be analyzed manually."}
          </p>
        </div>

        <button
          type="button"
          className={
            enabled
              ? "switch enabled"
              : "switch"
          }
          aria-label="Toggle automation"
          aria-pressed={enabled}
          onClick={
            onToggleAutomation
          }
        >
          <span />
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Analyzed"
          value={analyzed}
          detail="Reviews processed by AI"
        />

        <StatCard
          label="Pending"
          value={pending}
          detail="Waiting in the pipeline"
        />

        <StatCard
          label="Approval"
          value={approval}
          detail="Human approval required"
        />

        <StatCard
          label="Replied"
          value={replied}
          detail="Published replies"
        />
      </section>

      <section className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                PIPELINE
              </div>

              <h2>
                Automation flow
              </h2>
            </div>
          </div>

          <div className="workflow">
            <WorkflowStep
              number="01"
              title="Review received"
              description="A review enters the ReviewAuto workspace."
            />

            <WorkflowStep
              number="02"
              title="AI analysis"
              description="Sentiment, risk and a customer-facing reply are generated."
            />

            <WorkflowStep
              number="03"
              title="Safety decision"
              description="High-risk reviews are routed for human approval."
            />

            <WorkflowStep
              number="04"
              title="Automation"
              description="Eligible reviews continue toward publishing."
              last
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                SAFETY
              </div>

              <h2>
                Protection rules
              </h2>
            </div>
          </div>

          <AutomationRule
            title="High risk"
            description="Always requires human approval."
          />

          <AutomationRule
            title="Critical risk"
            description="Never automatically published."
          />

          <AutomationRule
            title="No AI reply"
            description="Review is skipped instead of publishing an empty response."
          />

          <AutomationRule
            title="Automation paused"
            description="Reviews remain available for manual handling."
          />
        </section>
      </section>
    </section>
  );
}

function AutomationRule({
  title,
  description,
}) {
  return (
    <div
      style={{
        padding:
          "13px 0",
        borderBottom:
          "1px solid #e8e8e3",
      }}
    >
      <strong
        style={{
          display:
            "block",
          fontSize:
            "11px",
          color:
            "#222",
        }}
      >
        {title}
      </strong>

      <span
        style={{
          display:
            "block",
          marginTop:
            "4px",
          color:
            "#888",
          fontSize:
            "10px",
          lineHeight:
            1.5,
        }}
      >
        {description}
      </span>
    </div>
  );
}

/* =========================================================
   LOCATIONS PAGE
   ========================================================= */

function LocationsPage({
  workspace,
}) {
  return (
    <section className="reviews-page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="eyebrow">
              LOCATIONS
            </div>

            <h2>
              Business locations
            </h2>

            <p
              style={{
                marginTop:
                  "6px",
                color:
                  "#888",
                fontSize:
                  "11px",
                lineHeight:
                  1.6,
              }}
            >
              Manage the locations connected
              to your ReviewAuto workspace.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop:
              "18px",
            padding:
              "18px",
            border:
              "1px solid #e3e3de",
            background:
              "#fafaf8",
          }}
        >
          <div
            className="location-top"
          >
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
              NOT CONNECTED
            </span>
          </div>

          <p
            className="location-description"
            style={{
              maxWidth:
                "620px",
            }}
          >
            Your ReviewAuto workspace is
            ready for a Google Business
            Profile connection. The Google
            OAuth integration will be added
            later.
          </p>

          <button
            type="button"
            className="secondary-button"
            disabled
          >
            Google connection
            coming next
          </button>
        </div>
      </section>

      <section className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                WORKSPACE
              </div>

              <h2>
                Current business
              </h2>
            </div>
          </div>

          <InfoRow
            label="Business name"
            value={
              workspace?.name ||
              "—"
            }
          />

          <InfoRow
            label="Business ID"
            value={
              workspace?.id ||
              "—"
            }
          />

          <InfoRow
            label="Google status"
            value="Not connected"
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                NEXT INTEGRATION
              </div>

              <h2>
                Google Business Profile
              </h2>
            </div>
          </div>

          <p
            style={{
              color:
                "#777",
              fontSize:
                "11px",
              lineHeight:
                1.7,
            }}
          >
            Once Google OAuth is connected,
            this area will handle the Google
            Business Profile location,
            review synchronization and
            publishing connection.
          </p>

          <div
            style={{
              marginTop:
                "14px",
            }}
          >
            <span className="status-pill">
              BACKEND NOT CONNECTED
            </span>
          </div>
        </section>
      </section>
    </section>
  );
}

/* =========================================================
   SETTINGS PAGE
   ========================================================= */

function SettingsPage({
  workspace,
  automation,
  reviews,
  onToggleAutomation,
}) {
  const enabled =
    automation?.enabled === true;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, review) =>
              sum +
              Number(
                review.rating || 0
              ),
            0
          ) /
          reviews.length
        ).toFixed(1)
      : "—";

  return (
    <section className="reviews-page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="eyebrow">
              SETTINGS
            </div>

            <h2>
              Workspace settings
            </h2>

            <p
              style={{
                marginTop:
                  "6px",
                color:
                  "#888",
                fontSize:
                  "11px",
                lineHeight:
                  1.6,
              }}
            >
              ReviewAuto workspace information
              and automation controls.
            </p>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                WORKSPACE
              </div>

              <h2>
                Business information
              </h2>
            </div>
          </div>

          <InfoRow
            label="Business name"
            value={
              workspace?.name ||
              "—"
            }
          />

          <InfoRow
            label="Business ID"
            value={
              workspace?.id ||
              "—"
            }
          />

          <InfoRow
            label="Total reviews"
            value={
              String(
                reviews.length
              )
            }
          />

          <InfoRow
            label="Average rating"
            value={
              averageRating
            }
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                AUTOMATION
              </div>

              <h2>
                Automatic replies
              </h2>
            </div>
          </div>

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap:
                "15px",
              padding:
                "14px 0",
              borderBottom:
                "1px solid #e8e8e3",
            }}
          >
            <div>
              <strong
                style={{
                  display:
                    "block",
                  fontSize:
                    "11px",
                }}
              >
                Automation status
              </strong>

              <span
                style={{
                  display:
                    "block",
                  marginTop:
                    "4px",
                  color:
                    "#888",
                  fontSize:
                    "10px",
                }}
              >
                {enabled
                  ? "Automation is enabled."
                  : "Automation is currently paused."}
              </span>
            </div>

            <button
              type="button"
              className={
                enabled
                  ? "switch enabled"
                  : "switch"
              }
              aria-label="Toggle automation"
              aria-pressed={
                enabled
              }
              onClick={
                onToggleAutomation
              }
            >
              <span />
            </button>
          </div>

          <div
            style={{
              marginTop:
                "14px",
            }}
          >
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
        </section>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="eyebrow">
              INTEGRATIONS
            </div>

            <h2>
              Connected services
            </h2>
          </div>
        </div>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap:
              "12px",
          }}
        >
          <IntegrationCard
            name="Google Business Profile"
            status="Not connected"
            description="Review synchronization and reply publishing."
          />

          <IntegrationCard
            name="AI Review Engine"
            status="Connected"
            description="Groq-powered review analysis is active."
            active
          />
        </div>
      </section>
    </section>
  );
}

function IntegrationCard({
  name,
  status,
  description,
  active = false,
}) {
  return (
    <div
      style={{
        padding:
          "16px",
        border:
          "1px solid #e3e3de",
        background:
          "#fafaf8",
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
            "10px",
        }}
      >
        <strong
          style={{
            fontSize:
              "11px",
          }}
        >
          {name}
        </strong>

        <span
          className={
            active
              ? "status-pill active"
              : "status-pill paused"
          }
        >
          {status.toUpperCase()}
        </span>
      </div>

      <p
        style={{
          marginTop:
            "8px",
          color:
            "#888",
          fontSize:
            "10px",
          lineHeight:
            1.6,
        }}
      >
        {description}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
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
        gap:
          "15px",
        padding:
          "12px 0",
        borderBottom:
          "1px solid #e8e8e3",
      }}
    >
      <span
        style={{
          color:
            "#888",
          fontSize:
            "10px",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color:
            "#222",
          fontSize:
            "10px",
          textAlign:
            "right",
          maxWidth:
            "65%",
          overflow:
            "hidden",
          textOverflow:
            "ellipsis",
          whiteSpace:
            "nowrap",
        }}
        title={value}
      >
        {value}
      </strong>
    </div>
  );
}

export default App;
