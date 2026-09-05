export default function Analytics({
  reviews = [],
}) {
  const total = reviews.length;

  const averageRating =
    total > 0
      ? (
          reviews.reduce(
            (sum, review) =>
              sum + Number(review.rating || 0),
            0
          ) / total
        ).toFixed(1)
      : "—";

  const positive = reviews.filter(
    (review) =>
      review.ai_sentiment === "positive"
  ).length;

  const neutral = reviews.filter(
    (review) =>
      review.ai_sentiment === "neutral"
  ).length;

  const negative = reviews.filter(
    (review) =>
      review.ai_sentiment === "negative"
  ).length;

  const mixed = reviews.filter(
    (review) =>
      review.ai_sentiment === "mixed"
  ).length;

  const needsAttention = reviews.filter(
    (review) =>
      review.automation_status ===
        "awaiting_approval" ||
      review.ai_risk_level === "high" ||
      review.ai_risk_level === "critical"
  ).length;

  const approved = reviews.filter(
    (review) =>
      review.automation_status ===
      "approved"
  ).length;

  const rejected = reviews.filter(
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
    reviewauto: reviews.filter(
      (review) =>
        review.source === "reviewauto"
    ).length,

    google: reviews.filter(
      (review) =>
        review.source === "google"
    ).length,

    manual: reviews.filter(
      (review) =>
        review.source === "manual"
    ).length,
  };

  const ratingCounts = {
    5: reviews.filter(
      (review) =>
        Number(review.rating) === 5
    ).length,

    4: reviews.filter(
      (review) =>
        Number(review.rating) === 4
    ).length,

    3: reviews.filter(
      (review) =>
        Number(review.rating) === 3
    ).length,

    2: reviews.filter(
      (review) =>
        Number(review.rating) === 2
    ).length,

    1: reviews.filter(
      (review) =>
        Number(review.rating) === 1
    ).length,
  };

  const lastSevenDays =
    getLastSevenDays(reviews);

  return (
    <div>
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
          value={averageRating}
          detail={
            total > 0
              ? "Across all feedback"
              : "Waiting for feedback"
          }
        />

        <StatCard
          label="Needs attention"
          value={needsAttention}
          detail={
            needsAttention > 0
              ? "Requires human review"
              : "Nothing requiring attention"
          }
        />

        <StatCard
          label="Replies published"
          value={repliesPublished}
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
          <SentimentPanel
            positive={positive}
            neutral={neutral}
            negative={negative}
            mixed={mixed}
            total={total}
          />

          <TrendPanel
            days={lastSevenDays}
          />
        </div>

        <div className="right-column">
          <StatusPanel
            approved={approved}
            rejected={rejected}
            needsAttention={needsAttention}
          />

          <SourcePanel
            counts={sourceCounts}
            total={total}
          />

          <RatingPanel
            counts={ratingCounts}
            total={total}
          />
        </div>
      </section>
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

function SentimentPanel({
  positive,
  neutral,
  negative,
  mixed,
  total,
}) {
  return (
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
          marginTop: "20px",
        }}
      >
        <MetricRow
          label="Positive"
          value={positive}
          total={total}
        />

        <MetricRow
          label="Neutral"
          value={neutral}
          total={total}
        />

        <MetricRow
          label="Negative"
          value={negative}
          total={total}
        />

        <MetricRow
          label="Mixed"
          value={mixed}
          total={total}
        />
      </div>
    </section>
  );
}

function MetricRow({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (
    <div
      style={{
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          fontSize: "10px",
          marginBottom: "6px",
        }}
      >
        <span>{label}</span>

        <span
          style={{
            color: "#777",
          }}
        >
          {value} · {percentage}%
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: "5px",
          background: "#eeeeeb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "#222",
          }}
        />
      </div>
    </div>
  );
}

function TrendPanel({
  days,
}) {
  const maximum = Math.max(
    ...days.map((day) => day.count),
    1
  );

  return (
    <section
      className="panel"
      style={{
        marginTop: "18px",
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
          display: "flex",
          alignItems: "flex-end",
          gap: "10px",
          height: "150px",
          marginTop: "24px",
        }}
      >
        {days.map((day) => {
          const height =
            day.count === 0
              ? 3
              : Math.max(
                  8,
                  (day.count / maximum) *
                    110
                );

          return (
            <div
              key={day.key}
              style={{
                flex: 1,
                height: "100%",
                display: "flex",
                flexDirection:
                  "column",
                justifyContent:
                  "flex-end",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  color: "#777",
                  marginBottom: "6px",
                }}
              >
                {day.count}
              </span>

              <div
                style={{
                  width: "100%",
                  maxWidth: "34px",
                  height: `${height}px`,
                  background: "#222",
                }}
              />

              <span
                style={{
                  marginTop: "7px",
                  fontSize: "8px",
                  color: "#999",
                }}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatusPanel({
  approved,
  rejected,
  needsAttention,
}) {
  return (
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
          marginTop: "18px",
        }}
      >
        <SimpleCount
          label="Approved"
          value={approved}
        />

        <SimpleCount
          label="Needs attention"
          value={needsAttention}
        />

        <SimpleCount
          label="Rejected"
          value={rejected}
        />
      </div>
    </section>
  );
}

function SourcePanel({
  counts,
  total,
}) {
  return (
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
          marginTop: "18px",
        }}
      >
        <SimpleCount
          label="ReviewAuto"
          value={counts.reviewauto}
          detail={getPercentage(
            counts.reviewauto,
            total
          )}
        />

        <SimpleCount
          label="Google"
          value={counts.google}
          detail={getPercentage(
            counts.google,
            total
          )}
        />

        <SimpleCount
          label="Manual"
          value={counts.manual}
          detail={getPercentage(
            counts.manual,
            total
          )}
        />
      </div>
    </section>
  );
}

function RatingPanel({
  counts,
  total,
}) {
  return (
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
          marginTop: "18px",
        }}
      >
        {[5, 4, 3, 2, 1].map(
          (rating) => (
            <SimpleCount
              key={rating}
              label={`${rating} stars`}
              value={counts[rating]}
              detail={getPercentage(
                counts[rating],
                total
              )}
            />
          )
        )}
      </div>
    </section>
  );
}

function SimpleCount({
  label,
  value,
  detail,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        padding:
          "9px 0",
        borderBottom:
          "1px solid #eeeeeb",
        fontSize: "10px",
      }}
    >
      <span>{label}</span>

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

function getPercentage(
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

  for (let i = 6; i >= 0; i--) {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(
      date.getDate() - i
    );

    const key =
      date.toISOString().slice(0, 10);

    const count = reviews.filter(
      (review) => {
        const value =
          review.review_created_at ||
          review.created_at;

        if (!value) {
          return false;
        }

        const reviewDate =
          new Date(value);

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
            .slice(0, 10) === key
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
            weekday: "short",
          }
        ),
    });
  }

  return result;
}
