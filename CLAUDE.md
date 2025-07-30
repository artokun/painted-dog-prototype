# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 project with TypeScript and React Three Fiber for 3D graphics. The project creates an interactive 3D book stack visualization with authentication. The project uses:
- Next.js 15.4.4 with App Router
- React 19.1.0 
- React Three Fiber for 3D rendering
- React Three Drei for 3D utilities (ScrollControls, Environment, Text, Text3D)
- React Three Rapier for physics simulation (removed from current implementation)
- React Spring Three for physics-based animations
- Valtio for global state management
- TypeScript with strict mode
- Tailwind CSS v4
- ESLint and Prettier for code quality
- Custom Fields font family for typography

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
    - `Book.tsx` - Individual book component with Text3D titles and spring animations
    - `CameraController.tsx` - Camera movement controlled by scroll position
    - `CoffeeTable.tsx` - 3D coffee table model component (currently unused)
    - `Table.tsx` - Alternative table component
    - `icons/` - SVG icon components (Search, SortAsc, SortBy, SortDesc)
  - `store/` - Global state management
    - `bookStore.ts` - Valtio store for book state and animations
    - `authStore.ts` - Valtio store for authentication state
- `/public` - Static assets
  - `fonts/` - Custom Fields Bold font
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

- **Authentication**: Password-protected access with localStorage persistence
- **Book Stack Visualization**: 25 African literature books with real metadata
- **Book Sizes**: Five size variants (thin, medium, thick, veryThick, extraThick)
- **Interactive Animations**: Click books to feature them with slide-out effect
- **Coordinated Movement**: Books above the selected one drop down with gravity
- **Spring Animations**: All movements use React Spring for natural motion
- **Camera Controls**: Scroll-based navigation through the book stack
- **UI Components**:
  - Fixed header with navigation links and "painted dog" branding
  - Floating bottom bar with Stack/Grid toggle and sort controls
  - Background pattern with repeated "painted dog" text
- **Text Effects**:
  - 3D metallic gold titles on book covers
  - Dynamic text wrapping for long titles
  - Spine text with author names
- **Visual Effects**:
  - HDR environment lighting
  - Soft shadows on all books
  - Backdrop that fades in when a book is featured
  - Mouse-based tilt on featured books
- **Global State**: Valtio manages:
  - Featured book index and thickness tracking
  - Authentication state
  - Animation coordination

## Configuration Notes

- TypeScript configured with strict mode and bundler module resolution
- ESLint extends `next/core-web-vitals` with relaxed a11y rules for 3D interactions
- Prettier configured with standard settings (semicolons, double quotes, 80 char width)