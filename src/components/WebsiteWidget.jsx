import { useState } from "react";

export default function WebsiteWidget({
  workspace,
}) {
  const [copied, setCopied] =
    useState(false);

  if (!workspace) {
    return null;
  }

  const feedbackEnabled =
    workspace.feedback_enabled !== false;

  const feedbackUrl =
    workspace.feedback_slug
      ? `${window.location.origin}/f/${workspace.feedback_slug}`
      : "";

  const embedCode = feedbackUrl
    ? `<iframe
  src="${feedbackUrl}"
  title="Customer feedback"
  style="width:100%;min-height:520px;border:0;"
  loading="lazy"
></iframe>`
    : "";

  async function copyEmbedCode() {
    if (!embedCode) {
      return;
    }

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          embedCode
        );
      } else {
        const textArea =
          document.createElement(
            "textarea"
          );

        textArea.value = embedCode;

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

        if (!successful) {
          throw new Error(
            "Browser blocked clipboard access."
          );
        }
      }

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error(
        "Failed to copy widget code:",
        error
      );

      window.prompt(
        "Copy your ReviewAuto widget code:",
        embedCode
      );
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">
            WEBSITE WIDGET
          </div>

          <h2>
            Add feedback to your website
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
        <p
          style={{
            color: "#777",
            fontSize: "11px",
            lineHeight: 1.6,
            maxWidth: "620px",
          }}
        >
          Add this simple ReviewAuto
          feedback widget to your website.
          Customers can submit their
          experience without leaving your
          site.
        </p>

        <div
          style={{
            marginTop: "18px",
          }}
        >
          <div className="eyebrow">
            EMBED CODE
          </div>

          <textarea
            value={
              embedCode ||
              "Widget code unavailable"
            }
            readOnly
            rows={8}
            spellCheck={false}
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginTop: "10px",
              padding: "12px",
              background: "#f5f5f2",
              border:
                "1px solid #e3e3de",
              resize: "vertical",
              fontFamily:
                "monospace",
              fontSize: "10px",
              lineHeight: 1.6,
              color: "#333",
            }}
          />

          <button
            type="button"
            className="primary-button"
            onClick={copyEmbedCode}
            disabled={!embedCode}
            style={{
              marginTop: "10px",
            }}
          >
            {copied
              ? "Copied"
              : "Copy embed code"}
          </button>
        </div>

        <div
          style={{
            marginTop: "26px",
          }}
        >
          <div className="eyebrow">
            PREVIEW
          </div>

          <div
            style={{
              marginTop: "10px",
              border:
                "1px solid #e3e3de",
              background: "#fff",
              overflow: "hidden",
            }}
          >
            {feedbackUrl ? (
              <iframe
                src={feedbackUrl}
                title="ReviewAuto customer feedback"
                style={{
                  display: "block",
                  width: "100%",
                  minHeight: "520px",
                  border: "0",
                }}
                loading="lazy"
              />
            ) : (
              <div
                className="empty-state"
                style={{
                  minHeight: "220px",
                }}
              >
                <strong>
                  Widget unavailable
                </strong>

                <span>
                  A feedback link has not
                  been configured for this
                  workspace.
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: "14px",
            fontSize: "10px",
            color: "#777",
            lineHeight: 1.6,
          }}
        >
          {feedbackEnabled
            ? "The widget uses your existing ReviewAuto feedback link and follows the same feedback collection and automation workflow."
            : "Feedback collection is currently paused. The widget will show the unavailable state until feedback collection is enabled again."}
        </div>
      </div>
    </section>
  );
}
