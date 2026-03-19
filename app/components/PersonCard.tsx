import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import type { Person } from "@/lib/about";

const renderOptions = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => (
      <p className="mb-6">{children}</p>
    ),
  },
};

export const PersonCard = ({ person }: { person: Person }) => {
  return (
    <div className="py-14 mb-0">
      <h3 className="text-[32px] font-fields font-semibold leading-tight mb-2">
        {person.name}
      </h3>
      <div className="border-b border-black mb-4"></div>
      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-8">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {person.links && person.links.length > 0 && (
            <>
              {person.links.map((link, index) => (
                <a
                  key={index}
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm"
                >
                  {link.text}
                </a>
              ))}
            </>
          )}
        </div>
        {person.description && person.description.content && (
          <div className="max-w-none font-montserrat text-base leading-[150%] [&>p:last-child]:mb-0">
            {documentToReactComponents(person.description, renderOptions)}
          </div>
        )}
      </div>
    </div>
  );
};
