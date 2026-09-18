import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { resolve } from 'node:path';
import { createStore } from '$lib/server/store';

const store = createStore(resolve('data'));

export const load = (({ params }) => {
  const result = store.workoutPage(params.name);
  if (!result) error(404, 'Workout not found.');
  return result;
}) satisfies PageServerLoad;
