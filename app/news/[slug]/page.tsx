import { getNewsArticleBySlug } from "@/lib/news";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Document } from "@contentful/rich-text-types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    return {
      title: "News post not found | Painted Dog",
      description: "The requested news post could not be found.",
    };
  }

  return {
    title: `${article.title} | Painted Dog`,
    description: article.excerpt || "News from Painted Dog.",
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div className="absolute inset-0 top-0 left-0 h-full w-full z-10 pointer-events-auto overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-20 pt-28 pb-24 text-black">
        <header className="mt-10">
          <h1 className="text-4xl md:text-5xl font-fields font-semibold leading-tight md:w-1/2">
            {article.title}
          </h1>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            {article.excerpt ? (
              <div className="text-xl md:text-2xl text-black leading-relaxed md:w-4/5 md:ml-auto flex gap-3">
                <span className="shrink-0">—</span>
                <span>{article.excerpt}</span>
              </div>
            ) : null}

            {article.coverImageUrl ? (
              <figure>
                <img
                  src={article.coverImageUrl}
                  alt=""
                  className="w-full h-auto max-h-[400px] object-cover rounded-sm border border-black/15"
                  loading="lazy"
                />
              </figure>
            ) : null}
          </div>
        </header>

        <article className="mt-10 space-y-14 md:space-y-36 leading-relaxed">
          {article.summaryCopy && article.summaryCopy.content && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="md:w-4/5 md:ml-auto">
                <div className="prose max-w-none [&_p]:text-2xl [&_p]:text-black [&_p]:leading-relaxed [&_p]:font-semibold">
                  {documentToReactComponents(article.summaryCopy)}
                </div>
                {(article.author || article.photoCredit) && (
                  <div className="mt-4 text-sm text-black/70 font-semibold">
                    {article.author && <div>Written by {article.author}</div>}
                    {article.photoCredit && (
                      <div>Leading image by {article.photoCredit}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {article.contentBlock1 && article.contentBlock1.content && (
            <div className="prose prose-lg max-w-none [&_p]:text-black/80 [&_p]:leading-relaxed [&_p]:mb-14 md:ml-auto md:w-1/2">
              {documentToReactComponents(article.contentBlock1)}
            </div>
          )}

          {article.fullWidthImage && article.fullWidthImage.fields && (
            <figure className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
              <img
                src={`https:${article.fullWidthImage.fields.file.url}`}
                alt={
                  article.fullWidthImage.fields.description ||
                  article.fullWidthImage.fields.title ||
                  ""
                }
                className="w-full h-auto"
                loading="lazy"
              />
              {(article.fullWidthImage.fields.description ||
                article.fullWidthImage.fields.title) && (
                <figcaption className="mt-2 px-5 md:px-20 text-sm text-black/60">
                  {article.fullWidthImage.fields.description ||
                    article.fullWidthImage.fields.title}
                </figcaption>
              )}
            </figure>
          )}

          {article.contentBlock2 && article.contentBlock2.content && (
            <div className="prose prose-lg max-w-none [&_p]:text-black/80 [&_p]:leading-relaxed [&_p]:mb-14 md:ml-auto md:w-1/2">
              {documentToReactComponents(article.contentBlock2)}
            </div>
          )}

          {article.pullquote && (
            <div className="grid grid-cols-1 gap-8 md:gap-12">
              <div className="md:w-[90%] md:ml-auto">
                <blockquote className="text-xl md:text-4xl text-black leading-relaxed text-center">
                  {article.pullquote}
                </blockquote>
              </div>
            </div>
          )}

          {article.imageWithCaption && article.imageWithCaption.fields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div></div>
              <div className="grid grid-cols-[80%_20%] gap-4 items-end">
                <img
                  src={`https:${article.imageWithCaption.fields.file.url}`}
                  alt={
                    article.imageWithCaption.fields.description ||
                    article.imageWithCaption.fields.title ||
                    ""
                  }
                  className="w-full h-auto rounded-sm border border-black/15"
                  loading="lazy"
                />
                {(article.imageWithCaption.fields.description ||
                  article.imageWithCaption.fields.title) && (
                  <figcaption className="text-sm text-black/60 pb-1 wrap-break-word">
                    {article.imageWithCaption.fields.description ||
                      article.imageWithCaption.fields.title}
                  </figcaption>
                )}
              </div>
            </div>
          )}

          {article.contentBlock3 && article.contentBlock3.content && (
            <div className="prose prose-lg max-w-none [&_p]:text-black/80 [&_p]:leading-relaxed [&_p]:mb-14 md:ml-auto md:w-1/2">
              {documentToReactComponents(article.contentBlock3)}
            </div>
          )}

          {(article.contentBlock4 || article.imageContentBlock4) && (
            <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {article.imageContentBlock4 &&
                article.imageContentBlock4.fields && (
                  <figure>
                    <img
                      src={`https:${article.imageContentBlock4.fields.file.url}`}
                      alt={
                        article.imageContentBlock4.fields.description ||
                        article.imageContentBlock4.fields.title ||
                        ""
                      }
                      className="w-full h-auto rounded-sm border border-black/15"
                      loading="lazy"
                    />
                    {(article.imageContentBlock4.fields.description ||
                      article.imageContentBlock4.fields.title) && (
                      <figcaption className="mt-2 text-sm text-black/60">
                        {article.imageContentBlock4.fields.description ||
                          article.imageContentBlock4.fields.title}
                      </figcaption>
                    )}
                  </figure>
                )}

              {article.contentBlock4 && article.contentBlock4.content && (
                <div className="prose prose-lg max-w-none [&_p]:text-black/80 [&_p]:leading-relaxed [&_p]:mb-14">
                  {documentToReactComponents(article.contentBlock4)}
                </div>
              )}
            </div>
          )}

          {article.acknowledgements && article.acknowledgements.content && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div></div>
              <div>
                <h3 className="text-base font-semibold mb-3">
                  Acknowledgements
                </h3>
                <div className="prose max-w-none [&_p]:text-sm [&_p]:text-black/70 [&_p]:leading-relaxed [&_p]:flex [&_p]:gap-3 [&_p]:before:content-['—'] [&_p]:before:shrink-0">
                  {documentToReactComponents(article.acknowledgements)}
                </div>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
