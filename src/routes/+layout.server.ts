import { resolve } from 'node:path';
import type { LayoutServerLoad } from './$types';
import { createStore } from '$lib/server/store';

const store = createStore(resolve('data'));

export const load = (() => store.options()) satisfies LayoutServerLoad;
