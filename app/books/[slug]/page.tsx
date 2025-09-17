import Client from "./client";
import { getBookBySlug } from "@/lib/books";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
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
      <div
        className={cn(
          "absolute inset-0 top-0 left-0 h-full w-full z-10 pointer-events-none gap-4 pt-20",
          "grid grid-cols-3 grid-rows-1 place-items-center [&>div]:h-full [&>div]:w-full text-black"
        )}
      >
        <div className="flex flex-col gap-4 p-20 justify-center">
          <ul className="flex flex-col gap-2 w-full font-medium [&>li]:pt-2">
            <li className="flex flex-col gap-2 border-b border-black w-full">
              {book?.authors.map((author) => author.fullName).join(", ")}
            </li>
            <li className="flex flex-col gap-2 border-b border-black w-full">
              Critical Reception
            </li>
            <li className="flex flex-col gap-2 border-b border-black w-full">
              Podcast Episode
            </li>
            <li className="flex flex-col gap-2 border-b border-black w-full">
              Excerpt
            </li>
            <li className="flex flex-col gap-2 border-b border-black w-full">
              Product Information
            </li>
          </ul>
        </div>
        <div /> {/* Middle empty div */}
        <div className="flex flex-col gap-4 p-20 justify-center">
          <h2 className="text-2xl font-bold">{book?.title}</h2>
          <p className="whitespace-pre-wrap">{book?.description}</p>
        </div>
      </div>
    </>
  );
}
