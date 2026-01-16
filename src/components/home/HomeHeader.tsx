import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { UserMenu } from "@/components/home/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { Library } from "lucide-react";

export function HomeHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between relative z-20">
      <Link to="/" className="transition-transform hover:scale-105">
        <Logo size="md" />
      </Link>
      
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-9 w-20 bg-muted/50 animate-pulse rounded-xl" />
        ) : user ? (
          <>
            <Link to="/library">
              <GlintButton
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-primary"
                aria-label="My Library"
              >
                <Library className="h-5 w-5" />
              </GlintButton>
            </Link>
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
