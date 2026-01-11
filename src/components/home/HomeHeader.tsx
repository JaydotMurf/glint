import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { GlintButton } from "@/components/ui/glint-button";
import { UserMenu } from "@/components/home/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

export function HomeHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between">
      <Link to="/">
        <Logo size="md" showIcon={false} />
      </Link>
      
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-9 w-20 bg-muted animate-pulse rounded-lg" />
        ) : user ? (
          <UserMenu />
        ) : (
          <>
            <Link to="/login">
              <GlintButton
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-primary transition-colors"
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
