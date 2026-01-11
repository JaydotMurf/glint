import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SavedConcept {
  id: string;
  user_id: string;
  topic: string;
  input_text: string | null;
  explanation_simplest: string | null;
  explanation_standard: string | null;
  explanation_deep: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConceptInput {
  topic: string;
  input_text?: string;
  explanation_simplest: string;
  explanation_standard: string;
  explanation_deep: string;
}

export function useSavedConcepts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: concepts = [], isLoading, error } = useQuery({
    queryKey: ['saved-concepts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_concepts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SavedConcept[];
    },
    enabled: !!user,
  });

  const saveConcept = useMutation({
    mutationFn: async (concept: ConceptInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('saved_concepts')
        .insert({
          user_id: user.id,
          topic: concept.topic,
          input_text: concept.input_text || null,
          explanation_simplest: concept.explanation_simplest,
          explanation_standard: concept.explanation_standard,
          explanation_deep: concept.explanation_deep,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as SavedConcept;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-concepts'] });
      toast.success('Saved to your library!', {
        description: 'You can review this anytime.',
      });
    },
    onError: (error) => {
      console.error('Failed to save concept:', error);
      toast.error('Failed to save concept', {
        description: 'Please try again.',
      });
    },
  });

  const deleteConcept = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_concepts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-concepts'] });
      toast.success('Removed from library');
    },
    onError: (error) => {
      console.error('Failed to delete concept:', error);
      toast.error('Failed to delete concept');
    },
  });

  const getConceptById = (id: string) => {
    return concepts.find((c) => c.id === id);
  };

  return { 
    concepts, 
    isLoading, 
    error,
    saveConcept, 
    deleteConcept,
    getConceptById,
  };
}
