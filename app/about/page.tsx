import { Metadata } from "next";
import { getAboutContent } from "@/lib/about";

export const metadata: Metadata = {
  title: "About Us | Painted Dog",
  description: "About us",
};

const Page = async () => {
  const aboutContent = await getAboutContent();
  
  return null;
};

export default Page;
