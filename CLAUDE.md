# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 project with TypeScript and React Three Fiber for 3D graphics. The project creates an interactive 3D book catalog with Contentful CMS integration. The project uses:
- Next.js 15.4.4 with App Router
- React 19.1.0 
- React Three Fiber for 3D rendering
- React Three Drei for 3D utilities (ScrollControls, Environment, Text, Text3D)
- React Three Rapier for physics simulation (available but not actively used)
- React Spring Three for physics-based animations
- Valtio for global state management
- Contentful CMS for book data and asset management
- Zod for content validation and type safety
- TypeScript with strict mode
- Tailwind CSS v4
- ESLint and Prettier for code quality
- Custom Fields font family for typography
- Leva for development controls and material debugging

## Development Commands

```bash
# Development
npm run dev         # Start development server with Turbopack

# Building
npm run build       # Create production build
npm run start       # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Run ESLint with auto-fix
npm run format      # Format code with Prettier
npm run format:check # Check code formatting
npm run typecheck   # Run TypeScript type checking

# Contentful Integration
npm run generate-types # Generate TypeScript types from Contentful schema
npm run create-book    # Interactive book creation script for Contentful
```

## Architecture

The project follows Next.js App Router structure:
- `/app` - Main application directory
  - `layout.tsx` - Root layout with Fields and Montserrat fonts
  - `page.tsx` - Homepage with Three.js Canvas, navigation header, and floating UI controls
  - `components/` - React components
    - `App.tsx` - Main 3D scene component with book stack and lighting
    - `AuthGate.tsx` - Password authentication component with localStorage persistence
    - `Backdrop.tsx` - Dynamic backdrop that appears when a book is featured
    - `Book.tsx` - Individual book component with advanced multi-layer animations
    - `CameraController.tsx` - Camera movement controlled by scroll position
    - `Background.tsx` - Animated background pattern component
    - `models/books/` - 3D book model components
      - `BookXS.tsx`, `BookSM.tsx`, `BookMD.tsx`, `BookLG.tsx`, `BookXL.tsx` - Size-specific book models
      - `index.ts` - Barrel exports for book components
    - `icons/` - SVG icon components (Search, SortAsc, SortBy, SortDesc)
  - `store/` - Global state management
    - `bookStore.ts` - Valtio store for book state and animations
    - `filterStore.ts` - Valtio store for sorting, searching, and view state
    - `authStore.ts` - Valtio store for authentication state
    - `materialStore.ts` - Valtio store for material properties and debugging
  - `hooks/` - Custom React hooks
    - `useBookTextures.ts` - Hook for loading textures and managing material properties
  - `utils/` - Utility functions
    - `book.ts` - Book positioning, sizing, and sorting utilities
    - `contentful.ts` - Contentful data fetching and transformation
- `/types` - TypeScript type definitions
  - Generated Contentful types (`TypeBook.ts`, `TypeAuthor.ts`, etc.)
  - Application types (`book.ts`, `contentful.ts`)
- `/scripts` - Contentful management scripts
- `/docs` - Technical documentation
- `/public` - Static assets
  - `fonts/` - Custom Fields Bold font
  - `models/` - 3D book model files (.gltf format)
  - `artist_workshop_1k.hdr` - HDR environment map for lighting
  - `FSP DEMO - Fields Display_Bold.json` - 3D font data for Text3D
  - `logo-dog.png` - Logo used in authentication screen
- Uses `"use client"` directive for components using React Three Fiber
- Path alias `@/*` maps to project root

## Three.js/R3F Patterns

- Components using Three.js must be client components
- Main scene setup in `App.tsx` includes:
  - HDR environment lighting from `/artist_workshop_1k.hdr`
  - Directional lights with shadows (4096x4096 shadow map)
  - Simple circle mesh as table surface (coffee table model commented out)
  - Book stack rendered with Suspense for better loading
  - ScrollControls wrapper for smooth camera movement
- Book animations use React Spring for physics-based motion:
  - Click to slide out books to optimal viewing distance
  - Books rotate 90 degrees when featured
  - Books above the selected book drop down with gravity effect
  - Chained animations: slide → rotate + lift
  - Mouse-based tilt effect on featured books
  - Top book stands vertically by default
