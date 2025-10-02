<template>
  <div>
    <button
      class="hidden items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted md:flex"
      type="button"
      @click="open = true"
    >
      <kbd class="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">⌘K</kbd>
      <span>Search</span>
    </button>

    <teleport to="body">
      <transition name="fade">
        <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4">
          <div class="mt-20 w-full max-w-2xl rounded-lg border border-border bg-background shadow-xl">
            <div class="border-b border-border px-4 py-3">
              <input
                ref="inputRef"
                v-model="term"
                type="search"
                placeholder="Search databases, tables, columns, metrics..."
                class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                @keydown.esc.prevent="close"
              />
            </div>
            <div class="max-h-96 overflow-y-auto">
              <template v-if="isLoading">
                <p class="px-4 py-6 text-sm text-muted-foreground">Loading catalog...</p>
              </template>
              <template v-else-if="filteredResults.length === 0">
                <p class="px-4 py-6 text-sm text-muted-foreground">No results for “{{ term }}”.</p>
              </template>
              <ul v-else class="divide-y divide-border text-sm">
                <li v-for="item in filteredResults" :key="item.id" class="px-4 py-3 hover:bg-muted/60">
                  <RouterLink :to="item.to" class="flex flex-col gap-1" @click="close">
                    <span class="font-medium text-foreground">{{ item.title }}</span>
                    <span class="text-xs uppercase text-muted-foreground">{{ item.category }}</span>
                    <span class="text-xs text-muted-foreground">{{ item.description }}</span>
                  </RouterLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import { useColumns, useDatabases, useMetrics, useTables, useTemplates } from '@/composables/useMetadataQueries';

const open = ref(false);
const term = ref('');
const inputRef = ref<HTMLInputElement>();

const databaseQuery = useDatabases(false);
const tableQuery = useTables(false);
const columnQuery = useColumns(false);
const metricQuery = useMetrics();
const templateQuery = useTemplates();

const isLoading = computed(
  () =>
    databaseQuery.isLoading.value ||
    tableQuery.isLoading.value ||
    columnQuery.isLoading.value ||
    metricQuery.isLoading.value ||
    templateQuery.isLoading.value
);

const results = computed(() => {
  return [
    ...(databaseQuery.data.value ?? []).map((db) => ({
      id: db.database_id,
      title: db.display_name?.en ?? db.database_name,
      description: db.description?.en ?? 'Database',
      category: 'Database',
      to: '/databases'
    })),
    ...(tableQuery.data.value ?? []).map((table) => ({
      id: table.table_id,
      title: table.display_name?.en ?? table.table_name,
      description: table.description?.en ?? 'Table',
      category: 'Table',
      to: '/tables'
    })),
    ...(columnQuery.data.value ?? []).map((column) => ({
      id: column.column_id,
      title: column.display_name?.en ?? column.column_name,
      description: column.description?.en ?? 'Column',
      category: 'Column',
      to: '/columns'
    })),
    ...(metricQuery.data.value ?? []).map((metric) => ({
      id: metric.metric_id,
      title: metric.metric_name.en,
      description: metric.description.en,
      category: 'Metric',
      to: '/metrics'
    })),
    ...(templateQuery.data.value ?? []).map((template) => ({
      id: template.query_template_id,
      title: template.natural_language_question.en,
      description: template.sql_statement,
      category: 'Template',
      to: '/templates'
    }))
  ];
});

const filteredResults = computed(() => {
  const value = term.value.trim().toLowerCase();
  if (!value) return results.value.slice(0, 15);
  return results.value.filter((item) =>
    [item.title, item.description, item.category].some((field) => field?.toLowerCase().includes(value))
  );
});

watch(open, async (value) => {
  if (value) {
    await nextTick();
    inputRef.value?.focus();
  } else {
    term.value = '';
  }
});

function close() {
  open.value = false;
}

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    open.value = !open.value;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
