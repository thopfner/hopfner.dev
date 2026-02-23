"use client"

import Link from "next/link"
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

type MultiSelectDropdownProps = {
  label: string
  placeholder: string
  options: TaxonomyOption[]
  selected: string[]
  open: boolean
  onToggleOpen: () => void
  onSelect: (slug: string) => void
  onClear: () => void
}

function MultiSelectDropdown({
  label,
  placeholder,
  options,
  selected,
  open,
  onToggleOpen,
  onSelect,
  onClear,
}: MultiSelectDropdownProps) {
  const optionNameBySlug = useMemo(
    () => Object.fromEntries(options.map((option) => [option.slug, option.name])),
    [options]
  )

  const selectedText = useMemo(() => {
    if (!selected.length) return placeholder
    if (selected.length <= 2) return selected.map((slug) => optionNameBySlug[slug] ?? slug).join(", ")
    return `${selected.length} selected`
  }, [optionNameBySlug, placeholder, selected])

  return (
    <div className="relative space-y-0.5 text-sm md:col-span-2">
      <span className="text-foreground/70">{label}</span>

      <button
        type="button"
        onClick={onToggleOpen}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-left text-sm"
      >
        <span className="truncate">{selectedText}</span>
        <span aria-hidden className="text-foreground/60">▾</span>
      </button>

      {open ? (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-border bg-background p-1 shadow-xl">
          <div className="max-h-52 overflow-auto">
            {options.map((option) => {
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
            })}
          </div>
          <div className="mt-1 border-t border-border px-1 pt-1">
            <button
              type="button"
              onClick={onClear}
              className="w-full rounded-md px-2 py-1.5 text-left text-xs text-foreground/70 hover:bg-card"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function BlogFilterBar({ q, selectedTags, selectedCategories, tags, categories }: BlogFilterBarProps) {
  const [searchValue, setSearchValue] = useState(q)
  const [tagValues, setTagValues] = useState<string[]>(selectedTags)
  const [categoryValues, setCategoryValues] = useState<string[]>(selectedCategories)
  const [openDropdown, setOpenDropdown] = useState<"tag" | "category" | null>(null)

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  useClickAway(wrapperRef, () => setOpenDropdown(null))

  return (
    <div ref={wrapperRef}>
      <form action="/blog" method="get" className="grid grid-cols-1 gap-2 md:grid-cols-12">
        <label className="space-y-0.5 text-sm md:col-span-4">
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

        <MultiSelectDropdown
          label="Tags"
          placeholder="All tags"
          options={tags}
          selected={tagValues}
          open={openDropdown === "tag"}
          onToggleOpen={() => setOpenDropdown((prev) => (prev === "tag" ? null : "tag"))}
          onSelect={(slug) => setTagValues((prev) => toggleItem(prev, slug))}
          onClear={() => setTagValues([])}
        />

        <MultiSelectDropdown
          label="Categories"
          placeholder="All categories"
          options={categories}
          selected={categoryValues}
          open={openDropdown === "category"}
          onToggleOpen={() => setOpenDropdown((prev) => (prev === "category" ? null : "category"))}
          onSelect={(slug) => setCategoryValues((prev) => toggleItem(prev, slug))}
          onClear={() => setCategoryValues([])}
        />

        {tagValues.map((slug) => (
          <input key={`tag-hidden-${slug}`} type="hidden" name="tag" value={slug} />
        ))}

        {categoryValues.map((slug) => (
          <input key={`category-hidden-${slug}`} type="hidden" name="category" value={slug} />
        ))}

        <div className="space-y-0.5 text-sm md:col-span-2">
          <span className="invisible">Apply</span>
          <button
            type="submit"
            className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Apply
          </button>
        </div>

        <div className="space-y-0.5 text-sm md:col-span-2">
          <span className="invisible">Reset</span>
          <Link
            href="/blog"
            className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-border px-4 text-sm text-foreground/80 transition-colors hover:bg-card"
          >
            Reset
          </Link>
        </div>
      </form>
    </div>
  )
}
