import type { Metadata, ResolvingMetadata } from "next";
import { getLegalPageData } from "@/lib/legal";

export const revalidate = 300;

export async function generateMetadata(
  _props: unknown,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const legalPage = await getLegalPageData();

  if (!legalPage) {
    return {
      title: "Privacy & Legal Policy | Painted Dog",
      description:
        "Explore the Painted Dog Press privacy and legal policy including data collection, usage, and your rights.",
    };
  }

  return {
    title: `${legalPage.title} | Painted Dog`,
    description:
      legalPage.metaDescription ||
      "Explore the Painted Dog Press privacy and legal policy including data collection, usage, and your rights.",
  };
}

const Page = async () => {
  await getLegalPageData();
  return null;
};

export default Page;
