import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get("MARKETCHECK_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "MarketCheck API key not configured",
          listing: null,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const listingId = pathParts[pathParts.length - 1];

    if (!listingId || listingId === "marketplace-listing") {
      return new Response(
        JSON.stringify({
          error: "Listing ID is required",
          listing: null,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const rawId = listingId.replace(/^mc-/, "");

    const marketCheckUrl = `https://mc-api.marketcheck.com/v2/listing/${rawId}?api_key=${apiKey}`;

    const res = await fetch(marketCheckUrl);

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");

      if (res.status === 401 || res.status === 403) {
        return new Response(
          JSON.stringify({
            error: "Invalid MarketCheck API key",
            listing: null,
          }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (res.status === 404) {
        return new Response(
          JSON.stringify({
            error: "Listing not found",
            listing: null,
          }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      throw new Error(`MarketCheck API returned ${res.status}: ${errorBody}`);
    }

    const listing = await res.json();

    return new Response(
      JSON.stringify({
        listing,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Failed to fetch listing detail",
        listing: null,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
