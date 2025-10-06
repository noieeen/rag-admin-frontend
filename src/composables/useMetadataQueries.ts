import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useQuery, useQueryClient, type QueryKey } from '@tanstack/vue-query';

import {
  getOverviewSummary,
  listBusinessMetrics,
  listColumns,
  listDatabases,
  listQueryTemplates,
  listSynonyms,
  listRelationships,
  listTables
} from '@/api/metadata';
import { useTenantStore } from '@/stores/tenant';

function useTenantAwareQuery<T>(key: QueryKey, fetcher: () => Promise<T>) {
  const tenantStore = useTenantStore();
  const queryClient = useQueryClient();
  const { activeTenant } = storeToRefs(tenantStore);

  const query = useQuery({
    queryKey: computed(() => [...key, activeTenant.value.brandRef, activeTenant.value.structure]),
    queryFn: fetcher
  });

  watch(
    () => activeTenant.value,
    () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
    { deep: true }
  );

  return query;
}

export function useOverviewSummary() {
  return useTenantAwareQuery(['metadata', 'overview'], getOverviewSummary);
}

export function useDatabases(withVector = false) {
  return useTenantAwareQuery(['metadata', 'databases', withVector], () => listDatabases(withVector));
}

export function useTables(withVector = false) {
  return useTenantAwareQuery(['metadata', 'tables', withVector], () => listTables(withVector));
}

export function useColumns(withVector = false) {
  return useTenantAwareQuery(['metadata', 'columns', withVector], () => listColumns(withVector));
}

export function useTemplates() {
  return useTenantAwareQuery(['metadata', 'templates'], listQueryTemplates);
}

export function useMetrics() {
  return useTenantAwareQuery(['metadata', 'metrics'], listBusinessMetrics);
}

export function useRelationships() {
  return useTenantAwareQuery(['metadata', 'relationships'], listRelationships);
}

export function useSynonyms(withVector = false) {
  return useTenantAwareQuery(['metadata', 'synonyms', withVector], () => listSynonyms(withVector));
}
