import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Heart,
  Package,
  Search,
  Star,
} from "lucide-react";

import {
  claimDownload,
  getWishlist,
  loadMarketplace,
  submitReview,
  toggleWishlist,
} from "../lib/marketplace.functions";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Digital Marketplace, templates and systems by Eager Beaver" },
      {
        name: "description",
        content:
          "Shop production ready templates, dashboards and automation systems. Instant download, license key included, bundle savings and verified customer reviews.",
      },
      { property: "og:title", content: "Digital Marketplace, Eager Beaver" },
      {
        property: "og:description",
        content:
          "Templates, dashboards and systems with instant downloads, license keys and bundle deals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketplacePage,
});

/** A stable per browser id so the wishlist survives refreshes without an account. */
function sessionId() {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem("eb-shop-session");
  if (!id) {
    id = `s-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.localStorage.setItem("eb-shop-session", id);
  }
  return id;
}

const money = (v: number, c: string) =>
  v <= 0 ? "Free" : `${(c || "USD") === "USD" ? "$" : `${c} `}${Number(v).toFixed(2)}`;

function MarketplacePage() {
  const load = useServerFn(loadMarketplace);
  const wishlistFn = useServerFn(getWishlist);
  const toggleFn = useServerFn(toggleWishlist);
  const claimFn = useServerFn(claimDownload);
  const reviewFn = useServerFn(submitReview);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [onlyWishlist, setOnlyWishlist] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const shop = useQuery({ queryKey: ["marketplace"], queryFn: () => load({}) });
  const wish = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistFn({ data: { sessionId: sessionId() } }),
  });

  const products = shop.data?.products ?? [];
  const bundles = shop.data?.bundles ?? [];
  const reviews = shop.data?.reviews ?? [];
  const saved = wish.data?.slugs ?? [];

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products],
  );

  const visible = products.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchQ =
      !q ||
      [p.name, p.summary, p.description, ...(p.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(q);
    const matchC = category === "All" || p.category === category;
    const matchW = !onlyWishlist || saved.includes(p.slug);
    return matchQ && matchC && matchW;
  });

  const ratingFor = (slug: string) => {
    const rs = reviews.filter((r) => r.product_slug === slug);
    if (!rs.length) return null;
    return {
      avg: rs.reduce((a, r) => a + Number(r.rating), 0) / rs.length,
      count: rs.length,
    };
  };

  const toggleSaved = async (slug: string) => {
    await toggleFn({
      data: { sessionId: sessionId(), productSlug: slug, wanted: !saved.includes(slug) },
    });
    await wish.refetch();
  };

  const card = "rounded-3xl border border-white/10 bg-white/[0.03]";

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-5 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to the portfolio
        </Link>

        <header className="mt-8">
          <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">Digital marketplace</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Templates, dashboards and systems
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-white/55">
            Every purchase is an instant download with its own license key, free updates for the
            version you buy, and bundle pricing when you take a full set.
          </p>
        </header>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <label className={`flex min-h-11 flex-1 items-center gap-2 px-4 ${card} min-w-[220px]`}>
            <Search className="h-4 w-4 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, tags, systems"
              className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
              aria-label="Search products"
            />
          </label>
          <button
            onClick={() => setOnlyWishlist((v) => !v)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm ${
              onlyWishlist ? "bg-white text-black" : "border border-white/15 bg-white/5"
            }`}
          >
            <Heart className={`h-4 w-4 ${onlyWishlist ? "" : "text-white/60"}`} /> Wishlist ({saved.length})
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`min-h-9 rounded-full px-4 text-xs ${
                category === c ? "bg-white text-black" : "border border-white/15 bg-white/5 text-white/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {shop.isPending ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-72 animate-pulse ${card}`} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className={`mt-12 p-10 text-center ${card}`}>
            <Package className="mx-auto h-8 w-8 text-white/35" />
            <p className="mt-4 text-white/55">
              Nothing matches that yet. Clear the filters, or add products from the dashboard.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => {
              const r = ratingFor(p.slug);
              return (
                <article key={p.slug} className={`group flex flex-col overflow-hidden ${card}`}>
                  <div className="aspect-[16/10] overflow-hidden bg-white/5">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={`${p.name} preview`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-white/25">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[11px] uppercase tracking-widest text-white/35">
                          {p.category || "Template"}
                        </span>
                        <h2 className="mt-1 truncate text-lg font-semibold">{p.name}</h2>
                      </div>
                      <button
                        onClick={() => void toggleSaved(p.slug)}
                        aria-label={saved.includes(p.slug) ? "Remove from wishlist" : "Save to wishlist"}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            saved.includes(p.slug) ? "fill-rose-400 text-rose-400" : "text-white/60"
                          }`}
                        />
                      </button>
                    </div>
                    {p.summary ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/55">{p.summary}</p>
                    ) : null}
                    <div className="mt-3 flex items-center gap-3 text-xs text-white/45">
                      <span className="text-base font-semibold text-white">
                        {money(Number(p.price), p.currency)}
                      </span>
                      {r ? (
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {r.avg.toFixed(1)} ({r.count})
                        </span>
                      ) : null}
                      <span>v{p.version}</span>
                    </div>
                    <button
                      onClick={() => setOpen(p.slug)}
                      className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black"
                    >
                      <Download className="h-4 w-4" /> Get it
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {bundles.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold tracking-tight">Bundle deals</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {bundles.map((b) => (
                <div key={b.slug} className={`p-5 ${card}`}>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] text-emerald-300">
                    {b.discount_label || "Bundle"}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{b.name}</h3>
                  {b.summary ? (
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{b.summary}</p>
                  ) : null}
                  <p className="mt-3 text-base font-semibold">{money(Number(b.price), b.currency)}</p>
                  <p className="mt-2 text-xs text-white/45">
                    Includes {(b.product_slugs ?? []).length} products
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {open ? (
          <ProductDialog
            product={products.find((p) => p.slug === open)!}
            reviews={reviews.filter((r) => r.product_slug === open)}
            onClose={() => setOpen(null)}
            onClaim={(payload) => claimFn({ data: { ...payload, sessionId: sessionId() } })}
            onReview={async (payload) => {
              await reviewFn({ data: payload });
            }}
          />
        ) : null}
      </div>
    </main>
  );
}

type ClaimResult = { licenseKey: string; fileUrl: string; version: string; name: string };

function ProductDialog({
  product,
  reviews,
  onClose,
  onClaim,
  onReview,
}: {
  product: { slug: string; name: string; description: string; summary: string; price: number; currency: string; changelog: string };
  reviews: { author_name: string; rating: number; body: string; created_at: string }[];
  onClose: () => void;
  onClaim: (p: { productSlug: string; customerName: string; customerEmail: string }) => Promise<ClaimResult>;
  onReview: (p: {
    productSlug: string;
    authorName: string;
    authorEmail: string;
    rating: number;
    body: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [copied, setCopied] = useState(false);

  const [rName, setRName] = useState("");
  const [rating, setRating] = useState(5);
  const [rBody, setRBody] = useState("");
  const [rDone, setRDone] = useState(false);

  const field =
    "min-h-11 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-white/40";

  const submit = async () => {
    setErr("");
    setBusy(true);
    try {
      setResult(await onClaim({ productSlug: product.slug, customerName: name, customerEmail: email }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That did not go through. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/12 bg-[#0C0C0C] p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="mt-1 text-sm text-white/50">
              {money(Number(product.price), product.currency)}
            </p>
          </div>
          <button onClick={onClose} className="min-h-9 rounded-full border border-white/15 px-3 text-sm">
            Close
          </button>
        </div>

        {product.description || product.summary ? (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/60">
            {product.description || product.summary}
          </p>
        ) : null}

        {result ? (
          <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
            <p className="text-sm text-emerald-200">
              You are all set. Keep this license key, it unlocks {result.name} v{result.version} on up to
              three machines.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="rounded-lg bg-black/50 px-3 py-2 text-sm">{result.licenseKey}</code>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(result.licenseKey);
                  setCopied(true);
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy key"}
              </button>
              {result.fileUrl ? (
                <a
                  href={result.fileUrl}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black"
                >
                  <Download className="h-4 w-4" /> Download files
                </a>
              ) : (
                <span className="text-xs text-white/50">
                  The files land in your inbox, the download link is being prepared.
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
                Your name
              </span>
              <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
                Email for the license key
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
                autoComplete="email"
              />
            </label>
            {err ? (
              <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-200 sm:col-span-2">
                {err}
              </p>
            ) : null}
            <button
              disabled={busy || !/.+@.+\..+/.test(email)}
              onClick={() => void submit()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black disabled:opacity-50 sm:col-span-2"
            >
              <Download className="h-4 w-4" />
              {Number(product.price) > 0 ? "Checkout and get my key" : "Get my free download"}
            </button>
          </div>
        )}

        <section className="mt-8 border-t border-white/10 pt-6">
          <h4 className="text-sm font-semibold">Customer reviews</h4>
          {reviews.length === 0 ? (
            <p className="mt-2 text-xs text-white/45">No reviews published yet, be the first.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {reviews.map((r, i) => (
                <li key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {Number(r.rating).toFixed(1)} <span className="text-white/30">·</span> {r.author_name}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{r.body}</p>
                </li>
              ))}
            </ul>
          )}

          {rDone ? (
            <p className="mt-4 text-xs text-emerald-300">
              Thanks, your review is in the queue and appears once it is approved.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              <input
                value={rName}
                onChange={(e) => setRName(e.target.value)}
                placeholder="Your name"
                className={field}
              />
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className={field}
                aria-label="Rating"
              >
                {[5, 4, 3, 2, 1].map((v) => (
                  <option key={v} value={v}>
                    {v} star{v > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <textarea
                value={rBody}
                onChange={(e) => setRBody(e.target.value)}
                rows={3}
                placeholder="What did you build with it?"
                className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm outline-none focus:border-white/40"
              />
              <button
                disabled={rName.trim().length < 1 || rBody.trim().length < 4}
                onClick={() =>
                  void (async () => {
                    await onReview({
                      productSlug: product.slug,
                      authorName: rName.trim(),
                      authorEmail: "",
                      rating,
                      body: rBody.trim(),
                    });
                    setRDone(true);
                  })()
                }
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-sm disabled:opacity-50"
              >
                Submit review
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
