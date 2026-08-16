<script lang="ts">
  import { Trash2 } from 'lucide-svelte'
  import { hydrated } from '$lib/hydrated.svelte'
  import type { Task } from '$lib/types'

  let {
    todo,
    onToggle,
    onDelete,
  }: {
    todo: Task
    onToggle: (id: number, isCompleted: boolean) => Promise<void> | void
    onDelete: (id: number) => Promise<void> | void
  } = $props()

  const ready = hydrated()
  let busy = $state(false)

  async function toggle() {
    busy = true
    try {
      await onToggle(todo.id, !todo.isCompleted)
    } finally {
      busy = false
    }
  }

  async function remove() {
    busy = true
    try {
      await onDelete(todo.id)
    } finally {
      busy = false
    }
  }
</script>

<li
  data-testid="todo-item"
  data-completed={todo.isCompleted}
  class="flex items-center gap-3 rounded-card border px-4 py-3 transition-colors {todo.isCompleted
    ? 'border-secondary/40 bg-secondary/10'
    : 'border-border bg-ever-surface'}"
>
  <input
    type="checkbox"
    checked={todo.isCompleted}
    onchange={toggle}
    disabled={busy || !ready.current}
    data-testid="complete-task"
    aria-label={todo.isCompleted ? `Mark ${todo.item} as active` : `Mark ${todo.item} as completed`}
    class="h-5 w-5 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
  />

  <span
    data-testid="todo-text"
    class="flex-1 break-words text-sm {todo.isCompleted
      ? 'text-muted-foreground line-through'
      : 'text-foreground'}"
  >
    {todo.item}
  </span>

  <button
    type="button"
    onclick={remove}
    disabled={busy || !ready.current}
    data-testid="delete"
    aria-label={`Delete ${todo.item}`}
    class="shrink-0 rounded-pill p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Trash2 size={18} />
  </button>
</li>
