import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

const supabaseUrl =
  Deno.env.get("SUPABASE_URL");

const serviceRoleKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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


    // --------------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------------

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

    const rating =
      Number(body?.rating);


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!slug) {
      return json(
        {
          error:
            "Feedback link is invalid.",
        },
        400
      );
    }


    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return json(
        {
          error:
            "Rating must be between 1 and 5.",
        },
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
        {
          error:
            "Your feedback is too long.",
        },
        400
      );
    }


    if (customerName.length > 200) {
      return json(
        {
          error:
            "Name is too long.",
        },
        400
      );
    }


    // --------------------------------------------------------
    // FIND BUSINESS
    // --------------------------------------------------------

    const {
      data: business,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select(
        `
        id,
        name,
        feedback_slug,
        feedback_enabled
        `
      )
      .eq(
        "feedback_slug",
        slug
      )
      .eq(
        "feedback_enabled",
        true
      )
      .maybeSingle();


    if (
      businessError ||
      !business
    ) {

      console.error(
        "Business lookup failed:",
        businessError
      );

      return json(
        {
          error:
            "This feedback page is unavailable.",
        },
        404
      );
    }


    // --------------------------------------------------------
    // CREATE REVIEW
    // --------------------------------------------------------

    const {
      data: review,
      error: reviewError,
    } = await supabase
      .from("reviews")
      .insert({
        business_id:
          business.id,

        source:
          "reviewauto",

        source_review_id:
          crypto.randomUUID(),

        customer_name:
          customerName || "Anonymous",

        rating,

        review_text:
          reviewText,

        automation_status:
          "pending",

        reply_status:
          "not_replied",

        review_created_at:
          new Date().toISOString(),

        review_updated_at:
          new Date().toISOString(),

        created_at:
          new Date().toISOString(),

        updated_at:
          new Date().toISOString(),
      })
      .select()
      .single();


    if (reviewError) {

      console.error(
        "Review insertion failed:",
        reviewError
      );

      return json(
        {
          error:
            "Unable to submit feedback.",
        },
        500
      );
    }


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    console.log(
      "ReviewAuto feedback received:",
      review.id
    );


    return json({
      success: true,

      review_id:
        review.id,

      message:
        "Feedback received.",
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
