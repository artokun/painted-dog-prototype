import { NextRequest, NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

console.log("Domain:", domain, "Token exists:", !!storefrontAccessToken);

// POST - Login customer and get access token
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const mutation = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        email,
        password,
      },
    };

    const response = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      return NextResponse.json(
        { success: false, errors: data.errors },
        { status: 500 }
      );
    }

    if (data.data?.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
      console.error(
        "Login errors:",
        data.data.customerAccessTokenCreate.customerUserErrors
      );
      return NextResponse.json(
        {
          success: false,
          errors: data.data.customerAccessTokenCreate.customerUserErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      accessToken:
        data.data.customerAccessTokenCreate.customerAccessToken.accessToken,
    });
  } catch (error) {
    console.error("Error logging in customer:", error);
    return NextResponse.json(
      { success: false, errors: [{ message: "Network error" }] },
      { status: 500 }
    );
  }
}
