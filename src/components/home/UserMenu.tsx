import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlintButton } from "@/components/ui/glint-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, BookOpen, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/appStore";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isPremium, savedConcepts } = useAppStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <GlintButton
          variant="ghost"
          size="sm"
          className="gap-2 text-foreground"
        >
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="hidden sm:inline max-w-[100px] truncate">
            {displayName}
          </span>
        </GlintButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border border-border">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          {isPremium && (
            <div className="flex items-center gap-1 mt-1">
              <Crown className="h-3 w-3 text-warning" />
              <span className="text-xs text-warning font-medium">Premium</span>
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        {savedConcepts.length > 0 && (
          <DropdownMenuItem
            onClick={() => navigate("/library")}
            className="cursor-pointer"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            My Library ({savedConcepts.length})
          </DropdownMenuItem>
        )}
        {!isPremium && (
          <DropdownMenuItem
            onClick={() => navigate("/upgrade")}
            className="cursor-pointer text-primary"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
