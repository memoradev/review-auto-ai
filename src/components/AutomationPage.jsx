import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AutomationPage({
  automation,
  reviews,
  onToggleAutomation,
}) {
  const enabled =
    automation?.enabled === true;

  const total = reviews.length;

  const awaitingApproval =
    reviews.filter(
      (review) =>
        review.automation_status ===
        "awaiting_approval"
    ).length;

  const analyzed =
    reviews.filter(
      (review) =>
        review.ai_sentiment ||
        review.ai_risk_level ||
        review.ai_generated_reply
    ).length;

  const highRisk =
    reviews.filter(
      (review) =>
        review.ai_risk_level === "high" ||
        review.ai_risk_level === "critical"
    ).length;

  const approved =
    reviews.filter(
      (review) =>
        review.automation_status ===
        "approved"
    ).length;

  const skipped =
    reviews.filter(
      (review) =>
        review.automation_status ===
        "skipped"
    ).length;

  const openActions =
    reviews.filter((review) => {
      if (!hasAnalyzedData(review)) {
        return false;
      }

      const actionType =
        getActionType(review);

      if (actionType === "no_action") {
        return false;
      }

      return (
        review.action_status !==
          "completed" &&
        review.action_status !==
          "dismissed"
      );
    }).length;

  const completedActions =
    reviews.filter(
      (review) =>
        review.action_status ===
        "completed"
    ).length;

  const dismissedActions =
    reviews.filter(
      (review) =>
        review.action_status ===
        "dismissed"
    ).length;

  return (
    <div>
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="eyebrow">
              AUTOMATION CONTROL
            </div>

            <h2>
              Customer feedback automation
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

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "20px",
          }}
        >
          <div>
            <strong
              style={{
                display: "block",
                fontSize: "13px",
              }}
            >
              {enabled
                ? "Automation is running"
                : "Automation is paused"}
            </strong>

            <p
              style={{
                marginTop: "6px",
                color: "#777",
                fontSize: "11px",
                lineHeight: 1.6,
                maxWidth: "600px",
              }}
            >
              {enabled
                ? "New customer feedback can be analyzed automatically and routed through the ReviewAuto workflow."
                : "New customer feedback will still be collected, but automatic processing is currently paused."}
            </p>
          </div>

          <button
            type="button"
            className={
              enabled
                ? "switch enabled"
                : "switch"
            }
            aria-label={
              enabled
                ? "Pause automation"
                : "Enable automation"
            }
            aria-pressed={enabled}
            onClick={
              onToggleAutomation
            }
          >
            <span />
          </button>
        </div>
      </section>

      <section
        className="stats-grid"
        style={{
          marginTop: "16px",
        }}
      >
        <StatCard
          label="FEEDBACK"
          value={total}
          detail="Total customer feedback"
        />

        <StatCard
          label="ANALYZED"
          value={analyzed}
          detail="Processed by AI"
        />

        <StatCard
          label="APPROVAL"
          value={
            awaitingApproval
          }
          detail="Waiting for human review"
        />

        <StatCard
          label="HIGH RISK"
          value={highRisk}
          detail="High or critical risk"
        />
      </section>

      <section
        className="stats-grid"
        style={{
          marginTop: "16px",
        }}
      >
        <StatCard
          label="OPEN ACTIONS"
          value={openActions}
          detail="Business actions requiring attention"
        />

        <StatCard
          label="COMPLETED"
          value={
            completedActions
          }
          detail="Actions completed"
        />

        <StatCard
          label="DISMISSED"
          value={
            dismissedActions
          }
          detail="Actions dismissed"
        />

        <StatCard
          label="APPROVED"
          value={approved}
          detail="Approved responses"
        />
      </section>

      <section
        className="panel"
        style={{
          marginTop: "16px",
        }}
      >
        <div className="panel-header">
          <div>
            <div className="eyebrow">
              ACTION ENGINE
            </div>

            <h2>
              What should you do next?
            </h2>
          </div>

          <span
            style={{
              color: "#aaa",
              fontSize: "8px",
            }}
          >
            {openActions > 0
              ? `${openActions} OPEN`
              : "NO OPEN ACTIONS"}
          </span>
        </div>

        <p
          style={{
            marginTop: "10px",
            color: "#777",
            fontSize: "11px",
            lineHeight: 1.6,
            maxWidth: "680px",
          }}
        >
          ReviewAuto turns customer feedback
          into a recommended business action.
          This is separate from the customer
          response workflow.
        </p>

        <div
          style={{
            marginTop: "18px",
          }}
        >
          {reviews.filter(
            (review) =>
              hasAnalyzedData(review) &&
              getActionType(review) !==
                "no_action"
          ).length === 0 ? (
            <div className="empty-state">
              <strong>
                No business actions yet
              </strong>

              <span>
                Once customer feedback is
                analyzed, ReviewAuto will
                identify issues that may
                require action.
              </span>
            </div>
          ) : (
            reviews
              .filter(
                (review) =>
                  hasAnalyzedData(
                    review
                  ) &&
                  getActionType(
                    review
                  ) !== "no_action"
              )
              .map((review) => (
                <ActionRow
                  key={review.id}
                  review={review}
                />
              ))
          )}
        </div>
      </section>

      <section
        className="content-grid"
        style={{
          marginTop: "16px",
        }}
      >
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                WORKFLOW
              </div>

              <h2>
                How ReviewAuto handles feedback
              </h2>
            </div>
          </div>

          <div className="workflow">
            <WorkflowStep
              number="01"
              title="Feedback received"
              description="Customer feedback enters ReviewAuto through your feedback link or website widget."
            />

            <WorkflowStep
              number="02"
              title="AI analysis"
              description="ReviewAuto analyzes sentiment, risk level, intent and context."
            />

            <WorkflowStep
              number="03"
              title="Action identified"
              description="The Action Engine determines what the business should do about the feedback."
            />

            <WorkflowStep
              number="04"
              title="Response prepared"
              description="A customer-facing response is generated when appropriate and saved as a draft."
            />

            <WorkflowStep
              number="05"
              title="Owner takes action"
              description="The business can complete or dismiss the recommended action."
              last
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">
                CURRENT STATE
              </div>

              <h2>
                Automation activity
              </h2>
            </div>
          </div>

          <div
            style={{
              marginTop: "18px",
            }}
          >
            <ActivityRow
              label="Analyzed"
              value={analyzed}
            />

            <ActivityRow
              label="Awaiting approval"
              value={
                awaitingApproval
              }
            />

            <ActivityRow
              label="Open actions"
              value={openActions}
            />

            <ActivityRow
              label="Completed actions"
              value={
                completedActions
              }
            />

            <ActivityRow
              label="Dismissed actions"
              value={
                dismissedActions
              }
            />

            <ActivityRow
              label="Approved"
              value={approved}
            />

            <ActivityRow
              label="Skipped"
              value={skipped}
            />

            <ActivityRow
              label="High / critical risk"
              value={highRisk}
            />
          </div>
        </section>
      </section>

      <section
        className="panel"
        style={{
          marginTop: "16px",
        }}
      >
        <div className="panel-header">
          <div>
            <div className="eyebrow">
              SAFETY
            </div>

            <h2>
              Built-in automation safeguards
            </h2>
          </div>
        </div>

        <div
          style={{
            marginTop: "18px",
            display: "grid",
            gap: "12px",
          }}
        >
          <SafetyItem text="High and critical-risk feedback requires human review." />

          <SafetyItem text="The AI must not invent facts or customer information." />

          <SafetyItem text="The AI cannot promise refunds, compensation or unsupported actions." />

          <SafetyItem text="Legal, safety, threat, discrimination and other serious issues are routed for human review." />

          <SafetyItem text="Responses are generated as drafts before they can be approved." />
        </div>
      </section>

      <div
        style={{
          marginTop: "14px",
          color: "#888",
          fontSize: "10px",
          lineHeight: 1.6,
        }}
      >
        Automation currently controls ReviewAuto
        feedback processing. External publishing
        integrations such as Google Business Profile
        will be added separately.
      </div>
    </div>
  );
}

