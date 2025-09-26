import { Metadata } from "next";
import { ContactPageContent } from "../components/ContactPageContent";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "Contact | Painted Dog",
  description: "Contact us",
};

const Page = () => {
  return (
    <div className="absolute inset-0 h-dvh w-dvw pointer-events-auto text-black z-10 overflow-y-auto overflow-x-hidden">
      <ContactPageContent />
      <Footer />
    </div>
  );
};

export default Page;
