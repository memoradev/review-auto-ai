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

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
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

  /*
   * Load reviews.
   *
   * Important:
   * This function does NOT automatically turn
   * reviewsLoading on during background refreshes.
   *
   * That prevents:
   *
   * reviews -> Loading...
   * reviews -> data
   * reviews -> Loading...
   * reviews -> data
   *
   * every few seconds.
   */
  const loadReviews = useCallback(
    async (businessId, showLoading = false) => {
      if (!businessId) {
        return;
      }

      if (showLoading) {
        setReviewsLoading(true);
      }

      try {
        const {
          data,
          error,
        } = await supabase
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

          /*
           * Do NOT erase already loaded reviews
           * just because a background refresh failed.
           */
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

  /*
   * Load workspace once after authentication.
   */
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

        /*
         * Initial review load.
         * This is the ONLY time we show
         * "Loading reviews..."
         */
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

  /*
   * Background review refresh.
   *
   * This refreshes silently so newly analyzed
   * reviews appear without showing a loading
   * screen every 5 seconds.
   */
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

  /*
   * Also refresh when the browser tab becomes
   * visible again.
   */
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
          <FullReviewsPage
            reviews={reviews}
            setReviews={setReviews}
            loading={reviewsLoading}
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
          whiteSpace: "nowrap",
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

            <span>
              {item.name}
            </span>
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
          reviews
            .slice(0, 5)
            .map((review) => (
              <ReviewRow
                key={review.id}
                review={review}
                setReviews={
                  setReviews
                }
              />
            ))
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
        search.trim().toLowerCase();

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
        customerName.includes(query) ||
        reviewText.includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (filter === "positive") {
        return (
          review.ai_sentiment ===
            "positive" ||
          Number(review.rating || 0) >=
            4
        );
      }

      if (filter === "negative") {
        return (
          review.ai_sentiment ===
            "negative" ||
          Number(review.rating || 0) <=
            2
        );
      }

      if (filter === "attention") {
        return (
          review.automation_status ===
            "awaiting_approval" ||
          review.ai_risk_level ===
            "high" ||
          review.ai_risk_level ===
            "critical"
        );
      }

      if (filter === "analyzed") {
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
        Number(review.rating || 0) >=
          4
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
    "★".repeat(safeRating) +
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

  /*
   * Read an Edge Function error properly.
   *
   * Supabase often gives the frontend only:
   * "Edge Function returned a non-2xx status code"
   *
   * The actual JSON response can be inside
   * error.context.
   */
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
      /*
       * The response may already have
       * been consumed or may not be JSON.
       */
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
      /*
       * Get the current authenticated session.
       */
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

      /*
       * IMPORTANT:
       *
       * Do NOT put your Vault secret,
       * service-role key, or automation key
       * in this frontend code.
       *
       * The Edge Function must authenticate
       * this request using the user's JWT.
       */
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
        result.success === false
      ) {
        throw new Error(
          result.error ||
            result.message ||
            "AI analysis failed."
        );
      }

      /*
       * Your successful function response
       * contains result.review.
       */
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

      /*
       * If the function succeeded but didn't
       * return the complete review object,
       * fetch this review directly.
       */
      const {
        data: updatedReview,
        error: refreshError,
      } =
        await supabase
          .from("reviews")
          .select("*")
          .eq("id", review.id)
          .maybeSingle();

      if (refreshError) {
        console.error(
          "Updated review fetch failed:",
          refreshError
        );

        /*
         * The function itself succeeded,
         * so don't report this as an AI failure.
         */
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

        {(
          review.ai_sentiment ||
          review.ai_risk_level
        ) && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
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
          onClick={analyzeReview}
          disabled={analyzing}
          style={{
            marginTop: "10px",
            opacity: analyzing
              ? 0.6
              : 1,
            cursor: analyzing
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
                marginTop: "10px",
                color: "#888",
                fontSize: "10px",
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
        connected during the next
        development stage.
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
