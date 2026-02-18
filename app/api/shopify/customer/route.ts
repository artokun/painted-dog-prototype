import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
    try {
        const { email, password, firstName, lastName, rememberMe } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Step 1: Create customer
        const createMutation = `
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

        const createResponse = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
            },
            body: JSON.stringify({
                query: createMutation,
                variables: {
                    input: {
                        email,
                        password,
                        firstName: firstName || "",
                        lastName: lastName || "",
                    },
                },
            }),
        });

        const createData = await createResponse.json();

        if (createData.errors) {
            return NextResponse.json(
                { success: false, errors: createData.errors },
                { status: 500 }
            );
        }

        if (createData.data?.customerCreate?.customerUserErrors?.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    errors: createData.data.customerCreate.customerUserErrors,
                },
                { status: 400 }
            );
        }

        // Step 2: Login to get access token
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

        const loginResponse = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
            },
            body: JSON.stringify({
                query: loginMutation,
                variables: { input: { email, password } },
            }),
        });

        const loginData = await loginResponse.json();

        if (loginData.errors || loginData.data?.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
            // Account created but login failed - tell user to login manually
            return NextResponse.json({
                success: true,
                customer: createData.data.customerCreate.customer,
                accessToken: null,
                message: "Account created! Please login.",
            });
        }

        const accessToken = loginData.data.customerAccessTokenCreate.customerAccessToken.accessToken;
        const customer = createData.data.customerCreate.customer;

        // Step 3: Create session
        await createSession(
            {
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                provider: "shopify",
                shopifyCustomerId: customer.id,
                shopifyAccessToken: accessToken,
            },
            rememberMe ?? false
        );

        return NextResponse.json({
            success: true,
            accessToken,
            customer,
        });
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json(
            { success: false, errors: [{ message: "Network error" }] },
            { status: 500 }
        );
    }
}