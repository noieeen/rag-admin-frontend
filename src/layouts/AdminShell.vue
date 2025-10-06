<template>
  <div class="flex min-h-screen bg-background text-foreground">
    <aside class="hidden w-64 border-r border-border bg-card md:flex md:flex-col">
      <div class="flex h-16 items-center border-b border-border px-6 text-lg font-semibold">
        <span>RAG Admin</span>
        <span class="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">Beta</span>
      </div>
      <nav class="flex-1 space-y-1 px-4 py-6">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          :class="isActive(item.to) ? 'bg-muted text-primary' : 'text-muted-foreground'"
        >
          <component :is="item.icon" class="h-4 w-4" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
      <div class="border-t border-border px-4 py-4">
        <TenantSwitcher />
      </div>
    </aside>

    <div class="flex min-h-screen flex-1 flex-col">
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background px-4">
        <button
          class="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground md:hidden"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <MenuIcon class="h-4 w-4" aria-hidden="true" />
          Menu
        </button>
        <div class="flex flex-1 items-center gap-3">
          <Breadcrumbs />
        </div>
        <div class="flex items-center gap-3">
          <CommandPalette />
          <UserMenu />
        </div>
      </header>

      <main class="flex-1 bg-background">
        <div class="container py-6">
          <RouterView />
        </div>
      </main>
    </div>
  </div>

  <transition name="fade">
    <div v-if="isSidebarOpen" class="fixed inset-0 z-40 flex md:hidden">
      <div class="fixed inset-0 bg-black/50" @click="isSidebarOpen = false" />
      <aside class="relative ml-auto flex w-64 flex-col border-l border-border bg-card">
        <div class="flex h-16 items-center border-b border-border px-6 text-lg font-semibold">
          RAG Admin
        </div>
        <nav class="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            :class="isActive(item.to) ? 'bg-muted text-primary' : 'text-muted-foreground'"
            @click="isSidebarOpen = false"
          >
            <component :is="item.icon" class="h-4 w-4" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
      </aside>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, RouterLink, RouterView } from 'vue-router';
import {
  Home,
  Database,
  Table,
  Columns,
  GitBranch,
  FileText,
  Layers,
  LineChart,
  Bot,
  Sparkles,
  Menu as MenuIcon
} from 'lucide-vue-next';

import TenantSwitcher from '@/components/TenantSwitcher.vue';
import UserMenu from '@/components/UserMenu.vue';
import CommandPalette from '@/components/CommandPalette.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';

const route = useRoute();
const isSidebarOpen = ref(false);

const navItems = [
  { to: '/', label: 'Overview', icon: Home },
  { to: '/databases', label: 'Databases', icon: Database },
  { to: '/tables', label: 'Tables', icon: Table },
  { to: '/columns', label: 'Columns', icon: Columns },
  { to: '/relationships', label: 'Relations', icon: GitBranch },
  { to: '/templates', label: 'Templates', icon: FileText },
  { to: '/sql-patterns', label: 'SQL Patterns', icon: Layers },
  { to: '/metrics', label: 'Business Metrics', icon: LineChart },
  { to: '/rag-playground', label: 'RAG Playground', icon: Sparkles },
  { to: '/ai-control', label: 'AI Control', icon: Bot }
] as const;

const isActive = computed(() => (path: string) => {
  return route.path === path || route.path.startsWith(`${path}/`);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
