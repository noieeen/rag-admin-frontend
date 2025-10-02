import { render, fireEvent, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it, beforeEach } from 'vitest';

import TenantSwitcher from '../TenantSwitcher.vue';

beforeEach(() => {
  const pinia = createPinia();
  setActivePinia(pinia);
});

describe('TenantSwitcher', () => {
  it('renders tenants and updates active tenant on change', async () => {
    render(TenantSwitcher);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    await fireEvent.update(select, 'BCRM_600_B2G2W894EP35');
    expect((select as HTMLSelectElement).value).toBe('BCRM_600_B2G2W894EP35');
  });
});
