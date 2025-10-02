<template>
  <div class="space-y-2">
    <p class="text-xs uppercase text-muted-foreground">Tenant</p>
    <select
      class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      :value="active.brandRef"
      @change="onSelect($event.target as HTMLSelectElement)"
    >
      <option v-for="tenant in tenants" :key="tenant.brandRef" :value="tenant.brandRef">
        {{ tenant.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useTenantStore } from '@/stores/tenant';

const tenantStore = useTenantStore();
const { tenants, activeTenant: active } = storeToRefs(tenantStore);

const onSelect = (select: HTMLSelectElement) => {
  const tenant = tenants.value.find((item) => item.brandRef === select.value);
  if (tenant) tenantStore.setTenant(tenant);
};
</script>
