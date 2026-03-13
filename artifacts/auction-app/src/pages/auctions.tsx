import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetAuctions } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuctionCard } from "@/components/auction/auction-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FilterX } from "lucide-react";

const CATEGORIES = ["All", "Electronics", "Art", "Jewelry", "Vehicles", "Fashion", "Sports", "Collectibles", "Other"];

export default function Auctions() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useGetAuctions({
    category: category === "All" ? undefined : category,
    search: debouncedSearch || undefined,
    limit: 50
  });

  const clearFilters = () => {
    setCategory("All");
    setSearch("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Explore Auctions</h1>
            <p className="text-muted-foreground">Find the perfect item. Bid smart, win big.</p>
          </div>

          {/* Filters Bar */}
          <div className="bg-card p-4 rounded-2xl shadow-sm border border-border mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search auctions..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex w-full md:w-auto items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    category === cat 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "bg-muted text-secondary hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
              {(category !== "All" || search) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 shrink-0 ml-2">
                  <FilterX className="w-4 h-4" /> Clear
                </Button>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-[380px] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : data?.auctions.length === 0 ? (
            <div className="text-center py-32 bg-card rounded-3xl border border-border">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold mb-2">No auctions found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or category filters.</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-muted-foreground mb-6">
                Showing {data?.auctions.length} result{data?.auctions.length !== 1 && "s"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data?.auctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            </>
          )}

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
