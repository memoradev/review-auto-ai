import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-automation-key",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

const supabaseUrl =
  Deno.env.get("SUPABASE_URL");

const serviceRoleKey =
  Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY"
  );

const groqApiKey =
  Deno.env.get("GROQ_API_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Supabase environment variables are missing."
  );
}

if (!groqApiKey) {
  throw new Error(
    "GROQ_API_KEY is not configured."
  );
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return json(
        {
          error:
            "Only POST requests are supported.",
        },
        405
      );
    }

    /*
     * ---------------------------------------------------------
     * AUTHENTICATION
     * ---------------------------------------------------------
     *
     * Automatic database-trigger requests use:
     *
     * x-automation-key:
     * <Supabase service-role key>
     *
     * Manual dashboard requests use:
     *
     * Authorization: Bearer <user access token>
     */

    const automationKey =
      req.headers.get(
        "x-automation-key"
      );

    const authHeader =
      req.headers.get("Authorization");

    const isAutomationRequest =
      !!automationKey &&
      automationKey ===
        serviceRoleKey;

    let authenticatedUser = null;

    /*
     * ---------------------------------------------------------
     * AUTOMATIC REQUEST
     * ---------------------------------------------------------
     */

    if (!isAutomationRequest) {
      /*
       * -------------------------------------------------------
       * MANUAL USER REQUEST
       * -------------------------------------------------------
       */

      if (!authHeader) {
        return json(
          {
            error:
              "Authentication required.",
          },
          401
        );
      }

      /*
       * Keep the existing authentication
       * contract intact.
       *
       * The current deployed function already
       * relies on the authenticated request path.
       */
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

    const body =
      await req.json();

    const reviewId =
      body?.review_id ||
      body?.record?.id;

    if (!reviewId) {
      return json(
        {
          error:
            "review_id is required.",
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
     * GET REVIEW
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
      .eq(
        "id",
        reviewId
      )
      .single();

    if (
      reviewError ||
      !review
    ) {
      console.error(
        "Review lookup error:",
        reviewError
      );

      return json(
        {
          error:
            "Review not found.",
        },
        404
      );
    }

    /*
     * ---------------------------------------------------------
     * BUSINESS OWNERSHIP
     * ---------------------------------------------------------
     *
     * Automatic requests are trusted only after
     * the automation key has been verified.
     *
     * Manual requests use the existing authorization
     * contract.
     */

    if (!isAutomationRequest) {
      console.log(
        "AUTH DEBUG",
        {
          hasAutomationKey:
            !!automationKey,

          hasAuthHeader:
            !!authHeader,

          automationKeyLength:
            automationKey?.length ??
            0,

          serviceRoleKeyLength:
            serviceRoleKey?.length ??
            0,

          automationMatchesServiceRole:
            !!automationKey &&
            automationKey ===
              serviceRoleKey,
        }
      );

      /*
       * Keep the existing ownership check.
       *
       * authenticatedUser is expected to be populated
       * by the current authentication flow when this
       * manual path is used.
       */

      if (!authenticatedUser) {
        return json(
          {
            error:
              "Unable to verify authenticated user.",
          },
          401
        );
      }

      const {
        data: business,
        error: businessError,
      } = await supabase
        .from("businesses")
        .select("id")
        .eq(
          "id",
          review.business_id
        )
        .eq(
          "owner_id",
          authenticatedUser.id
        )
        .single();

      if (
        businessError ||
        !business
      ) {
        console.error(
          "Business ownership error:",
          businessError
        );

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
     * MARK AS ANALYZING
     * ---------------------------------------------------------
     */

    const {
      error: analyzingError,
    } = await supabase
      .from("reviews")
      .update({
        automation_status:
          "analyzing",

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        review.id
      );

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
  "action_type": "reply_customer | fix_issue | follow_up | review_internally | no_action",
  "action_reason": "short explanation of why this business action is recommended",
  "reason": "short explanation of the review analysis",
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

13. A one-star review must always use
    "human_review". It may receive an
    AI-generated draft, but it must never
    be eligible for automatic approval or
    automatic publishing.

13. Also determine the single most useful
    business-side action.

14. "action_type" means what the business
    should do internally. It does NOT mean
    whether the customer reply should be
    automated.

15. Use "reply_customer" when the primary
    need is to respond to the customer's
    question or feedback.

16. Use "fix_issue" when the feedback
    identifies a service, product, process,
    staff, or experience problem that the
    business should investigate or fix.

17. Use "follow_up" when the customer appears
    to need additional contact or when the
    issue cannot reasonably be resolved by
    a normal public response alone.

18. Use "review_internally" for serious,
    sensitive, legal, safety, refund,
    discrimination, threat, or high-risk
    issues that require a business decision.

19. Use "no_action" when there is no
    meaningful business-side action required
    beyond the normal response workflow.

20. "action_reason" must be concise and based
    only on information present in the
    customer feedback.

21. Never invent an internal problem that
    the customer did not describe or imply.

22. If the risk is "high" or "critical",
    "action_type" MUST be
    "review_internally".

23. If the intent is "refund_request",
    "action_type" MUST be
    "review_internally".

24. If the review describes a concrete
    service or experience problem,
    prefer "fix_issue" unless a higher-risk
    condition requires "review_internally".

25. If the customer explicitly asks for
    contact or indicates an unresolved issue,
    prefer "follow_up".

26. Positive praise without a meaningful
    problem should normally use "no_action".

Customer:
${review.customer_name || "Anonymous"}

Rating:
${review.rating}/5

Review:
${review.review_text || "(No written review.)"}
`;

    /*
     * ---------------------------------------------------------
     * GROQ
     * ---------------------------------------------------------
     */

    console.log(
      "Sending review to Groq:",
      review.id
    );

    const groqResponse =
      await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
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

                content:
                  prompt,
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
        "Groq API error:",
        errorText
      );

      await supabase
        .from("reviews")
        .update({
          automation_status:
            "failed",

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          review.id
        );

      return json(
        {
          error:
            "Groq API request failed.",

          details:
            errorText,
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
      groqData
        ?.choices?.[0]
        ?.message?.content;

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
      console.error(
        "Invalid Groq JSON:",
        rawText
      );

      throw new Error(
        "Groq returned invalid JSON."
      );
    }

    /*
     * ---------------------------------------------------------
     * VALIDATE AI OUTPUT
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

    /*
     * Existing automation routing.
     *
     * IMPORTANT:
     * Do not confuse this with Action Engine.
     */

    const allowedActions = [
      "auto_reply",
      "human_review",
      "skip",
    ];

    /*
     * Action Engine routing.
     */

    const allowedActionTypes = [
      "reply_customer",
      "fix_issue",
      "follow_up",
      "review_internally",
      "no_action",
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
     * Existing safety rule:
     *
     * High / critical risk must always
     * require human review.
     */

    const isOneStarReview =
      Number(review.rating || 0) === 1;

    if (
      riskLevel === "high" ||
      riskLevel === "critical" ||
      isOneStarReview
    ) {
      recommendedAction =
        "human_review";
    }

    /*
     * ---------------------------------------------------------
     * ACTION ENGINE VALIDATION
     * ---------------------------------------------------------
     */

    let actionType =
      allowedActionTypes.includes(
        analysis?.action_type
      )
        ? analysis.action_type
        : "review_internally";

    const actionReason =
      typeof analysis?.action_reason ===
      "string"
        ? analysis.action_reason.trim()
        : "";

    /*
     * ---------------------------------------------------------
     * ACTION ENGINE SAFETY OVERRIDES
     * ---------------------------------------------------------
     *
     * The AI recommendation is not trusted blindly.
     * Certain conditions always override the model.
     */

    if (
      riskLevel === "high" ||
      riskLevel === "critical" ||
      isOneStarReview
    ) {
      actionType =
        "review_internally";
    }

    if (
      analysis?.intent ===
      "refund_request"
    ) {
      actionType =
        "review_internally";
    }

    /*
     * Serious categories should never become
     * a simple customer-reply action.
     */

    if (
      analysis?.intent ===
        "other" &&
      (riskLevel ===
        "high" ||
        riskLevel ===
          "critical")
    ) {
      actionType =
        "review_internally";
    }

    /*
     * ---------------------------------------------------------
     * GENERATED REPLY
     * ---------------------------------------------------------
     */

    const generatedReply =
      typeof analysis?.reply ===
      "string"
        ? analysis.reply.trim()
        : "";

    /*
     * ---------------------------------------------------------
     * AUTOMATION STATUS
     * ---------------------------------------------------------
     *
     * Existing ReviewAuto workflow remains unchanged.
     */

    const automationStatus =
      recommendedAction ===
      "human_review"
        ? "awaiting_approval"
        : "pending";

    /*
     * ---------------------------------------------------------
     * ACTION STATUS
     * ---------------------------------------------------------
     *
     * no_action is immediately complete.
     *
     * Every other action requires business
     * attention and starts as open.
     */

    const actionStatus =
      actionType ===
      "no_action"
        ? "completed"
        : "open";

    const actionCompletedAt =
      actionType ===
      "no_action"
        ? new Date().toISOString()
        : null;

    /*
     * ---------------------------------------------------------
     * SAVE AI RESULT
     * ---------------------------------------------------------
     */

    const {
      data: updatedReview,
      error: updateError,
    } =
      await supabase
        .from("reviews")
        .update({
          /*
           * Existing AI fields
           */

          ai_sentiment:
            sentiment,

          ai_risk_level:
            riskLevel,

          ai_generated_reply:
            generatedReply,

          /*
           * ---------------------------------------------------
           * ACTION ENGINE
           * ---------------------------------------------------
           */

          ai_action_type:
            actionType,

          ai_action_reason:
            actionReason,

          action_status:
            actionStatus,

          action_completed_at:
            actionCompletedAt,

          /*
           * Existing workflow fields
           */

          automation_status:
            automationStatus,

          reply_status:
            generatedReply
              ? "draft"
              : "not_replied",

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          review.id
        )
        .select()
        .single();

    if (updateError) {
      console.error(
        "Review update error:",
        updateError
      );

      throw updateError;
    }

    /*
     * ---------------------------------------------------------
     * LOG RESULT
     * ---------------------------------------------------------
     */

    console.log(
      "Review automation completed:",
      {
        reviewId:
          review.id,

        sentiment,

        riskLevel,

        recommendedAction,

        actionType,

        actionReason,

        actionStatus,

        automationStatus,
      }
    );

    /*
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

    return json({
      success: true,

      review:
        updatedReview,

      analysis: {
        sentiment,

        risk_level:
          riskLevel,

        recommended_action:
          recommendedAction,

        action_type:
          actionType,

        action_reason:
          actionReason,

        reason:
          typeof analysis?.reason ===
          "string"
            ? analysis.reason
            : "",
      },
    });
  } catch (error) {
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
