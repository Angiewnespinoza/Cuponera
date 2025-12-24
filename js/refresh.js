import { loadState } from './storage.js';
import { renderCoupons } from './render.js';
import { invalidateAdminCache } from './actions-admin.js';

export async function refreshAll() {
  await loadState();     // cupones
  renderCoupons();       // UI principal
  invalidateAdminCache(); // selects admin
}