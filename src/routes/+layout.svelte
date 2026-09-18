<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Actions from '$lib/Actions.svelte';

  let { data, children } = $props();

  function escape(event) {
    if (event.key !== 'Escape' || event.defaultPrevented || event.repeat || event.isComposing) return;
    if (document.querySelector('dialog[open]')) return;
    if (page.url.pathname !== '/') {
      event.preventDefault();
      goto('/');
    }
  }
</script>

<svelte:window onkeydown={escape} />

<Actions
  {data}
  dashboard={page.url.pathname === '/'}
  person={page.route.id === '/people/[name]' ? page.params.name : ''}
  workout={page.route.id === '/workouts/[name]' ? page.params.name : ''}
/>

{@render children()}
