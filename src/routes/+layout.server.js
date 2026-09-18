import { resolve } from 'node:path';
import { createStore } from '$lib/server/store.js';

const store = createStore(resolve('data'));

export function load() {
  return store.options();
}
