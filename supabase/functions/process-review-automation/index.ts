import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-automation-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase environment variables are missing.");
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

  if (req.method !== "POST") {
    return json(
      {
        error: "Only POST requests are supported.",
      },
      405
    );
  }

  try {
    /*
     * ---------------------------------------------------------
     * AUTHENTICATION
     * ---------------------------------------------------------
     *
     * Automatic requests:
     * x-automation-key = service role key
     *
     * Manual dashboard requests:
     * Authorization: Bearer <user access token>
     */

    const automationKey =
      req.headers.get("x-automation-key");

    const authHeader =
      req.headers.get("Authorization");

    const isAutomationRequest =
      !!automationKey &&
      automationKey === serviceRoleKey;

    let authenticatedUser = null;

    /*
     * ---------------------------------------------------------
     * MANUAL USER AUTHENTICATION
     * ---------------------------------------------------------
     */

    if (!isAutomationRequest) {
      if (!authHeader) {
        return json(
          {
            error: "Authentication required.",
          },
          401
        );
      }

      const token = authHeader.replace(
        /^Bearer\s+/i,
        ""
      );

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser(token);

      if (userError || !user) {
        return json(
          {
            error: "Invalid authentication.",
          },
          401
        );
      }

      authenticatedUser = user;
    }

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
        "Review lookup error:",
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
     * BUSINESS OWNERSHIP
     * ---------------------------------------------------------
     */

    const {
      data: business,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select("id, owner_id")
      .eq(
        "id",
        review.business_id
      )
      .single();

    if (
      businessError ||
      !business
    ) {
      console.error(
        "Business lookup error:",
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
     * Manual requests may only process reviews
     * belonging to the authenticated business owner.
     */

    if (
      !isAutomationRequest &&
      business.owner_id !==
        authenticatedUser?.id
    ) {
      return json(
        {
          error:
            "You do not have access to this review.",
        },
        403
      );
    }

    /*
     * ---------------------------------------------------------
     * AUTOMATION ON/OFF CHECK
     * ---------------------------------------------------------
     *
     * IMPORTANT:
     *
     * We use the existing automation_settings table.
     *
     * If automation is OFF:
     *
     *   - Do NOT call AI
     *   - Do NOT generate a reply
     *   - Keep the review pending
     *
     * Manual dashboard processing still works because
     * manual requests bypass this automatic-only check.
     */

    if (isAutomationRequest) {
      const {
        data: automationSettings,
        error: automationSettingsError,
      } = await supabase
        .from("automation_settings")
        .select("enabled")
        .eq(
          "business_id",
          review.business_id
        )
        .maybeSingle();

      if (automationSettingsError) {
        console.error(
          "Automation settings lookup failed:",
          automationSettingsError
        );

        return json(
          {
            error:
              "Unable to read automation settings.",
          },
          500
        );
      }

      /*
       * Fail closed:
       *
       * If there is no automation setting,
       * automatic processing is NOT allowed.
       */

      const automationEnabled =
        automationSettings?.enabled === true;

      if (!automationEnabled) {
        console.log(
          "Automation disabled. Leaving review pending:",
          review.id
        );

        await supabase
          .from("reviews")
          .update({
            automation_status:
              "pending",
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            review.id
          );

        return json({
          success: true,
          automated: false,
          skipped: true,
          reason:
            "Automation is disabled for this business.",
          review_id: review.id,
        });
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
     * CALL EXISTING AI ENGINE
     * ---------------------------------------------------------
     *
     * We intentionally do NOT duplicate the AI logic here.
     *
     * analyze-review remains the single AI analysis engine.
     */

    const analyzeUrl =
      `${supabaseUrl}/functions/v1/analyze-review`;

    const analyzeResponse =
      await fetch(
        analyzeUrl,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${serviceRoleKey}`,

            "Content-Type":
              "application/json",

            "x-automation-key":
              serviceRoleKey,
          },

          body: JSON.stringify({
            review_id:
              review.id,
          }),
        }
      );

    const analyzeText =
      await analyzeResponse.text();

    if (!analyzeResponse.ok) {
      console.error(
        "AI analysis failed:",
        analyzeResponse.status,
        analyzeText
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
            "AI analysis failed.",
          details:
            analyzeText,
        },
        502
      );
    }

    let analysisResult = null;

    try {
      analysisResult =
        JSON.parse(
          analyzeText
        );
    } catch {
      console.error(
        "Invalid analyze-review response:",
        analyzeText
      );
    }

    /*
     * ---------------------------------------------------------
     * GET FINAL REVIEW STATE
     * ---------------------------------------------------------
     */

    const {
      data: processedReview,
      error: processedReviewError,
    } = await supabase
      .from("reviews")
      .select(
        `
        id,
        business_id,
        customer_name,
        rating,
        review_text,
        ai_sentiment,
        ai_risk_level,
        ai_generated_reply,
        automation_status,
        reply_status
        `
      )
      .eq(
        "id",
        review.id
      )
      .single();

    if (
      processedReviewError ||
      !processedReview
    ) {
      console.error(
        "Processed review lookup failed:",
        processedReviewError
      );

      return json(
        {
          error:
            "Unable to load processed review.",
        },
        500
      );
    }

    /*
     * ---------------------------------------------------------
     * SAFETY ENFORCEMENT
     * ---------------------------------------------------------
     *
     * High/critical risk can NEVER become an automatic reply.
     */

    if (
      processedReview.ai_risk_level ===
        "high" ||
      processedReview.ai_risk_level ===
        "critical"
    ) {
      await supabase
        .from("reviews")
        .update({
          automation_status:
            "awaiting_approval",
          reply_status:
            processedReview.ai_generated_reply
              ? "draft"
              : "not_replied",
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          review.id
        );

      return json({
        success: true,
        automated: isAutomationRequest,
        review_id: review.id,
        status:
          "awaiting_approval",
        analysis:
          analysisResult,
      });
    }

    /*
     * ---------------------------------------------------------
     * AUTOMATION RESULT
     * ---------------------------------------------------------
     *
     * For now, ReviewAuto does not have an external
     * publishing destination for ReviewAuto feedback.
     *
     * Therefore an AI-generated response remains a draft.
     *
     * Google publishing will be added later through
     * the Google source adapter.
     */

    if (
      processedReview.ai_generated_reply
    ) {
      await supabase
        .from("reviews")
        .update({
          automation_status:
            "pending",
          reply_status:
            "draft",
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          review.id
        );
    } else {
      await supabase
        .from("reviews")
        .update({
          automation_status:
            "pending",
          reply_status:
            "not_replied",
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          review.id
        );
    }

    console.log(
      "Review automation completed:",
      review.id
    );

    return json({
      success: true,
      automated:
        isAutomationRequest,
      review_id:
        review.id,
      status:
        "pending",
      review:
        processedReview,
      analysis:
        analysisResult,
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
