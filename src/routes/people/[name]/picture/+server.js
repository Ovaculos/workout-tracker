import { error } from '@sveltejs/kit';
import { resolve } from 'node:path';
import { createStore } from '$lib/server/store.js';

const store = createStore(resolve('data'));

export function GET({ params }) {
  const picture = store.picture(params.name);
  if (!picture) error(404, 'Picture not found.');
  return new Response(picture.body, {
    headers: {
      'Content-Type': picture.contentType,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