function ActionRow({
  review,
}) {
  return (
    <ActionRowContent
      review={review}
    />
  );
}

function ActionRowContent({
  review,
}) {
  const actionType =
    getActionType(review);

  const [actionStatus, setActionStatus] =
    useState(
      review?.action_status ||
        null
    );

  const [completedAt, setCompletedAt] =
    useState(
      review?.action_completed_at ||
        null
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const status =
    actionStatus ===
      "completed" ||
    actionStatus ===
      "dismissed"
      ? actionStatus
      : actionType ===
        "no_action"
      ? "completed"
      : "open";

  async function updateAction(
    nextStatus
  ) {
    setSaving(true);
    setError("");

    try {
      const completedTimestamp =
        nextStatus ===
          "completed" ||
        nextStatus ===
          "dismissed"
          ? new Date().toISOString()
          : null;

      /*
       * IMPORTANT:
       * Only update the action fields here.
       *
       * Do NOT update ai_action_type.
       * The AI action type is already validated
       * and stored by analyze-review.
       *
       * This prevents the reviews_ai_action_type_check
       * constraint from being triggered by the
       * completion button.
       */
      const { data, error } =
        await supabase
          .from("reviews")
          .update({
            action_status:
              nextStatus,

            action_completed_at:
              completedTimestamp,

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", review.id)
          .select()
          .single();

      if (error) {
        console.error(
          "Failed to update action:",
          error
        );

        throw error;
      }

      /*
       * Update this row immediately.
       * No page reload.
       */
      setActionStatus(
        nextStatus
      );

      setCompletedAt(
        completedTimestamp
      );

      /*
       * Keep the rest of ReviewAuto informed
       * without leaving the Automation page.
       */
      window.dispatchEvent(
        new CustomEvent(
          "reviewauto:review-updated",
          {
            detail: data,
          }
        )
      );
    } catch (err) {
      console.error(
        "Action update failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to update action."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <article
      style={{
        padding: "14px 0",
        borderBottom:
          "1px solid #eeeeea",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          gap: "18px",
        }}
      >
        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "6px",
              flexWrap:
                "wrap",
            }}
          >
            <strong
              style={{
                fontSize: "12px",
              }}
            >
              {getActionLabel(
                actionType
              )}
            </strong>

            <span
              className={
                status ===
                "completed"
                  ? "status-pill active"
                  : status ===
                    "dismissed"
                  ? "status-pill"
                  : "status-pill paused"
              }
            >
              {status.toUpperCase()}
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

          <div
            style={{
              marginTop: "7px",
              fontSize: "11px",
              lineHeight: 1.6,
              color: "#444",
            }}
          >
            {getActionReason(
              review,
              actionType
            )}
          </div>

          <div
            style={{
              marginTop: "7px",
              fontSize: "10px",
              lineHeight: 1.5,
              color: "#888",
            }}
          >
            Customer:{" "}
            {review.customer_name ||
              "Anonymous customer"}
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "10px",
              lineHeight: 1.5,
              color: "#888",
            }}
          >
            {review.review_text ||
              "No review text provided."}
          </div>

          {completedAt &&
            status ===
              "completed" && (
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "9px",
                  color: "#999",
                }}
              >
                Completed
              </div>
            )}

          {error && (
            <div
              style={{
                marginTop: "8px",
                color: "#b42318",
                fontSize: "10px",
              }}
            >
              {error}
            </div>
          )}

          {status !==
            "completed" &&
            status !==
              "dismissed" && (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap:
                    "wrap",
                  marginTop:
                    "10px",
                }}
              >
                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    updateAction(
                      "completed"
                    )
                  }
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Mark complete"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    updateAction(
                      "dismissed"
                    )
                  }
                  disabled={
                    saving
                  }
                >
                  Dismiss
                </button>
              </div>
            )}
        </div>
      </div>
    </article>
  );
}

