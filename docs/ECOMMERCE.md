# Ecommerce Implementation

This document covers the Shopify Storefront API integration for authentication, cart, checkout, and customer management.

---

## Environment Variables

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
SHOPIFY_ADMIN_ACCESS_TOKEN=your-admin-token  # Optional: for creating verified customers
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SESSION_SECRET=your-session-secret  # For JWT signing
```

---

## Architecture Overview

```
lib/
├── shopify.ts           # Server-side Shopify API functions
├── shopify-client.ts    # Client-side wrappers (calls API routes)
└── auth/
    ├── session.ts       # JWT session management (httpOnly cookies)
    └── jwt.ts           # Pure Web Crypto JWT utilities

app/
├── api/
│   ├── auth/
│   │   ├── login/       # Creates session after Shopify login
│   │   ├── logout/      # Clears session cookie
│   │   └── session/     # Returns current session (for rehydration)
│   └── shopify/
│       ├── customer/
│       │   ├── route.ts           # Create customer
│       │   ├── login/             # Login (get access token)
│       │   ├── info/              # Get customer info
│       │   ├── orders/            # Get customer orders
│       │   ├── addresses/         # Get customer addresses
│       │   ├── update/            # Update profile
│       │   ├── address-update/    # Update address
│       │   ├── recover/           # Send password reset email
│       │   └── reset/             # Reset password with token
│       ├── cart/                  # Create cart → checkout URL
│       └── products/              # Get products
├── store/
│   ├── authStore.ts              # Valtio auth state
│   ├── cartStore.ts              # Valtio cart state
│   ├── cartUIStore.ts            # Cart sidebar visibility
│   ├── forgotPasswordStore.ts    # Forgot password modal state
│   └── resetPasswordStore.ts     # Reset password modal state
└── components/
    ├── LoginPageComponent.tsx    # Login/Register form
    ├── ForgotPasswordModal.tsx   # Triggers password recovery
    ├── ResetPasswordModal.tsx    # New password form
    └── ecommerce/
        ├── CartSidebar.tsx       # Cart drawer
        └── Dashboard.tsx         # Account dashboard (orders, addresses, profile)
```

---

## Authentication Flow

### Login
1. User submits email/password → `LoginPageComponent.tsx`
2. Client calls `/api/shopify/customer/login` → returns Shopify `accessToken`
3. Client calls `/api/auth/login` → creates JWT session in httpOnly cookie
4. `authStore` updated with user info

### Register
1. User submits form → `LoginPageComponent.tsx`
2. Client calls `/api/shopify/customer` → creates Shopify customer
3. Auto-login flow triggers (same as above)

### Session Rehydration
On app mount, `hydrateAuth()` in `authStore.ts` calls `/api/auth/session` to restore state from the httpOnly cookie.

### Remember Me
- Checked: Session lasts 30 days
- Unchecked: Session lasts 24 hours

Controlled in `lib/auth/session.ts` via `COOKIE_MAX_AGE_LONG` / `COOKIE_MAX_AGE_SHORT`.

---

## Password Reset Flow Setup

The password reset flow requires configuration in **three places**: Shopify Admin, environment variables, and the codebase.

---

### 1. Environment Variable

Ensure this is set (used to construct the reset URL in the API):

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
```

---

### 2. Shopify Email Template

**Location:** Shopify Admin → Settings → Notifications → Customer account password reset

By default, Shopify's reset email links to `your-store.myshopify.com/account/reset/...`. To redirect users to **your custom domain**, edit the template:

**Add this** at the top (after any `{% capture %}` blocks):

```liquid
{% assign url_parts = customer.reset_password_url | split: '/' %}
{% assign token = url_parts | last %}
{% assign customer_id = url_parts[-2] %}
{% assign custom_reset_url = 'https://YOUR_DOMAIN/account/reset/' | append: customer_id | append: '/' | append: token %}
```

**Replace `YOUR_DOMAIN`** with your actual domain (e.g., `www.example.com`).

**Then change** the button href:

```liquid
<!-- From: -->
<a href="{{ customer.reset_password_url }}">Reset your password</a>

<!-- To: -->
<a href="{{ custom_reset_url }}">Reset your password</a>
```

> **Local testing:** Use `http://localhost:3000` (not https) to avoid SSL errors.

---

### 3. Codebase Files

| Path | Purpose |
|------|---------|
| `lib/shopify.ts` | `customerRecover()` — triggers email; `customerReset()` — resets password |
| `lib/shopify-client.ts` | Client-side wrappers that call the API routes |
| `app/api/shopify/customer/recover/route.ts` | API route: sends reset email via Storefront API |
| `app/api/shopify/customer/reset/route.ts` | API route: resets password using token |
| `app/store/resetPasswordStore.ts` | Valtio store: holds `isOpen`, `customerId`, `token` |
| `app/components/ForgotPasswordModal.tsx` | Modal: user enters email to request reset |
| `app/components/ResetPasswordModal.tsx` | Modal: user enters new password |
| `app/components/Foreground.tsx` | Detects `/account/reset/[customerId]/[token]` URL and opens modal |
| `app/account/reset/[customerId]/[token]/page.tsx` | Catch-all route (returns `null`) so Next.js doesn't 404 |

