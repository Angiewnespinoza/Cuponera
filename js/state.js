export const STORAGE_KEY = 'cuponera_data_v1';

export let state = {
  coupons: [],
  lastAction: null,
  undoTimeoutId: null
};

export function setState(newState) {
  state = newState;
}
