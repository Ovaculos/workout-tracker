import { fail, redirect } from '@sveltejs/kit';
import { resolve } from 'node:path';
import { createStore, InputError } from '$lib/server/store.js';

const store = createStore(resolve('data'));

export function load() {
  return store.dashboard();
}

function action(save) {
  return async ({ request }) => {
    const input = Object.fromEntries(await request.formData());
    try {
      save(input);
      return { success: true };
    } catch (error) {
      if (error instanceof InputError) return fail(400, { error: error.message });
      throw error;
    }
  };
}

export const actions = {
  addPerson: action((input) => store.addPerson(input.name)),
  addWorkoutType: action((input) => store.addWorkoutType(input)),
  logWorkout: action((input) => store.logWorkout(input)),
  deleteWorkout: action((input) => store.deleteWorkout(input)),
  deletePerson: action((input) => {
    store.deletePerson(input.person);
    redirect(303, '/');
  }),
  deleteWorkoutType: action((input) => {
    store.deleteWorkoutType(input.workoutName);
    redirect(303, '/');
  })
};