- Text rendering:
  - Spine text using Drei Text component with Fields Bold font
  - Front cover uses Text3D with metallic gold material
  - Dynamic font sizing based on title length
  - Multi-line text wrapping for long titles
- Camera controller:
  - Controlled by Drei ScrollControls (3 pages, 0.2 damping)
  - Tracks featured book Y position
  - Smooth interpolation between positions
- Backdrop component:
  - Appears with 600ms delay when book is featured
  - Blocks interaction with books behind featured book
  - Animated opacity using React Spring

## Key Features

### Contentful Integration
- **Dynamic Content**: Books fetched from Contentful CMS with real-time updates
- **Asset Management**: Book cover textures stored and delivered via Contentful CDN
- **Type Safety**: Auto-generated TypeScript types from Contentful schema
- **Content Validation**: Zod schemas ensure data integrity and type safety
- **Book Creation**: Automated scripts for adding new books with metadata research

### Book Data Structure
- **Book Sizes**: Five precise size variants (XS, SM, MD, LG, XL) with accurate 3D dimensions
- **Rich Metadata**: Title, authors, genre, publication date, description, pricing
- **Linked Entities**: Authors, genres, prices as separate Contentful entries
- **Media Assets**: Front and side cover textures with optimized delivery
- **Featured Content**: Critical reception text, podcast links, article references

### 3D Visualization & Animation
- **Multi-Layer Animation System**: Four-layer animation architecture for complex interactions
- **Physics-Based Springs**: React Spring animations with custom configurations per motion type
- **Interactive Book Models**: Five size-specific 3D models with precise dimensions from GLTF analysis
- **Advanced Material System**: PBR materials with customizable properties via material store
- **Performance Optimizations**: 
  - Local hover state to prevent global re-renders
  - Conditional texture loading and material updates
  - Staggered animations to prevent frame drops
  - Ref-based animation conflict prevention

### User Interface
- **Authentication**: Password-protected access with localStorage persistence
- **Search & Filter**: Fuzzy search with Fuse.js, sorting by title/author
- **View Modes**: Stack view (current) with grid view architecture prepared
- **Interactive Controls**: Click to focus, mouse tilt effects, scroll navigation
- **UI Components**:
  - Fixed header with navigation links and "painted dog" branding
  - Floating bottom bar with Stack/Grid toggle and sort controls
  - Animated background pattern with repeated "painted dog" text
  - Dynamic backdrop system for focused books

### Visual & Material System
- **Texture Management**: Custom hook for loading and applying book textures
- **Material Store**: Centralized material property management with Leva controls
- **Lighting System**: HDR environment lighting with dynamic intensity
- **Shadow System**: Optimized shadow mapping (4096x4096) with proper bias settings
- **Text Rendering**:
  - 3D spine text with dynamic font sizing
  - Front cover titles with metallic materials
  - Multi-line text wrapping for long titles

### Performance & State Management
- **Optimized Rendering**: Conditional animations based on book visibility and state
- **Efficient State**: Valtio proxy stores for reactive updates without unnecessary re-renders
- **Animation Coordination**: Complex chained animations with proper timing and conflict resolution
- **Memory Management**: Proper cleanup of textures, materials, and animation refs

## Contentful Schema & Data Structure

### Book Entry Fields
- `title` (Text) - Book title
- `featured` (Boolean) - Whether book appears at top of stack
- `description` (Long text) - Book description
- `authors` (References to Author entries) - Book authors
- `publishDate` (Date) - Publication date
- `genre` (Reference to Genre entry) - Book genre
- `prices` (References to Price entries) - Available prices
- `bookSize` (Select) - One of: XS, SM, MD, LG, XL
- `bookCoverTextureFront` (Asset) - Front cover image
- `bookCoverTextureSide` (Asset) - Spine/side cover image
- `linkToFeaturedArticle` (Reference to Link) - Featured article link
- `linkToPodcastEpisode` (Reference to Link) - Podcast episode link
- `criticalReceptionText` (Long text) - Critical reception content
- `podcastText` (Long text) - Podcast-related content
- `podcastLinks` (References to Link entries) - Additional podcast links

