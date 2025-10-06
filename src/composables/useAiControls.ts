import { computed, type ComputedRef, type Ref, unref } from 'vue';
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

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>;

export function useEmbeddingJobs(options: { enabled?: MaybeRef<boolean> } = {}) {
  const pollingEnabled = computed(() =>
    options.enabled === undefined ? true : Boolean(unref(options.enabled))
  );

  const query = useQuery({
    queryKey: ['ai', 'embedding-jobs'],
    queryFn: listEmbeddingJobs,
    enabled: pollingEnabled,
    refetchInterval: () => (pollingEnabled.value ? 10_000 : false),
    refetchOnWindowFocus: false
  });

  const queryClient = useQueryClient();

  const trigger = useMutation({
    mutationFn: ({ resource, ids }: { resource: string; ids: string[] }) => triggerEmbeddingRefresh(resource, ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai', 'embedding-jobs'] })
  });

  const triggerPending = computed(() => trigger.status.value === 'pending');

  return {
    ...query,
    triggerRefresh: trigger.mutateAsync,
    triggering: triggerPending,
    pollingEnabled
  };
}
