import { NextRequest, NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// POST - Update a customer address
export async function POST(request: NextRequest) {
  try {
    const { accessToken, addressId, address } = await request.json();

    if (!accessToken || !addressId || !address) {
      return NextResponse.json(
        { error: "Access token, address ID, and address data are required" },
        { status: 400 }
      );
    }

    const mutation = `
      mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
        customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
          customerAddress {
            id
            address1
            address2
            city
            province
            zip
            country
            phone
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
      id: addressId,
      address,
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
      data.data?.customerAddressUpdate?.customerUserErrors?.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          errors:
            data.errors || data.data.customerAddressUpdate.customerUserErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      address: data.data.customerAddressUpdate.customerAddress,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { success: false, errors: [{ message: "Network error" }] },
      { status: 500 }
    );
  }
}
