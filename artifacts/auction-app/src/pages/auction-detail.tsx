import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetAuction, usePlaceBid } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/auth-store";
import { formatCurrency, getStatusColor, cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CountdownTimer } from "@/components/auction/countdown-timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAuctionQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ShieldCheck, UserCircle, ImageIcon, History, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuctionDetail() {
  const { id } = useParams();
  const auctionId = Number(id);
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [bidAmount, setBidAmount] = useState("");

  // Polling every 3 seconds for real-time updates
  const { data, isLoading, error } = useGetAuction(auctionId, {
    query: {
      queryKey: getGetAuctionQueryKey(auctionId),
      refetchInterval: 3000,
    },
  });

  const { mutate: placeBid, isPending: isBidding } = usePlaceBid({
    mutation: {
      onSuccess: () => {
        setBidAmount("");
        toast({
          title: "Bid Placed!",
          description: "Your bid was successfully registered.",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: getGetAuctionQueryKey(auctionId) });
      },
      onError: (err) => {
        toast({
          title: "Bid Failed",
          description: err.message || "Could not place bid. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= (data?.auction.currentPrice || 0)) {
      toast({
        title: "Invalid Bid",
        description: "Your bid must be higher than the current price.",
        variant: "destructive",
      });
      return;
    }

    placeBid({ data: { auctionId, amount } });
  };

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
        <div className="flex-grow flex items-center justify-center p-4 text-center">
          <div>
            <h2 className="text-2xl font-bold text-destructive mb-2">Auction Not Found</h2>
            <p className="text-muted-foreground">The auction you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const { auction, bids, winner } = data;
  const isEnded = auction.status !== "active" || new Date(auction.endTime) <= new Date();
  const minNextBid = auction.currentPrice + 1; // Assuming $1 increments

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Col: Image */}
            <div className="lg:col-span-7">
              <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center relative group">
                {auction.imageUrl ? (
                  <img 
                    src={auction.imageUrl} 
                    alt={auction.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground/40">
                    <ImageIcon className="w-20 h-20 mb-4" />
                    <p>No image available</p>
                  </div>
                )}
                
                <div className="absolute top-6 left-6">
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border shadow-md backdrop-blur-md",
                    getStatusColor(isEnded ? "ended" : auction.status)
                  )}>
                    {isEnded ? "Auction Ended" : "Live Auction"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Col: Details & Bidding */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="mb-6">
                <span className="text-sm font-medium text-primary mb-2 block">{auction.category}</span>
                <h1 className="text-4xl font-extrabold text-secondary mb-4 leading-tight">{auction.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg">
                    <UserCircle className="w-4 h-4" />
                    <span>Seller: <span className="font-semibold text-secondary">{auction.sellerUsername}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    <span>Verified</span>
                  </div>
                </div>

                <p className="text-secondary/80 leading-relaxed mb-8">
                  {auction.description}
                </p>
              </div>

              {/* Price & Action Area */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-8">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">
                      {isEnded ? "Final Price" : "Current Bid"}
                    </p>
                    <p className="text-4xl font-black text-secondary">
                      {formatCurrency(auction.currentPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Time Remaining</p>
                    <CountdownTimer endTime={auction.endTime} className="text-base px-3 py-1.5" />
                  </div>
                </div>

                {isEnded ? (
                  <div className="bg-muted p-4 rounded-xl text-center">
                    <p className="font-bold text-secondary mb-1">This auction has ended.</p>
                    {winner ? (
                      <p className="text-success font-medium flex items-center justify-center gap-2">
                        🎉 Won by {winner.id === user?.id ? "YOU!" : winner.username}
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-sm">Ended with {auction.bidCount} bids.</p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleBidSubmit} className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="relative flex-grow">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min={minNextBid}
                          className="pl-8 text-lg font-bold h-14"
                          placeholder={minNextBid.toFixed(2)}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" size="lg" disabled={isBidding} className="h-14 px-8 text-lg shrink-0">
                        {isBidding ? "Processing..." : "Place Bid"}
                      </Button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      Enter {formatCurrency(minNextBid)} or more. {auction.bidCount} bids so far.
                    </p>
                  </form>
                )}
              </div>

              {/* Bid History */}
              <div className="flex-grow">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Bid History
                </h3>
                
                {bids.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-2xl border border-dashed border-border">
                    <p className="text-muted-foreground text-sm">No bids yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {bids.map((bid, i) => (
                      <div key={bid.id} className={cn(
                        "flex items-center justify-between p-3 rounded-xl border",
                        i === 0 ? "bg-success/5 border-success/20" : "bg-card border-border"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-xs text-secondary">
                            {bid.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {bid.username} {bid.userId === user?.id && <span className="text-xs text-primary font-normal">(You)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{format(new Date(bid.createdAt), "MMM d, h:mm a")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn("font-bold", i === 0 ? "text-success" : "text-secondary")}>
                            {formatCurrency(bid.amount)}
                          </p>
                          {i === 0 && <span className="text-[10px] uppercase font-bold text-success">Highest</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
