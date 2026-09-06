export default function AutomationPage({
  automation,
  reviews,
  onToggleAutomation,
}) {
  const enabled = automation?.enabled === true;

  const total = reviews.length;

  const awaitingApproval = reviews.filter(
    (review) =>
      review.automation_status === "awaiting_approval"
  ).length;

  const analyzed = reviews.filter(
    (review) =>
      review.ai_sentiment ||
      review.ai_risk_level ||
      review.ai_generated_reply
  ).length;

  const highRisk = reviews.filter(
    (review) =>
      review.ai_risk_level === "high" ||
      review.ai_risk_level === "critical"
  ).length;

  const approved = reviews.filter(
    (review) =>
      review.automation_status === "approved"
  ).length;

  const skipped = reviews.filter(
    (review) =>
      review.automation_status === "skipped"
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
            {enabled ? "ACTIVE" : "PAUSED"}
          </span>
        </div>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
            onClick={onToggleAutomation}
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
          value={awaitingApproval}
          detail="Waiting for human review"
        />

        <StatCard
          label="HIGH RISK"
          value={highRisk}
          detail="High or critical risk"
        />
      </section>

      <section className="content-grid">
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
              title="Safety decision"
              description="The automation engine decides whether the feedback can continue automatically or requires human attention."
            />

            <WorkflowStep
              number="04"
              title="Response prepared"
              description="A customer-facing response is generated when appropriate and saved as a draft."
            />

            <WorkflowStep
              number="05"
              title="Human approval"
              description="Higher-risk feedback is held for review before any response can move forward."
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
              value={awaitingApproval}
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
        Automation currently controls ReviewAuto feedback
        processing. External publishing integrations such as
        Google Business Profile will be added separately.
      </div>
    </div>
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
        <strong>{title}</strong>

        <p>{description}</p>
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
        alignItems: "center",
        justifyContent: "space-between",
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
        alignItems: "flex-start",
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

      <span>{text}</span>
    </div>
  );
}
