import { createClient, type Environment } from "contentful-management";
import "dotenv/config";

type LocaleCode = "en-US";

const LOCALE: LocaleCode = "en-US";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

const managementClient = createClient({
  accessToken: getEnv("CONTENTFUL_MANAGEMENT_TOKEN"),
});

async function getEnvironment(): Promise<Environment> {
  const space = await managementClient.getSpace(getEnv("CONTENTFUL_SPACE_ID"));
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
  const environment = await space.getEnvironment(environmentId);
  return environment;
}

async function ensureContentType(
  environment: Environment,
  id: string,
  definition: Parameters<Environment["createContentTypeWithId"]>[1]
) {
  try {
    const existing = await environment.getContentType(id);
    if (definition.name) {
      existing.name = definition.name;
    }
    existing.description = definition.description ?? existing.description;
    existing.displayField = definition.displayField ?? existing.displayField;
    existing.fields = definition.fields;
    const updated = await existing.update();
    await updated.publish();
    console.log(`✅ Updated content type: ${id}`);
  } catch (error: any) {
    if (error?.name === "NotFound") {
      const created = await environment.createContentTypeWithId(id, definition);
      await created.publish();
      console.log(`✅ Created content type: ${id}`);
    } else {
      throw error;
    }
  }
}

interface PolicySeed {
  policyId: string;
  navTitle: string;
  title: string;
  content: string;
}

const POLICIES: PolicySeed[] = [
  {
    policyId: "privacy-data-collection",
    navTitle: "Privacy & Data Collection",
    title: "Privacy & Data Collection",
    content:
      "We are committed to safeguarding your personal information in compliance with South Africa's Protection of Personal Information Act (POPIA). We collect personal data only when voluntarily provided—for example, when you subscribe to news, participate in events or contact us. No data is knowingly collected from individuals under the age of 13. Personal information will never be sold or shared with third parties for profit.",
  },
  {
    policyId: "use-of-personal-information",
    navTitle: "Use of Personal Information",
    title: "Use of Personal Information",
    content:
      "Your data is used to:\n\n- Respond to your requests and fulfil business obligations.\n- Send marketing communications related to our publications—with your consent where required. You may opt out of marketing communications at any time.",
  },
  {
    policyId: "cookies",
    navTitle: "Cookies and Tracking Technologies",
    title: "Cookies and Tracking Technologies",
    content:
      "Our website may use cookies or similar technologies (such as pixels or web beacons) to enhance user experience—remembering preferences, optimising navigation and collecting anonymous usage data. You may adjust your browser settings to manage cookies.",
  },
  {
    policyId: "third-party-processors",
    navTitle: "Third-Party Processors",
    title: "Third-Party Processors",
    content:
      "We may engage trusted third-party service providers (such as analytics or email platforms) to assist in operations and marketing. These providers are bound to handle personal information securely and in accordance with POPIA. Links to external websites are provided for your convenience—we are not responsible for their privacy practices.",
  },
  {
    policyId: "cross-border-transfers",
    navTitle: "Cross-Border Data Transfers",
    title: "Cross-Border Data Transfers",
    content:
      "Personal data may be stored or processed outside South Africa where necessary. We ensure that such external parties adhere to standards comparable to our privacy policy—via binding agreements or recognised legal safeguards.",
  },
  {
    policyId: "data-retention",
    navTitle: "Data Retention",
    title: "Data Retention",
    content:
      "We retain personal data only as long as is necessary to fulfil the purposes for which it was collected or as required by law. Once no longer needed, data will be securely deleted or anonymised.",
  },
  {
    policyId: "security-measures",
    navTitle: "Security Measures",
    title: "Security Measures",
    content:
      "We implement industry-standard security measures—including SSL encryption and secure server storage—to protect your personal information from unauthorised access or breaches. While we strive to safeguard data, transmission over the internet carries inherent risks.",
  },
  {
    policyId: "your-rights",
    navTitle: "Your Rights",
    title: "Your Rights",
    content:
      "You have the right to:\n\n- Access and update your personal information.\n- Request erasure of your data (excluding legally required records).\n- Withdraw consent to marketing and data processing.\n- Lodge a complaint with the Information Regulator of South Africa if you believe your data has been mishandled.",
  },
  {
    policyId: "legal-compliance",
    navTitle: "Legal Compliance and Disclosure",
    title: "Legal Compliance and Disclosure",
    content:
      "We may disclose your personal information when required by law—such as subpoenas, court orders or to safeguard public safety—as permitted under POPIA.",
  },
  {
    policyId: "policy-updates",
    navTitle: "Policy Updates",
    title: "Policy Updates",
    content:
      "We reserve the right to update this Privacy & Legal Policy at any time. Any changes will be posted on our website and will take effect immediately upon publication.",
  },
];

