<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Synonym Mappings</h1>
          <p class="text-sm text-muted-foreground">
            Manage canonical terms and their aliases to improve search and retrieval matching.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="rounded-md border border-border px-3 py-2 text-sm"
            @click="synonymsQuery.refetch()"
          >
            Refresh
          </button>
          <button
            class="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            @click="isCreateOpen = true"
          >
            New Synonym
          </button>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <input
          v-model="search"
          class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm md:w-80"
          placeholder="Search canonical term or alias"
          type="search"
        />
      </div>
    </header>

    <div class="overflow-hidden rounded-lg border border-border">
      <table class="min-w-full divide-y divide-border text-sm">
        <thead class="bg-muted/40 text-left">
          <tr>
            <th class="px-4 py-3 font-medium">Canonical Term</th>
            <th class="px-4 py-3 font-medium">Aliases</th>
            <th class="px-4 py-3 font-medium">Entity Type</th>
            <th class="px-4 py-3 font-medium">Entity ID</th>
            <th class="px-4 py-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="synonymsQuery.isLoading.value">
            <td colspan="5" class="px-4 py-6 text-center text-muted-foreground">Loading synonym mappings…</td>
          </tr>
          <tr v-else-if="filteredSynonyms.length === 0">
            <td colspan="5" class="px-4 py-6 text-center text-muted-foreground">No synonym mappings found</td>
          </tr>
          <tr
            v-else
            v-for="mapping in filteredSynonyms"
            :key="mapping.canonical_term"
            class="border-b border-border hover:bg-muted/40"
          >
            <td class="px-4 py-3 font-medium">{{ mapping.canonical_term }}</td>
            <td class="px-4 py-3">
              <span
                v-for="alias in mapping.aliases"
                :key="alias"
                class="mr-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {{ alias }}
              </span>
            </td>
            <td class="px-4 py-3 text-muted-foreground">{{ mapping.entity_type }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ mapping.entity_id ?? '—' }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ formatDate(mapping.updated_at ?? mapping.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <CreateSynonymMappingDialog v-model:open="isCreateOpen" @created="synonymsQuery.refetch()" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSynonyms } from '@/composables/useMetadataQueries';
import CreateSynonymMappingDialog from '@/views/synonyms/dialogs/CreateSynonymMappingDialog.vue';
import { formatIsoDate } from '@/utils/formatters';

const synonymsQuery = useSynonyms();
const search = ref('');
const isCreateOpen = ref(false);

const synonyms = computed(() => synonymsQuery.data.value ?? []);

const filteredSynonyms = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return synonyms.value;
  return synonyms.value.filter((mapping) => {
    const canonical = mapping.canonical_term.toLowerCase();
    const aliasMatch = mapping.aliases.some((alias) => alias.toLowerCase().includes(term));
    return canonical.includes(term) || aliasMatch;
  });
});

function formatDate(value?: string) {
  if (!value) return '—';
  return formatIsoDate(value);
}
</script>
