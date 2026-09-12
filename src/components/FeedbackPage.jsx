import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function FeedbackPage({ slug }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (rating < 1) {
      setError("Please select a rating.");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please tell us about your experience.");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        "public-feedback-submit",
        {
          body: {
            slug,
            rating,
            review_text: reviewText.trim(),
            customer_name: customerName.trim(),
          },
        }
      );

      /*
       * When feedback collection is disabled,
       * the backend intentionally returns 404.
       *
       * Supabase wraps that response as a
       * FunctionsHttpError, so inspect the
       * response body instead of displaying
       * the raw error to the customer.
       */
      if (functionError) {
        let backendError = "";

        try {
          if (
            functionError.context &&
            typeof functionError.context.json === "function"
          ) {
            const errorBody = await functionError.context.json();
            backendError = errorBody?.error || "";
          }
        } catch {
          // Ignore response parsing errors.
        }

        if (
          functionError.context?.status === 404 ||
          backendError === "This feedback page is unavailable."
        ) {
          setUnavailable(true);
          return;
        }

        throw functionError;
      }

      if (!data?.success) {
        if (data?.error === "This feedback page is unavailable.") {
          setUnavailable(true);
          return;
        }

        throw new Error(data?.error || "Unable to submit feedback.");
      }

      setSubmitted(true);
    } catch (submitError) {
      console.error("Feedback submission failed:", submitError);

      /*
       * Never expose Supabase's internal
       * FunctionsHttpError message to customers.
       */
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Feedback collection is disabled or the
   * feedback link is unavailable.
   */
  if (unavailable) {
    return (
      <main className="feedback-page-wrapper">
        <FeedbackStyles />
        <div className="feedback-card">
          <div className="feedback-badge neutral">OFFLINE</div>
          <h1 className="feedback-title">Feedback Unavailable</h1>
          <p className="feedback-subtitle">
            This feedback link is currently paused or inactive. Please contact
            the business directly.
          </p>
          <div className="feedback-footer">
            <span>Powered by ReviewAuto AI</span>
          </div>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="feedback-page-wrapper">
        <FeedbackStyles />
        <div className="feedback-card">
          <div className="success-icon-badge">✓</div>
          <h1 className="feedback-title" style={{ marginTop: "16px" }}>
            Thank You!
          </h1>
          <p className="feedback-subtitle">
            Your feedback has been received and shared directly with the
            business management.
          </p>
          <div className="feedback-footer">
            <span>Powered by ReviewAuto AI</span>
          </div>
        </div>
      </main>
    );
  }

  const activeRating = hoverRating || rating;

  return (
    <main className="feedback-page-wrapper">
      <FeedbackStyles />

      <div className="feedback-card">
        <div className="feedback-header">
          <div className="feedback-brand-pill">
            <span className="brand-dot" />
            <span>CUSTOMER REVIEW</span>
          </div>
          <h1 className="feedback-title">How was your experience?</h1>
          <p className="feedback-subtitle">
            Your honest feedback helps us improve our service.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          {/* STAR SELECTOR */}
          <div className="rating-container">
            <div className="stars-row">
              {[1, 2, 3, 4, 5].map((value) => {
                const isFilled = value <= activeRating;
                return (
                  <button
                    key={value}
                    type="button"
                    className={`star-btn ${isFilled ? "filled" : ""}`}
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${value} stars`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <div className="rating-caption">
              {activeRating > 0 ? (
                <span className="rating-label-text">
                  {ratingLabels[activeRating]} ({activeRating}/5)
                </span>
              ) : (
                <span className="rating-label-hint">Tap a star to rate</span>
              )}
            </div>
          </div>

          {/* REVIEW TEXT */}
          <div className="form-group">
            <label htmlFor="reviewText" className="input-label">
              Your Review
            </label>
            <textarea
              id="reviewText"
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="Tell us about what went well or what we can improve..."
              maxLength={5000}
              rows={5}
              required
              className="feedback-textarea"
            />
          </div>

          {/* CUSTOMER NAME */}
          <div className="form-group">
            <label htmlFor="customerName" className="input-label">
              Your Name <span className="optional-tag">(Optional)</span>
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="e.g. Alex Smith"
              maxLength={120}
              className="feedback-input"
            />
          </div>

          {error && <div className="feedback-alert error">{error}</div>}

          <button
            type="submit"
            className="feedback-submit-btn"
            disabled={submitting}
          >
            {submitting ? "Submitting feedback..." : "Submit feedback"}
          </button>
        </form>

        <div className="feedback-footer">
          <span>Powered by ReviewAuto AI</span>
        </div>
      </div>
    </main>
  );
}

function FeedbackStyles() {
  return (
    <style>{`
      .feedback-page-wrapper {
        min-height: 100vh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8fafc;
        padding: 24px 16px;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #0f172a;
        -webkit-font-smoothing: antialiased;
      }

      .feedback-card {
        width: 100%;
        max-width: 440px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 32px 28px;
        box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
        box-sizing: border-box;
      }

      .feedback-header {
        margin-bottom: 24px;
        text-align: center;
      }

      .feedback-brand-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #f1f5f9;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 10px;
        font-weight: 700;
        color: #64748b;
        letter-spacing: 0.06em;
        margin-bottom: 12px;
      }

      .brand-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #2563eb;
      }

      .feedback-title {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #0f172a;
      }

      .feedback-subtitle {
        margin: 8px 0 0;
        font-size: 13px;
        color: #64748b;
        line-height: 1.5;
      }

      .feedback-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* STAR RATING */
      .rating-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        margin-bottom: 4px;
      }

      .stars-row {
        display: flex;
        gap: 8px;
      }

      .star-btn {
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 32px;
        line-height: 1;
        padding: 2px 4px;
        color: #e2e8f0;
        transition: transform 0.15s ease, color 0.15s ease;
        user-select: none;
      }

      .star-btn:hover {
        transform: scale(1.18);
      }

      .star-btn.filled {
        color: #f59e0b;
      }

      .rating-caption {
        margin-top: 8px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .rating-label-text {
        font-size: 12px;
        font-weight: 700;
        color: #b45309;
      }

      .rating-label-hint {
        font-size: 11px;
        font-weight: 500;
        color: #94a3b8;
      }

      /* FORM CONTROLS */
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .input-label {
        font-size: 12px;
        font-weight: 600;
        color: #334155;
      }

      .optional-tag {
        font-weight: 400;
        color: #94a3b8;
        font-size: 11px;
      }

      .feedback-textarea,
      .feedback-input {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 13px;
        font-family: inherit;
        color: #0f172a;
        background: #ffffff;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      .feedback-textarea:focus,
      .feedback-input:focus {
        outline: none;
        border-color: #0f172a;
        box-shadow: 0 0 0 1px #0f172a;
      }

      .feedback-textarea::placeholder,
      .feedback-input::placeholder {
        color: #94a3b8;
      }

      .feedback-textarea {
        resize: vertical;
        min-height: 110px;
        line-height: 1.5;
      }

      .feedback-alert {
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 12px;
        line-height: 1.45;
      }

      .feedback-alert.error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
      }

      .feedback-submit-btn {
        width: 100%;
        padding: 12px;
        background: #0f172a;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s ease, transform 0.05s ease;
        margin-top: 4px;
      }

      .feedback-submit-btn:hover:not(:disabled) {
        background: #1e293b;
      }

      .feedback-submit-btn:active:not(:disabled) {
        transform: scale(0.99);
      }

      .feedback-submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* SUCCESS & STATUS SCREENS */
      .success-icon-badge {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        color: #059669;
        font-size: 22px;
        font-weight: 800;
        display: grid;
        place-items: center;
        margin: 8px auto 0;
      }

      .feedback-badge {
        display: inline-block;
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 12px;
        margin-bottom: 12px;
      }

      .feedback-badge.neutral {
        background: #f1f5f9;
        color: #64748b;
      }

      .feedback-footer {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #f1f5f9;
        text-align: center;
      }

      .feedback-footer span {
        font-size: 11px;
        font-weight: 500;
        color: #94a3b8;
      }
    `}</style>
  );
}
