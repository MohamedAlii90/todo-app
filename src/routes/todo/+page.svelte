<script lang="ts">
  import { Plus } from 'lucide-svelte'
  import { invalidateAll } from '$app/navigation'
  import TodoItem from '$lib/components/TodoItem.svelte'
  import Pagination from '$lib/components/Pagination.svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const PER_PAGE = 5

  let currentPage = $state(1)
  let actionError = $state('')

  const todos = $derived(data.tasks)

  // The page number is clamped to the list length, so deleting the last item on
  // the last page moves you back rather than showing an empty page.
  const totalPages = $derived(Math.max(1, Math.ceil(todos.length / PER_PAGE)))
  const safePage = $derived(Math.min(currentPage, totalPages))
  const visibleTodos = $derived(todos.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE))

  function greeting(): string {
    const hour = new Date().getHours()
    if (hour <= 5) return 'Time to sleep'
    if (hour <= 12) return 'Good morning'
    if (hour <= 17) return 'Good afternoon'
    return 'Good evening'
  }

  function displayName(name: string | undefined): string {
    if (!name || name.length < 2 || name.includes('@') || name.includes('.')) return 'User'
    return name
  }

  async function toggle(id: number, isCompleted: boolean) {
    actionError = ''
    const response = await fetch(`/api/v1/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted }),
    })
    if (!response.ok) {
      actionError = (await response.json()).message ?? 'Could not update the todo'
      return
    }
    await invalidateAll()
  }

  async function remove(id: number) {
    actionError = ''
    const response = await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      actionError = (await response.json()).message ?? 'Could not delete the todo'
      return
    }
    await invalidateAll()
  }
</script>

<svelte:head>
  <title>QAcart Todo App - Todos page</title>
</svelte:head>

<div class="w-full max-w-xl">
  <section class="surface space-y-4 p-8">
    <div>
      <span class="eyebrow">Your list</span>
      <h1 data-testid="welcome" class="font-display text-3xl font-bold text-foreground">
        {greeting()} {displayName(data.user?.firstName)}
      </h1>
    </div>

    <a
      href="/todo/new"
      data-testid="add"
      class="inline-flex items-center gap-2 pt-2 text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      <span
        class="flex h-8 w-8 items-center justify-center rounded-pill border border-border text-primary"
      >
        <Plus size={16} />
      </span>
      Add a new Todo
    </a>

    {#if actionError}
      <p role="alert" data-testid="error-message" class="rounded-card border border-destructive bg-destructive/15 px-4 py-3 text-sm text-destructive">
        {actionError}
      </p>
    {/if}

    {#if visibleTodos.length}
      <ul data-testid="todo-list" class="space-y-3">
        {#each visibleTodos as todo (todo.id)}
          <TodoItem {todo} onToggle={toggle} onDelete={remove} />
        {/each}
      </ul>
    {:else}
      <p data-testid="no-todos" class="py-6 text-center text-sm text-muted-foreground">
        No Available Todos
      </p>
    {/if}

    {#if todos.length > PER_PAGE}
      <Pagination
        currentPage={safePage}
        totalItems={todos.length}
        perPage={PER_PAGE}
        onPaginate={(page) => (currentPage = page)}
      />
    {/if}
  </section>
</div>