function hasAnalyzedData(
  review
) {
  return Boolean(
    review?.ai_sentiment ||
      review?.ai_risk_level ||
      review?.ai_generated_reply
  );
}

function getActionType(
  review
) {
  if (
    review?.ai_action_type &&
    [
      "reply_customer",
      "fix_issue",
      "follow_up",
      "review_internally",
      "no_action",
    ].includes(
      review.ai_action_type
    )
  ) {
    return review.ai_action_type;
  }

  const risk =
    review?.ai_risk_level;

  const intent =
    review?.ai_intent ||
    review?.intent;

  const sentiment =
    review?.ai_sentiment;

  if (
    risk === "critical" ||
    risk === "high"
  ) {
    return "review_internally";
  }

  if (
    intent === "refund_request"
  ) {
    return "review_internally";
  }

  if (
    intent === "service_issue" ||
    intent === "complaint"
  ) {
    return "fix_issue";
  }

  if (
    intent === "question"
  ) {
    return "reply_customer";
  }

  if (
    intent === "suggestion"
  ) {
    return "review_internally";
  }

  if (
    intent === "praise" &&
    sentiment === "positive"
  ) {
    return "no_action";
  }

  if (
    sentiment === "negative" ||
    sentiment === "mixed"
  ) {
    return "follow_up";
  }

  return "reply_customer";
}

function getActionLabel(
  actionType
) {
  switch (actionType) {
    case "reply_customer":
      return "Reply to customer";

    case "fix_issue":
      return "Fix service issue";

    case "follow_up":
      return "Follow up with customer";

    case "review_internally":
      return "Review internally";

    case "no_action":
      return "No action needed";

    default:
      return "Review feedback";
  }
}

function getActionReason(
  review,
  actionType
) {
  if (
    review?.ai_action_reason
  ) {
    return review.ai_action_reason;
  }

  if (
    review?.ai_reason
  ) {
    return review.ai_reason;
  }

  switch (actionType) {
    case "reply_customer":
      return "The feedback appears to need a direct customer response.";

    case "fix_issue":
      return "The feedback indicates a service or experience problem that may require a business-side fix.";

    case "follow_up":
      return "The feedback indicates an unresolved customer concern that may benefit from follow-up.";

    case "review_internally":
      return "The feedback should be reviewed by the business before deciding on the appropriate response or internal action.";

    case "no_action":
      return "No business-side action appears necessary beyond the normal customer response workflow.";

    default:
      return "Review the feedback and determine the appropriate next step.";
  }
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

function WorkflowStep({
  number,
  title,
  description,
  last = false,
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

function ActivityRow({
  label,
  value,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "space-between",
        padding: "12px 0",
        borderBottom:
          "1px solid #eeeeea",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          color: "#666",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          fontSize: "13px",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function SafetyItem({
  text,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems:
          "flex-start",
        gap: "10px",
        fontSize: "11px",
        lineHeight: 1.6,
        color: "#666",
      }}
    >
      <span
        style={{
          fontSize: "10px",
          marginTop: "2px",
        }}
      >
        ✓
      </span>

      <span>
        {text}
      </span>
    </div>
  );
}
