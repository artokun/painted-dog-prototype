"use client";

import { SubstackEmbed } from "@/app/components/ui/SubstackEmbed";
import { ThreeLink } from "@/app/components/ThreeLink";

const Page = () => {
  return (
    <div className="flex items-center justify-center absolute inset-0 top-0 left-0 h-full w-full bg-[#2F2F2F] z-10 pointer-events-auto">
      <div className="max-w-2xl mx-auto p-8 text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-medium text-white mb-4 font-fields">
            Subscribe to Our Newsletter
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-6">
            Stay updated with the latest from Painted Dog Press. Get insights into African literature, 
            book releases, and literary conversations delivered straight to your inbox.
          </p>
        </div>

        {/* Substack Embed Container */}
        <div className="mb-8">
          <div className="bg-white rounded-sm p-6 shadow-2xl mb-6 max-w-md mx-auto">
            <SubstackEmbed 
              src="https://painteddogpress.substack.com/embed"
              width="100%"
              height="150"
              title="Painted Dog Press Newsletter Signup"
            />
          </div>
          
          {/* Additional info */}
          <div className="text-white/60 text-sm space-y-2">
            <p>Powered by Substack - Testing custom integration</p>
            <p className="text-xs">
              This is a test implementation using the embed code you provided
            </p>
          </div>
        </div>

        {/* Back to main site link */}
        <div className="pt-4 border-t border-white/20">
          <ThreeLink 
            href="/"
            className="text-white/80 hover:text-white underline transition-colors"
          >
            ← Back to Main Site
          </ThreeLink>
        </div>
      </div>
    </div>
  );
};

export default Page;
