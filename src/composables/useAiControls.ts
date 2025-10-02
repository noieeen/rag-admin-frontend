import { computed } from 'vue';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

import { listEmbeddingJobs, listModels, setDefaultModel, triggerEmbeddingRefresh } from '@/api/ai';

export function useModels() {
  const query = useQuery({
    queryKey: ['ai', 'models'],
    queryFn: listModels,
    staleTime: 1000 * 60 * 5
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: setDefaultModel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai', 'models'] })
  });

  const defaultModel = computed(() => query.data.value?.find((model) => model.default));

  return { ...query, setDefaultModel: mutation.mutateAsync, defaultModel };
}

export function useEmbeddingJobs() {
  const query = useQuery({
    queryKey: ['ai', 'embedding-jobs'],
    queryFn: listEmbeddingJobs,
    refetchInterval: 10_000
  });

  const queryClient = useQueryClient();

  const trigger = useMutation({
    mutationFn: ({ resource, ids }: { resource: string; ids: string[] }) => triggerEmbeddingRefresh(resource, ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai', 'embedding-jobs'] })
  });

  return {
    ...query,
    triggerRefresh: trigger.mutateAsync,
    triggering: trigger.isLoading
  };
}
