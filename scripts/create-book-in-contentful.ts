import { createClient, type Asset, type Entry } from "contentful-management";
import "dotenv/config";

type LocaleCode = "en-US";

type LinkRef = {
  sys: { type: "Link"; linkType: "Entry" | "Asset"; id: string };
};

type TextureAssets = { front: string; side: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`${name} env var is required`);
  return val;
}

const managementClient = createClient({
  accessToken: getEnv("CONTENTFUL_MANAGEMENT_TOKEN"),
});

async function getEnvironment() {
  const space = await managementClient.getSpace(getEnv("CONTENTFUL_SPACE_ID"));
  const environment = await space.getEnvironment(
    process.env.CONTENTFUL_ENVIRONMENT || "master"
  );
  return environment;
}

// Utilities
function linkToEntry(id: string): LinkRef {
  return { sys: { type: "Link", linkType: "Entry", id } };
}
function linkToAsset(id: string): LinkRef {
  return { sys: { type: "Link", linkType: "Asset", id } };
}

// Texture map per agent spec
const TEXTURE_MAP: Record<"XS" | "SM" | "MD" | "LG" | "XL", TextureAssets> = {
  XS: { front: "7dG9T8tnJwuamBDfBfLoeq", side: "34nWVAWGx2yKgs8kZz9YBp" },
  SM: { front: "6UosV9tUXCkwn4sxzxi2Cp", side: "OuerSi1YTfPPLkF2nJ70w" },
  MD: { front: "2X2koL053KqxOR7VfAjGpS", side: "5QSZ6oFRrhZTqOygZejI5l" },
  LG: { front: "5VdkmTfiiaL8EYoC99quEO", side: "Wf1GaODJaewJEeiIyMqUJ" },
  XL: { front: "4ZdDgvoCXQsVEKzh6Advsq", side: "6n3fr7Ho62MEx5jbhdS6ji" },
};

// Basic size mapping by nearest euclidean distance in mm
const SIZES_MM = {
  XS: { height: 174, width: 108 },
  SM: { height: 203, width: 127 },
  MD: { height: 203, width: 133 },
  LG: { height: 216, width: 140 },
  XL: { height: 229, width: 152 },
} as const;

function inchesToMm(inches: number) {
  return inches * 25.4;
}

function parseInches(dim: string): [number, number] | null {
  // Expect formats like "5.5 x 8.26 inches" or "5 x 8 inches"
  const m = dim.match(
    /([0-9]+(?:\.[0-9]+)?)\s*x\s*([0-9]+(?:\.[0-9]+)?)\s*inch/i
  );
  if (!m) return null;
  return [parseFloat(m[1]), parseFloat(m[2])];
}

function mapDimensionsToSize(
  dimensionString: string
): keyof typeof TEXTURE_MAP {
  const parsed = parseInches(dimensionString);
  if (!parsed) return "LG";
  const [wIn, hIn] = parsed;
  const width = inchesToMm(wIn);
  const height = inchesToMm(hIn);
  let best: keyof typeof SIZES_MM = "MD";
  let bestDist = Number.POSITIVE_INFINITY;
  for (const size of Object.keys(SIZES_MM) as (keyof typeof SIZES_MM)[]) {
    const dims = SIZES_MM[size];
    const d = Math.hypot(dims.width - width, dims.height - height);
    if (d < bestDist) {
      bestDist = d;
      best = size;
    }
  }
  return best;
}

async function findOrCreateAuthor(environment: any, fullName: string) {
  const entries = await environment.getEntries({
    content_type: "author",
    "fields.fullName": fullName,
    limit: 1,
  });
  if (entries.items.length) return entries.items[0];
  const entry = await environment.createEntry("author", {
    fields: { fullName: { "en-US": fullName }, biography: { "en-US": "" } },
  });
  return entry.publish();
}

async function findOrCreateGenre(
  environment: any,
  genre: string,
  subGenre: string
) {
  const entries = await environment.getEntries({
    content_type: "genre",
    "fields.genre": genre,
    "fields.subGenre": subGenre,
    limit: 1,
  });
  if (entries.items.length) return entries.items[0];
  const entry = await environment.createEntry("genre", {
    fields: { genre: { "en-US": genre }, subGenre: { "en-US": subGenre } },
  });
  return entry.publish();
}

async function createPrice(
  environment: any,
  text: string,
  price?: number,
  description?: string,
  productInformation?: Record<string, unknown>
) {
  const entry = await environment.createEntry("price", {
    fields: {
      text: { "en-US": text },
      ...(price !== undefined ? { price: { "en-US": price } } : {}),
      ...(description ? { description: { "en-US": description } } : {}),
      ...(productInformation
        ? { productInformation: { "en-US": productInformation } }
        : {}),
    },
  });
  return entry.publish();
}

