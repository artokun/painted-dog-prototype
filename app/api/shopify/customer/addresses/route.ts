import { NextRequest, NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// POST - Get customer addresses
export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    const query = `
      query getCustomerAddresses($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          addresses(first: 10) {
            edges {
              node {
                id
                name
                firstName
                lastName
                address1
                address2
                city
                province
                country
                zip
                phone
              }
            }
          }
        }
      }
    `;

    const variables = {
      customerAccessToken: accessToken,
    };

    const response = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json(
        { success: false, errors: data.errors },
        { status: 500 }
      );
    }

    const addresses =
      data.data?.customer?.addresses?.edges.map((edge: any) => edge.node) || [];

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Error getting addresses:", error);
    return NextResponse.json(
      { success: false, errors: [{ message: "Network error" }] },
      { status: 500 }
    );
  }
}
