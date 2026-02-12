import { NextRequest, NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// POST - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const mutation = `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
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
        firstName,
        lastName,
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
    console.log("Create customer response:", data);

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      return NextResponse.json(
        { success: false, errors: data.errors },
        { status: 500 }
      );
    }

    if (data.data?.customerCreate?.customerUserErrors?.length > 0) {
      console.error(
        "Customer errors:",
        data.data.customerCreate.customerUserErrors
      );
      return NextResponse.json(
        {
          success: false,
          errors: data.data.customerCreate.customerUserErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: data.data.customerCreate.customer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { success: false, errors: [{ message: "Network error" }] },
      { status: 500 }
    );
  }
}
