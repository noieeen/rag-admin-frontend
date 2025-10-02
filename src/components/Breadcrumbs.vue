<template>
  <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm text-muted-foreground">
    <RouterLink to="/" class="hover:text-foreground">RAG Admin</RouterLink>
    <span>/</span>
    <span class="font-medium text-foreground">{{ activeTitle }}</span>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const activeTitle = computed(() => (route.meta?.title as string) ?? 'Overview');
</script>
