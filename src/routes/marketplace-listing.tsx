import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { estimateMarketValues, getDealRating, fmtCurrency, type MarketplaceListing } from '@/lib/store';
import { fetchMarketCheckListing } from '@/lib/marketcheck';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/marketplace-listing')({
  component: MarketplaceListingDetail,
});

function MarketplaceListingDetail() {
  const search = Route.useSearch() as { listingId: string };
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadListing() {
      if (!search.listingId) {
        setError('No listing ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const result = await fetchMarketCheckListing(search.listingId);

      if (result.error || !result.listing) {
        setError(result.error || 'Listing not found');
      } else {
        setListing(result.listing);
      }

      setIsLoading(false);
    }

    loadListing();
  }, [search.listingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
            ← Back to Marketplace
          </Button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden mb-6 bg-card border-border">
                <div className="h-96 bg-muted animate-pulse" />
              </Card>
              <div className="space-y-4">
                <div className="h-12 bg-muted animate-pulse rounded" />
                <div className="h-8 bg-muted animate-pulse rounded w-2/3" />
                <Card className="p-6 bg-card border-border">
                  <div className="space-y-3">
                    <div className="h-6 bg-muted animate-pulse rounded" />
                    <div className="h-6 bg-muted animate-pulse rounded" />
                    <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                  </div>
                </Card>
              </div>
            </div>
            <div className="lg:col-span-1">
              <Card className="p-6 bg-card border-border">
                <div className="space-y-4">
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Listing Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || 'This listing may have been removed or does not exist.'}
          </p>
          <Button onClick={() => window.history.back()}>
            ← Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const marketValues = estimateMarketValues(listing);
  const dealRating = getDealRating(listing.price, marketValues.retail, marketValues.wholesale);

  const images = listing.imageUrls || [listing.imageUrl];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
          ← Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images & Details */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <Card className="overflow-hidden mb-6 bg-card border-border">
              <div className="relative h-96 bg-muted">
                <img
                  src={images[0]}
                  alt={`${listing.year} ${listing.make} ${listing.model}`}
                  className="w-full h-full object-cover"
                />
                {/* Deal Badge */}
                <div className={`absolute top-4 right-4 ${dealRating.bgColor} ${dealRating.color} px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2`}>
                  <span className="text-2xl">{dealRating.emoji}</span>
                  <div>
                    <div>{dealRating.label}</div>
                    <div className="text-xs opacity-90">{dealRating.pctOfMarket}% of market</div>
                  </div>
                </div>
              </div>

              {/* Image Gallery */}
              {images.length > 1 && (
                <div className="p-4 bg-card border-t border-border flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="h-20 w-20 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Title & Price */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {listing.year} {listing.make} {listing.model}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">{listing.trim}</p>
              <div className="flex items-baseline gap-4">
                <p className="text-5xl font-bold text-primary">{fmtCurrency(listing.price)}</p>
                <div className="text-sm text-muted-foreground">
                  <p>Est. Retail: {fmtCurrency(marketValues.retail)}</p>
                  <p>Est. Wholesale: {fmtCurrency(marketValues.wholesale)}</p>
                </div>
              </div>
            </div>

            {/* Key Specs */}
            <Card className="p-6 mb-6 bg-card border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Vehicle Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Mileage</p>
                  <p className="text-lg font-bold text-foreground">{listing.miles.toLocaleString()} mi</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Year</p>
                  <p className="text-lg font-bold text-foreground">{listing.year}</p>
                </div>
                {listing.bodyStyle && (
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Body Style</p>
                    <p className="text-lg font-bold text-foreground">{listing.bodyStyle}</p>
                  </div>
                )}
                {listing.engine && (
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Engine</p>
                    <p className="text-lg font-bold text-foreground">{listing.engine}</p>
                  </div>
                )}
                {listing.transmission && (
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Transmission</p>
                    <p className="text-lg font-bold text-foreground">{listing.transmission}</p>
                  </div>
                )}
                {listing.drivetrain && (
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Drivetrain</p>
                    <p className="text-lg font-bold text-foreground">{listing.drivetrain}</p>
                  </div>
                )}
                {listing.fuelType && (
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Fuel Type</p>
                    <p className="text-lg font-bold text-foreground">{listing.fuelType}</p>
                  </div>
                )}
                {listing.titleType && (
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Title Type</p>
                    <p className="text-lg font-bold text-foreground">{listing.titleType}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Exterior Color</p>
                  <p className="text-lg font-bold text-foreground">{listing.exteriorColor}</p>
                </div>
              </div>
            </Card>

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <Card className="p-6 mb-6 bg-card border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary">
                      ✓ {feature}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Description */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Description</h2>
              <p className="text-foreground leading-relaxed">{listing.description}</p>
            </Card>
          </div>

          {/* Right: Seller Info & Make Offer */}
          <div className="lg:col-span-1">
            {/* Seller Card */}
            <Card className="p-6 mb-6 bg-card border-border sticky top-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Seller Information</h2>
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Name</p>
                  <p className="text-foreground">{listing.sellerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Location</p>
                  <p className="text-foreground">{listing.location}</p>
                </div>
                {listing.sellerPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Phone</p>
                    <a href={`tel:${listing.sellerPhone}`} className="text-primary hover:underline">
                      {listing.sellerPhone}
                    </a>
                  </div>
                )}
                {listing.sellerEmail && (
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Email</p>
                    <a href={`mailto:${listing.sellerEmail}`} className="text-primary hover:underline">
                      {listing.sellerEmail}
                    </a>
                  </div>
                )}
              </div>

              {/* Contact Methods */}
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground font-semibold mb-3">Preferred Contact</p>
                <div className="space-y-2">
                  {listing.contactPreference === 'any' || listing.contactPreference === 'phone' ? (
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      📞 Call Seller
                    </Button>
                  ) : null}
                  {listing.contactPreference === 'any' || listing.contactPreference === 'email' ? (
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      ✉️ Email Seller
                    </Button>
                  ) : null}
                  {listing.contactPreference === 'any' || listing.contactPreference === 'chat' ? (
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      💬 Chat on Platform
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* External Source Link */}
              {listing.sourceUrl && (
                <a
                  href={listing.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-6"
                >
                  <Button variant="outline" className="w-full justify-start">
                    🔗 View Original Listing
                  </Button>
                </a>
              )}
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
