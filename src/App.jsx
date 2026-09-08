import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";
import FeedbackPage from "./components/FeedbackPage";
import WebsiteWidget from "./components/WebsiteWidget";
import AutomationPage from "./components/AutomationPage";

const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Reviews", icon: "★" },
  { name: "Analytics", icon: "◒" },
  { name: "Website Widget", icon: "▣" },
  { name: "Locations", icon: "⌖" },
  { name: "Automation", icon: "⚡" },
  { name: "Settings", icon: "⚙" },
];

/*
 * Dashboard / Reviews UI compatibility styles.
 *
 * The existing ReviewAuto stylesheet already contains the
 * original application design. These styles only cover the
 * Dashboard/Reviews classes introduced by the current workflow
 * UI so they do not appear as unstyled browser-default elements.
 */
function DashboardReviewsStyles() {
  return (
    <style>{`
      /* ---------------------------------------------
         DASHBOARD AUTOMATION BANNER
      --------------------------------------------- */

      .automation-banner {
        position: relative;
        min-height: 80px;
        margin-bottom: 14px;
        padding: 16px 19px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        border: 1px solid #dcdcd5;
        border-radius: 13px;
        background: #ffffff;
      }

      .automation-banner > div:first-child {
        min-width: 0;
        flex: 1;
      }

      .automation-banner h2 {
        margin: 0;
        font-size: 17px;
        letter-spacing: -0.035em;
      }

      .automation-banner p {
        margin: 5px 0 0;
        color: #85857e;
        font-size: 10px;
        line-height: 1.5;
      }

      .toggle-button {
        width: 58px;
        min-width: 58px;
        height: 28px;
        padding: 0 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        border: 1px solid #deded7;
        border-radius: 7px;
        background: #ffffff;
        color: #55554f;
        font-size: 8px;
        font-weight: 800;
      }

      .toggle-button.active {
        border-color: #111111;
        background: #111111;
        color: #ffffff;
      }

      .toggle-button span {
        width: 6px;
        height: 6px;
        flex: 0 0 6px;
        border-radius: 50%;
        background: #aaa9a2;
      }

      .toggle-button.active span {
        background: #ffffff;
      }


      /* ---------------------------------------------
         DASHBOARD ACTIVATION
      --------------------------------------------- */

      .dashboard-activation {
        margin-bottom: 14px;
        padding: 22px;
        border: 1px solid #e2e2dc;
        border-radius: 13px;
        background: #ffffff;
      }

      .dashboard-activation-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 22px;
      }

      .dashboard-activation-header > div:first-child {
        min-width: 0;
        flex: 1;
      }

      .dashboard-activation h2 {
        margin: 0;
        font-size: 20px;
        line-height: 1.15;
        letter-spacing: -0.045em;
      }

      .dashboard-activation-header p {
        max-width: 680px;
        margin: 8px 0 0;
        color: #77776f;
        font-size: 11px;
        line-height: 1.55;
      }

      .dashboard-activation-progress {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 6px;
        max-width: 430px;
        color: #77776f;
        font-size: 8px;
        font-weight: 700;
        line-height: 1.4;
      }

      .activation-check,
      .activation-pending {
        width: 17px;
        height: 17px;
        flex: 0 0 17px;
        display: inline-grid;
        place-items: center;
        border-radius: 50%;
        font-size: 9px;
        font-weight: 800;
      }

      .activation-check {
        background: #111111;
        color: #ffffff;
      }

      .activation-pending {
        border: 1px solid #d8d8d1;
        background: #ffffff;
        color: #aaa9a2;
      }

      .activation-divider {
        color: #c0c0b9;
        margin: 0 2px;
      }

      .dashboard-activation-options {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .activation-option {
        min-width: 0;
        min-height: 150px;
        padding: 17px;
        display: flex;
        align-items: flex-start;
        gap: 13px;
        border: 1px solid #e5e5df;
        border-radius: 11px;
        background: #fafaf8;
        box-sizing: border-box;
      }

      .activation-option.disabled {
        background: #f7f7f4;
        opacity: 0.72;
      }

      .activation-option-icon {
        width: 30px;
        height: 30px;
        flex: 0 0 30px;
        display: grid;
        place-items: center;
        border: 1px solid #dfdfd8;
        border-radius: 8px;
        background: #ffffff;
        color: #44443f;
        font-size: 12px;
        font-weight: 800;
      }

      .activation-option-content {
        min-width: 0;
        flex: 1;
      }

      .activation-option h3 {
        margin: 0;
        font-size: 13px;
        line-height: 1.3;
        letter-spacing: -0.025em;
      }

      .activation-option p {
        min-height: 34px;
        margin: 6px 0 13px;
        color: #85857e;
        font-size: 9px;
        line-height: 1.55;
      }

      .activation-button {
        min-height: 30px;
        padding: 7px 10px;
        border: 1px solid #111111;
        border-radius: 7px;
        background: #111111;
        color: #ffffff;
        font: inherit;
        font-size: 9px;
        font-weight: 750;
        cursor: pointer;
      }

      .activation-button.secondary {
        border-color: #deded7;
        background: #ffffff;
        color: #55554f;
      }

      .activation-button:hover:not(:disabled) {
        opacity: 0.88;
      }

      .activation-button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .activation-option-title-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 7px;
      }

      .activation-coming-soon {
        display: inline-flex;
        align-items: center;
        min-height: 17px;
        padding: 2px 6px;
        border: 1px solid #deded7;
        border-radius: 5px;
        background: #ffffff;
        color: #999992;
        font-size: 6px;
        font-weight: 800;
        letter-spacing: 0.1em;
      }

      @media (max-width: 800px) {
        .dashboard-activation-header {
          flex-direction: column;
        }

        .dashboard-activation-progress {
          justify-content: flex-start;
          max-width: none;
        }

        .dashboard-activation-options {
          grid-template-columns: 1fr;
        }
      }


      /* ---------------------------------------------
         DASHBOARD REVIEW ROW
      --------------------------------------------- */

      .review-row {
        min-width: 0;
      }

      .review-row .review-content {
        min-width: 0;
        flex: 1;
      }

      .review-row .review-text {
        max-width: 650px;
        margin: 5px 0 0;
        color: #72726b;
        font-size: 10px;
        line-height: 1.55;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .review-ai-meta {
        margin-top: 7px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        color: #999992;
        font-size: 8px;
      }

      .review-ai-meta span {
        display: inline-flex;
        align-items: center;
      }

      .review-ai-meta span + span::before {
        content: "·";
        margin-right: 8px;
        color: #c1c1ba;
      }


      /* ---------------------------------------------
         FULL REVIEWS WORKFLOW
      --------------------------------------------- */

      .review-workflow-row {
        min-width: 0;
        padding: 18px 0;
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr);
        gap: 24px;
        border-top: 1px solid #eeeeea;
      }

      .review-workflow-row:first-child {
        padding-top: 0;
        border-top: 0;
      }

      .review-main {
        min-width: 0;
        display: flex;
        align-items: flex-start;
        gap: 15px;
      }

      .review-main .review-content {
        min-width: 0;
        flex: 1;
      }

      .review-rating {
        width: 25px;
        min-width: 25px;
        padding-top: 1px;
        color: #1d1d1b;
        font-size: 10px;
        text-align: center;
      }

      .review-workflow-row .review-meta {
        min-width: 0;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .review-workflow-row .review-meta strong {
        font-size: 11px;
      }

      .review-workflow-row .review-meta span {
        color: #aaa9a1;
        font-size: 8px;
      }

      .review-workflow-row .review-text {
        margin: 8px 0 0;
        color: #55554f;
        font-size: 10px;
        line-height: 1.65;
      }

      .review-workflow-row .review-ai-meta {
        margin-top: 10px;
      }

      .review-workflow {
        min-width: 0;
        padding: 0;
      }

      .workflow-status {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
      }

      .workflow-status span {
        padding: 5px 7px;
        border-radius: 5px;
        background: #ededeb;
        color: #777770;
        font-size: 7px;
        font-weight: 900;
        letter-spacing: 0.07em;
        text-transform: uppercase;
      }

      .workflow-status span[data-status="awaiting_approval"] {
        background: #f5f0df;
        color: #917733;
      }

      .ai-reply {
        padding: 12px;
        border: 1px solid #e5e5df;
        border-radius: 8px;
        background: #fafaf8;
      }

      .ai-reply p {
        margin: 6px 0 0;
        color: #5f5f58;
        font-size: 10px;
        line-height: 1.6;
      }

      .workflow-actions {
        margin-top: 10px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
      }

      .workflow-actions .secondary-button,
      .workflow-actions .primary-button,
      .workflow-actions .danger-button {
        width: 100%;
        min-height: 32px;
      }

      .danger-button {
        border: 1px solid #e1caca;
        border-radius: 8px;
        padding: 9px 12px;
        background: #ffffff;
        color: #9a4b4b;
        font-size: 9px;
        font-weight: 750;
      }

      .danger-button:hover {
        background: #fbf3f3;
      }


      /* ---------------------------------------------
         RESPONSIVE
      --------------------------------------------- */

      @media (max-width: 900px) {
        .review-workflow-row {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .workflow-status {
          justify-content: flex-start;
        }
      }

      @media (max-width: 520px) {
        .automation-banner {
          align-items: flex-start;
        }

        .review-workflow-row {
          padding: 16px 0;
        }

        .review-main {
          gap: 10px;
        }

        .review-ai-meta {
          align-items: flex-start;
          flex-direction: column;
          gap: 4px;
        }

        .review-ai-meta span + span::before {
          display: none;
        }

        .workflow-actions {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}

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

  const [needsOnboarding, setNeedsOnboarding] =
    useState(false);

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
          if (mounted) {
            setNeedsOnboarding(true);
          }

          return;
        }

        let initializedBusiness = business;

        if (!initializedBusiness.feedback_slug) {
          const baseSlug =
            (
              initializedBusiness.name ||
              "business"
            )
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
              .slice(0, 50) ||
            "business";

          const uniqueSuffix =
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID ===
              "function"
              ? crypto
                  .randomUUID()
                  .slice(0, 8)
              : `${Date.now()}`.slice(-8);

          const feedbackSlug =
            `${baseSlug}-${uniqueSuffix}`;

          const {
            data: updatedBusiness,
            error: feedbackSlugError,
          } = await supabase
            .from("businesses")
            .update({
              feedback_slug:
                feedbackSlug,
              feedback_enabled: true,
            })
            .eq(
              "id",
              initializedBusiness.id
            )
            .eq(
              "owner_id",
              session.user.id
            )
            .select("*")
            .single();

          if (feedbackSlugError) {
            throw feedbackSlugError;
          }

          initializedBusiness =
            updatedBusiness;
        }

        const {
          data:
            existingAutomationSettings,
          error:
            automationLookupError,
        } = await supabase
          .from("automation_settings")
          .select("*")
          .eq(
            "business_id",
            initializedBusiness.id
          )
          .maybeSingle();

        if (automationLookupError) {
          throw automationLookupError;
        }

        let automationSettings =
          existingAutomationSettings;

        if (!automationSettings) {
          const {
            data:
              createdAutomationSettings,
            error:
              automationCreateError,
          } = await supabase
            .from("automation_settings")
            .insert({
              business_id:
                initializedBusiness.id,
              enabled: true,
              updated_at:
                new Date().toISOString(),
            })
            .select("*")
            .single();

          if (automationCreateError) {
            throw automationCreateError;
          }

          automationSettings =
            createdAutomationSettings;
        }

        if (mounted) {
          setNeedsOnboarding(false);
          setWorkspace(
            initializedBusiness
          );
          setAutomation(
            automationSettings
          );
        }

        await loadReviews(
          initializedBusiness.id,
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

  if (needsOnboarding) {
    return (
      <WorkspaceOnboarding
        session={session}
        onCreated={async (
          business,
          automationSettings
        ) => {
          setNeedsOnboarding(false);
          setWorkspaceError("");
          setWorkspace(business);
          setAutomation(
            automationSettings
          );

          await loadReviews(
            business.id,
            true
          );
        }}
      />
    );
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
        <DashboardReviewsStyles />

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
            onOpenWebsiteWidget={() =>
              setActivePage(
                "Website Widget"
              )
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
          "Automation" ? (
          <AutomationPage
            automation={automation}
            reviews={reviews}
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
        ) : activePage ===
          "Locations" ? (
          <LocationsPage />
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

function WorkspaceOnboarding({
  session,
  onCreated,
}) {
  const [businessName, setBusinessName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleCreateWorkspace(
    event
  ) {
    event.preventDefault();

    const name =
      businessName.trim();

    if (!name) {
      setError(
        "Please enter your business name."
      );
      return;
    }

    if (name.length > 120) {
      setError(
        "Business name must be 120 characters or less."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const baseSlug =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 50) ||
        "business";

      const uniqueSuffix =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID ===
          "function"
          ? crypto
              .randomUUID()
              .slice(0, 8)
          : `${Date.now()}`.slice(-8);

      const uniqueSlug =
        `${baseSlug}-${uniqueSuffix}`;

      const {
        data: business,
        error: businessError,
      } = await supabase
        .from("businesses")
        .insert({
          owner_id:
            session.user.id,
          name,
          feedback_slug:
            uniqueSlug,
          feedback_enabled: true,
        })
        .select("*")
        .single();

      if (businessError) {
        throw businessError;
      }

      const {
        data: automationSettings,
        error: automationError,
      } = await supabase
        .from("automation_settings")
        .insert({
          business_id:
            business.id,
          enabled: true,
          updated_at:
            new Date().toISOString(),
        })
        .select("*")
        .single();

      if (automationError) {
        await supabase
          .from("businesses")
          .delete()
          .eq(
            "id",
            business.id
          )
          .eq(
            "owner_id",
            session.user.id
          );

        throw automationError;
      }

      onCreated(
        business,
        automationSettings
      );
    } catch (createError) {
      console.error(
        "Workspace creation failed:",
        createError
      );

      setError(
        createError?.message ||
          "Unable to create your workspace. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            R
          </div>

          <div>
            <strong>
              ReviewAuto
            </strong>

            <span>AI</span>
          </div>
        </div>

        <div className="auth-heading">
          <div className="eyebrow">
            GET STARTED
          </div>

          <h1>
            Create your workspace.
          </h1>

          <p>
            Start collecting customer feedback and let ReviewAuto handle the rest.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={
            handleCreateWorkspace
          }
        >
          <label>
            <span>
              Business name
            </span>

            <input
              type="text"
              value={
                businessName
              }
              onChange={(
                event
              ) =>
                setBusinessName(
                  event.target.value
                )
              }
              placeholder="Your Business"
              autoComplete="organization"
              maxLength={120}
              required
              autoFocus
            />
          </label>

          {error && (
            <div className="auth-message error">
              {error}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating workspace..."
              : "Create workspace"}
          </button>
        </form>

        <div className="auth-note">
          Your feedback link and automation settings will be created automatically.
        </div>
      </section>
    </main>
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

function DashboardActivationCard({
  workspace,
  onOpenWebsiteWidget,
}) {
  const [activated, setActivated] =
    useState(false);

  const feedbackUrl =
    workspace?.feedback_slug
      ? `${window.location.origin}/f/${workspace.feedback_slug}`
      : "";

  async function handleCopyLink() {
    if (!feedbackUrl) {
      return;
    }

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          feedbackUrl
        );
      } else {
        const textArea =
          document.createElement(
            "textarea"
          );

        textArea.value = feedbackUrl;
        textArea.setAttribute(
          "readonly",
          ""
        );
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
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
          document.execCommand("copy");

        document.body.removeChild(
          textArea
        );

        if (!successful) {
          throw new Error(
            "Browser blocked clipboard access."
          );
        }
      }

      setActivated(true);
    } catch (error) {
      console.error(
        "Feedback link copy failed:",
        error
      );

      window.prompt(
        "Copy your feedback link:",
        feedbackUrl
      );
      setActivated(true);
    }
  }

  function handleWebsiteWidget() {
    setActivated(true);

    if (
      typeof onOpenWebsiteWidget ===
      "function"
    ) {
      onOpenWebsiteWidget();
    }
  }

  return (
    <section className="dashboard-activation">
      <div className="dashboard-activation-header">
        <div>
          <div className="eyebrow">
            GET REVIEWAUTO WORKING
          </div>

          <h2>
            {activated
              ? "You're ready to collect feedback."
              : "Start collecting customer feedback."}
          </h2>

          <p>
            {activated
              ? "Share your feedback link or add the widget to your website."
              : "Your ReviewAuto workspace is ready. Choose how customers will give you feedback."}
          </p>
        </div>

        <div className="dashboard-activation-progress">
          <span className="activation-check">
            ✓
          </span>
          <span>Workspace</span>
          <span className="activation-divider">
            →
          </span>
          <span className="activation-check">
            ✓
          </span>
          <span>Feedback link</span>
          <span className="activation-divider">
            →
          </span>
          <span
            className={
              activated
                ? "activation-check"
                : "activation-pending"
            }
          >
            {activated ? "✓" : "○"}
          </span>
          <span>Collection method</span>
        </div>
      </div>

      <div className="dashboard-activation-options">
        <div className="activation-option">
          <div className="activation-option-icon">↗</div>
          <div className="activation-option-content">
            <h3>Share Link</h3>
            <p>
              Send your feedback link through SMS, WhatsApp, email, or anywhere else.
            </p>
            <button
              type="button"
              className="activation-button"
              onClick={handleCopyLink}
              disabled={!feedbackUrl}
            >
              Copy feedback link
            </button>
          </div>
        </div>

        <div className="activation-option">
          <div className="activation-option-icon">#</div>
          <div className="activation-option-content">
            <h3>QR Code</h3>
            <p>
              Put a QR code on tables, receipts, counters, packaging, or printed materials.
            </p>
            <button
              type="button"
              className="activation-button secondary"
              disabled
            >
              QR code coming next
            </button>
          </div>
        </div>

        <div className="activation-option">
          <div className="activation-option-icon">▣</div>
          <div className="activation-option-content">
            <h3>Website Widget</h3>
            <p>
              Add ReviewAuto directly to your website using the existing widget.
            </p>
            <button
              type="button"
              className="activation-button"
              onClick={handleWebsiteWidget}
            >
              Set up widget
            </button>
          </div>
        </div>

        <div className="activation-option disabled">
          <div className="activation-option-icon">⌖</div>
          <div className="activation-option-content">
            <div className="activation-option-title-row">
              <h3>Google Business Profile</h3>
              <span className="activation-coming-soon">
                COMING SOON
              </span>
            </div>
            <p>
              Connect your Google Business Profile to manage Google reviews.
            </p>
            <button
              type="button"
              className="activation-button secondary"
              disabled
            >
              Not available yet
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardContent({
  workspace,
  automation,
  reviews,
  setReviews,
  reviewsLoading,
  onToggleAutomation,
  onOpenWebsiteWidget,
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
      <DashboardActivationCard
        workspace={workspace}
        onOpenWebsiteWidget={
          onOpenWebsiteWidget
        }
      />

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
 * Existing analytics implementation.
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

        <span>
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
            width:
              `${percentage}%`,
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
          "10px 0",
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
          fontWeight:
            700,
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
    (value / total) *
      100
  )}%`;
}

function getLastSevenDays(
  reviews
) {
  const days = [];

  for (
    let offset = 6;
    offset >= 0;
    offset--
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
      date.getDate() -
        offset
    );

    const key =
      date
        .toISOString()
        .slice(0, 10);

    const count =
      reviews.filter(
        (review) => {
          const value =
            review.created_at ||
            review.review_created_at;

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

          reviewDate.setHours(
            0,
            0,
            0,
            0
          );

          return (
            reviewDate
              .toISOString()
              .slice(0, 10) ===
            key
          );
        }
      ).length;

    days.push({
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

  return days;
}

function AutomationBanner({
  enabled,
  setEnabled,
}) {
  return (
    <section className="automation-banner">
      <div>
        <div className="eyebrow">
          AUTOMATION
        </div>

        <h2>
          ReviewAuto is{" "}
          {enabled
            ? "active"
            : "paused"}
        </h2>

        <p>
          {enabled
            ? "New feedback can move through the AI workflow automatically."
            : "Automation is paused. New feedback will wait for manual action."}
        </p>
      </div>

      <button
        type="button"
        className={
          enabled
            ? "toggle-button active"
            : "toggle-button"
        }
        onClick={
          setEnabled
        }
        aria-label={
          enabled
            ? "Turn automation off"
            : "Turn automation on"
        }
      >
        <span />
        {enabled
          ? "ON"
          : "OFF"}
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
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">
            REVIEWS
          </div>

          <h2>
            Recent feedback
          </h2>
        </div>

        <span className="panel-count">
          {reviews.length}
        </span>
      </div>

      {loading ? (
        <div className="empty-state">
          Loading reviews...
        </div>
      ) : reviews.length ===
        0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            ★
          </div>

          <h3>
            No reviews yet
          </h3>

          <p>
            Your customer feedback will appear here once ReviewAuto receives it.
          </p>
        </div>
      ) : (
        <div className="review-list">
          {reviews
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
                />
              )
            )}
        </div>
      )}
    </section>
  );
}

function ReviewsPage({
  reviews,
  setReviews,
  loading,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">
            REVIEWS
          </div>

          <h2>
            All customer feedback
          </h2>
        </div>

        <span className="panel-count">
          {reviews.length}
        </span>
      </div>

      {loading ? (
        <div className="empty-state">
          Loading reviews...
        </div>
      ) : reviews.length ===
        0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            ★
          </div>

          <h3>
            No reviews yet
          </h3>

          <p>
            Share your ReviewAuto feedback link with customers to start collecting feedback.
          </p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map(
            (review) => (
              <ReviewWorkflowRow
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
          )}
        </div>
      )}
    </section>
  );
}

