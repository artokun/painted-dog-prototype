import Link from "next/link";
import Image from "next/image";
import { getNewsCategories, getNewsPage } from "@/lib/news";
import { cn } from "@/lib/utils";
import { Footer } from "@/app/components/Footer";

const PAGE_SIZE = 9;

function formatCardDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

function getSingleSearchParam(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function buildNewsHref({
  page,
  category,
}: {
  page?: number;
  category?: string;
}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page && page !== 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/news?${qs}` : "/news";
}

export default async function NewsArchivePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const categorySlug = getSingleSearchParam(sp.category);
  const pageParam = getSingleSearchParam(sp.page);
  const page = Math.max(1, Number.parseInt(pageParam || "1", 10) || 1);

  const [categories, pageRes] = await Promise.all([
    getNewsCategories(),
    getNewsPage({ page, pageSize: PAGE_SIZE, categorySlug }),
  ]);

  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : undefined;

  const items = pageRes.items;
  const total = pageRes.total;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const startIdx = (page - 1) * PAGE_SIZE;
  const paginatedItems = items.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <div
      id="news-page-scroll-container"
      className="absolute inset-0 top-0 left-0 h-full w-full z-10 pointer-events-auto overflow-y-auto"
    >
      <div className="w-full pt-20 px-5 md:px-8 pb-7 text-black">
        <header className=" pt-14  pb-14 md:pt-20 md:pb-40 ">
          <div className="w-full flex flex-col gap-6">
            <div className="w-full grid grid-cols-3 gap-6 items-center">
              <div className="leading-none col-span-1 flex justify-center gap-4">
                <p className="text-[32px] md:text-[72px] tracking-[-0.04em] font-fields font-semibold">
                  {total}
                </p>
              </div>

              <div className="col-span-2">
                <h1 className="text-[32px] md:text-[72px] font-fields font-semibold leading-none">
                  {activeCategory && typeof activeCategory.name === "string"
                    ? `News — ${activeCategory.name}`
                    : "News"}
                </h1>
              </div>
            </div>

            <div className="w-full grid grid-cols-3 gap-8">
              <div className="col-span-1"></div>
              <div className="col-span-2 flex flex-wrap gap-4">
                <Link
                  href={buildNewsHref({ page: 1 })}
                  className={cn(
                    "text-base",
                    !categorySlug ? "underline decoration-2" : "hover:underline"
                  )}
                >
                  All
                </Link>
                {categories.map((cat) => {
                  const active = categorySlug === cat.slug;
                  return (
                    <Link
                      key={cat.id}
                      href={buildNewsHref({ page: 1, category: cat.slug })}
                      className={cn(
                        "text-base",
                        active ? "underline decoration-2" : "hover:underline"
                      )}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-6">
          {paginatedItems.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className={cn("group flex flex-col cursor-pointer text-black")}
            >
              <div className="flex items-start gap-4">
                <p className="text-xs md:text-sm text-black whitespace-nowrap mt-0.5">
                  {formatCardDate(item.publishDate)}
                </p>

                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-lg font-medium leading-snug">
                      {item.title}
                    </h2>
                    <span className="hidden md:block text-lg md:text-xl leading-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                      →
                    </span>
                  </div>
                  {item.excerpt && (
                    <div className="mt-2 md:mt-0 flex items-start md:max-h-0 md:overflow-hidden md:group-hover:max-h-16 md:group-hover:mt-2 md:transition-all md:duration-300">
                      <span className="shrink-0 mr-2">—</span>
                      <span className="text-sm md:text-base leading-relaxed line-clamp-2 font-semibold">
                        {item.excerpt}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative overflow-hidden mt-6">
                <div className="md:transition-transform md:duration-300">
                  {item.coverImageUrl ? (
                    <Image
                      src={item.coverImageUrl}
                      alt=""
                      width={600}
                      height={400}
                      className="w-full object-cover transition-all duration-300 md:h-auto h-64"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full bg-[#F0D6B2] transition-all duration-300 md:h-auto h-64" />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {paginatedItems.length === 0 && (
          <p className="mt-12 text-black/70">
            No news posts yet{categorySlug ? " for this category" : ""}.
          </p>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => {
                const isActive = pageNum === page;

                // Show first page, last page, current page, and pages around current
                const showPage =
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  pageNum === page ||
                  pageNum === page - 1 ||
                  pageNum === page + 1;

                const showEllipsisBefore = pageNum === page - 2 && page > 3;
                const showEllipsisAfter =
                  pageNum === page + 2 && page < totalPages - 2;

                if (showEllipsisBefore || showEllipsisAfter) {
                  return (
                    <span key={pageNum} className="px-2 text-black/40">
                      ...
                    </span>
                  );
                }

                if (!showPage && pageNum !== page - 2 && pageNum !== page + 2) {
                  return null;
                }

                return (
                  <Link
                    key={pageNum}
                    href={buildNewsHref({
                      page: pageNum,
                      category: categorySlug,
                    })}
                    className={cn(
                      "px-2 py-1 text-base transition-all hover:text-lg",
                      isActive ? "underline decoration-2" : "hover:underline"
                    )}
                  >
                    {pageNum}
                  </Link>
                );
              }
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
