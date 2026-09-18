import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { resolve } from 'node:path';
import { createStore } from '$lib/server/store';

const store = createStore(resolve('data'));

export const GET: RequestHandler = ({ params }) => {
  const picture = store.picture(params.name);
  if (!picture) error(404, 'Picture not found.');
  return new Response(picture.body, {
    headers: {
      'Content-Type': picture.contentType,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    }
  });
};
