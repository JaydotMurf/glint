import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback } from "react";

interface StreakData {
  current_streak: number | null;
  longest_streak: number | null;
  last_activity_date: string | null;
}

interface StreakUpdateResult {
  streak: number;
  longest: number;
  increased: boolean;
  is_new_streak: boolean;
}

const STREAK_MILESTONES = [7, 30, 100, 365] as const;

export function useStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingMilestone, setPendingMilestone] = useState<number | null>(null);

  const { data: streakData, isLoading } = useQuery({
    queryKey: ["streak", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak, last_activity_date")
        .eq("id", user!.id)
        .single();
      
      if (error) throw error;
      return data as StreakData;
    },
    enabled: !!user,
  });

  const recordActivity = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("update_user_streak", {
        p_user_id: user!.id
      });
      if (error) throw error;
      return data as unknown as StreakUpdateResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["streak", user?.id] });
      
      // Check for milestone achievements
      if (result.increased) {
        const hitMilestone = STREAK_MILESTONES.find(m => result.streak === m);
        if (hitMilestone) {
          setPendingMilestone(hitMilestone);
        }
      }
    },
  });

  const clearMilestone = useCallback(() => {
    setPendingMilestone(null);
  }, []);

  const checkIfActiveToday = useCallback(() => {
    if (!streakData?.last_activity_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return streakData.last_activity_date === today;
  }, [streakData?.last_activity_date]);

  return {
    currentStreak: streakData?.current_streak ?? 0,
    longestStreak: streakData?.longest_streak ?? 0,
    lastActivity: streakData?.last_activity_date,
    isLoading,
    recordActivity: recordActivity.mutate,
    isRecording: recordActivity.isPending,
    pendingMilestone,
    clearMilestone,
    checkIfActiveToday,
    milestones: STREAK_MILESTONES,
  };
}
