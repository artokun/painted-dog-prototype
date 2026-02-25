import { NextRequest, NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// POST - Get customer orders
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
      query getCustomerOrders($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
            edges {
              node {
                id
                orderNumber
                processedAt
                fulfillmentStatus
                totalPrice {
                  amount
                  currencyCode
                }
                totalShippingPrice {
                  amount
                  currencyCode
                }
                lineItems(first: 10) {
                  edges {
                    node {
                      title
                      quantity
                      originalTotalPrice {
                        amount
                        currencyCode
                      }
                      variant {
                        image {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
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

    const orders =
      data.data?.customer?.orders?.edges.map((edge: any) => edge.node) || [];

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    return NextResponse.json(
      { success: false, errors: [{ message: "Network error" }] },
      { status: 500 }
    );
  }
}
