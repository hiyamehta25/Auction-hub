import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth-store";
import { useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Gavel, LayoutDashboard, LogOut, PlusCircle, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout: clearStore } = useAuthStore();
  const { mutate: logoutMutation } = useLogout();

  const handleLogout = () => {
    logoutMutation(undefined, {
      onSettled: () => {
        clearStore();
        setLocation("/");
      }
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-white/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Gavel className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display font-bold text-2xl text-secondary">BidWave</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/auctions" className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-primary", location === "/auctions" ? "bg-accent text-primary" : "text-secondary")}>
                Explore Auctions
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/create-auction">
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Create Auction
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <div className="h-8 w-px bg-border mx-2 hidden sm:block" />
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold text-secondary">{user?.username}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-medium">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
