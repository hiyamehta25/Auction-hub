import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetAuctions } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { AuctionCard } from "@/components/auction/auction-card";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const CATEGORIES = [
  { name: "Electronics", icon: "💻" },
  { name: "Art", icon: "🎨" },
  { name: "Jewelry", icon: "💎" },
  { name: "Vehicles", icon: "🚗" },
  { name: "Fashion", icon: "👗" },
  { name: "Collectibles", icon: "🧸" },
];

export default function Home() {
  const { data, isLoading } = useGetAuctions({ limit: 6 });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
              alt="Background" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                  Bid. Win. <span className="text-gradient">Own.</span>
                </h1>
                <p className="text-lg md:text-xl text-secondary/80 mb-10 leading-relaxed">
                  Discover rare items, unbeatable deals, and a thrilling bidding experience. 
                  Join thousands of collectors and enthusiasts today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/auctions">
                    <Button size="lg" className="w-full sm:w-auto gap-2 rounded-full text-lg">
                      Start Bidding <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/create-auction">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full text-lg bg-white/50 backdrop-blur-sm">
                      Sell an Item
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-white border-y border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Browse Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map((cat, i) => (
                <Link key={cat.name} href={`/auctions?category=${cat.name}`}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-muted/50 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer group"
                  >
                    <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="font-semibold text-secondary">{cat.name}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Auctions */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="text-primary w-8 h-8" />
                Featured Auctions
              </h2>
              <Link href="/auctions" className="text-primary font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : data?.auctions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-border">
                <p className="text-lg text-muted-foreground">No active auctions at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data?.auctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-secondary text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Secure Bidding</h3>
                <p className="text-white/70">Your data and bids are encrypted and securely stored. Trade with peace of mind.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Real-time Updates</h3>
                <p className="text-white/70">Watch bids come in live. Our real-time engine ensures you never miss a counter-bid.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Premium Items</h3>
                <p className="text-white/70">Carefully curated selections across multiple categories. Find what you love.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
