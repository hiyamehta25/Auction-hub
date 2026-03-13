import { useLocation, Link } from "wouter";
import { useGetDashboard } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/auth-store";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuctionCard } from "@/components/auction/auction-card";
import { formatCurrency } from "@/lib/utils";
import { Activity, Gavel, Trophy, PackageOpen } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const { data, isLoading, error } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-center p-4">
          <div className="bg-destructive/10 text-destructive p-6 rounded-2xl max-w-md">
            <p className="font-bold mb-2">Failed to load dashboard.</p>
            <p className="text-sm opacity-80">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  const { stats, myAuctions, myBids, wonAuctions } = data;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2 text-secondary">Welcome back, {user?.username}</h1>
            <p className="text-muted-foreground">Here's an overview of your auction activity.</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-5 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <PackageOpen className="w-7 h-7" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Active Auctions</p>
                <p className="text-3xl font-bold text-secondary">{stats.activeAuctions}</p>
              </div>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-5 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Total Bids Placed</p>
                <p className="text-3xl font-bold text-secondary">{stats.totalBids}</p>
              </div>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-5 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center text-success">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Auctions Won</p>
                <p className="text-3xl font-bold text-secondary">{stats.auctionsWon}</p>
              </div>
            </div>
          </div>

          {/* Two Column Layout for Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Left Col: My Items & Won */}
            <div className="space-y-10">
              <section>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
                  <PackageOpen className="w-5 h-5 text-primary" />
                  Selling ({myAuctions.length})
                </h2>
                {myAuctions.length === 0 ? (
                  <div className="text-center p-8 bg-muted/30 rounded-xl border border-dashed border-border">
                    <p className="text-muted-foreground mb-4">You haven't listed any items yet.</p>
                    <Link href="/create-auction" className="text-primary font-medium hover:underline">List an item now</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myAuctions.map(auction => (
                      <AuctionCard key={auction.id} auction={auction} />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
                  <Trophy className="w-5 h-5 text-success" />
                  Won Auctions ({wonAuctions.length})
                </h2>
                {wonAuctions.length === 0 ? (
                  <div className="p-8 bg-muted/30 rounded-xl border border-dashed border-border text-center text-muted-foreground">
                    You haven't won any auctions yet. Keep bidding!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wonAuctions.map(auction => (
                      <AuctionCard key={auction.id} auction={auction} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Col: Recent Bids */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
                <Gavel className="w-5 h-5 text-blue-500" />
                Recent Bids
              </h2>
              {myBids.length === 0 ? (
                <div className="p-8 bg-muted/30 rounded-xl border border-dashed border-border text-center text-muted-foreground">
                  You haven't placed any bids yet.
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="divide-y divide-border">
                    {myBids.map(bid => (
                      <div key={bid.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-secondary">Bid: {formatCurrency(bid.amount)}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(bid.createdAt), "MMM d, yyyy h:mm a")}</p>
                        </div>
                        <Link href={`/auctions/${bid.auctionId}`}>
                          <button className="text-sm font-medium text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-lg">
                            View Auction
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
