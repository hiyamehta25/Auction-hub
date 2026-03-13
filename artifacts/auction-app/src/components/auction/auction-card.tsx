import { Link } from "wouter";
import { Auction } from "@workspace/api-client-react";
import { formatCurrency, getStatusColor, cn } from "@/lib/utils";
import { CountdownTimer } from "./countdown-timer";
import { ArrowRight, ImageIcon } from "lucide-react";

interface AuctionCardProps {
  auction: Auction;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const isEnded = auction.status !== "active" || new Date(auction.endTime) <= new Date();

  return (
    <Link href={`/auctions/${auction.id}`} className="block group hover-lift">
      <div className="bg-card rounded-2xl overflow-hidden border border-border h-full flex flex-col relative">
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border backdrop-blur-md shadow-sm",
            getStatusColor(isEnded ? "ended" : auction.status)
          )}>
            {isEnded ? "Ended" : "Live"}
          </span>
        </div>

        {/* Image */}
        <div className="aspect-[4/3] w-full bg-muted relative overflow-hidden flex items-center justify-center">
          {auction.imageUrl ? (
            <img 
              src={auction.imageUrl} 
              alt={auction.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              {auction.category}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-secondary line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {auction.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
            {auction.description}
          </p>

          <div className="flex items-end justify-between pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Bid</p>
              <p className="text-xl font-bold text-secondary">
                {formatCurrency(auction.currentPrice)}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <CountdownTimer endTime={auction.endTime} />
              <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
                View Item <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
