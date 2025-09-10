const { createClient } = require("contentful-management");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

async function generateTypes() {
  try {
    console.log("🔍 Fetching content types from Contentful...");

    const space = await managementClient.getSpace(
      process.env.CONTENTFUL_SPACE_ID
    );
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || "master"
    );
    const contentTypes = await environment.getContentTypes();

    console.log(`✅ Found ${contentTypes.items.length} content types`);

    let typeDefinitions = `// Auto-generated Contentful types
// Generated on ${new Date().toISOString()}
import { Asset, Entry } from 'contentful'

`;

    // Generate types for each content type
    contentTypes.items.forEach((contentType) => {
      const typeName = toPascalCase(contentType.sys.id);
      console.log(`📝 Generating type for: ${contentType.name} (${typeName})`);

      typeDefinitions += `// ${contentType.name}\n`;
      if (contentType.description) {
        typeDefinitions += `// ${contentType.description}\n`;
      }
      typeDefinitions += `export interface ${typeName}Fields {\n`;

      contentType.fields.forEach((field) => {
        const fieldName = field.id;
        const fieldType = getFieldType(field);
        const required = field.required ? "" : "?";
        const description = field.name ? `  /** ${field.name} */\n` : "";

        typeDefinitions += description;
        typeDefinitions += `  ${fieldName}${required}: ${fieldType}\n`;
      });

      typeDefinitions += `}\n\n`;
      // Skeleton type for Entry generic (v10+)
      typeDefinitions += `export interface ${typeName}Skeleton {\n`;
      typeDefinitions += `  contentTypeId: '${contentType.sys.id}'\n`;
      typeDefinitions += `  fields: ${typeName}Fields\n`;
      typeDefinitions += `}\n\n`;
      typeDefinitions += `export type ${typeName} = Entry<${typeName}Skeleton>\n\n`;
    });

    // Generate union type for all content types
    const allTypes = contentTypes.items
      .map((ct) => toPascalCase(ct.sys.id))
      .join(" | ");
    typeDefinitions += `// Union type for all content types\n`;
    typeDefinitions += `export type ContentfulEntry = ${allTypes}\n\n`;

    // Generate content type ID constants
    typeDefinitions += `// Content type IDs\n`;
    typeDefinitions += `export const CONTENT_TYPES = {\n`;
    contentTypes.items.forEach((ct) => {
      const constName = ct.sys.id.toUpperCase().replace(/-/g, "_");
      typeDefinitions += `  ${constName}: '${ct.sys.id}',\n`;
    });
    typeDefinitions += `} as const\n\n`;

    // Generate content type map
    typeDefinitions += `// Helper type for content type mapping\n`;
    typeDefinitions += `export type ContentTypeMap = {\n`;
    contentTypes.items.forEach((ct) => {
      const typeName = toPascalCase(ct.sys.id);
      typeDefinitions += `  [CONTENT_TYPES.${ct.sys.id.toUpperCase().replace(/-/g, "_")}]: ${typeName}\n`;
    });
    typeDefinitions += `}\n`;

    // Write to file
    const outputPath = path.join(process.cwd(), "types", "contentful.ts");

    // Create types directory if it doesn't exist
    const typesDir = path.dirname(outputPath);
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, typeDefinitions);

    console.log(`🎉 Types generated successfully at: ${outputPath}`);
    console.log(`\n📋 Generated types for:`);
    contentTypes.items.forEach((ct) => {
      console.log(`  - ${ct.name} (${toPascalCase(ct.sys.id)})`);
    });
  } catch (error) {
    console.error("❌ Error generating types:", error.message);
    if (error.details) {
      console.error("Details:", error.details);
    }
  }
}

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function getFieldType(field) {
  switch (field.type) {
    case "Symbol":
    case "Text":
      return "string";
    case "Integer":
    case "Number":
      return "number";
    case "Boolean":
      return "boolean";
    case "Date":
      return "string";
    case "Location":
      return "{ lat: number; lon: number }";
    case "RichText":
      return "any"; // You might want to import proper RichText types from @contentful/rich-text-types
    case "Link":
      if (field.linkType === "Asset") {
        return "Asset";
      } else if (field.linkType === "Entry") {
        // Try to be more specific if we know the content type
        if (
          field.validations &&
          field.validations.find((v) => v.linkContentType)
        ) {
          const linkedTypes = field.validations
            .find((v) => v.linkContentType)
            .linkContentType.map((id) => toPascalCase(id))
            .join(" | ");
          return `Entry<${linkedTypes}Skeleton>`;
        }
        return "Entry<any>";
      }
      return "any";
    case "Array":
      if (field.items) {
        const itemType = getFieldType(field.items);
        return `${itemType}[]`;
      }
      return "any[]";
    default:
      return "any";
  }
}

generateTypes();