async function upsertPolicy(environment: Environment, seed: PolicySeed) {
  const existing = await environment.getEntries({
    content_type: "policy",
    "fields.policyId": seed.policyId,
    limit: 1,
  });

  const fields = {
    policyId: { [LOCALE]: seed.policyId },
    navTitle: { [LOCALE]: seed.navTitle },
    title: { [LOCALE]: seed.title },
    content: { [LOCALE]: seed.content },
  } as const;

  if (existing.items.length > 0) {
    let entry = existing.items[0];
    entry.fields = { ...entry.fields, ...fields } as typeof entry.fields;
    entry = await entry.update();
    if (!entry.isPublished()) {
      entry = await entry.publish();
    } else {
      entry = await entry.publish();
    }
    console.log(`✅ Upserted policy: ${seed.policyId}`);
    return entry;
  }

  const created = await environment.createEntry("policy", { fields });
  const published = await created.publish();
  console.log(`✅ Created policy: ${seed.policyId}`);
  return published;
}

async function upsertLegalPage(
  environment: Environment,
  policyIds: string[]
) {
  const existing = await environment.getEntries({
    content_type: "legalPage",
    "fields.slug": "legal-page",
    limit: 1,
  });

  const policyLinks = policyIds.map((id) => ({
    sys: { type: "Link", linkType: "Entry", id },
  }));

  const fields = {
    title: { [LOCALE]: "Privacy & Legal Policy" },
    slug: { [LOCALE]: "legal-page" },
    policies: { [LOCALE]: policyLinks },
  } as const;

  if (existing.items.length > 0) {
    let entry = existing.items[0];
    entry.fields = { ...entry.fields, ...fields } as typeof entry.fields;
    entry = await entry.update();
    if (!entry.isPublished()) {
      entry = await entry.publish();
    } else {
      entry = await entry.publish();
    }
    console.log("✅ Updated Legal Page entry");
    return entry;
  }

  const created = await environment.createEntry("legalPage", { fields });
  const published = await created.publish();
  console.log("✅ Created Legal Page entry");
  return published;
}

async function main() {
  const environment = await getEnvironment();

  await ensureContentType(environment, "policy", {
    name: "Policy",
    description: "Individual policy section for the legal page",
    displayField: "title",
    fields: [
      {
        id: "policyId",
        name: "Policy ID",
        type: "Symbol",
        required: true,
        localized: true,
        validations: [{ unique: true }],
      },
      {
        id: "navTitle",
        name: "Navigation Title",
        type: "Symbol",
        required: true,
        localized: true,
      },
      {
        id: "title",
        name: "Title",
        type: "Symbol",
        required: true,
        localized: true,
      },
      {
        id: "content",
        name: "Content",
        type: "Text",
        required: true,
        localized: true,
      },
    ],
  });

  await ensureContentType(environment, "legalPage", {
    name: "Legal Page",
    description: "Page containing the list of legal policies",
    displayField: "title",
    fields: [
      {
        id: "title",
        name: "Title",
        type: "Symbol",
        required: true,
        localized: true,
      },
      {
        id: "slug",
        name: "Slug",
        type: "Symbol",
        required: true,
        localized: true,
        validations: [{ unique: true }],
      },
      {
        id: "policies",
        name: "Policies",
        type: "Array",
        required: true,
        localized: true,
        items: {
          type: "Link",
          linkType: "Entry",
          validations: [{ linkContentType: ["policy"] }],
        },
      },
    ],
  });

  const policies = [] as string[];
  for (const seed of POLICIES) {
    const policy = await upsertPolicy(environment, seed);
    policies.push(policy.sys.id);
  }

  await upsertLegalPage(environment, policies);
}

main()
  .then(() => {
    console.log("✅ Legal page setup complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed to set up legal page:", error);
    process.exit(1);
  });
