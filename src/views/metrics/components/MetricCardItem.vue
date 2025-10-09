<template>
  <CardHeader>
    <div class="flex items-center justify-between">
      <CardTitle>{{ metricTitle }}</CardTitle>
      <span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{{ metric.short_name }}</span>
    </div>
    <CardDescription>{{ metricDescription }}</CardDescription>
  </CardHeader>
  <CardContent class="space-y-2 text-sm text-muted-foreground">
    <p><strong class="text-foreground">Domain:</strong> {{ metric.business_domain }}</p>
    <p><strong class="text-foreground">Owner:</strong> {{ metric.business_owner }}</p>
    <p><strong class="text-foreground">Refresh:</strong> {{ metric.refresh_schedule }}</p>
    <p><strong class="text-foreground">Usage:</strong> {{ metric.usage_frequency ?? '—' }} queries</p>
  </CardContent>
</template>

<script setup lang="ts">
import {computed} from 'vue';

import {CardHeader, CardContent, CardTitle, CardDescription} from '@/components/ui/card';
import type {BusinessMetricMetadata} from '@/types/metadata';

const props = defineProps<{ metric: BusinessMetricMetadata }>();

const metric = computed(() => props.metric);

const metricTitle = computed(
    () => metric.value.metric_name?.en ?? metric.value.metric_name?.th ?? metric.value.short_name
);

const metricDescription = computed(
    () => metric.value.description?.en ?? metric.value.description?.th ?? 'No description'
);
</script>
