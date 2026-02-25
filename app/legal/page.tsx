import type { Metadata, ResolvingMetadata } from "next";
import { getLegalPageData } from "@/lib/legal";
import { LegalPageInitializer } from "@/app/components/LegalPageInitializer";

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
  const legalPage = await getLegalPageData();

  if (!legalPage) {
    return (
      <LegalPageInitializer
        data={{
          title: "Privacy & Legal Policy",
          policies: [],
        }}
      />
    );
  }

  const formattedData = {
    title: legalPage.title || "Privacy & Legal Policy",
    slug: legalPage.slug || undefined,
    policies: legalPage.policies || [],
  };

  return <LegalPageInitializer data={formattedData} />;
};

export default Page;
