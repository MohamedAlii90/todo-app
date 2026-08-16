<script lang="ts">
  import '../app.css'
  import { goto, invalidateAll } from '$app/navigation'
  import { page } from '$app/state'
  import QacartMark from '$lib/components/QacartMark.svelte'
  import { hydrated } from '$lib/hydrated.svelte'
  import type { LayoutData } from './$types'

  let { data, children }: { data: LayoutData; children: any } = $props()

  const ready = hydrated()
  let loggingOut = $state(false)

  async function logout() {
    loggingOut = true
    try {
      await fetch('/api/v1/users/logout', { method: 'POST' })
      await invalidateAll()
      await goto('/login')
    } finally {
      loggingOut = false
    }
  }
</script>

<div class="min-h-screen bg-background bg-grid-fade flex flex-col">
  <header class="border-b border-border">
    <nav
      aria-label="Main"
      class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4"
    >
      <a
        href={data.user ? '/todo' : '/login'}
        aria-label="QAcart Todo home"
        data-testid="brand"
        class="flex items-center text-foreground transition-colors hover:text-primary"
      >
        <span class="w-9 shrink-0"><QacartMark /></span>
      </a>

      <div class="flex items-center gap-2 sm:gap-4">
        {#if data.user}
          <a
            href="/todo"
            data-testid="nav-todo"
            aria-current={page.url.pathname === '/todo' ? 'page' : undefined}
            class="rounded-pill px-3 py-2 text-sm transition-colors {page.url.pathname === '/todo'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            Todos
          </a>
          <span class="hidden text-sm text-muted-foreground sm:inline" data-testid="nav-user">
            {data.user.firstName}
          </span>
          <button type="button" onclick={logout} disabled={loggingOut || !ready.current} data-testid="logout" class="btn">
            {loggingOut ? 'Logging out…' : 'Logout'}
          </button>
        {:else}
          <a href="/login" data-testid="nav-login" class="btn">Login</a>
          <a href="/signup" data-testid="nav-signup" class="btn btn-primary">Signup</a>
        {/if}
      </div>
    </nav>
  </header>

  <main class="flex flex-1 items-center justify-center px-6 py-10">
    {@render children()}
  </main>
</div>