function ReviewWorkflowRow({
  review,
  setReviews,
}) {
  const [reply, setReply] =
    useState(
      review.ai_generated_reply ||
        ""
    );

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  async function saveApproval() {
    if (!reply.trim()) {
      return;
    }

    setSaving(true);

    const {
      data,
      error,
    } = await supabase
      .from("reviews")
      .update({
        ai_generated_reply:
          reply.trim(),
        automation_status:
          "approved",
        reply_status:
          "draft",
      })
      .eq(
        "id",
        review.id
      )
      .select()
      .single();

    if (error) {
      console.error(
        "Review approval failed:",
        error
      );
      setSaving(false);
      return;
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
    setSaving(false);
  }

  async function approve() {
    if (!reply.trim()) {
      return;
    }

    setSaving(true);

    const {
      data,
      error,
    } = await supabase
      .from("reviews")
      .update({
        ai_generated_reply:
          reply.trim(),
        automation_status:
          "approved",
        reply_status:
          "draft",
      })
      .eq(
        "id",
        review.id
      )
      .select()
      .single();

    if (error) {
      console.error(
        "Review approval failed:",
        error
      );
      setSaving(false);
      return;
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

    setSaving(false);
  }

  async function reject() {
    setSaving(true);

    const {
      data,
      error,
    } = await supabase
      .from("reviews")
      .update({
        automation_status:
          "skipped",
        reply_status:
          "not_replied",
      })
      .eq(
        "id",
        review.id
      )
      .select()
      .single();

    if (error) {
      console.error(
        "Review rejection failed:",
        error
      );
      setSaving(false);
      return;
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

    setSaving(false);
  }

  async function analyze() {
    setAnalyzing(true);

    try {
      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "You are not authenticated."
        );
      }

      const functionUrl =
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-review`;

      const response =
        await fetch(
          functionUrl,
          {
            method:
              "POST",
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
              "Content-Type":
                "application/json",
              apikey:
                import.meta.env
                  .VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body:
              JSON.stringify({
                review_id:
                  review.id,
              }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "AI analysis failed."
        );
      }

      const {
        data,
        error,
      } = await supabase
        .from("reviews")
        .select("*")
        .eq(
          "id",
          review.id
        )
        .single();

      if (error) {
        throw error;
      }

      setReply(
        data.ai_generated_reply ||
          ""
      );

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
    } catch (error) {
      console.error(
        "AI analysis failed:",
        error
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const status =
    review.automation_status ||
    "pending";

  return (
    <article className="review-workflow-row">
      <div className="review-main">
        <div className="review-rating">
          {review.rating || "—"}
        </div>

        <div className="review-content">
          <div className="review-meta">
            <strong>
              {review.customer_name ||
                "Customer"}
            </strong>

            <span>
              {formatDate(
                review.review_created_at ||
                  review.created_at
              )}
            </span>

            {review.source && (
              <span>
                {review.source}
              </span>
            )}
          </div>

          <p className="review-text">
            {review.review_text ||
              "No review text."}
          </p>

          <div className="review-ai-meta">
            <span>
              Sentiment:{" "}
              {review.ai_sentiment ||
                "Not analyzed"}
            </span>

            <span>
              Risk:{" "}
              {review.ai_risk_level ||
                "Not analyzed"}
            </span>

            <span>
              Intent:{" "}
              {review.ai_intent ||
                "Not analyzed"}
            </span>
          </div>
        </div>
      </div>

      <div className="review-workflow">
        <div className="workflow-status">
          <span
            data-status={
              status
            }
          >
            {status}
          </span>
        </div>

        {editing ? (
          <textarea
            value={reply}
            onChange={(event) =>
              setReply(
                event.target.value
              )
            }
            rows={4}
            style={{
              width:
                "100%",
              marginTop:
                "0",
              resize:
                "vertical",
              border:
                "1px solid #ddd",
              borderRadius:
                "8px",
              padding:
                "10px",
              fontSize:
                "10px",
              lineHeight:
                1.6,
              fontFamily:
                "inherit",
              color:
                "#333",
              background:
                "#ffffff",
              boxSizing:
                "border-box",
            }}
          />
        ) : (
          <div className="ai-reply">
            <div className="eyebrow">
              AI REPLY
            </div>

            <p>
              {reply ||
                "No AI reply generated yet."}
            </p>
          </div>
        )}

        <div className="workflow-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={
              editing
                ? saveApproval
                : () =>
                    setEditing(
                      true
                    )
            }
            disabled={
              saving ||
              analyzing
            }
          >
            {saving
              ? "Saving..."
              : editing
              ? "Save & approve"
              : "Edit AI reply"}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={
              approve
            }
            disabled={
              saving ||
              !reply.trim() ||
              analyzing
            }
          >
            Approve
          </button>

          <button
            type="button"
            className="danger-button"
            onClick={
              reject
            }
            disabled={
              saving ||
              analyzing
            }
          >
            Reject
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={
              analyze
            }
            disabled={
              saving ||
              analyzing
            }
          >
            {analyzing
              ? "Analyzing..."
              : "Analyze with AI"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ReviewRow({
  review,
}) {
  const status =
    review.automation_status ||
    "pending";

  const statusClass =
    status ===
      "approved" ||
    status ===
      "published"
      ? "review-status replied"
      : status ===
        "awaiting_approval"
      ? "review-status approval"
      : "review-status";

  return (
    <article className="review-row">
      <div className="review-rating">
        {review.rating || "—"}
      </div>

      <div className="review-content">
        <div className="review-meta">
          <strong>
            {review.customer_name ||
              "Customer"}
          </strong>

          <span>
            {formatDate(
              review.review_created_at ||
                review.created_at
            )}
          </span>

          {review.source && (
            <span>
              {review.source}
            </span>
          )}
        </div>

        <p className="review-text">
          {review.review_text ||
            "No review text."}
        </p>

        <div className="review-ai-meta">
          <span>
            {review.ai_sentiment ||
              "Not analyzed"}
          </span>

          <span>
            Risk:{" "}
            {review.ai_risk_level ||
              "—"}
          </span>
        </div>
      </div>

      <div
        className={
          statusClass
        }
      >
        <span />
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

function LocationsPage() {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">
            LOCATIONS
          </div>

          <h2>
            Your business locations
          </h2>
        </div>

        <span className="status-pill paused">
          NOT CONNECTED
        </span>
      </div>

      <div
        className="empty-state"
        style={{
          marginTop: "18px",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            marginBottom: "10px",
          }}
        >
          ⌖
        </div>

        <h3>
          No locations connected
        </h3>

        <p>
          Google Business Profile connection will be added when the integration is available.
        </p>

        <button
          type="button"
          className="secondary-button"
          disabled
        >
          Connect Google Business Profile
        </button>
      </div>
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
