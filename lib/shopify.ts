const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

async function ShopifyData(query: string) {
  const URL = `https://${domain}/api/2026-01/graphql.json`;

  const options = {
    method: "POST",
    headers: {
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  };

  const response = await fetch(URL, options);
  const data = await response.json();

  return data;
}

export async function getAllProducts() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  const query = `
    {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  //  API version to match what works for you 2024/2026
  const response = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  console.log("Products with variants:", data);
  return data.data.products.edges;
}

export async function getProduct(handle: string) {
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

  const response = await ShopifyData(query);
  return response.data.product || null;
}

// Checkout Flow
export async function createCart(
  lineItems: { merchandiseId: string; quantity: number }[]
) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

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
    },
  };

  try {
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
      return null;
    }

    if (data.data?.cartCreate?.userErrors?.length > 0) {
      console.error("Cart errors:", data.data.cartCreate.userErrors);
      return null;
    }

    return data.data?.cartCreate?.cart;
  } catch (error) {
    console.error("Error creating cart:", error);
    return null;
  }
}

// Create a new customer account
export async function createCustomer(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

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

  try {
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
      return { success: false, errors: data.errors };
    }

    if (data.data?.customerCreate?.customerUserErrors?.length > 0) {
      console.error(
        "Customer errors:",
        data.data.customerCreate.customerUserErrors
      );
      return {
        success: false,
        errors: data.data.customerCreate.customerUserErrors,
      };
    }

    return { success: true, customer: data.data.customerCreate.customer };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// Login customer and get access token
export async function loginCustomer(email: string, password: string) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

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

  try {
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
      return { success: false, errors: data.errors };
    }

    if (data.data?.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
      console.error(
        "Login errors:",
        data.data.customerAccessTokenCreate.customerUserErrors
      );
      return {
        success: false,
        errors: data.data.customerAccessTokenCreate.customerUserErrors,
      };
    }

    return {
      success: true,
      accessToken:
        data.data.customerAccessTokenCreate.customerAccessToken.accessToken,
    };
  } catch (error) {
    console.error("Error logging in customer:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// Get customer info using access token
export async function getCustomer(accessToken: string) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        email
        firstName
        lastName
      }
    }
  `;

  const variables = {
    customerAccessToken: accessToken,
  };

  try {
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
      return { success: false, errors: data.errors };
    }

    return { success: true, customer: data.data.customer };
  } catch (error) {
    console.error("Error getting customer:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// Get customer orders
export async function getCustomerOrders(accessToken: string) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

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

  try {
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
    console.log("Get orders response:", data); // This line should already be there
    console.log("Customer data:", data.data?.customer);
    console.log("Orders edges:", data.data?.customer?.orders?.edges);

    if (data.errors) {
      return { success: false, errors: data.errors };
    }

    const orders =
      data.data?.customer?.orders?.edges.map((edge: any) => edge.node) || [];
    return { success: true, orders };
  } catch (error) {
    console.error("Error getting orders:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// Get customer addresses
export async function getCustomerAddresses(accessToken: string) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

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

  try {
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
    console.log("Get addresses response:", data);

    if (data.errors) {
      return { success: false, errors: data.errors };
    }

    const addresses =
      data.data?.customer?.addresses?.edges.map((edge: any) => edge.node) || [];
    return { success: true, addresses };
  } catch (error) {
    console.error("Error getting addresses:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// create Google customer using Admin
export async function createCustomerAdmin(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  const response = await fetch(
    `https://${domain}/admin/api/2026-01/customers.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken!,
      },
      body: JSON.stringify({
        customer: {
          email,
          password,
          password_confirmation: password,
          first_name: firstName,
          last_name: lastName,
          verified_email: true, // 👈 this is the key line
          send_email_welcome: false,
        },
      }),
    }
  );

  const data = await response.json();
  console.log("ADMIN CREATE CUSTOMER:", data);

  if (data.errors) {
    return { success: false, errors: data.errors };
  }

  return { success: true, customer: data.customer };
}

// Update customer profile
export async function updateCustomerProfile(
  accessToken: string,
  firstName: string,
  lastName: string,
  email: string
) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

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

  try {
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
      return {
        success: false,
        errors: data.errors || data.data.customerUpdate.customerUserErrors,
      };
    }

    return { success: true, customer: data.data.customerUpdate.customer };
  } catch (error) {
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// Update a customer address
export async function updateCustomerAddress(
  accessToken: string,
  addressId: string,
  address: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    phone?: string;
  }
) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

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

  try {
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
      return {
        success: false,
        errors:
          data.errors || data.data.customerAddressUpdate.customerUserErrors,
      };
    }

    return {
      success: true,
      address: data.data.customerAddressUpdate.customerAddress,
    };
  } catch (error) {
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// Password Recovery: Send recovery email
export async function customerRecover(email: string) {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const storefrontAccessToken =
        process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    const mutation = `
    mutation customerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

    const variables = {
        email,
    };

    try {
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
            return { success: false, errors: data.errors };
        }

        if (data.data?.customerRecover?.customerUserErrors?.length > 0) {
            console.error(
                "Recovery errors:",
                data.data.customerRecover.customerUserErrors
            );
            return {
                success: false,
                errors: data.data.customerRecover.customerUserErrors,
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Error sending recovery email:", error);
        return { success: false, errors: [{ message: "Network error" }] };
    }
}

// Password Reset: Set new password using reset token
export async function customerReset(
    resetUrl: string,
    password: string
) {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const storefrontAccessToken =
        process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    // Extract the reset token and customer ID from the Shopify reset URL
    // URL format: https://your-store.myshopify.com/account/reset/{customer_id}/{token}
    const urlParts = resetUrl.split('/');
    const token = urlParts[urlParts.length - 1];
    const customerId = urlParts[urlParts.length - 2];

    const mutation = `
    mutation customerResetByUrl($resetUrl: URL!, $password: String!) {
      customerResetByUrl(resetUrl: $resetUrl, password: $password) {
        customer {
          id
        }
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
        resetUrl,
        password,
    };

    try {
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
            return { success: false, errors: data.errors };
        }

        if (data.data?.customerResetByUrl?.customerUserErrors?.length > 0) {
            console.error(
                "Reset errors:",
                data.data.customerResetByUrl.customerUserErrors
            );
            return {
                success: false,
                errors: data.data.customerResetByUrl.customerUserErrors,
            };
        }

        // Return the new access token so user can be auto-logged in after reset
        return {
            success: true,
            accessToken: data.data.customerResetByUrl.customerAccessToken?.accessToken,
            customer: data.data.customerResetByUrl.customer,
        };
    } catch (error) {
        console.error("Error resetting password:", error);
        return { success: false, errors: [{ message: "Network error" }] };
    }
}