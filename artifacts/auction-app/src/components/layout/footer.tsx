import { Gavel } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Gavel className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-2xl">BidWave</span>
            </Link>
            <p className="text-secondary-foreground/70 max-w-sm">
              The premier destination for finding exceptional items. Bid with confidence, win with pride.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Explore</h4>
            <ul className="space-y-2">
              <li><Link href="/auctions?category=Electronics" className="text-secondary-foreground/70 hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link href="/auctions?category=Art" className="text-secondary-foreground/70 hover:text-primary transition-colors">Art & Collectibles</Link></li>
              <li><Link href="/auctions?category=Vehicles" className="text-secondary-foreground/70 hover:text-primary transition-colors">Vehicles</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Account</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="text-secondary-foreground/70 hover:text-primary transition-colors">My Dashboard</Link></li>
              <li><Link href="/login" className="text-secondary-foreground/70 hover:text-primary transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="text-secondary-foreground/70 hover:text-primary transition-colors">Register</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-secondary-foreground/50 text-sm">
          &copy; {new Date().getFullYear()} BidWave Online Auctions. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
