import { error, fail } from '@sveltejs/kit';
import { resolve } from 'node:path';
import { createStore, InputError } from '$lib/server/store.js';

const store = createStore(resolve('data'));

export function load({ params }) {
  const person = store.personPage(params.name);
  if (!person) error(404, 'Person not found.');
  return person;
}

export const actions = {
  uploadPicture: async ({ params, request }) => {
    const form = await request.formData();
    try {
      await store.savePicture(params.name, form.get('picture'));
      return { success: true };
    } catch (error) {
      if (error instanceof InputError) return fail(400, { error: error.message });
      throw error;
    }
  }
};
