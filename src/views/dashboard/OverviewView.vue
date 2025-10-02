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
          <div class="text-3xl font-semibold">{{ card.value }}</div>
        </CardContent>
      </Card>
    </div>

    <section class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">RAG Database Configuration</h2>
      <div class="flex items-center gap-3">
        <button class="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">Refresh</button>
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
      <Card v-for="metric in overviewMetrics" :key="metric.title">
        <CardHeader>
          <CardTitle>{{ metric.title }}</CardTitle>
          <CardDescription>{{ metric.subtitle }}</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-semibold">{{ metric.value }}</div>
        </CardContent>
      </Card>
    </div>

    <section class="space-y-3">
      <h3 class="text-lg font-semibold">Database Status</h3>
      <Card v-for="db in databaseStatus" :key="db.id">
        <CardContent class="flex items-center justify-between gap-3">
          <div>
            <p class="font-medium">{{ db.name }}</p>
            <p class="text-sm text-muted-foreground">{{ db.dialect }}</p>
          </div>
          <span :class="['rounded-full px-3 py-1 text-xs font-medium', db.connected ? 'bg-green-100 text-green-700' : 'bg-destructive/10 text-destructive']">
            {{ db.connected ? 'Connected' : 'Offline' }}
          </span>
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
import { useTenantStore } from '@/stores/tenant';

const route = useRoute();
const tenantStore = useTenantStore();

const topCards = computed(() => [
  { title: 'Connected Databases', description: 'Active database connections', value: '—' },
  { title: 'Query Templates', description: 'Configured templates', value: '—' },
  { title: 'Metadata Coverage', description: 'Documentation completeness', value: '—%' },
  { title: 'Schema Capture', description: 'One-click schema import', value: 'NEW' }
]);

const tabs = [
  { label: 'Overview', to: '/' },
  { label: 'Databases', to: '/databases' },
  { label: 'Tables', to: '/tables' },
  { label: 'Columns', to: '/columns' },
  { label: 'Relations', to: '/relationships' },
  { label: 'Templates', to: '/templates' },
  { label: 'Sql Patterns', to: '/sql-patterns' }
] as const;

const overviewMetrics = computed(() => [
  { title: 'Databases', subtitle: 'Registered instances', value: '0' },
  { title: 'Tables', subtitle: 'Documented tables', value: '0' },
  { title: 'Columns', subtitle: 'Documented columns', value: '0' },
  { title: 'Templates', subtitle: 'Query templates', value: '0' }
]);

const databaseStatus = computed(() => {
  const { brandRef } = tenantStore.activeTenant;
  return [
    { id: 'primary', name: `${brandRef} · Primary`, dialect: 'SQLServer', connected: false },
    { id: 'secondary', name: `${brandRef} · Replica`, dialect: 'SQLServer', connected: false }
  ];
});
</script>
