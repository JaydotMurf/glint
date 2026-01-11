import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type ReviewStatus = 'new' | 'learning' | 'mastered';

export interface Flashcard {
  id: string;
  concept_id: string;
  user_id: string;
  front_text: string;
  back_text: string;
  review_status: ReviewStatus;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  created_at: string;
}

export interface FlashcardInput {
  front: string;
  back: string;
}

export function useFlashcards(conceptId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: flashcards = [], isLoading, error } = useQuery({
    queryKey: ['flashcards', conceptId],
    queryFn: async () => {
      const query = supabase
        .from('flashcards')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (conceptId) {
        query.eq('concept_id', conceptId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Flashcard[];
    },
    enabled: !!user && !!conceptId,
  });

  const saveFlashcards = useMutation({
    mutationFn: async ({ 
      conceptId: cId, 
      flashcards: cards 
    }: { 
      conceptId: string; 
      flashcards: FlashcardInput[] 
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const flashcardsToInsert = cards.map((card) => ({
        concept_id: cId,
        user_id: user.id,
        front_text: card.front,
        back_text: card.back,
        review_status: 'new' as ReviewStatus,
      }));

      const { data, error } = await supabase
        .from('flashcards')
        .insert(flashcardsToInsert)
        .select();
      
      if (error) throw error;
      return data as Flashcard[];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', variables.conceptId] });
    },
    onError: (error) => {
      console.error('Failed to save flashcards:', error);
      toast.error('Failed to save flashcards');
    },
  });

  const updateFlashcardStatus = useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string; 
      status: ReviewStatus 
    }) => {
      const now = new Date().toISOString();
      
      // Calculate next review date based on status (simple spaced repetition)
      let nextReview: string | null = null;
      if (status === 'learning') {
        // Review again in 1 day
        nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (status === 'mastered') {
        // Review again in 7 days
        nextReview = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { error } = await supabase
        .from('flashcards')
        .update({
          review_status: status,
          last_reviewed_at: now,
          next_review_at: nextReview,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
    onError: (error) => {
      console.error('Failed to update flashcard:', error);
    },
  });

  const deleteFlashcardsForConcept = useMutation({
    mutationFn: async (cId: string) => {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('concept_id', cId);
      
      if (error) throw error;
    },
    onSuccess: (_, cId) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', cId] });
    },
  });

  return { 
    flashcards, 
    isLoading, 
    error,
    saveFlashcards, 
    updateFlashcardStatus,
    deleteFlashcardsForConcept,
  };
}