---

### 4. User Flow

1. User clicks "Forgot Password" → `ForgotPasswordModal` opens
2. User submits email → `/api/shopify/customer/recover` → Shopify sends email
3. Email contains link: `https://YOUR_DOMAIN/account/reset/{customerId}/{token}`
4. User clicks link → Lands on your site
5. `Foreground.tsx` detects the URL pattern → Opens `ResetPasswordModal` with params
6. User submits new password → `/api/shopify/customer/reset` → Password updated
7. Auto-login → User redirected to home, logged in

---

### 5. URL Detection Logic (Foreground.tsx)

```tsx
useEffect(() => {
  const match = pathname.match(/^\/account\/reset\/([^/]+)\/([^/]+)$/);
  if (match) {
    const [, customerId, token] = match;
    openResetPassword(customerId, token);
    router.push("/");  // Clean URL after capturing params
  }
}, [pathname]);
```

---

### 6. Reset API Call (ResetPasswordModal.tsx)

The modal constructs the full Shopify reset URL and calls the API:

```tsx
const resetUrl = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/account/reset/${customerId}/${token}`;
const result = await resetCustomerPassword(resetUrl, newPassword);
```

---

## Cart & Checkout

### Adding to Cart
Cart is managed client-side in `cartStore.ts` (Valtio). Items stored as:

```ts
interface CartItem {
  id: string;           // Shopify variant ID
  title: string;
  price: number;
  quantity: number;
  image?: string;
}
```

### Checkout Flow
1. User clicks checkout → `CartSidebar.tsx`
2. If not logged in → Redirect to `/login`
3. If logged in → Call `/api/shopify/cart` with line items
4. API returns `checkoutUrl` from Shopify
5. Redirect to Shopify checkout

```tsx
const handleCheckout = async () => {
  if (!auth.isLoggedIn) {
    onClose();
    globalStore.currentRoute = "/login";  // Use globalStore, not window.location
    return;
  }
  
  const cart = await createCart(lineItems);
  window.location.href = cart.checkoutUrl;
};
```

---

## Customer Dashboard

**Location:** `app/components/ecommerce/Dashboard.tsx`

### Tabs
- **Profile** — View/edit first name, last name, email
- **Addresses** — View/edit shipping addresses
- **Orders** — View order history with line items

### API Calls
All use the Shopify `customerAccessToken` stored in the session:

- `getCustomerOrders(accessToken)`
- `getCustomerAddresses(accessToken)`
- `updateCustomerProfile(accessToken, firstName, lastName, email)`
- `updateCustomerAddress(accessToken, addressId, address)`

---

## Navigation Pattern

**Important:** This app uses `globalStore.currentRoute` for internal navigation, not `window.location.href` or Next.js `router.push()`.

```tsx
// ✅ Correct
globalStore.currentRoute = "/login";

// ❌ Incorrect (causes full page reload, breaks animations)
window.location.href = "/login";
```

The `Foreground.tsx` component syncs `currentRoute` with the actual URL via a `useEffect`.

---

## Shopify Theme Considerations

### Horizon Theme + New Customer Accounts
The Horizon theme **only supports** Shopify's "New Customer Accounts" (passwordless login). This means:

- Shopify-hosted login uses email code, not password
- You **cannot** edit `/account/login` templates in the theme
- Legacy customer account templates don't exist

### Hybrid Approach (Current Implementation)
- **Your site:** Email/password auth via Storefront API
- **Shopify checkout:** Passwordless (or guest checkout)
- **Both authenticate the same customer record**

### Store Credit Limitation
Switching to "Legacy Customer Accounts" disables Store Credit. If Store Credit is needed, keep New Customer Accounts enabled.

---

## Storefront API Scopes Required

In Shopify Admin → Settings → Apps → Develop apps → Your app → Configure Storefront API scopes:

- `unauthenticated_read_customers`
- `unauthenticated_write_customers`
- `unauthenticated_read_product_listings`
- `unauthenticated_write_checkouts`

---

## Gotchas

| Issue | Solution |
|-------|----------|
| Reset email goes to Shopify URL | Edit the Liquid email template (see above) |
| `https://localhost` SSL error | Use `http://localhost:3000` for local testing |
| Login redirects to home instead of login page | Use `globalStore.currentRoute`, not `window.location.href` |
| Customer can't reset password | They must have an "active" account (not just "invited") |
| Passwordless login at checkout | Expected behavior with New Customer Accounts |
