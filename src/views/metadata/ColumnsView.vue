<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Columns</h1>
          <p class="text-sm text-muted-foreground">Track column-level semantics, sensitivity, and embedding coverage.</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="rounded-md border border-border px-3 py-2 text-sm"
            @click="exportColumns"
            :disabled="query.data.value?.length === 0"
          >
            Export JSON
          </button>
          <button
            class="rounded-md border border-border px-3 py-2 text-sm"
            @click="isImportOpen = true"
          >
            Import JSON
          </button>
          <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Add Column Metadata
          </button>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 text-sm">
        <input class="w-full rounded-md border border-border bg-background px-3 py-2 md:w-72" placeholder="Search columns" v-model="search" />
        <select class="rounded-md border border-border bg-background px-3 py-2" v-model="selectedSensitivity">
          <option value="">All sensitivity</option>
          <option v-for="option in sensitivityOptions" :key="option" :value="option">{{ option }}</option>
        </select>
        <select class="rounded-md border border-border bg-background px-3 py-2" v-model="selectedLanguage">
          <option value="">All languages</option>
          <option v-for="lang in languageOptions" :key="lang" :value="lang">{{ lang }}</option>
        </select>
      </div>
    </header>

    <div class="overflow-auto rounded-lg border border-border">
      <table class="min-w-full divide-y divide-border text-sm">
        <thead class="bg-muted/40 text-left">
          <tr>
            <th class="px-4 py-3 font-medium">Column</th>
            <th class="px-4 py-3 font-medium">Table</th>
            <th class="px-4 py-3 font-medium">Type</th>
            <th class="px-4 py-3 font-medium">Sensitivity</th>
            <th class="px-4 py-3 font-medium">Embedding</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr v-if="query.isLoading.value">
            <td colspan="6" class="px-4 py-6 text-center text-muted-foreground">Loading columns...</td>
          </tr>
          <tr v-else-if="filteredColumns.length === 0">
            <td colspan="6" class="px-4 py-6 text-center text-muted-foreground">No columns found</td>
          </tr>
          <tr v-else v-for="column in filteredColumns" :key="column.column_id" class="border-b border-border hover:bg-muted/40">
            <td class="px-4 py-3 font-medium">{{ column.display_name?.en ?? column.column_name }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ column.table_name }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ column.data_type }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ column.sensitivity ?? '—' }}</td>
            <td class="px-4 py-3 text-muted-foreground">
              <span :class="column.embedding ? 'text-emerald-600' : 'text-muted-foreground'">
                {{ column.embedding ? 'Ready' : 'Pending' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right text-muted-foreground">
              <button class="rounded-md border border-border px-2 py-1">Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ColumnImportDialog v-model:open="isImportOpen" @imported="onImported" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useColumns } from '@/composables/useMetadataQueries';
import ColumnImportDialog from './dialogs/ColumnImportDialog.vue';
import { downloadJson } from '@/utils/download';

const query = useColumns();
const search = ref('');
const selectedSensitivity = ref('');
const selectedLanguage = ref('');
const isImportOpen = ref(false);

const columns = computed(() => query.data.value ?? []);

const sensitivityOptions = computed(() => {
  const unique = new Set(columns.value.map((column) => column.sensitivity).filter(Boolean) as string[]);
  return Array.from(unique);
});

const languageOptions = computed(() => {
  const unique = new Set<string>();
  columns.value.forEach((column) => column.lang_available?.forEach((lang) => unique.add(lang)));
  return Array.from(unique);
});

const filteredColumns = computed(() => {
  return columns.value.filter((column) => {
    const name = column.display_name?.en ?? column.column_name;
    const matchesSearch = name.toLowerCase().includes(search.value.toLowerCase());
    const matchesSensitivity = selectedSensitivity.value ? column.sensitivity === selectedSensitivity.value : true;
    const matchesLanguage = selectedLanguage.value ? column.lang_available?.includes(selectedLanguage.value) : true;
    return matchesSearch && matchesSensitivity && matchesLanguage;
  });
});

function exportColumns() {
  if (!columns.value.length) return;
  const filename = `columns-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  downloadJson(filename, columns.value);
}

async function onImported() {
  isImportOpen.value = false;
  await query.refetch();
}
</script>
