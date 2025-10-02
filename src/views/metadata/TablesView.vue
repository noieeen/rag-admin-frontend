<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Tables</h1>
          <p class="text-sm text-muted-foreground">Document table level metadata, usage patterns, and relevant columns.</p>
        </div>
        <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Register Table
        </button>
      </div>
      <div class="flex flex-wrap gap-2 text-sm">
        <input class="w-full rounded-md border border-border bg-background px-3 py-2 md:w-72" placeholder="Search tables" v-model="search" />
        <button class="rounded-md border border-border px-3 py-2">Columns</button>
        <button class="rounded-md border border-border px-3 py-2">Usage</button>
      </div>
    </header>

    <div class="overflow-hidden rounded-lg border border-border">
      <table class="min-w-full divide-y divide-border text-sm">
        <thead class="bg-muted/40 text-left">
          <tr>
            <th class="px-4 py-3 font-medium">Table</th>
            <th class="px-4 py-3 font-medium">Schema</th>
            <th class="px-4 py-3 font-medium">Row Estimate</th>
            <th class="px-4 py-3 font-medium">Sensitivity</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr v-if="query.isLoading.value">
            <td colspan="5" class="px-4 py-6 text-center text-muted-foreground">Loading tables...</td>
          </tr>
          <tr v-else-if="filteredTables.length === 0">
            <td colspan="5" class="px-4 py-6 text-center text-muted-foreground">No tables found</td>
          </tr>
          <tr v-else v-for="table in filteredTables" :key="table.table_id" class="border-b border-border hover:bg-muted/40">
            <td class="px-4 py-3 font-medium">{{ table.display_name?.en ?? table.table_name }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ table.schema ?? '—' }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ formatNumber(table.row_estimate ?? 0) }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ table.sensitivity ?? '—' }}</td>
            <td class="px-4 py-3 text-right text-muted-foreground">
              <button class="rounded-md border border-border px-2 py-1">Inspect</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useTables } from '@/composables/useMetadataQueries';
import { formatNumber } from '@/utils/formatters';

const query = useTables();
const search = ref('');
const tables = computed(() => query.data.value ?? []);

const filteredTables = computed(() => {
  const value = search.value.toLowerCase();
  if (!value) return tables.value;
  return tables.value.filter((table) => {
    const name = table.display_name?.en ?? table.table_name;
    return name.toLowerCase().includes(value);
  });
});
</script>
