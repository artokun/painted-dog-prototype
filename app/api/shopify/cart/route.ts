import { NextRequest, NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// POST - Create a new cart
export async function POST(request: NextRequest) {
  try {
    const { lineItems, customerAccessToken } = await request.json();

    if (!lineItems || !Array.isArray(lineItems)) {
      return NextResponse.json(
        { error: "Invalid lineItems format" },
        { status: 400 }
      );
    }

    const cartCreateMutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lines: lineItems,
        // Attach customer if logged in
        ...(customerAccessToken && {
          buyerIdentity: {
            customerAccessToken: customerAccessToken,
          },
        }),
      },
    };

    const response = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
      },
      body: JSON.stringify({
        query: cartCreateMutation,
        variables: variables,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      return NextResponse.json(
        { error: "Failed to create cart", details: data.errors },
        { status: 500 }
      );
    }

    if (data.data?.cartCreate?.userErrors?.length > 0) {
      console.error("Cart errors:", data.data.cartCreate.userErrors);
      return NextResponse.json(
        {
          error: "Cart creation failed",
          details: data.data.cartCreate.userErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      cart: data.data?.cartCreate?.cart,
    });
  } catch (error) {
    console.error("Error creating cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
