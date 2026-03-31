import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SearchParams {
  year?: string;
  make?: string;
  model?: string;
  zip?: string;
  radius?: number;
  priceMin?: number;
  priceMax?: number;
  milesMax?: number;
  rows?: number;
  start?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  sellerType?: "dealer" | "private";
  bodyType?: string;
}

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
          listings: [],
          totalFound: 0,
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
    const params: SearchParams = {};

    if (url.searchParams.has("year")) params.year = url.searchParams.get("year")!;
    if (url.searchParams.has("make")) params.make = url.searchParams.get("make")!;
    if (url.searchParams.has("model")) params.model = url.searchParams.get("model")!;
    if (url.searchParams.has("zip")) params.zip = url.searchParams.get("zip")!;
    if (url.searchParams.has("radius")) params.radius = parseInt(url.searchParams.get("radius")!);
    if (url.searchParams.has("priceMin")) params.priceMin = parseInt(url.searchParams.get("priceMin")!);
    if (url.searchParams.has("priceMax")) params.priceMax = parseInt(url.searchParams.get("priceMax")!);
    if (url.searchParams.has("milesMax")) params.milesMax = parseInt(url.searchParams.get("milesMax")!);
    if (url.searchParams.has("rows")) params.rows = parseInt(url.searchParams.get("rows")!);
    if (url.searchParams.has("start")) params.start = parseInt(url.searchParams.get("start")!);
    if (url.searchParams.has("sortBy")) params.sortBy = url.searchParams.get("sortBy")!;
    if (url.searchParams.has("sortOrder")) params.sortOrder = url.searchParams.get("sortOrder")! as "asc" | "desc";
    if (url.searchParams.has("sellerType")) params.sellerType = url.searchParams.get("sellerType")! as "dealer" | "private";
    if (url.searchParams.has("bodyType")) params.bodyType = url.searchParams.get("bodyType")!;

    const queryParams = new URLSearchParams();
    queryParams.set("api_key", apiKey);

    if (params.year) queryParams.set("year", params.year);
    if (params.make) queryParams.set("make", params.make);
    if (params.model) queryParams.set("model", params.model);
    if (params.zip) queryParams.set("zip", params.zip);
    if (params.radius) queryParams.set("radius", String(params.radius));
    if (params.priceMin || params.priceMax) {
      const priceRange = `${params.priceMin || ""}-${params.priceMax || ""}`;
      queryParams.set("price_range", priceRange);
    }
    if (params.milesMax) queryParams.set("miles_range", `-${params.milesMax}`);
    if (params.rows) queryParams.set("rows", String(params.rows));
    if (params.start) queryParams.set("start", String(params.start));
    if (params.sellerType) queryParams.set("seller_type", params.sellerType);
    if (params.bodyType) queryParams.set("body_type", params.bodyType);

    queryParams.set("sort_by", params.sortBy || "first_seen_at");
    queryParams.set("sort_order", params.sortOrder || "desc");
    queryParams.set("include_relevant_links", "true");

    const marketCheckUrl = `https://mc-api.marketcheck.com/v2/search/car/active?${queryParams.toString()}`;

    const res = await fetch(marketCheckUrl);

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");

      if (res.status === 401 || res.status === 403) {
        return new Response(
          JSON.stringify({
            error: "Invalid MarketCheck API key",
            listings: [],
            totalFound: 0,
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

      if (res.status === 429) {
        return new Response(
          JSON.stringify({
            error: "API rate limit reached. Please try again in a moment.",
            listings: [],
            totalFound: 0,
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      throw new Error(`MarketCheck API returned ${res.status}: ${errorBody}`);
    }

    const data = await res.json();

    return new Response(
      JSON.stringify({
        listings: data.listings || [],
        totalFound: data.num_found || 0,
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
        error: err instanceof Error ? err.message : "Failed to fetch listings from MarketCheck",
        listings: [],
        totalFound: 0,
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
