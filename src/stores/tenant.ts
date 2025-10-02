import { defineStore } from 'pinia';

export interface TenantContext {
  brandRef: string;
  structure: string;
  label: string;
}

interface TenantState {
  tenants: TenantContext[];
  activeTenant: TenantContext;
}

const defaultTenants: TenantContext[] = [
  { brandRef: 'BL6ZLW8PXBXD', structure: 'L4', label: 'Brand 5 - CRM POS' },
  { brandRef: 'BCRM_600_B2G2W894EP35', structure: 'L4', label: 'Brand 600 - CRM POS' }
];

export const useTenantStore = defineStore('tenant', {
  state: (): TenantState => ({
    tenants: defaultTenants,
    activeTenant: defaultTenants[0]
  }),
  actions: {
    setTenant(tenant: TenantContext) {
      this.activeTenant = tenant;
    }
  }
});
