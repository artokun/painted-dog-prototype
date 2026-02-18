// Client-side functions to call our secure API routes
// This file replaces direct calls to @/lib/shopify

// ============================================
// PRODUCTS
// ============================================

// Get all products
export async function getAllProducts() {
  try {
    const response = await fetch("/api/shopify/products");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch products");
    }

    return data.products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Get single product by handle
export async function getProduct(handle: string) {
  try {
    const response = await fetch(`/api/shopify/products/${handle}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch product");
    }

    return data.product;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

// ============================================
// CART
// ============================================

// Create a new cart
export async function createCart(
  lineItems: { merchandiseId: string; quantity: number }[]
) {
  try {
    const response = await fetch("/api/shopify/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lineItems }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create cart");
    }

    return data.cart;
  } catch (error) {
    console.error("Error creating cart:", error);
    return null;
  }
}

// ============================================
// CUSTOMER AUTHENTICATION
// ============================================

// Create a new customer account
export async function createCustomer(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
) {
  try {
    const response = await fetch("/api/shopify/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error creating customer:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// Login customer and get access token
export async function loginCustomer(email: string, password: string) {
  try {
    const response = await fetch("/api/shopify/customer/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error logging in customer:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// Get customer info using access token
export async function getCustomer(accessToken: string) {
  try {
    const response = await fetch("/api/shopify/customer/info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error getting customer:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// ============================================
// CUSTOMER PROFILE & DATA
// ============================================

// Get customer orders
export async function getCustomerOrders(accessToken: string) {
  try {
    const response = await fetch("/api/shopify/customer/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error getting orders:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// Get customer addresses
export async function getCustomerAddresses(accessToken: string) {
  try {
    const response = await fetch("/api/shopify/customer/addresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error getting addresses:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// Update customer profile
export async function updateCustomerProfile(
  accessToken: string,
  firstName: string,
  lastName: string,
  email: string
) {
  try {
    const response = await fetch("/api/shopify/customer/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken, firstName, lastName, email }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error updating customer:", error);
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
  try {
    const response = await fetch("/api/shopify/customer/address-update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken, addressId, address }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error updating address:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}


// ============================================
// PASSWORD RECOVERY
// ============================================

// Request password reset email
export async function recoverCustomerPassword(email: string) {
  try {
    const response = await fetch("/api/shopify/customer/recover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}

// Reset password using token from email
export async function resetCustomerPassword(
  resetUrl: string,
  password: string
) {
  try {
    const response = await fetch("/api/shopify/customer/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resetUrl, password }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, errors: [{ message: "Network error" }] };
  }
}
