import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import type { PersonWithoutLinks } from "@/lib/about";

const renderOptions = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => (
      <p className="mb-6">{children}</p>
    ),
  },
};

export const PersonCardSimple = ({
  person,
}: {
  person: PersonWithoutLinks;
}) => {
  return (
    <div className="border-b border-black py-12 mb-0 last:border-0">
      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-8">
        <h3 className="text-[32px] font-fields font-semibold leading-tight">{person.name}</h3>
        {person.description && person.description.content && (
          <div className="max-w-none font-montserrat text-base leading-[150%] [&>p:last-child]:mb-0">
            {documentToReactComponents(person.description, renderOptions)}
          </div>
        )}
      </div>
    </div>
  );
};
