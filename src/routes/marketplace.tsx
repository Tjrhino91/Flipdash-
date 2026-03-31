import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { fmtCurrency, estimateMarketValues, getDealRating, type MarketplaceListing } from '@/lib/store';
import { fetchMarketCheckListings } from '@/lib/marketcheck';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/marketplace')({ component: MarketplacePage });

function MarketplacePage() {
  const [marketplace, setMarketplace] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    async function loadListings() {
      setIsLoading(true);
      setError(null);

      const result = await fetchMarketCheckListings({
        rows: 100,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setMarketplace(result.listings);
      }

      setIsLoading(false);
    }

    loadListings();
  }, []);

  const filtered = useMemo(() => {
    return marketplace.filter((listing) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        listing.year.includes(searchTerm) ||
        listing.make.toLowerCase().includes(searchLower) ||
        listing.model.toLowerCase().includes(searchLower) ||
        listing.trim.toLowerCase().includes(searchLower);

      const matchesLocation = !locationFilter || listing.location.toLowerCase().includes(locationFilter.toLowerCase());

      const price = listing.price;
      const matchesPrice =
        (!priceMin || price >= parseInt(priceMin)) &&
        (!priceMax || price <= parseInt(priceMax));

      return matchesSearch && matchesLocation && matchesPrice;
    });
  }, [marketplace, searchTerm, locationFilter, priceMin, priceMax]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedListings = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const locations = Array.from(new Set(marketplace.map((m) => m.location))).sort();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading listings...' : `${filtered.length} vehicles available`}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-8 mb-8 bg-red-500/10 border-red-500/20">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-400 mb-2">Unable to Load Listings</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden h-[400px] bg-card border-border">
                <div className="h-48 bg-muted animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                  <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        {!isLoading && !error && (
          <Card className="p-6 mb-8 bg-card border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search</label>
              <Input
                placeholder="Year, make, model..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm"
              >
                <option value="">All locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Min Price</label>
              <Input
                type="number"
                placeholder="$0"
                value={priceMin}
                onChange={(e) => {
                  setPriceMin(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Max Price</label>
              <Input
                type="number"
                placeholder="$999,999"
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setLocationFilter('');
                  setPriceMin('');
                  setPriceMax('');
                  setCurrentPage(1);
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>
        )}

        {/* Listings Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedListings.map((listing) => {
            const marketValues = estimateMarketValues(listing);
            const dealRating = getDealRating(listing.price, marketValues.retail, marketValues.wholesale);

            return (
              <Link
                key={listing.id}
                to="/marketplace-listing"
                search={{ listingId: listing.id }}
                className="no-underline"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full flex flex-col bg-card border-border">
                  {/* Image */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img
                      src={listing.imageUrl}
                      alt={`${listing.year} ${listing.make} ${listing.model}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Deal Badge */}
                    <div className={`absolute top-3 right-3 ${dealRating.bgColor} ${dealRating.color} px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}>
                      <span>{dealRating.emoji}</span>
                      <span>{dealRating.label}</span>
                    </div>
                    {/* Days Listed */}
                    <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                      {listing.daysListed}d
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="font-bold text-lg text-foreground mb-1">
                      {listing.year} {listing.make} {listing.model}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{listing.trim}</p>

                    {/* Price & Location */}
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-primary mb-1">{fmtCurrency(listing.price)}</p>
                      <p className="text-sm text-muted-foreground">{listing.location}</p>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-muted-foreground">
                      <div>
                        <span className="font-semibold">Miles:</span> {listing.miles.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-semibold">Year:</span> {listing.year}
                      </div>
                      {listing.fuelType && (
                        <div>
                          <span className="font-semibold">Fuel:</span> {listing.fuelType}
                        </div>
                      )}
                      {listing.transmission && (
                        <div>
                          <span className="font-semibold">Trans:</span> {listing.transmission}
                        </div>
                      )}
                    </div>

                    {/* Seller */}
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold">Seller:</span> {listing.sellerName}
                      </p>
                    </div>

                    {/* Source Badge */}
                    {listing.source === 'marketplace' && (
                      <Badge variant="outline" className="mt-2 w-fit text-xs">
                        External Listing
                      </Badge>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filtered.length === 0 && marketplace.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No Listings Available</h2>
            <p className="text-muted-foreground">
              There are currently no vehicles in the marketplace.
            </p>
          </div>
        )}

        {/* No Results from Filter */}
        {!isLoading && !error && filtered.length === 0 && marketplace.length > 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No Vehicles Match Your Filters</h2>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or clearing the filters.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('');
                setPriceMin('');
                setPriceMax('');
                setCurrentPage(1);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-8">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  className="w-10"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
