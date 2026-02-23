import Link from "next/link"
import type { Metadata } from "next"

import {
  listBlogCategories,
  listBlogTags,
  listPublishedBlogPosts,
} from "@/lib/blog/get-published-posts"
import { BlogFilterBar } from "@/components/blog/blog-filter-bar"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Blog | hopfner.dev",
  description: "Automation and AI insights, case-driven practical guides, and execution playbooks.",
}

type SearchParams = {
  page?: string
  q?: string
  tag?: string | string[]
  category?: string | string[]
}

type ActiveFilterChipsProps = {
  q: string
  selectedTags: string[]
  selectedCategories: string[]
  tagNameBySlug: Record<string, string>
  categoryNameBySlug: Record<string, string>
}

function parsePage(value: string | undefined): number {
  const n = Number(value ?? "1")
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
}

function normalizeMultiParam(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value : value ? [value] : []
  return Array.from(
    new Set(
      raw
        .flatMap((entry) => entry.split(","))
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean)
    )
  )
}

function buildBlogHref(params: {
  page?: number
  q?: string
  tag?: string[]
  category?: string[]
}) {
  const search = new URLSearchParams()

  if (params.page && params.page > 1) search.set("page", String(params.page))
  if (params.q && params.q.trim()) search.set("q", params.q.trim())

  for (const tag of params.tag ?? []) {
    if (tag.trim()) search.append("tag", tag.trim())
  }

  for (const category of params.category ?? []) {
    if (category.trim()) search.append("category", category.trim())
  }

  const query = search.toString()
  return query ? `/blog?${query}` : "/blog"
}

function ActiveFilterChips({ q, selectedTags, selectedCategories, tagNameBySlug, categoryNameBySlug }: ActiveFilterChipsProps) {
  const hasFilters = Boolean(q || selectedTags.length || selectedCategories.length)

  if (!hasFilters) {
    return null
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {q ? (
        <Link
          href={buildBlogHref({ tag: selectedTags, category: selectedCategories })}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card/40 px-2.5 py-1 text-xs text-foreground/80 hover:bg-card"
        >
          <span>Search: {q}</span>
          <span aria-hidden>×</span>
        </Link>
      ) : null}

      {selectedTags.map((slug) => (
        <Link
          key={`tag-${slug}`}
          href={buildBlogHref({
            q,
            tag: selectedTags.filter((t) => t !== slug),
            category: selectedCategories,
          })}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card/40 px-2.5 py-1 text-xs text-foreground/80 hover:bg-card"
        >
          <span>#{tagNameBySlug[slug] ?? slug}</span>
          <span aria-hidden>×</span>
        </Link>
      ))}

      {selectedCategories.map((slug) => (
        <Link
          key={`category-${slug}`}
          href={buildBlogHref({
            q,
            tag: selectedTags,
            category: selectedCategories.filter((c) => c !== slug),
          })}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card/40 px-2.5 py-1 text-xs text-foreground/80 hover:bg-card"
        >
          <span>{categoryNameBySlug[slug] ?? slug}</span>
          <span aria-hidden>×</span>
        </Link>
      ))}
    </div>
  )
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolved = await searchParams

  const page = parsePage(resolved.page)
  const q = (resolved.q ?? "").trim()
  const selectedTags = normalizeMultiParam(resolved.tag)
  const selectedCategories = normalizeMultiParam(resolved.category)

  const [postsResult, tags, categories] = await Promise.all([
    listPublishedBlogPosts({
      page,
      pageSize: 10,
      q,
      tag: selectedTags,
      category: selectedCategories,
    }),
    listBlogTags(),
    listBlogCategories(),
  ])

  const { items, total, pageSize } = postsResult
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const featured = items[0] ?? null
  const rest = items.slice(1)

  const tagNameBySlug = Object.fromEntries(tags.map((item) => [item.slug, item.name]))
  const categoryNameBySlug = Object.fromEntries(categories.map((item) => [item.slug, item.name]))

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-3xl space-y-4">
        <p className="text-xs uppercase tracking-[0.24em] text-foreground/60">Blog</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Execution-first AI & automation insights</h1>
        <p className="text-sm text-foreground/75 sm:text-base">
          Practical breakdowns, implementation playbooks, and operator notes from real automation work.
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-border bg-card/30 p-3 sm:p-4">
        <BlogFilterBar
          q={q}
          selectedTags={selectedTags}
          selectedCategories={selectedCategories}
          tags={tags}
          categories={categories}
        />
        <ActiveFilterChips
          q={q}
          selectedTags={selectedTags}
          selectedCategories={selectedCategories}
          tagNameBySlug={tagNameBySlug}
          categoryNameBySlug={categoryNameBySlug}
        />
      </section>

      {featured ? (
        <section className="mb-8">
          <article className="relative overflow-hidden rounded-2xl border border-border border-l-2 border-l-sky-500 bg-card/30">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/8 via-transparent to-transparent" />
            {featured.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.cover_image_url}
                alt={featured.title}
                className="h-64 w-full object-cover sm:h-80"
              />
            ) : null}
            <div className="relative space-y-3 p-6 sm:p-7">
              <span className="inline-flex items-center rounded-full border border-sky-500/40 bg-sky-500/15 px-2.5 py-0.5 text-xs font-medium text-sky-300">
                Featured
              </span>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                <Link href={`/blog/${featured.slug}`} className="hover:underline">
                  {featured.title}
                </Link>
              </h2>
              {featured.excerpt ? <p className="text-sm text-foreground/80 sm:text-base">{featured.excerpt}</p> : null}
              <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/65">
                <span>{featured.published_at ? new Date(featured.published_at).toLocaleDateString() : ""}</span>
                {featured.tag_names.slice(0, 3).map((name) => (
                  <span key={name} className="rounded-full border border-border/50 bg-foreground/5 px-2 py-0.5 text-foreground/60">
                    #{name}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </section>
      ) : null}

      <section className="space-y-3">
        {rest.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {rest.map((post) => (
              <article
                key={post.version_id}
                className="rounded-xl border border-border bg-card/20 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-lg font-semibold tracking-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt ? (
                  <p className="mt-2 line-clamp-3 text-sm text-foreground/75">{post.excerpt}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                  <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}</span>
                  {post.tag_names.slice(0, 2).map((name) => (
                    <span key={name} className="rounded-full border border-border/50 bg-foreground/5 px-2 py-0.5 text-foreground/60">
                      #{name}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/20 p-6 text-sm text-foreground/75">
            No published posts match your filters yet.
          </div>
        )}
      </section>

      <footer className="mt-8 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="text-foreground/70">{total} article{total === 1 ? "" : "s"}</span>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="mr-2 text-foreground/60">
            Page {page} of {totalPages}
          </span>
          <Link
            href={buildBlogHref({
              page: Math.max(1, page - 1),
              q,
              tag: selectedTags,
              category: selectedCategories,
            })}
            aria-disabled={page <= 1}
            className={`rounded-md border px-3 py-1.5 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-card"}`}
          >
            Previous
          </Link>
          <Link
            href={buildBlogHref({
              page: Math.min(totalPages, page + 1),
              q,
              tag: selectedTags,
              category: selectedCategories,
            })}
            aria-disabled={page >= totalPages}
            className={`rounded-md border px-3 py-1.5 ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-card"}`}
          >
            Next
          </Link>
        </div>
      </footer>
    </main>
  )
}
