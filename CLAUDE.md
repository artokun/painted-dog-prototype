# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive 3D book catalog and ecommerce platform built with Next.js, React Three Fiber, Contentful CMS, and Shopify. Features an immersive book stack visualization, full ecommerce checkout, news/blog system, and customer account management.

**Tech Stack:**
- Next.js 15.5.10 with App Router and Turbopack
- React 19.1.0
- React Three Fiber 9.2.0 + Drei (local fork at `lib/drei/`) + Postprocessing
- React Spring Three for physics-based 3D animations
- GSAP for web/scroll animations
- Valtio 2.1.5 for global state management
- Contentful CMS for books, news, about, and legal content
- Shopify Storefront API for ecommerce (products, cart, customers)
- Resend for transactional email (newsletter, contact forms)
- JWT session management with httpOnly cookies (jose library)
- Zod for content validation
- TypeScript strict mode, Tailwind CSS v4, ESLint, Prettier
- Fuse.js for fuzzy search
- Leva for development 3D controls
- React Hook Form for form handling
- reCAPTCHA for form spam protection

## Development Commands

```bash
npm run dev            # Start dev server with Turbopack
npm run build          # Production build
npm run start          # Start production server
npm run lint           # Run ESLint
npm run lint:fix       # ESLint with auto-fix
npm run format         # Format with Prettier
npm run format:check   # Check formatting
npm run typecheck      # TypeScript type checking
npm run generate-types # Generate TS types from Contentful schema
npm run create-book    # Interactive book creation script
```

## Architecture

### Pages (App Router)

| Route | Description |
|-------|-------------|
| `/` | Homepage - 3D Canvas with book stack (middleware-controlled) |
| `/books/[slug]` | Book detail pages with leaflet sections, SEO metadata |
| `/about` | About page |
| `/contact` | Contact & book submission forms (dual-tab, reCAPTCHA) |
| `/news` | News archive with pagination and category filtering |
| `/news/[slug]` | Individual news articles |
| `/newsletter` | Newsletter subscription |
| `/login` | Login/register page |
| `/dashboard` | Customer account dashboard (orders, addresses, profile) |
| `/legal` | Legal policies |
| `/account/reset/[customerId]/[token]` | Password reset flow |

### API Routes (18 endpoints)

**Auth:** `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`
**Content:** `/api/books` (60s revalidation), `/api/about`, `/api/legal`
**Shopify:** `/api/shopify/products`, `/api/shopify/products/[handle]`, `/api/shopify/cart`, `/api/shopify/customer` (CRUD), `/api/shopify/customer/login`, `/api/shopify/customer/info`, `/api/shopify/customer/orders`, `/api/shopify/customer/addresses`, `/api/shopify/customer/address-update`, `/api/shopify/customer/update`, `/api/shopify/customer/recover`, `/api/shopify/customer/reset`

### Server Actions

- `contact.ts` - Contact form submission with reCAPTCHA validation
- `newsletter.ts` - Newsletter signup via Resend
- `submission.ts` - Book submission form processing

### Directory Structure

```
/app
  layout.tsx              # Root layout (Fields + Montserrat fonts)
  page.tsx                # Homepage
  middleware.ts           # Route protection
  /components             # ~80+ React components
    /models/books/        # 3D book models (XS, SM, MD, LG, XL, 280x260)
    /icons/               # 20+ SVG icon components
    /ecommerce/           # CartButton, CartSidebar, Dashboard, SocialLinks
    /leaflet/             # Modular book detail sections (7 components)
  /store                  # Valtio state stores (9 stores)
  /hooks                  # Custom hooks (4)
  /utils                  # Utility functions
  /actions                # Server actions
  /api                    # API route handlers
/lib                      # Server utilities and API clients
  /auth                   # JWT session management
  /drei                   # Local fork of @react-three/drei
/types
  /generated              # Auto-generated Contentful types
  app.ts                  # Core domain types
  contentful.ts           # Contentful-specific types
/scripts                  # Contentful management scripts
/docs                     # Technical documentation
/public
  /fonts                  # Custom Fields Bold font
  /models                 # 3D book GLTF files
  artist_workshop_1k.hdr  # HDR environment map
```

### Components (Key Groups)

**3D Scene:** `App.tsx`, `BookStack.tsx`, `Book.tsx`, `CameraController.tsx`, `Lights.tsx`, `Skybox.tsx`, `Floor.tsx`, `Cursor.tsx`

**Layout:** `Header.tsx`, `Footer.tsx`, `MenuOverlay.tsx`, `FloatingBar.tsx`, `Background.tsx`, `Middle.tsx`, `Foreground.tsx`, `ClientComponents.tsx` (dynamic imports)

**Book Detail (Leaflet Sections):** `BookSection.tsx`, `AuthorsSection.tsx`, `ReviewsSection.tsx`, `PodcastEpisodesSection.tsx`, `ExcerptsSection.tsx`, `ProductInformationSection.tsx`, `FullDescription.tsx`

**Page Content:** `BookPageContent.tsx`, `ContactPageContent.tsx`, `AboutPageContent.tsx`, `LegalPageContent.tsx`, `LoginPageComponent.tsx`, `NotFoundContent.tsx`

**Ecommerce:** `CartButton.tsx`, `CartSidebar.tsx`, `Dashboard.tsx`, `PurchaseButtons.tsx`

