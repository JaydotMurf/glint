import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, BookOpen, User, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "library", label: "Library", icon: BookOpen, path: "/library", requiresAuth: true },
  { id: "upgrade", label: "Upgrade", icon: Sparkles, path: "/upgrade" },
];

const MobileNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Don't show on non-mobile or on auth pages only
  const hideOnPaths = ["/login", "/signup"];
  if (!isMobile || hideOnPaths.some(p => location.pathname.startsWith(p))) {
    return null;
  }

  const handleNavigation = (item: NavItem) => {
    if (item.requiresAuth && !user) {
      navigate("/login");
      return;
    }
    navigate(item.path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border safe-area-bottom"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full",
                "min-h-[44px] min-w-[44px]", // Touch target requirement
                "transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground active:text-primary"
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110"
                )} 
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Account button */}
        <button
          onClick={() => navigate(user ? "/library" : "/login")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 flex-1 h-full",
            "min-h-[44px] min-w-[44px]",
            "transition-colors duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "text-muted-foreground hover:text-foreground active:text-primary"
          )}
          aria-label={user ? "Account" : "Sign in"}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">
            {user ? "Account" : "Sign in"}
          </span>
        </button>
      </div>
    </nav>
  );
};

export { MobileNav };
