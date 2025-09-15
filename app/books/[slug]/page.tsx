import Client from "./client";
import { getBookBySlug } from "@/lib/books";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  return {
    title: `${book?.title} | Painted Dog`,
    description: book?.description,
  };
}

export default async function BookPage(props: PageProps<"/books/[slug]">) {
  const { slug } = await props.params;
  const book = await getBookBySlug(slug);

  return (
    <>
      <Client slug={slug} />
      <div className="flex flex-col items-center justify-center absolute inset-0 top-0 left-0 h-full w-full z-10 pointer-events-none">
        <pre className="absolute bottom-0 left-0 text-white bg-black/75 text-xs w-full whitespace-pre-wrap max-h-48 overflow-scroll border border-white/20 p-4 pointer-events-auto rounded-lg">
          {JSON.stringify(book, null, 2)}
        </pre>
      </div>
    </>
  );
}
