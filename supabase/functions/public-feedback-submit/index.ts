import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables.");
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
      { error: "Only POST requests are supported." },
      405
    );
  }

  try {
    const body = await req.json();

    const slug =
      typeof body?.slug === "string"
        ? body.slug.trim().toLowerCase()
        : "";

    const customerName =
      typeof body?.customer_name === "string"
        ? body.customer_name.trim()
        : "";

    const reviewText =
      typeof body?.review_text === "string"
        ? body.review_text.trim()
        : "";

    const rating = Number(body?.rating);

    // -----------------------------
    // Validate input
    // -----------------------------

    if (!slug) {
      return json(
        { error: "Feedback link is invalid." },
        400
      );
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return json(
        { error: "Rating must be between 1 and 5." },
        400
      );
    }

    if (!reviewText) {
      return json(
        {
          error:
            "Please tell us about your experience.",
        },
        400
      );
    }

    if (reviewText.length > 5000) {
      return json(
        { error: "Your feedback is too long." },
        400
      );
    }

    if (customerName.length > 200) {
      return json(
        { error: "Name is too long." },
        400
      );
    }

    // -----------------------------
    // Find business
    // -----------------------------

    const {
      data: business,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select(
        "id, name, feedback_slug, feedback_enabled"
      )
      .eq("feedback_slug", slug)
      .eq("feedback_enabled", true)
      .maybeSingle();

    if (businessError) {
      console.error(
        "Business lookup failed:",
        businessError
      );

      return json(
        { error: "Unable to load feedback page." },
        500
      );
    }

    if (!business) {
      return json(
        {
          error:
            "This feedback page is unavailable.",
        },
        404
      );
    }

    // -----------------------------
    // Check automation setting
    // -----------------------------

    const {
      data: automationSettings,
      error: automationSettingsError,
    } = await supabase
      .from("automation_settings")
      .select("business_id, enabled")
      .eq("business_id", business.id)
      .maybeSingle();

    if (automationSettingsError) {
      console.error(
        "Automation settings lookup failed:",
        automationSettingsError
      );

      // IMPORTANT:
      // Feedback collection must still work even if
      // automation settings cannot be read.
      // Treat automation as disabled.
    }

    const automationEnabled =
      automationSettingsError
        ? false
        : automationSettings?.enabled === true;

    // -----------------------------
    // Save feedback FIRST
    // -----------------------------

    const now = new Date().toISOString();

    const {
      data: review,
      error: reviewError,
    } = await supabase
      .from("reviews")
      .insert({
        business_id: business.id,
        source: "reviewauto",
        source_review_id: crypto.randomUUID(),
        customer_name:
          customerName || "Anonymous",
        rating,
        review_text: reviewText,
        automation_status: "pending",
        reply_status: "not_replied",
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (reviewError) {
      console.error(
        "Review insertion failed:",
        reviewError
      );

      return json(
        { error: "Unable to submit feedback." },
        500
      );
    }

    // ==================================================
    // AUTOMATION OFF
    // ==================================================
    //
    // The review has already been successfully saved.
    //
    // DO NOT call process-review-automation.
    //
    // This guarantees that disabling automation cannot
    // break customer feedback submission.
    //

    if (!automationEnabled) {
      return json({
        success: true,
        review_id: review.id,
        automation_enabled: false,
        processed: false,
        message: "Feedback received.",
      });
    }

    // ==================================================
    // AUTOMATION ON
    // ==================================================
    //
    // Only now do we call the automation engine.
    //

    const automationUrl =
      `${supabaseUrl}/functions/v1/process-review-automation`;

    try {
      const automationResponse =
        await fetch(
          automationUrl,
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
              review_id: review.id,
            }),
          }
        );

      if (!automationResponse.ok) {
        const automationError =
          await automationResponse.text();

        console.error(
          "Automation processing failed:",
          automationResponse.status,
          automationError
        );

        // IMPORTANT:
        // Do NOT fail the customer's feedback submission.
        // The review is already safely stored.
      }
    } catch (automationError) {
      console.error(
        "Automation request failed:",
        automationError
      );

      // IMPORTANT:
      // Do NOT return an error to the customer.
      // Feedback was already saved successfully.
    }

    // -----------------------------
    // Final success response
    // -----------------------------

    return json({
      success: true,
      review_id: review.id,
      automation_enabled: true,
      processed: true,
      message: "Feedback received.",
    });
  } catch (error) {
    console.error(
      "public-feedback-submit error:",
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
