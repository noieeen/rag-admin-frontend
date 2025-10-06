<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Business Metrics</h1>
          <p class="text-sm text-muted-foreground">Define curated metrics with calculation logic, owners, and embedding
            coverage.</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="rounded-md border border-border px-3 py-2 text-sm"
            @click="exportMetrics"
            :disabled="query.data.value.length === 0"
          >
            Export JSON
          </button>
          <button
            class="rounded-md border border-border px-3 py-2 text-sm"
            @click="isImportOpen = true"
          >
            Import JSON
          </button>
          <button
            class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            @click="openCreate()"
          >
            New Metric
          </button>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 text-sm">
        <input class="w-full rounded-md border border-border bg-background px-3 py-2 md:w-72"
               placeholder="Search metrics" v-model="search"/>
        <select class="rounded-md border border-border bg-background px-3 py-2" v-model="selectedDomain">
          <option value="">All domains</option>
          <option v-for="domain in domains" :key="domain" :value="domain">{{ domain }}</option>
        </select>
        <select class="rounded-md border border-border bg-background px-3 py-2" v-model="selectedRefresh">
          <option value="">All schedules</option>
          <option v-for="schedule in schedules" :key="schedule" :value="schedule">{{ schedule }}</option>
        </select>
      </div>
    </header>

    <div v-if="query.isLoading.value" class="rounded-lg border border-border p-6 text-center text-muted-foreground">
      Loading metrics...
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <Card v-for="metric in filteredMetrics" :key="metric.metric_id" class="flex flex-col">
        <MetricCardItem :metric="metric" />
        <CardContent class="mt-auto flex items-center justify-end gap-2 border-t border-border pt-4 text-sm">
          <button
            class="rounded-md border border-border px-3 py-2 text-muted-foreground hover:bg-muted"
            @click="openEdit(metric)"
          >
            Edit
          </button>
          <button
            class="rounded-md border border-border px-3 py-2 text-destructive hover:bg-destructive/10"
            :disabled="isDeleting === metric.metric_id"
            @click="removeMetric(metric)"
          >
            {{ isDeleting === metric.metric_id ? 'Removing…' : 'Delete' }}
          </button>
        </CardContent>
      </Card>
      <Card v-if="filteredMetrics.length === 0">
        <CardContent class="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No metrics match the current filters.
        </CardContent>
      </Card>
    </div>

    <MetricFormDialog v-model:open="isDialogOpen" :metric="activeMetric" @saved="onSaved" />
    <MetricImportDialog v-model:open="isImportOpen" @imported="onImported" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import Card from '@/components/ui/Card.vue';
import CardContent from '@/components/ui/CardContent.vue';
import { useMetrics } from '@/composables/useMetadataQueries';
import { deleteBusinessMetric } from '@/api/metadata';
import type { BusinessMetricMetadata } from '@/types/metadata';
import MetricCardItem from './components/MetricCardItem.vue';
import MetricFormDialog from './dialogs/MetricFormDialog.vue';
import MetricImportDialog from './dialogs/MetricImportDialog.vue';
import { downloadJson } from '@/utils/download';

const query = useMetrics();
const metrics = computed(() => query.data.value ?? []);
const search = ref('');
const selectedDomain = ref('');
const selectedRefresh = ref('');
const isDialogOpen = ref(false);
const activeMetric = ref<BusinessMetricMetadata | null>(null);
const isDeleting = ref<string | null>(null);
const isImportOpen = ref(false);

const domains = computed(() => Array.from(new Set(metrics.value.map((metric) => metric.business_domain).filter(Boolean))));
const schedules = computed(() => Array.from(new Set(metrics.value.map((metric) => metric.refresh_schedule).filter(Boolean))));

const filteredMetrics = computed(() => {
  const searchValue = search.value.toLowerCase();
  return metrics.value.filter((metric) => {
    const title = metric.metric_name?.en ?? metric.metric_name?.th ?? metric.short_name ?? '';
    const matchesSearch = title.toLowerCase().includes(searchValue);
    const matchesDomain = selectedDomain.value ? metric.business_domain === selectedDomain.value : true;
    const matchesRefresh = selectedRefresh.value ? metric.refresh_schedule === selectedRefresh.value : true;
    return matchesSearch && matchesDomain && matchesRefresh;
  });
});

function openCreate() {
  activeMetric.value = null;
  isDialogOpen.value = true;
}

function openEdit(metric: BusinessMetricMetadata) {
  activeMetric.value = metric;
  isDialogOpen.value = true;
}

async function removeMetric(metric: BusinessMetricMetadata) {
  if (isDeleting.value || !metric.metric_id) return;
  const confirmed = window.confirm(`Delete metric "${metric.metric_name?.en ?? metric.short_name}"?`);
  if (!confirmed) return;

  try {
    isDeleting.value = metric.metric_id;
    await deleteBusinessMetric(metric.metric_id);
    await query.refetch();
  } catch (error) {
    // surface minimal alert to avoid silent failure
    alert((error as Error).message ?? 'Failed to delete metric');
  } finally {
    isDeleting.value = null;
  }
}

async function onSaved() {
  isDialogOpen.value = false;
  activeMetric.value = null;
  await query.refetch();
}

async function onImported() {
  isImportOpen.value = false;
  await query.refetch();
}

function exportMetrics() {
  if (!metrics.value.length) return;
  const filename = `business-metrics-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  downloadJson(filename, metrics.value);
}
</script>