### Book Size Mapping (Precise GLTF Measurements)
```typescript
// Dimensions extracted from 3D models: [width, thickness, height] in meters
const contentfulSizeMap = {
  XS: [0.113, 0.0347, 0.1793],   // 113.0mm × 34.7mm × 179.3mm
  SM: [0.1317, 0.0187, 0.2072],  // 131.7mm × 18.7mm × 207.2mm
  MD: [0.138, 0.0195, 0.2075],   // 138.0mm × 19.5mm × 207.5mm
  LG: [0.1452, 0.0297, 0.2204],  // 145.2mm × 29.7mm × 220.4mm
  XL: [0.1572, 0.0226, 0.2333],  // 157.2mm × 22.6mm × 233.3mm
};
```

## Animation System Architecture

### Four-Layer Animation Pattern
1. **Base Position Layer**: Core positioning based on stack/grid/search states
2. **Focus Slide Layer**: Forward slide animation when book is selected
3. **Focus Lift & Rotate Layer**: Vertical lift and 90° rotation for focused books
4. **Real-time Interaction Layer**: Mouse-based tilt effects during focus

### Spring Configuration Strategy
- `config.gentle` - Smooth, deliberate movements (slide animations, backdrop fades)
- `config.stiff` - Quick, responsive updates (Z-depth changes, real-time tracking)
- `config.slow` - Heavy, gravity-like motion (Y-position updates, drops)
- `config.default` - Standard spring physics (general movements, rotations)

### Performance Optimizations Implemented
1. **Local State for Hover**: Prevents global re-renders on mouse interactions
2. **Ref-Based Animation Flags**: Prevents conflicting animations without state updates
3. **Conditional Texture Loading**: Only loads materials when books are visible
4. **Staggered Animations**: Delays between book animations prevent frame drops
5. **Material Store Optimization**: Direct access to material properties without snapshots in useFrame

## Material System

### Material Store Properties
- `metalness` (0-1) - Material metallic property
- `roughness` (0-1) - Surface roughness
- `ior` (1.0-2.333) - Index of refraction for glass-like effects
- `transmission` (0-1) - Light transmission through material
- `thickness` (0-5) - Material thickness for transmission
- `clearcoat` (0-1) - Clear coat layer intensity
- `clearcoatRoughness` (0-1) - Clear coat surface roughness
- `specularIntensity` (0-2) - Specular reflection intensity
- `specularColor` - Specular highlight color

### Texture Configuration
- **Front covers**: Applied to front-facing book materials
- **Side covers**: Applied to spine materials with horizontal mirroring
- **Texture optimization**: flipY=false, SRGBColorSpace, anisotropy=8
- **Dynamic updates**: Material properties updated via useFrame for performance

## Search & Filter System

### Fuzzy Search Implementation
- **Library**: Fuse.js with weighted keys (title: 0.7, author names: 0.15 each)
- **Threshold**: 0.3 (balance between strict and fuzzy matching)
- **Features**: Includes match scoring, highlights, location-independent matching
- **Performance**: Books marked as `hidden` when filtered, maintaining position

### Sorting Capabilities
- **By Title**: Alphabetical A-Z or Z-A
- **By Author**: Primary author's full name
- **Featured Priority**: Featured books always appear at top regardless of sort

## View System Architecture

### Current: Stack View
- Books stacked vertically with small random offsets
- Focused book slides forward and rotates 90°
- Books above focused book drop with gravity simulation
- Scroll-based camera movement through the stack

### Prepared: Grid View
- Grid layout calculation functions ready (`calculateSortGridPosition`)
- Camera positioning prepared for aerial overview
- Animation system supports arbitrary target positions
- UI toggle exists but grid mode not fully activated

## Development & Debugging

### Leva Controls
- Material property debugging with real-time updates
- Book material controls panel for PBR material tuning
- Integration with materialStore for centralized property management

### Type Generation
- Contentful types auto-generated via `cf-content-types-generator`
- Zod schemas for runtime validation and type safety
- Backward compatibility types for legacy code integration

### Content Management
- Interactive book creation script (`npm run create-book`)
- Automated metadata research and asset management
- Environment variables for Contentful space and API access

## Configuration Notes

- TypeScript configured with strict mode and bundler module resolution
- ESLint extends `next/core-web-vitals` with relaxed a11y rules for 3D interactions
- Prettier configured with standard settings (semicolons, double quotes, 80 char width)
- Contentful environment variables required: `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`