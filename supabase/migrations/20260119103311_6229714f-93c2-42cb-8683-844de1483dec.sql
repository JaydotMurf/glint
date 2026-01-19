-- Add streak tracking columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- Function to update streak on activity
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE := CURRENT_DATE;
  v_streak_increased BOOLEAN := FALSE;
  v_is_new_streak BOOLEAN := FALSE;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM profiles WHERE id = p_user_id;

  -- If already active today, no change
  IF v_last_activity = v_today THEN
    RETURN json_build_object(
      'streak', v_current_streak, 
      'longest', v_longest_streak,
      'increased', FALSE,
      'is_new_streak', FALSE
    );
  END IF;

  -- Calculate new streak
  IF v_last_activity = v_today - 1 THEN
    -- Consecutive day - increase streak
    v_current_streak := COALESCE(v_current_streak, 0) + 1;
    v_streak_increased := TRUE;
  ELSIF v_last_activity IS NULL OR v_last_activity < v_today - 1 THEN
    -- Streak broken or first activity - reset to 1
    v_current_streak := 1;
    v_streak_increased := TRUE;
    v_is_new_streak := TRUE;
  END IF;

  -- Update longest streak
  IF v_current_streak > COALESCE(v_longest_streak, 0) THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Save changes
  UPDATE profiles
  SET current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_activity_date = v_today,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'streak', v_current_streak,
    'longest', v_longest_streak,
    'increased', v_streak_increased,
    'is_new_streak', v_is_new_streak
  );
END;
$$;