**Modals:** `NewsletterModal.tsx`, `ForgotPasswordModal.tsx`, `ResetPasswordModal.tsx`

**Forms/UI:** `PDButton.tsx`, `PDInput.tsx`, `PDTextarea.tsx`, `NewsletterForm.tsx`, `ReCaptcha.tsx`, `Markdown.tsx`, `AddToCalendarButton.tsx`

### State Management (Valtio Stores)

| Store | Purpose |
|-------|---------|
| `bookStore.ts` | Books data, focused/hovered book ID, loading/error, flip state |
| `filterStore.ts` | Sort order, search query, view mode (stack/grid), dropdown |
| `authStore.ts` | Login state, user profile, access token, hydration flag |
| `cartStore.ts` | Shopping cart items with localStorage persistence |
| `cartUIStore.ts` | Cart sidebar visibility, checkout flow state |
| `globalStore.ts` | Current/previous route, scroll pages, menu, newsletter modal |
| `materialStore.ts` | PBR material properties for 3D book rendering |
| `legalStore.ts` | Legal page content and loading state |
| `forgotPasswordStore.ts` | Forgot password modal state |
| `resetPasswordStore.ts` | Reset password modal with token/customer ID |

### Custom Hooks

- `useBookMaterialControls.tsx` - Leva UI controls for book material properties
- `useHLSVideoTexture.ts` - Video/HLS stream to Three.js texture with scaling/positioning
- `useGridOverrideControls.tsx` - Leva UI controls for grid layout debugging
- `useResetDectector.tsx` - Detect password reset flow from URL params

### Lib (Server Utilities)

- `contentful.ts` - Contentful client initialization (server-only)
- `books.ts` - Book transformation, slugification, enrichment
- `news.ts` - News article and category fetching/transformation
- `about.ts` - About page content
- `legal.ts` - Legal/policy page content
- `shopify.ts` - Shopify Storefront API GraphQL queries
- `shopify-client.ts` - Client-side Shopify API wrappers
- `resend.ts` - Email sending via Resend
- `utils.ts` - cn(), UUID generation, slugify, capitalize
- `newsletter-utils.ts` - Newsletter utilities
- `auth/session.ts` - JWT session management with httpOnly cookies
- `auth/jwt.ts` - JWT encoding/decoding with Web Crypto

## Three.js/R3F Patterns

- Components using Three.js must have `"use client"` directive
- Scene setup in `App.tsx`: HDR environment, directional lights with 4096x4096 shadows, floor mesh
- `BookStack.tsx` renders books with Suspense
- Desktop-only 3D rendering (mobile detection in place)
- Book animations via React Spring:
  - Click to slide out, 90-degree rotation, gravity drop for books above
  - Mouse-based tilt effect on featured books
  - Four-layer animation: base position → focus slide → lift/rotate → real-time interaction
- Text: spine text via Drei Text, front cover via Text3D with metallic gold material
- Camera: Drei ScrollControls (3 pages, 0.2 damping), tracks focused book Y position

## Ecommerce Architecture

- **Shopify Storefront API** via GraphQL (graphql-request)
- **Cart**: Client-side cart state in Valtio with localStorage persistence, Shopify cart creation at checkout
- **Customer Auth**: Shopify customer access tokens stored in JWT session cookies
- **Account Features**: Order history, saved addresses, profile management, password reset
- **Product Display**: Book detail pages link to Shopify products via handle matching

## Content Systems

### Contentful (Books, News, About, Legal)
- Auto-generated types via `cf-content-types-generator`
- Books: title, authors, genre, prices, sizes (XS-XL), cover textures, featured content
- News: articles with categories, cover images, rich text content
- About: team members, company information
- Legal: policy documents

### Book Size Mapping
```typescript
const contentfulSizeMap = {
  XS: [0.113, 0.0347, 0.1793],
  SM: [0.1317, 0.0187, 0.2072],
  MD: [0.138, 0.0195, 0.2075],
  LG: [0.1452, 0.0297, 0.2204],
  XL: [0.1572, 0.0226, 0.2333],
};
```

## Environment Variables

**Required:**
- `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, `CONTENTFUL_ENVIRONMENT`
- `CONTENTFUL_MANAGEMENT_TOKEN` (for type generation and book creation)
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_STORE_DOMAIN`
- `JWT_SECRET` (session signing)
- `RESEND_API_KEY` (email)
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`

## Configuration Notes

- TypeScript strict mode, bundler module resolution, `@/*` path alias
- ESLint extends `next/core-web-vitals`, relaxed a11y rules for 3D, ignores `lib/drei`
- Prettier: semicolons, double quotes, 80 char width
- Next.js: Contentful CDN remote images, 20MB server action body limit, reactStrictMode disabled
- Tailwind CSS v4 with `@tailwindcss/postcss`
- Local Drei fork at `lib/drei/` (referenced via `file:./lib/drei` in package.json)

## Documentation

- `/docs/ECOMMERCE.md` - Full ecommerce architecture
- `/docs/CONTENTFUL_BOOK_CREATION.md` - Book creation workflow
- `/docs/BOOK_CREATION_AGENT_SPEC.md` - Agent specifications
- `/docs/motion-system-architecture.md` - Animation system details
- `/docs/grid-mode-implementation-plan.md` - Grid view planning
- `TODO.md` - Active development task list
