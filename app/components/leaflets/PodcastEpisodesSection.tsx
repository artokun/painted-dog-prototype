import { useSnapshot } from "valtio";
import { bookStore } from "@/app/store/bookStore";

export const PodcastEpisodesSection = () => {
  const { books, focusedBookId } = useSnapshot(bookStore);
  const book = focusedBookId ? books[focusedBookId] : null;

  if (!book) return null;

  return <div>Podcast Episodes Section Coming Soon</div>;
};
