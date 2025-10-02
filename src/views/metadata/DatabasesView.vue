<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Databases</h1>
          <p class="text-sm text-muted-foreground">Manage registered databases and their metadata.</p>
        </div>
        <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90" @click="openCreate = true">
          New Database
        </button>
      </div>
      <div class="flex flex-wrap gap-2 text-sm">
        <input
          class="w-full rounded-md border border-border bg-background px-3 py-2 md:w-72"
          placeholder="Search databases"
          type="search"
          v-model="search"
        />
        <button class="rounded-md border border-border px-3 py-2">Filters</button>
      </div>
    </header>

    <div class="overflow-hidden rounded-lg border border-border">
      <table class="min-w-full divide-y divide-border text-sm">
        <thead class="bg-muted/40 text-left">
          <tr>
            <th class="px-4 py-3 font-medium">Name</th>
            <th class="px-4 py-3 font-medium">Dialect</th>
            <th class="px-4 py-3 font-medium">Tags</th>
            <th class="px-4 py-3 font-medium">Updated</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr v-if="query.isLoading.value">
            <td colspan="5" class="px-4 py-6 text-center text-muted-foreground">Loading databases...</td>
          </tr>
          <tr v-else-if="filteredDatabases.length === 0">
            <td colspan="5" class="px-4 py-6 text-center text-muted-foreground">No databases found</td>
          </tr>
          <tr
            v-else
            v-for="database in filteredDatabases"
            :key="database.database_id"
            class="border-b border-border hover:bg-muted/40"
          >
            <td class="px-4 py-3 font-medium">{{ database.display_name?.en ?? database.database_name }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ database.dialect ?? '—' }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ database.tags?.en?.slice(0, 3).join(', ') ?? '—' }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ formatDate(database.updated_at) }}</td>
            <td class="px-4 py-3 text-right text-muted-foreground">
              <button class="rounded-md border border-border px-2 py-1">Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CreateDatabaseDialog v-model:open="openCreate" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useDatabases } from '@/composables/useMetadataQueries';
import { formatIsoDate } from '@/utils/formatters';
import CreateDatabaseDialog from '@/views/metadata/dialogs/CreateDatabaseDialog.vue';

const query = useDatabases();
const search = ref('');
const openCreate = ref(false);

const databases = computed(() => query.data.value ?? []);
const filteredDatabases = computed(() => {
  const value = search.value.toLowerCase();
  if (!value) return databases.value;
  return databases.value.filter((db) => {
    const name = db.display_name?.en ?? db.database_name;
    return name.toLowerCase().includes(value);
  });
});

const formatDate = (value?: string) => (value ? formatIsoDate(value) : '—');
</script>
