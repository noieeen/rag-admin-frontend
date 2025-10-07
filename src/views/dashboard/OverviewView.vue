<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <p class="text-sm uppercase tracking-wide text-muted-foreground">RAG Management</p>
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-semibold">Manage RAG database configuration</h1>
        <span class="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">Beta</span>
      </div>
      <p class="max-w-2xl text-sm text-muted-foreground">
        Monitor database coverage, embeddings, and AI-ready assets across all tenants. Use the tabs below to drill into detailed metadata.
      </p>
    </header>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card v-for="card in topCards" :key="card.title">
        <CardHeader>
          <CardTitle>{{ card.title }}</CardTitle>
          <CardDescription>{{ card.description }}</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-semibold">
            <span v-if="card.loading" class="animate-pulse text-muted-foreground">···</span>
            <span v-else>{{ card.value }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <section class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">RAG Database Configuration</h2>
      <div class="flex items-center gap-3">
        <button class="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted" @click="refetchAll">
          Refresh
        </button>
      </div>
    </section>

    <div class="flex flex-wrap gap-2 text-sm font-medium">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="rounded-full border border-border px-4 py-2 transition-colors hover:bg-muted"
        :class="route.path === tab.to ? 'bg-muted text-foreground' : 'text-muted-foreground'"
      >
        {{ tab.label }}
      </RouterLink>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card v-for="metric in overviewCards" :key="metric.title">
        <CardHeader>
          <CardTitle>{{ metric.title }}</CardTitle>
          <CardDescription>{{ metric.subtitle }}</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-semibold">
            <span v-if="metric.loading" class="animate-pulse text-muted-foreground">···</span>
            <span v-else>{{ metric.value }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <section class="space-y-3">
      <h3 class="text-lg font-semibold">Database Status</h3>
      <Card v-for="db in databaseStatus" :key="db.database_id">
        <CardContent class="flex items-center justify-between gap-3">
          <div>
            <p class="font-medium">{{ db.display_name?.en ?? db.database_name }}</p>
            <p class="text-sm text-muted-foreground">{{ db.dialect ?? '—' }}</p>
          </div>
          <span
            v-if="db.metadata?.status"
            :class="statusChipClass(db.metadata?.status === 'connected')"
          >
            {{ db.metadata?.status === 'connected' ? 'Connected' : 'Offline' }}
          </span>
          <span v-else class="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Unknown</span>
        </CardContent>
      </Card>
      <Card v-if="databaseStatus.length === 0">
        <CardContent class="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No databases registered yet.
        </CardContent>
      </Card>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';

import Card from '@/components/ui/Card.vue';
import CardHeader from '@/components/ui/CardHeader.vue';
import CardContent from '@/components/ui/CardContent.vue';
import CardTitle from '@/components/ui/CardTitle.vue';
import CardDescription from '@/components/ui/CardDescription.vue';
import { useOverviewSummary, useDatabases } from '@/composables/useMetadataQueries';

const route = useRoute();
const overviewQuery = useOverviewSummary();
const databasesQuery = useDatabases();

const topCards = computed(() => [
  {
    title: 'Connected Databases',
    description: 'Active database connections',
    value: overviewQuery.data.value?.databases ?? '—',
    loading: overviewQuery.isLoading.value
  },
  {
    title: 'Query Templates',
    description: 'Configured templates',
    value: overviewQuery.data.value?.templates ?? '—',
    loading: overviewQuery.isLoading.value
  },
  {
    title: 'Metadata Coverage',
    description: 'Documentation completeness',
    value: `${overviewQuery.data.value?.metadataCoverage ?? '—'}%`,
    loading: overviewQuery.isLoading.value
  },
  {
    title: 'Schema Capture',
    description: 'One-click schema import',
    value: 'NEW',
    loading: false
  }
]);

const tabs = [
  { label: 'Overview', to: '/' },
  { label: 'Databases', to: '/databases' },
  { label: 'Tables', to: '/tables' },
  { label: 'Columns', to: '/columns' },
  { label: 'Relations', to: '/relationships' },
  { label: 'Templates', to: '/templates' },
  { label: 'Sql Patterns', to: '/sql-patterns' },
  { label: 'Chat Playground', to: '/chat-playground' },
  { label: 'RAG Playground', to: '/rag-playground' },
  { label: 'Synonyms', to: '/synonyms' },
  { label: 'AI Control', to: '/ai-control' }
] as const;

const overviewCards = computed(() => [
  { title: 'Databases', subtitle: 'Registered instances', value: overviewQuery.data.value?.databases ?? 0, loading: overviewQuery.isLoading.value },
  { title: 'Tables', subtitle: 'Documented tables', value: overviewQuery.data.value?.tables ?? 0, loading: overviewQuery.isLoading.value },
  { title: 'Columns', subtitle: 'Documented columns', value: overviewQuery.data.value?.columns ?? 0, loading: overviewQuery.isLoading.value },
  { title: 'Templates', subtitle: 'Query templates', value: overviewQuery.data.value?.templates ?? 0, loading: overviewQuery.isLoading.value }
]);

const databaseStatus = computed(() => databasesQuery.data.value ?? []);

function refetchAll() {
  overviewQuery.refetch();
  databasesQuery.refetch();
}

const statusChipClass = (connected: boolean) =>
  connected
    ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700'
    : 'rounded-full bg-destructive/15 px-3 py-1 text-xs font-medium text-destructive';
</script>
