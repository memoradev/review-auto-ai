import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function FeedbackPage({
  slug,
}) {
  const [rating, setRating] =
    useState(0);

  const [reviewText, setReviewText] =
    useState("");

  const [customerName, setCustomerName] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleSubmit(event) {

    event.preventDefault();

    setError("");


    if (rating < 1) {
      setError(
        "Please select a rating."
      );

      return;
    }


    if (!reviewText.trim()) {
      setError(
        "Please tell us about your experience."
      );

      return;
    }


    setSubmitting(true);


    try {

      const {
        data,
        error: functionError,
      } =
        await supabase.functions.invoke(
          "public-feedback-submit",
          {
            body: {
              slug,

              rating,

              review_text:
                reviewText.trim(),

              customer_name:
                customerName.trim(),
            },
          }
        );


      if (functionError) {
        throw functionError;
      }


      if (!data?.success) {
        throw new Error(
          data?.error ||
            "Unable to submit feedback."
        );
      }


      setSubmitted(true);

    } catch (submitError) {

      console.error(
        "Feedback submission failed:",
        submitError
      );

      setError(
        submitError?.message ||
          "Something went wrong. Please try again."
      );

    } finally {

      setSubmitting(false);
    }
  }


  if (submitted) {

    return (
      <main className="loading-page">

        <div className="auth-card">

          <div className="eyebrow">
            FEEDBACK RECEIVED
          </div>

          <h1>
            Thank you.
          </h1>

          <p
            style={{
              color: "#777",
              fontSize: "11px",
              lineHeight: 1.6,
            }}
          >
            Your experience has been
            shared with the business.
          </p>

        </div>

      </main>
    );
  }


  return (
    <main className="loading-page">

      <div
        className="auth-card"
        style={{
          width: "min(420px, 92vw)",
        }}
      >

        <div className="eyebrow">
          REVIEWAUTO AI
        </div>

        <h1>
          Customer feedback
        </h1>

        <p
          style={{
            color: "#777",
            fontSize: "11px",
            lineHeight: 1.6,
            marginBottom: "22px",
          }}
        >
          How was your experience?
        </p>


        <form
          onSubmit={handleSubmit}
        >

          <div
            style={{
              display: "flex",
              gap: "5px",
              marginBottom: "18px",
            }}
          >

            {[1, 2, 3, 4, 5].map(
              (value) => (

                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setRating(value)
                  }
                  aria-label={`${value} stars`}
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    cursor: "pointer",
                    fontSize: "24px",
                    padding: "0",
                    color:
                      value <= rating
                        ? "#111"
                        : "#ccc",
                  }}
                >
                  ★
                </button>

              )
            )}

          </div>


          <textarea
            value={reviewText}
            onChange={(event) =>
              setReviewText(
                event.target.value
              )
            }
            placeholder="Tell us about your experience..."
            maxLength={5000}
            rows={6}
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              resize: "vertical",
              marginBottom: "12px",
            }}
          />


          <input
            value={customerName}
            onChange={(event) =>
              setCustomerName(
                event.target.value
              )
            }
            placeholder="Your name (optional)"
            maxLength={200}
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "14px",
            }}
          />


          {error && (
            <p
              style={{
                color: "#b00020",
                fontSize: "11px",
                lineHeight: 1.5,
                marginBottom: "12px",
              }}
            >
              {error}
            </p>
          )}


          <button
            type="submit"
            className="auth-submit"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit feedback"}
          </button>

        </form>

      </div>

    </main>
  );
}
