<script lang="ts">
  let {
    currentPage,
    totalItems,
    perPage,
    onPaginate,
  }: {
    currentPage: number
    totalItems: number
    perPage: number
    onPaginate: (page: number) => void
  } = $props()

  const pages = $derived(
    Array.from({ length: Math.ceil(totalItems / perPage) }, (_, i) => i + 1)
  )
</script>

<nav aria-label="Todo pages" data-testid="pagination" class="flex flex-wrap justify-center gap-2 pt-2">
  {#each pages as pageNumber (pageNumber)}
    <button
      type="button"
      onclick={() => onPaginate(pageNumber)}
      data-testid="pagination-link"
      aria-current={pageNumber === currentPage ? 'page' : undefined}
      class="h-9 w-9 rounded-pill border text-sm transition-colors {pageNumber === currentPage
        ? 'border-primary bg-primary/20 text-primary'
        : 'border-border text-muted-foreground hover:border-border-hover hover:text-foreground'}"
    >
      {pageNumber}
    </button>
  {/each}
</nav>