async function createLink(environment: any, text: string, href: string) {
  const entry = await environment.createEntry("link", {
    fields: { text: { "en-US": text }, link: { "en-US": href } },
  });
  return entry.publish();
}

async function getTextureAssets(size: keyof typeof TEXTURE_MAP) {
  const map = TEXTURE_MAP[size];
  return { front: linkToAsset(map.front), side: linkToAsset(map.side) };
}

export interface CreateBookParams {
  title: string;
  authorFullName: string;
  descriptionMarkdown: string;
  publishDate: string;
  priceText: string;
  priceAmount?: number;
  priceDescription?: string;
  priceProductInfo?: Record<string, unknown>;
  genre?: { genre: string; subGenre: string };
  featuredArticle?: { text: string; href: string };
  podcastEpisode?: { text: string; href: string };
  criticalReceptionMarkdown: string;
  podcastMarkdown?: string;
  dimensionsInches: string; // e.g., "5.5 x 8.26 inches"
}

export async function createBookInContentful(params: CreateBookParams) {
  const env = await getEnvironment();

  // Linked entries
  const author = await findOrCreateAuthor(env, params.authorFullName);
  const genre = params.genre
    ? await findOrCreateGenre(env, params.genre.genre, params.genre.subGenre)
    : null;
  const price = await createPrice(
    env,
    params.priceText,
    params.priceAmount,
    params.priceDescription,
    params.priceProductInfo
  );

  const links: { article?: any; podcast?: any } = {};
  if (params.featuredArticle)
    links.article = await createLink(
      env,
      params.featuredArticle.text,
      params.featuredArticle.href
    );
  if (params.podcastEpisode)
    links.podcast = await createLink(
      env,
      params.podcastEpisode.text,
      params.podcastEpisode.href
    );

  const size = mapDimensionsToSize(params.dimensionsInches);
  const textures = await getTextureAssets(size);

  const fields: any = {
    title: { "en-US": params.title },
    featured: { "en-US": false },
    description: { "en-US": params.descriptionMarkdown },
    authors: { "en-US": [linkToEntry(author.sys.id)] },
    publishDate: { "en-US": params.publishDate },
    bookSize: { "en-US": size },
    prices: { "en-US": [linkToEntry(price.sys.id)] },
    criticalReceptionText: { "en-US": params.criticalReceptionMarkdown },
    ...(params.podcastMarkdown
      ? { podcastText: { "en-US": params.podcastMarkdown } }
      : {}),
    ...(params.featuredArticle
      ? {
          linkToFeaturedArticle: {
            "en-US": linkToEntry(links.article!.sys.id),
          },
        }
      : {}),
    ...(params.podcastEpisode
      ? {
          linkToPodcastEpisode: { "en-US": linkToEntry(links.podcast!.sys.id) },
        }
      : {}),
    ...(genre ? { genre: { "en-US": linkToEntry(genre.sys.id) } } : {}),
    bookCoverTextureFront: { "en-US": textures.front },
    bookCoverTextureSide: { "en-US": textures.side },
  };

  const book = await env.createEntry("book", { fields });
  const published = await book.publish();
  return {
    success: true,
    bookId: published.sys.id,
    linkedEntries: {
      authorId: author.sys.id,
      genreId: genre?.sys.id,
      priceIds: [price.sys.id],
      linkIds: [links.article?.sys.id, links.podcast?.sys.id].filter(
        Boolean
      ) as string[],
    },
    metadata: {
      researchedSize: size,
      realDimensions: params.dimensionsInches,
      textureAssets: [TEXTURE_MAP[size].front, TEXTURE_MAP[size].side],
    },
  };
}

// CLI usage: tsx scripts/create-book-in-contentful.ts "Title" "Author" "5.5 x 8.26 inches"
if (require.main === module) {
  const [title, author, dimensions] = process.argv.slice(2);
  if (!title || !author || !dimensions) {
    console.error(
      'Usage: tsx scripts/create-book-in-contentful.ts "Title" "Author" "5.5 x 8.26 inches"'
    );
    process.exit(1);
  }
  (async () => {
    const result = await createBookInContentful({
      title,
      authorFullName: author,
      descriptionMarkdown: `# ${title} by ${author}\n\nPlaceholder description`,
      publishDate: "2000-01-01",
      priceText: "Paperback",
      priceAmount: 0,
      criticalReceptionMarkdown: "# Critical Reception\n\nPlaceholder",
      dimensionsInches: dimensions,
    });
    console.log("Created book:", result);
  })().catch((err) => {
    console.error("Failed:", err?.message || err);
    process.exit(1);
  });
}
