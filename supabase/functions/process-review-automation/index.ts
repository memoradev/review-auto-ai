import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-automation-key",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const groqApiKey = Deno.env.get("GROQ_API_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Supabase environment variables are missing."
  );
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey
);

Deno.serve(async (req) => {
  /*
   * ---------------------------------------------------------
   * CORS
   * ---------------------------------------------------------
   */

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    /*
     * ---------------------------------------------------------
     * METHOD
     * ---------------------------------------------------------
     */

    if (req.method !== "POST") {
      return json(
        {
          error: "Only POST requests are supported.",
        },
        405
      );
    }

    /*
     * ---------------------------------------------------------
     * AUTHENTICATION
     * ---------------------------------------------------------
     *
     * Automatic request:
     *
     * x-automation-key:
     * <SUPABASE_SERVICE_ROLE_KEY>
     *
     * Manual request:
     *
     * Authorization:
     * Bearer <USER_ACCESS_TOKEN>
     */

    const automationKey =
      req.headers.get("x-automation-key");

    const authHeader =
      req.headers.get("Authorization");

    const isAutomationRequest =
      !!automationKey &&
      automationKey === serviceRoleKey;

    let authenticatedUser = null;

    if (!isAutomationRequest) {
      if (!authHeader) {
        return json(
          {
            error: "Authentication required.",
          },
          401
        );
      }

      const token = authHeader
        .replace(/^Bearer\s+/i, "")
        .trim();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);

      if (userError || !user) {
        console.error(
          "User authentication failed:",
          userError
        );

        return json(
          {
            error: "Invalid authentication.",
          },
          401
        );
      }

      authenticatedUser = user;
    }

    console.log(
      isAutomationRequest
        ? "Authenticated automatic request."
        : "Authenticated user request."
    );

    /*
     * ---------------------------------------------------------
     * REQUEST BODY
     * ---------------------------------------------------------
     */

    const body = await req.json();

    const reviewId =
      body?.review_id ||
      body?.record?.id;

    if (!reviewId) {
      return json(
        {
          error: "review_id is required.",
        },
        400
      );
    }

    console.log(
      "Processing review:",
      reviewId
    );

    /*
     * ---------------------------------------------------------
     * LOAD REVIEW
     * ---------------------------------------------------------
     */

    const {
      data: review,
      error: reviewError,
    } = await supabase
      .from("reviews")
      .select(
        `
        id,
        business_id,
        customer_name,
        rating,
        review_text,
        automation_status,
        reply_status
        `
      )
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      console.error(
        "Review lookup failed:",
        reviewError
      );

      return json(
        {
          error: "Review not found.",
        },
        404
      );
    }

    /*
     * ---------------------------------------------------------
     * LOAD BUSINESS
     * ---------------------------------------------------------
     */

    const {
      data: business,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select(
        `
        id,
        name,
        owner_id
        `
      )
      .eq("id", review.business_id)
      .single();

    if (businessError || !business) {
      console.error(
        "Business lookup failed:",
        businessError
      );

      return json(
        {
          error: "Business not found.",
        },
        404
      );
    }

    /*
     * ---------------------------------------------------------
     * MANUAL REQUEST OWNERSHIP CHECK
     * ---------------------------------------------------------
     */

    if (!isAutomationRequest) {
      if (
        !authenticatedUser ||
        business.owner_id !== authenticatedUser.id
      ) {
        return json(
          {
            error:
              "You do not have access to this review.",
          },
          403
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * LOAD AUTOMATION SETTINGS
     * ---------------------------------------------------------
     *
     * The actual frontend uses:
     *
     * automation_settings
     * business_id
     * enabled
     *
     * We use the exact same structure here.
     */

    const {
      data: automationSettings,
      error: automationError,
    } = await supabase
      .from("automation_settings")
      .select(
        `
        business_id,
        enabled
        `
      )
      .eq("business_id", business.id)
      .maybeSingle();

    if (automationError) {
      console.error(
        "Automation settings lookup failed:",
        automationError
      );

      /*
       * IMPORTANT:
       *
       * We do NOT fail the customer's feedback submission
       * just because automation settings could not be read.
       *
       * Leave the review pending.
       */

      await supabase
        .from("reviews")
        .update({
          automation_status: "pending",
          reply_status: "not_replied",
          updated_at: new Date().toISOString(),
        })
        .eq("id", review.id);

      return json({
        success: true,
        automation_enabled: false,
        processed: false,
        reason:
          "Automation settings could not be read. Review left pending.",
        review_id: review.id,
      });
    }

    /*
     * ---------------------------------------------------------
     * AUTOMATION OFF
     * ---------------------------------------------------------
     *
     * THIS IS THE IMPORTANT FIX.
     *
     * Disabled automation is a valid state.
     * It must return HTTP 200.
     *
     * The review stays in the database.
     * No Groq request is made.
     * Manual "Analyze with AI" remains available.
     */

    const automationEnabled =
      automationSettings?.enabled === true;

    if (!automationEnabled) {
      console.log(
        "Automation is disabled. Leaving review pending:",
        review.id
      );

      const {
        data: pendingReview,
        error: pendingError,
      } = await supabase
        .from("reviews")
        .update({
          automation_status: "pending",
          reply_status: "not_replied",
          updated_at: new Date().toISOString(),
        })
        .eq("id", review.id)
        .select()
        .single();

      if (pendingError) {
        console.error(
          "Failed to preserve pending review:",
          pendingError
        );

        /*
         * This is a real server error because the review
         * could not be updated.
         */
        return json(
          {
            error:
              "Unable to update review status.",
          },
          500
        );
      }

      /*
       * HTTP 200.
       *
       * This prevents:
       *
       * "Edge Function returned a non-2xx status code"
       *
       * when automation is simply OFF.
       */

      return json({
        success: true,
        automation_enabled: false,
        processed: false,
        reason:
          "Automation is disabled. Review saved and left pending.",
        review: pendingReview,
      });
    }

    /*
     * ---------------------------------------------------------
     * GROQ CONFIGURATION
     * ---------------------------------------------------------
     */

    if (!groqApiKey) {
      console.error(
        "GROQ_API_KEY is not configured."
      );

      /*
       * Do not delete or lose the review.
       */

      await supabase
        .from("reviews")
        .update({
          automation_status: "failed",
          reply_status: "not_replied",
          updated_at: new Date().toISOString(),
        })
        .eq("id", review.id);

      return json(
        {
          error:
            "GROQ_API_KEY is not configured.",
        },
        500
      );
    }

    /*
     * ---------------------------------------------------------
     * MARK AS ANALYZING
     * ---------------------------------------------------------
     */

    const {
      error: analyzingError,
    } = await supabase
      .from("reviews")
      .update({
        automation_status: "analyzing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", review.id);

    if (analyzingError) {
      console.error(
        "Failed to mark review as analyzing:",
        analyzingError
      );

      return json(
        {
          error:
            "Failed to update review status.",
        },
        500
      );
    }

    /*
     * ---------------------------------------------------------
     * AI PROMPT
     * ---------------------------------------------------------
     */

    const prompt = `
You are the AI review-analysis engine
for a business reputation management
SaaS called ReviewAuto.

Analyze this customer review and
return ONLY valid JSON.

Required structure:

{
  "sentiment": "positive | neutral | negative | mixed",
  "risk_level": "low | medium | high | critical",
  "intent": "praise | complaint | question | suggestion | service_issue | refund_request | other",
  "recommended_action": "auto_reply | human_review | skip",
  "reason": "short explanation",
  "reply": "professional customer-facing reply"
}

Rules:

1. Never invent facts.

2. Never promise refunds, compensation,
   discounts, or specific actions unless
   supported by the review.

3. Never admit legal liability.

4. Never reveal private information.

5. Never attack or insult the customer.

6. Serious allegations, legal claims,
   safety issues, threats, discrimination
   claims, or highly sensitive issues must
   use "human_review".

7. Normal positive reviews can use
   "auto_reply".

8. Minor ordinary complaints may use
   "auto_reply" when safe.

9. Keep replies concise and natural.

10. Never mention AI.

11. Do not fabricate names or details.

12. Match the customer's general tone
    while remaining professional.

Customer:
${review.customer_name || "Anonymous"}

Rating:
${review.rating}/5

Review:
${review.review_text || "(No written review.)"}
`;

    /*
     * ---------------------------------------------------------
     * GROQ REQUEST
     * ---------------------------------------------------------
     */

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${groqApiKey}`,
        },

        body: JSON.stringify({
          model:
            "openai/gpt-oss-120b",

          messages: [
            {
              role: "system",
              content:
                "You are a professional review analysis engine. Always return valid JSON only.",
            },

            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.2,

          response_format: {
            type: "json_object",
          },
        }),
      }
    );

    /*
     * ---------------------------------------------------------
     * GROQ ERROR
     * ---------------------------------------------------------
     */

    if (!groqResponse.ok) {
      const errorText =
        await groqResponse.text();

      console.error(
        "Groq API request failed:",
        groqResponse.status,
        errorText
      );

      await supabase
        .from("reviews")
        .update({
          automation_status: "failed",
          reply_status: "not_replied",
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", review.id);

      return json(
        {
          error:
            "Groq API request failed.",
          details: errorText,
        },
        502
      );
    }

    /*
     * ---------------------------------------------------------
     * PARSE GROQ RESPONSE
     * ---------------------------------------------------------
     */

    const groqData =
      await groqResponse.json();

    const rawText =
      groqData?.choices?.[0]?.message?.content;

    if (!rawText) {
      throw new Error(
        "Groq returned no response content."
      );
    }

    let analysis;

    try {
      analysis =
        JSON.parse(rawText);
    } catch {
      throw new Error(
        "Groq returned invalid JSON."
      );
    }

    /*
     * ---------------------------------------------------------
     * VALIDATION
     * ---------------------------------------------------------
     */

    const allowedSentiments = [
      "positive",
      "neutral",
      "negative",
      "mixed",
    ];

    const allowedRisks = [
      "low",
      "medium",
      "high",
      "critical",
    ];

    const allowedActions = [
      "auto_reply",
      "human_review",
      "skip",
    ];

    const sentiment =
      allowedSentiments.includes(
        analysis?.sentiment
      )
        ? analysis.sentiment
        : "neutral";

    const riskLevel =
      allowedRisks.includes(
        analysis?.risk_level
      )
        ? analysis.risk_level
        : "medium";

    let recommendedAction =
      allowedActions.includes(
        analysis?.recommended_action
      )
        ? analysis.recommended_action
        : "human_review";

    /*
     * ---------------------------------------------------------
     * SAFETY OVERRIDE
     * ---------------------------------------------------------
     *
     * High and critical risk can NEVER
     * become automatic replies.
     */

    if (
      riskLevel === "high" ||
      riskLevel === "critical"
    ) {
      recommendedAction =
        "human_review";
    }

    /*
     * ---------------------------------------------------------
     * GENERATED REPLY
     * ---------------------------------------------------------
     */

    const generatedReply =
      typeof analysis?.reply === "string"
        ? analysis.reply.trim()
        : "";

    /*
     * ---------------------------------------------------------
     * FINAL AUTOMATION STATUS
     * ---------------------------------------------------------
     */

    let automationStatus =
      "pending";

    let replyStatus =
      generatedReply
        ? "draft"
        : "not_replied";

    if (
      recommendedAction ===
      "human_review"
    ) {
      automationStatus =
        "awaiting_approval";
    }

    if (
      recommendedAction === "skip"
    ) {
      automationStatus =
        "skipped";

      replyStatus =
        "not_replied";
    }

    /*
     * ---------------------------------------------------------
     * SAVE RESULT
     * ---------------------------------------------------------
     */

    const {
      data: updatedReview,
      error: updateError,
    } = await supabase
      .from("reviews")
      .update({
        ai_sentiment:
          sentiment,

        ai_risk_level:
          riskLevel,

        ai_generated_reply:
          generatedReply,

        automation_status:
          automationStatus,

        reply_status:
          replyStatus,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", review.id)
      .select()
      .single();

    if (updateError) {
      console.error(
        "Failed to save AI analysis:",
        updateError
      );

      throw updateError;
    }

    /*
     * ---------------------------------------------------------
     * SUCCESS
     * ---------------------------------------------------------
     */

    console.log(
      "Review automation completed:",
      {
        reviewId: review.id,
        sentiment,
        riskLevel,
        recommendedAction,
        automationStatus,
      }
    );

    return json({
      success: true,

      automation_enabled:
        true,

      processed:
        true,

      review:
        updatedReview,

      analysis: {
        sentiment,
        risk_level:
          riskLevel,
        recommended_action:
          recommendedAction,
        reason:
          typeof analysis?.reason ===
          "string"
            ? analysis.reason
            : "",
      },
    });
  } catch (error) {
    /*
     * ---------------------------------------------------------
     * UNEXPECTED ERROR
     * ---------------------------------------------------------
     */

    console.error(
      "process-review-automation error:",
      error
    );

    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      500
    );
  }
});

/*
 * ---------------------------------------------------------
 * JSON RESPONSE HELPER
 * ---------------------------------------------------------
 */

function json(
  body: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    }
  );
}
