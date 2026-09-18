import { error } from '@sveltejs/kit';
import { resolve } from 'node:path';
import { createStore } from '$lib/server/store.js';

const store = createStore(resolve('data'));

export function load({ params }) {
  const result = store.workoutPage(params.name);
  if (!result) error(404, 'Workout not found.');
  return result;
}
