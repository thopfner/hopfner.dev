import Link from "next/link"
import type { Metadata } from "next"

import {
  listBlogCategories,
  listBlogTags,
  listPublishedBlogPosts,
} from "@/lib/blog/get-published-posts"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Blog | hopfner.dev",
  description: "Automation and AI insights, case-driven practical guides, and execution playbooks.",
}

type SearchParams = {
  page?: string
  q?: string
  tag?: string
  category?: string
}

type PrimaryFilterRowProps = {
  q: string
  tag: string
  category: string
  tags: Array<{ id: string; slug: string; name: string }>
  categories: Array<{ id: string; slug: string; name: string }>
}

type ActiveFilterChipsProps = {
  q: string
  tag: string
  category: string
  activeTagName: string | null
  activeCategoryName: string | null
}

function parsePage(value: string | undefined): number {
  const n = Number(value ?? "1")
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
}

function buildBlogHref(params: {
  page?: number
  q?: string
  tag?: string
  category?: string
}) {
  const search = new URLSearchParams()

  if (params.page && params.page > 1) search.set("page", String(params.page))
  if (params.q && params.q.trim()) search.set("q", params.q.trim())
  if (params.tag && params.tag.trim()) search.set("tag", params.tag.trim())
  if (params.category && params.category.trim()) search.set("category", params.category.trim())

  const query = search.toString()
  return query ? `/blog?${query}` : "/blog"
}

function PrimaryFilterRow({ q, tag, category, tags, categories }: PrimaryFilterRowProps) {
  return (
    <form action="/blog" method="get" className="grid grid-cols-1 gap-3 md:grid-cols-12">
      <label className="space-y-1 text-sm md:col-span-4">
        <span className="text-foreground/70">Search</span>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search title, excerpt, body"
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
        />
      </label>

      <label className="space-y-1 text-sm md:col-span-2">
        <span className="text-foreground/70">Tag</span>
        <select
          name="tag"
          defaultValue={tag}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="">All tags</option>
          {tags.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-sm md:col-span-2">
        <span className="text-foreground/70">Category</span>
        <select
          name="category"
          defaultValue={category}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-1 text-sm md:col-span-2">
        <span className="invisible">Apply</span>
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Apply
        </button>
      </div>

      <div className="space-y-1 text-sm md:col-span-2">
        <span className="invisible">Reset</span>
        <Link
          href="/blog"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border px-4 text-sm text-foreground/80 transition-colors hover:bg-card"
        >
          Reset
        </Link>
      </div>
    </form>
  )
}

function ActiveFilterChips({ q, tag, category, activeTagName, activeCategoryName }: ActiveFilterChipsProps) {
  const hasFilters = Boolean(q || tag || category)

  if (!hasFilters) {
    return null
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {q ? (
        <Link
          href={buildBlogHref({ tag, category })}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-foreground/80 hover:bg-card"
        >
          <span>Search: {q}</span>
          <span aria-hidden>×</span>
        </Link>
      ) : null}

      {tag ? (
        <Link
          href={buildBlogHref({ q, category })}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-foreground/80 hover:bg-card"
        >
          <span>#{activeTagName ?? tag}</span>
          <span aria-hidden>×</span>
        </Link>
      ) : null}

      {category ? (
        <Link
          href={buildBlogHref({ q, tag })}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-foreground/80 hover:bg-card"
        >
          <span>{activeCategoryName ?? category}</span>
          <span aria-hidden>×</span>
        </Link>
      ) : null}
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
  const tag = (resolved.tag ?? "").trim().toLowerCase()
  const category = (resolved.category ?? "").trim().toLowerCase()

  const [postsResult, tags, categories] = await Promise.all([
    listPublishedBlogPosts({
      page,
      pageSize: 10,
      q,
      tag,
      category,
    }),
    listBlogTags(),
    listBlogCategories(),
  ])

  const { items, total, pageSize } = postsResult
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const featured = items[0] ?? null
  const rest = items.slice(1)

  const activeTagName = tag ? tags.find((item) => item.slug === tag)?.name ?? null : null
  const activeCategoryName = category ? categories.find((item) => item.slug === category)?.name ?? null : null

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-3xl space-y-4">
        <p className="text-xs uppercase tracking-[0.24em] text-foreground/60">Blog</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Execution-first AI & automation insights</h1>
        <p className="text-sm text-foreground/75 sm:text-base">
          Practical breakdowns, implementation playbooks, and operator notes from real automation work.
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-border bg-card/30 p-4 sm:p-5">
        <PrimaryFilterRow q={q} tag={tag} category={category} tags={tags} categories={categories} />
        <ActiveFilterChips
          q={q}
          tag={tag}
          category={category}
          activeTagName={activeTagName}
          activeCategoryName={activeCategoryName}
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
              tag,
              category,
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
              tag,
              category,
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
