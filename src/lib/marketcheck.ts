// ─── MarketCheck API Integration ─────────────────────────────────────
// Fetches real vehicle listings from MarketCheck API via secure backend proxy
// Maps API data into Flipdash MarketplaceListing format
// Flipdash Value Engine runs AFTER data is received

import type { MarketplaceListing } from "./store";

// ─── Backend API Configuration ───────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

function getBackendHeaders(): HeadersInit {
  return {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}

// ─── Types ───────────────────────────────────────────────────────────

export interface MarketCheckSearchParams {
  year?: string;
  make?: string;
  model?: string;
  zip?: string;
  radius?: number;
  priceMin?: number;
  priceMax?: number;
  milesMin?: number;
  milesMax?: number;
  rows?: number;
  start?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  sellerType?: "dealer" | "private";
  bodyType?: string;
}

export interface MarketCheckListing {
  id: string;
  vin?: string;
  heading?: string;
  price?: number;
  miles?: number;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  body_type?: string;
  exterior_color?: string;
  interior_color?: string;
  dom?: number; // days on market
  first_seen_at?: string;
  last_seen_at?: string;
  seller_type?: string;
  inventory_type?: string;
  source?: string;
  vdp_url?: string;
  media?: {
    photo_links?: string[];
  };
  build?: {
    engine?: string;
    transmission?: string;
    drivetrain?: string;
    fuel_type?: string;
    doors?: number;
    made_in?: string;
    city_miles?: number;
    highway_miles?: number;
  };
  dealer?: {
    id?: number;
    name?: string;
    phone?: string;
    website?: string;
    city?: string;
    state?: string;
    zip?: string;
    latitude?: number;
    longitude?: number;
  };
  extra?: {
    features?: string[];
  };
  dist?: number; // distance from zip
}

export interface MarketCheckResponse {
  num_found: number;
  listings: MarketCheckListing[];
}

// ─── Placeholder image for missing photos ────────────────────────────

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' fill='%23111827'%3E%3Crect width='640' height='400' fill='%23111827'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' fill='%234B5563' font-family='system-ui' font-size='24'%3ENo Photo%3C/text%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' fill='%234B5563' font-family='system-ui' font-size='14'%3EAvailable%3C/text%3E%3C/svg%3E";

// ─── Map MarketCheck listing → Flipdash MarketplaceListing ───────────

function mapToFlipdash(mc: MarketCheckListing): MarketplaceListing {
  const photos = mc.media?.photo_links || [];
  const primaryImage = photos.length > 0 ? photos[0] : PLACEHOLDER_IMG;
  const allImages = photos.length > 0 ? photos.slice(0, 10) : [PLACEHOLDER_IMG];

  const city = mc.dealer?.city || "";
  const state = mc.dealer?.state || "";
  const location = city && state ? `${city}, ${state}` : city || state || "Unknown";

  const sellerName = mc.dealer?.name || (mc.seller_type === "private" ? "Private Seller" : "Unknown");

  // Calculate days listed from first_seen_at or dom field
  let daysListed = mc.dom || 0;
  if (!daysListed && mc.first_seen_at) {
    const firstSeen = new Date(mc.first_seen_at);
    const now = new Date();
    daysListed = Math.max(0, Math.floor((now.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const postedAt = mc.first_seen_at || new Date().toISOString();

  // Build features list from actual data only
  const features: string[] = [];
  if (mc.extra?.features && mc.extra.features.length > 0) {
    features.push(...mc.extra.features.slice(0, 15));
  }
  if (mc.build?.drivetrain && mc.build.drivetrain !== "FWD") {
    features.push(mc.build.drivetrain);
  }

  return {
    id: `mc-${mc.id}`,
    year: String(mc.year || ""),
    make: mc.make || "Unknown",
    model: mc.model || "Unknown",
    trim: mc.trim || "",
    miles: mc.miles || 0,
    price: mc.price || 0,
    location,
    exteriorColor: mc.exterior_color || "Unknown",
    imageUrl: primaryImage,
    imageUrls: allImages,
    daysListed,
    source: "marketplace",
    sourceUrl: mc.vdp_url || undefined,
    sellerName,
    sellerPhone: mc.dealer?.phone || undefined,
    sellerEmail: undefined,
    description: mc.heading || `${mc.year || ""} ${mc.make || ""} ${mc.model || ""} ${mc.trim || ""}`.trim() || "No description available",
    vin: mc.vin || undefined,
    postedAt,
    drivetrain: mc.build?.drivetrain || undefined,
    fuelType: mc.build?.fuel_type || undefined,
    engine: mc.build?.engine || undefined,
    bodyStyle: mc.body_type || undefined,
    transmission: mc.build?.transmission || undefined,
    titleType: "Clean",
    features: features.length > 0 ? features : undefined,
    contactPreference: "any",
    interiorColor: mc.interior_color || undefined,
  };
}

// ─── Fetch Listings from MarketCheck via Backend Proxy ───────────────

export async function fetchMarketCheckListings(
  params: MarketCheckSearchParams
): Promise<{ listings: MarketplaceListing[]; totalFound: number; error?: string }> {
  try {
    const queryParams = new URLSearchParams();

    if (params.year) queryParams.set("year", params.year);
    if (params.make) queryParams.set("make", params.make);
    if (params.model) queryParams.set("model", params.model);
    if (params.zip) queryParams.set("zip", params.zip);
    if (params.radius) queryParams.set("radius", String(params.radius));
    if (params.priceMin) queryParams.set("priceMin", String(params.priceMin));
    if (params.priceMax) queryParams.set("priceMax", String(params.priceMax));
    if (params.milesMax) queryParams.set("milesMax", String(params.milesMax));
    if (params.rows) queryParams.set("rows", String(params.rows));
    if (params.start) queryParams.set("start", String(params.start));
    if (params.sellerType) queryParams.set("sellerType", params.sellerType);
    if (params.bodyType) queryParams.set("bodyType", params.bodyType);
    if (params.sortBy) queryParams.set("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

    const apiUrl = `${SUPABASE_URL}/functions/v1/marketplace-search?${queryParams.toString()}`;

    const res = await fetch(apiUrl, {
      headers: getBackendHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        listings: [],
        totalFound: 0,
        error: errorData.error || "Failed to fetch listings from marketplace",
      };
    }

    const data = await res.json();

    if (data.error) {
      return {
        listings: [],
        totalFound: 0,
        error: data.error,
      };
    }

    const listings = (data.listings || [])
      .filter((l: MarketCheckListing) => l.price && l.price > 0)
      .map(mapToFlipdash);

    return {
      listings,
      totalFound: data.totalFound || listings.length,
    };
  } catch (err) {
    return {
      listings: [],
      totalFound: 0,
      error: err instanceof Error ? err.message : "Failed to fetch listings from MarketCheck",
    };
  }
}

// ─── Fetch Single Listing Detail via Backend Proxy ───────────────────

export async function fetchMarketCheckListing(
  listingId: string
): Promise<{ listing: MarketplaceListing | null; error?: string }> {
  try {
    const apiUrl = `${SUPABASE_URL}/functions/v1/marketplace-listing/${listingId}`;

    const res = await fetch(apiUrl, {
      headers: getBackendHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        listing: null,
        error: errorData.error || "Failed to fetch listing detail",
      };
    }

    const data = await res.json();

    if (data.error || !data.listing) {
      return {
        listing: null,
        error: data.error || "Listing not found",
      };
    }

    return { listing: mapToFlipdash(data.listing) };
  } catch (err) {
    return {
      listing: null,
      error: err instanceof Error ? err.message : "Failed to fetch listing detail",
    };
  }
}
