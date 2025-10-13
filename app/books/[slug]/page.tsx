import { getBookBySlug } from "@/lib/books";
import { notFound } from "next/navigation";
import Client from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  // Fallback values if book is not found
  if (!book) {
    return {
      title: "Book Not Found | Painted Dog",
      description: "The requested book could not be found in our collection.",
    };
  }

  return {
    title: `${book.title} | Painted Dog`,
    description: book.description || `Discover "${book.title}" in the Painted Dog collection.`,
  };
}

export default async function BookPage(props: PageProps<"/books/[slug]">) {
  const { slug } = await props.params;

  // Check if the book exists
  const book = await getBookBySlug(slug);

  // If book doesn't exist, trigger 404 page
  if (!book) {
    notFound();
  }

  return <Client slug={slug} />;
}
