import { NextRequest, NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// POST - Update customer profile
export async function POST(request: NextRequest) {
  try {
    const { accessToken, firstName, lastName, email } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    const mutation = `
      mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
        customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
          customer {
            firstName
            lastName
            email
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
      customerAccessToken: accessToken,
      customer: { firstName, lastName, email },
    };

    const response = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const data = await response.json();

    if (
      data.errors ||
      data.data?.customerUpdate?.customerUserErrors?.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          errors: data.errors || data.data.customerUpdate.customerUserErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: data.data.customerUpdate.customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { success: false, errors: [{ message: "Network error" }] },
      { status: 500 }
    );
  }
}
