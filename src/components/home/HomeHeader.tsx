import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { UserMenu } from "@/components/home/UserMenu";
import { StreakBadge } from "@/components/StreakBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Library, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "library", label: "Library", icon: Library, path: "/library", requiresAuth: true },
  { id: "upgrade", label: "Upgrade", icon: Sparkles, path: "/upgrade" },
];

export function HomeHeader() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.requiresAuth && !user) {
      e.preventDefault();
      window.location.href = "/login";
    }
  };

  return (
    <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between relative z-20">
      <div className="flex items-center gap-6">
        <Link to="/" className="transition-transform hover:scale-105">
          <Logo size="md" />
        </Link>
        
        {/* Desktop Navigation - hidden on mobile since MobileNav handles it */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => handleNavClick(item, e)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-9 w-20 bg-muted/50 animate-pulse rounded-xl" />
        ) : user ? (
          <>
            <StreakBadge />
            <UserMenu />
          </>
        ) : (
          <>
            <Link to="/login">
              <GlintButton
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-primary"
              >
                Log in
              </GlintButton>
            </Link>
            <Link to="/signup">
              <GlintButton variant="primary" size="sm">
                Sign up
              </GlintButton>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
