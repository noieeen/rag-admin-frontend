<template>
    <section class="space-y-6">
      <header class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold">Synonyms Mapping</h1>
            <p class="text-sm text-muted-foreground">XXX</p>
          </div>
          <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            New Dict
          </button>
        </div>
        <div class="flex flex-wrap gap-2 text-sm">
          <input class="w-full rounded-md border border-border bg-background px-3 py-2 md:w-72" placeholder="Search metrics" v-model="search" />
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
        <Card v-for="metric in filteredMetrics" :key="metric.metric_id">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>{{ metric.metric_name.en }}</CardTitle>
              <span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{{ metric.short_name }}</span>
            </div>
            <CardDescription>{{ metric.description.en }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-2 text-sm text-muted-foreground">
            <p><strong class="text-foreground">Domain:</strong> {{ metric.business_domain }}</p>
            <p><strong class="text-foreground">Owner:</strong> {{ metric.business_owner }}</p>
            <p><strong class="text-foreground">Refresh:</strong> {{ metric.refresh_schedule }}</p>
            <p><strong class="text-foreground">Usage:</strong> {{ metric.usage_frequency }} queries</p>
          </CardContent>
        </Card>
        <Card v-if="filteredMetrics.length === 0">
          <CardContent class="flex items-center justify-center py-10 text-sm text-muted-foreground">
            No metrics match the current filters.
          </CardContent>
        </Card>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { computed, ref } from 'vue';

  import {Card, CardHeader, CardContent, CardTitle, CardDescription} from '@/components/ui/card';

  import { useMetrics } from '@/composables/useMetadataQueries';
  
  const query = useMetrics();
  const metrics = computed(() => query.data.value ?? []);
  const search = ref('');
  const selectedDomain = ref('');
  const selectedRefresh = ref('');
  
  const domains = computed(() => Array.from(new Set(metrics.value.map((metric) => metric.business_domain).filter(Boolean))));
  const schedules = computed(() => Array.from(new Set(metrics.value.map((metric) => metric.refresh_schedule).filter(Boolean))));
  
  const filteredMetrics = computed(() => {
    const searchValue = search.value.toLowerCase();
    return metrics.value.filter((metric) => {
      const matchesSearch = metric.metric_name.en.toLowerCase().includes(searchValue);
      const matchesDomain = selectedDomain.value ? metric.business_domain === selectedDomain.value : true;
      const matchesRefresh = selectedRefresh.value ? metric.refresh_schedule === selectedRefresh.value : true;
      return matchesSearch && matchesDomain && matchesRefresh;
    });
  });
  </script>
  