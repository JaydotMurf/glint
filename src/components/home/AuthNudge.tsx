import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function AuthNudge() {
  const { user, loading } = useAuth();

  // Don't show nudge if loading or already logged in
  if (loading || user) return null;

  return (
    <p className="text-center text-sm text-muted-foreground mt-4">
      Want to save your results?{" "}
      <Link
        to="/signup"
        className="text-primary hover:underline font-medium transition-colors"
      >
        Create an account
      </Link>
    </p>
  );
}
