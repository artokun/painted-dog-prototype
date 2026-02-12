import { NextRequest, NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// GET single product by handle
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await context.params;

    const query = `
      {
        product(handle: "${handle}") {
          id
          title
          handle
          description
          descriptionHtml
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 25) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json(
        { error: "Failed to fetch product", details: data.errors },
        { status: 500 }
      );
    }

    if (!data.data.product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: data.data.product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
