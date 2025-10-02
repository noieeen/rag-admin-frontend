import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'overview',
    component: () => import('@/views/dashboard/OverviewView.vue'),
    meta: { title: 'Overview' }
  },
  {
    path: '/databases',
    name: 'databases',
    component: () => import('@/views/metadata/DatabasesView.vue'),
    meta: { title: 'Databases' }
  },
  {
    path: '/tables',
    name: 'tables',
    component: () => import('@/views/metadata/TablesView.vue'),
    meta: { title: 'Tables' }
  },
  {
    path: '/columns',
    name: 'columns',
    component: () => import('@/views/metadata/ColumnsView.vue'),
    meta: { title: 'Columns' }
  },
  {
    path: '/relationships',
    name: 'relationships',
    component: () => import('@/views/metadata/RelationshipsView.vue'),
    meta: { title: 'Relations' }
  },
  {
    path: '/templates',
    name: 'templates',
    component: () => import('@/views/templates/TemplatesView.vue'),
    meta: { title: 'Templates' }
  },
  {
    path: '/sql-patterns',
    name: 'sql-patterns',
    component: () => import('@/views/templates/SqlPatternsView.vue'),
    meta: { title: 'SQL Patterns' }
  },
  {
    path: '/metrics',
    name: 'metrics',
    component: () => import('@/views/metrics/BusinessMetricsView.vue'),
    meta: { title: 'Business Metrics' }
  },
  {
    path: '/ai-control',
    name: 'ai-control',
    component: () => import('@/views/ai/AiControlView.vue'),
    meta: { title: 'AI Control' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} · RAG Admin`;
  }
});

export default router;
