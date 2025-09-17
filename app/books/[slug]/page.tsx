import { getBookBySlug } from "@/lib/books";
import Client from "./client";

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

  return <Client slug={slug} />;
}
