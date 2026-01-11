import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const FREE_DAILY_LIMIT = 3;
const LOCAL_STORAGE_KEY = 'glint_usage';

interface LocalUsage {
  count: number;
  date: string;
}

function getLocalUsage(): LocalUsage {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse local usage:', e);
  }
  return { count: 0, date: new Date().toISOString().split('T')[0] };
}

function setLocalUsage(usage: LocalUsage) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(usage));
}

export function useUsageLimit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  // Local state for anonymous users
  const [localUsage, setLocalUsageState] = useState<LocalUsage>(getLocalUsage);

  // Sync local usage with localStorage
  useEffect(() => {
    const stored = getLocalUsage();
    // Reset if it's a new day
    if (stored.date !== today) {
      const newUsage = { count: 0, date: today };
      setLocalUsage(newUsage);
      setLocalUsageState(newUsage);
    } else {
      setLocalUsageState(stored);
    }
  }, [today]);

  // Fetch profile for authenticated users
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('daily_usage_count, last_usage_date, plan_type')
        .eq('id', user!.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  // Calculate usage values
  const isNewDay = profile?.last_usage_date !== today;
  const dbUsageCount = isNewDay ? 0 : (profile?.daily_usage_count ?? 0);
  
  // Use DB count for logged-in users, local count for anonymous
  const usageCount = user ? dbUsageCount : localUsage.count;
  const isPremium = profile?.plan_type === 'premium';
  const canGenerate = isPremium || usageCount < FREE_DAILY_LIMIT;
  const remainingUses = Math.max(0, FREE_DAILY_LIMIT - usageCount);

  // Increment usage for authenticated users
  const incrementUsage = useMutation({
    mutationFn: async () => {
      if (!user) {
        // For anonymous users, update local storage
        const newUsage = { count: localUsage.count + 1, date: today };
        setLocalUsage(newUsage);
        setLocalUsageState(newUsage);
        return;
      }

      // For authenticated users, update database
      const newCount = isNewDay ? 1 : dbUsageCount + 1;
      const { error } = await supabase
        .from('profiles')
        .update({ 
          daily_usage_count: newCount,
          last_usage_date: today
        })
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      }
    },
  });

  // Sync local usage to DB when user logs in
  useEffect(() => {
    const syncLocalToDb = async () => {
      if (!user || !profile) return;
      
      // If user has local usage from before login, sync it
      const stored = getLocalUsage();
      if (stored.date === today && stored.count > 0) {
        const newCount = isNewDay 
          ? stored.count 
          : Math.max(dbUsageCount, stored.count);
        
        await supabase
          .from('profiles')
          .update({ 
            daily_usage_count: newCount,
            last_usage_date: today
          })
          .eq('id', user.id);
        
        // Clear local storage after sync
        setLocalUsage({ count: 0, date: today });
        setLocalUsageState({ count: 0, date: today });
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      }
    };
    
    syncLocalToDb();
  }, [user, profile, today, isNewDay, dbUsageCount, queryClient]);

  return { 
    usageCount, 
    remainingUses, 
    canGenerate, 
    isPremium, 
    incrementUsage,
    isLoading: user ? profileLoading : false,
    FREE_DAILY_LIMIT,
  };
}
