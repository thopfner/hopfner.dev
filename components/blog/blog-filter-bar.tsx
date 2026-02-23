"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type RefObject } from "react"

type TaxonomyOption = {
  id: string
  slug: string
  name: string
}

type BlogFilterBarProps = {
  q: string
  selectedTags: string[]
  selectedCategories: string[]
  tags: TaxonomyOption[]
  categories: TaxonomyOption[]
}

function toggleItem(items: string[], value: string): string[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value]
}

function useClickAway(ref: RefObject<HTMLElement | null>, onAway: () => void) {
  useEffect(() => {
    function handle(event: MouseEvent) {
      const target = event.target as Node
      if (!ref.current?.contains(target)) onAway()
    }

    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [ref, onAway])
}

function buildFilterHref(pathname: string, q: string, tags: string[], categories: string[]) {
  const params = new URLSearchParams()

  if (q.trim()) params.set("q", q.trim())
  for (const tag of tags) params.append("tag", tag)
  for (const category of categories) params.append("category", category)

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

type MultiSelectComboboxProps = {
  label: string
  placeholder: string
  options: TaxonomyOption[]
  selected: string[]
  open: boolean
  onOpen: () => void
  onToggleOpen: () => void
  onSelect: (slug: string) => void
  onClear: () => void
}

function MultiSelectCombobox({
  label,
  placeholder,
  options,
  selected,
  open,
  onOpen,
  onToggleOpen,
  onSelect,
  onClear,
}: MultiSelectComboboxProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)

  const optionNameBySlug = useMemo(
    () => Object.fromEntries(options.map((option) => [option.slug, option.name])),
    [options]
  )

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => option.name.toLowerCase().includes(q) || option.slug.toLowerCase().includes(q))
  }, [options, query])

  return (
    <div className="relative space-y-0.5 text-sm md:col-span-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-foreground/70">{label}</span>
        {selected.length ? (
          <button
            type="button"
            onClick={() => {
              onClear()
              setQuery("")
            }}
            className="text-[11px] text-foreground/60 hover:text-foreground"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div
        onClick={() => {
          onOpen()
          inputRef.current?.focus()
        }}
        className="flex min-h-9 w-full flex-wrap items-center gap-1 rounded-lg border border-border bg-background px-2 py-1"
      >
        {selected.map((slug) => (
          <span
            key={`${label}-${slug}`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card/50 px-2 py-0.5 text-xs"
          >
            <span className="truncate">{optionNameBySlug[slug] ?? slug}</span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onSelect(slug)
              }}
              className="text-foreground/60 hover:text-foreground"
              aria-label={`Remove ${optionNameBySlug[slug] ?? slug}`}
            >
              ×
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={onOpen}
          onChange={(event) => {
            if (!open) onOpen()
            setQuery(event.currentTarget.value)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
            }

            if (event.key === "Backspace" && !query && selected.length) {
              event.preventDefault()
              onSelect(selected[selected.length - 1])
            }
          }}
          placeholder={selected.length ? "" : placeholder}
          className="h-7 min-w-20 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-foreground/50"
        />

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onToggleOpen()
            if (!open) setTimeout(() => inputRef.current?.focus(), 0)
          }}
          className="text-foreground/60 hover:text-foreground"
          aria-label={`Toggle ${label} options`}
        >
          ▾
        </button>
      </div>

      {open ? (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-border bg-background p-1 shadow-xl">
          <div className="max-h-56 overflow-auto">
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const checked = selected.includes(option.slug)
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSelect(option.slug)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      checked ? "bg-card" : "hover:bg-card/70"
                    }`}
                  >
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                        checked ? "border-foreground bg-foreground text-background" : "border-border"
                      }`}
                    >
                      {checked ? "✓" : ""}
                    </span>
                    <span className="truncate">{option.name}</span>
                  </button>
                )
              })
            ) : (
              <div className="px-2 py-2 text-xs text-foreground/60">No matches</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function BlogFilterBar({ q, selectedTags, selectedCategories, tags, categories }: BlogFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [searchValue, setSearchValue] = useState(q)
  const [tagValues, setTagValues] = useState<string[]>(selectedTags)
  const [categoryValues, setCategoryValues] = useState<string[]>(selectedCategories)
  const [openDropdown, setOpenDropdown] = useState<"tag" | "category" | null>(null)

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  useClickAway(wrapperRef, () => setOpenDropdown(null))

  const canonicalHref = useMemo(
    () => buildFilterHref(pathname, q, selectedTags, selectedCategories),
    [pathname, q, selectedTags, selectedCategories]
  )

  const lastPushedHrefRef = useRef(canonicalHref)

  useEffect(() => {
    setSearchValue(q)
    setTagValues(selectedTags)
    setCategoryValues(selectedCategories)
    lastPushedHrefRef.current = canonicalHref
  }, [q, selectedTags, selectedCategories, canonicalHref])

  function pushFilters(nextSearch: string, nextTags: string[], nextCategories: string[]) {
    const href = buildFilterHref(pathname, nextSearch, nextTags, nextCategories)
    if (href === lastPushedHrefRef.current) return
    lastPushedHrefRef.current = href
    router.replace(href, { scroll: false })
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      pushFilters(searchValue, tagValues, categoryValues)
    }, 220)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, tagValues, categoryValues])

  return (
    <div ref={wrapperRef}>
      <form action="/blog" method="get" onSubmit={(event) => event.preventDefault()} className="grid grid-cols-1 gap-2 md:grid-cols-12">
        <label className="space-y-0.5 text-sm md:col-span-6">
          <span className="text-foreground/70">Search</span>
          <input
            type="text"
            name="q"
            value={searchValue}
            onChange={(event) => setSearchValue(event.currentTarget.value)}
            placeholder="Search title, excerpt, body"
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
          />
        </label>

        <MultiSelectCombobox
          label="Tags"
          placeholder="All tags"
          options={tags}
          selected={tagValues}
          open={openDropdown === "tag"}
          onOpen={() => setOpenDropdown("tag")}
          onToggleOpen={() => setOpenDropdown((prev) => (prev === "tag" ? null : "tag"))}
          onSelect={(slug) => {
            setTagValues((prev) => {
              const next = toggleItem(prev, slug)
              pushFilters(searchValue, next, categoryValues)
              return next
            })
          }}
          onClear={() => {
            setTagValues([])
            pushFilters(searchValue, [], categoryValues)
          }}
        />

        <MultiSelectCombobox
          label="Categories"
          placeholder="All categories"
          options={categories}
          selected={categoryValues}
          open={openDropdown === "category"}
          onOpen={() => setOpenDropdown("category")}
          onToggleOpen={() => setOpenDropdown((prev) => (prev === "category" ? null : "category"))}
          onSelect={(slug) => {
            setCategoryValues((prev) => {
              const next = toggleItem(prev, slug)
              pushFilters(searchValue, tagValues, next)
              return next
            })
          }}
          onClear={() => {
            setCategoryValues([])
            pushFilters(searchValue, tagValues, [])
          }}
        />

        <div className="space-y-0.5 text-sm md:col-span-12 md:flex md:justify-end">
          <span className="hidden md:inline text-transparent">Reset</span>
          <button
            type="button"
            onClick={() => {
              setSearchValue("")
              setTagValues([])
              setCategoryValues([])
              pushFilters("", [], [])
            }}
            className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-border px-4 text-sm text-foreground/80 transition-colors hover:bg-card md:w-auto"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
