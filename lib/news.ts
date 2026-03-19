import type { Entry } from "contentful";
import type { Document } from "@contentful/rich-text-types";
import { getEntries } from "./contentful";
import type {
  TypeNewsArticle,
  TypeNewsArticleSkeleton,
  TypeNewsCategory,
  TypeNewsCategorySkeleton,
} from "@/types";

export type NewsCategory = {
  id: string;
  name: string;
  slug: string;
};

export type NewsArticleListItem = {
  id: string;
  title: string;
  slug: string;
  publishDate: string;
  excerpt?: string;
  coverImageUrl?: string;
  categories: NewsCategory[];
};

export type NewsArticle = NewsArticleListItem & {
  summaryCopy?: Document;
  author?: string;
  photoCredit?: string;
  contentBlock1?: Document;
  fullWidthImage?: any;
  contentBlock2?: Document;
  pullquote?: string;
  imageWithCaption?: any;
  contentBlock3?: Document;
  imageContentBlock3?: any;
  contentBlock4?: Document;
  imageContentBlock4?: any;
  acknowledgements?: Document;
};

type ContentfulNewsArticleEntry = TypeNewsArticle<"WITHOUT_UNRESOLVABLE_LINKS">;
type ContentfulNewsCategoryEntry = TypeNewsCategory<"WITHOUT_UNRESOLVABLE_LINKS">;

export function getLocalizedField<T>(field: T | { [locale: string]: T }): T {
  if (field === null || field === undefined) return field as T;

  if (
    typeof field === "object" &&
    field !== null &&
    !Array.isArray(field) &&
    "sys" in field
  ) {
    return field as T;
  }

  if (typeof field === "object" && field !== null && !Array.isArray(field)) {
    const localizedField = field as { [locale: string]: T };
    return (
      localizedField["en-US"] ||
      localizedField[Object.keys(localizedField)[0]] ||
      (undefined as T)
    );
  }

  return field as T;
}

export function normaliseContentfulUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith("//") ? `https:${url}` : url;
}

function toNewsCategory(entry: {
  sys: { id: string };
  fields: { name?: unknown; slug?: unknown };
}): NewsCategory {
  return {
    id: entry.sys.id,
    name: getLocalizedField(entry.fields.name as any) || "",
    slug: getLocalizedField(entry.fields.slug as any) || "",
  };
}

function toNewsArticleListItem(
  entry: ContentfulNewsArticleEntry | Entry<TypeNewsArticleSkeleton>
): NewsArticleListItem {
  const coverImage = entry.fields.coverImage as any;
  const coverImageUrl =
    coverImage && typeof coverImage === "object" && "fields" in coverImage
      ? normaliseContentfulUrl(
          getLocalizedField(coverImage.fields?.file?.url as any)
        )
      : undefined;

  const categories: NewsCategory[] = Array.isArray(entry.fields.categories)
    ? entry.fields.categories
        .filter(
          (cat): cat is Entry<TypeNewsCategorySkeleton> =>
            !!cat && typeof cat === "object" && "sys" in cat && "fields" in cat
        )
        .map((cat) => toNewsCategory(cat as any))
    : [];

  return {
    id: entry.sys.id,
    title: getLocalizedField(entry.fields.title) || "",
    slug: getLocalizedField(entry.fields.slug) || "",
    publishDate: getLocalizedField(entry.fields.publishDate) || "",
    excerpt: getLocalizedField(entry.fields.excerpt),
    coverImageUrl,
    categories,
  };
}

export async function getNewsCategories(): Promise<NewsCategory[]> {
  const res = await getEntries<ContentfulNewsCategoryEntry>("newsCategory", {
    limit: 200,
    order: "fields.name",
  });

  return res.items.map((item) => toNewsCategory(item as any));
}

export async function getNewsCategoryBySlug(
  slug: string
): Promise<NewsCategory | null> {
  const res = await getEntries<ContentfulNewsCategoryEntry>("newsCategory", {
    limit: 1,
    "fields.slug": slug,
  });

  const first = res.items[0];
  return first ? toNewsCategory(first as any) : null;
}

export async function getNewsPage({
  page,
  pageSize,
  categorySlug,
}: {
  page: number;
  pageSize: number;
  categorySlug?: string;
}): Promise<{ items: NewsArticleListItem[]; total: number }> {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 9;

  let categoryId: string | undefined;
  if (categorySlug) {
    const category = await getNewsCategoryBySlug(categorySlug);
    if (!category) return { items: [], total: 0 };
    categoryId = category.id;
  }

  const query: Record<string, unknown> = {
    limit: safePageSize,
    skip: (safePage - 1) * safePageSize,
    include: 2,
    order: "-fields.publishDate",
  };

  if (categoryId) {
    query["fields.categories.sys.id"] = categoryId;
  }

  const res = await getEntries<ContentfulNewsArticleEntry>("newsArticle", query);
  return {
    items: res.items.map((item) => toNewsArticleListItem(item as any)),
    total: res.total,
  };
}

export async function getNewsArticleBySlug(
  slug: string
): Promise<NewsArticle | null> {
  const res = await getEntries<ContentfulNewsArticleEntry>("newsArticle", {
    limit: 1,
    include: 2,
    "fields.slug": slug,
  });

  const first = res.items[0] as any;
  if (!first) return null;

  const base = toNewsArticleListItem(first as any);
  const fields = first.fields as any;
  
  return { 
    ...base, 
    summaryCopy: fields.summaryCopy as Document | undefined,
    author: fields.author as string | undefined,
    photoCredit: fields.photoCredit as string | undefined,
    contentBlock1: fields.contentBlock1 as Document | undefined,
    fullWidthImage: fields.fullWidthImage,
    contentBlock2: fields.contentBlock2 as Document | undefined,
    pullquote: fields.pullquote as string | undefined,
    imageWithCaption: fields.imageWithCaption,
    contentBlock3: fields.contentBlock3 as Document | undefined,
    imageContentBlock3: fields.imageContentBlock3,
    contentBlock4: fields.contentBlock4 as Document | undefined,
    imageContentBlock4: fields.imageContentBlock4,
    acknowledgements: fields.acknowledgements as Document | undefined,
  };
}

