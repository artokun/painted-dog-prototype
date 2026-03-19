import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Step 1: Get access token
    const loginMutation = `
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

    const loginResponse = await fetch(
      `https://${domain}/api/2026-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
        },
        body: JSON.stringify({
          query: loginMutation,
          variables: { input: { email, password } },
        }),
      }
    );

    const loginData = await loginResponse.json();

    if (loginData.errors) {
      return NextResponse.json(
        { success: false, errors: loginData.errors },
        { status: 500 }
      );
    }

    if (
      loginData.data?.customerAccessTokenCreate?.customerUserErrors?.length > 0
    ) {
      const shopifyError =
        loginData.data.customerAccessTokenCreate.customerUserErrors[0];

      const friendlyMessages: Record<string, string> = {
        UNIDENTIFIED_CUSTOMER: "Incorrect email or Password. Please try again.",
        INVALID: "Incorrect email or password. Please try again.",
        TAKEN: "An account with this email already exists.",
        TOO_MANY_ATTEMPTS_EXCEEDED:
          "Too many login attempts. Please wait a moment and try again.",
        TOKEN_INVALID: "Your session has expired. Please login in again. ",
        CUSTOMER_DISABLED:
          "This account has been disabled. Please contact support.",
      };

      const message =
        friendlyMessages[shopifyError.code] ??
        "Login failed. Please try again.";

      return NextResponse.json(
        {
          success: false,
          errors: [{ message }],
        },
        { status: 400 }
      );
    }

    const accessToken =
      loginData.data.customerAccessTokenCreate.customerAccessToken.accessToken;

    // Step 2: Get customer info (same server, no extra client round trip)
    const customerQuery = `
      query getCustomer($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          email
          firstName
          lastName
        }
      }
    `;

    const customerResponse = await fetch(
      `https://${domain}/api/2026-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
        },
        body: JSON.stringify({
          query: customerQuery,
          variables: { customerAccessToken: accessToken },
        }),
      }
    );

    const customerData = await customerResponse.json();

    if (customerData.errors || !customerData.data?.customer) {
      return NextResponse.json(
        {
          success: false,
          errors: customerData.errors || [
            { message: "Failed to fetch customer" },
          ],
        },
        { status: 500 }
      );
    }

    // Create session server-side
    await createSession(
      {
        email: customerData.data.customer.email,
        firstName: customerData.data.customer.firstName,
        lastName: customerData.data.customer.lastName,
        provider: "shopify",
        shopifyCustomerId: customerData.data.customer.id,
        shopifyAccessToken: accessToken,
      },
      rememberMe ?? false
    );

    // Return both in one response
    return NextResponse.json({
      success: true,
      accessToken,
      customer: customerData.data.customer,
    });
  } catch (error) {
    console.error("Error logging in customer:", error);
    return NextResponse.json(
      { success: false, errors: [{ message: "Network error" }] },
      { status: 500 }
    );
  }
}
