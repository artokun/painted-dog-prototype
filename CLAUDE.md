# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 project with TypeScript and React Three Fiber for 3D graphics. The project creates an interactive 3D book stack visualization. The project uses:
- Next.js 15.4.4 with App Router
- React 19.1.0 
- React Three Fiber for 3D rendering
- React Three Rapier for physics simulation
- React Spring Three for physics-based animations
- Valtio for global state management
- TypeScript with strict mode
- Tailwind CSS v4
- ESLint and Prettier for code quality

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
  - `layout.tsx` - Root layout with Geist fonts
  - `page.tsx` - Homepage with Three.js Canvas (client component)
  - `components/` - React components
    - `App.tsx` - Main 3D scene component with book stack and lighting
    - `Book.tsx` - Individual book component with animations
    - `CameraController.tsx` - Camera movement and controls
    - `CoffeeTable.tsx` - 3D coffee table model component
  - `store/` - Global state management
    - `bookStore.ts` - Valtio store for book state and animations
- Uses `"use client"` directive for components using React Three Fiber
- Path alias `@/*` maps to project root

## Three.js/R3F Patterns

- Components using Three.js must be client components
- Main scene setup in `App.tsx` includes:
  - HDR environment lighting
  - Directional lights with shadows
  - Physics simulation with React Three Rapier
  - Coffee table and book stack
- Book animations use React Spring for physics-based motion:
  - Click to slide out and rotate books
  - Books above the selected book drop down
  - Chained animations for smooth transitions
- Camera controller responds to scroll and mouse movement
- Interactive elements use event handlers for click interactions

## Key Features

- **Book Stack Visualization**: 21 dynamically generated books with varied sizes
- **Physics Simulation**: Books fall and settle realistically using Rapier physics
- **Interactive Animations**: Click books to see them slide out and rotate
- **Coordinated Movement**: Books above the selected one drop down smoothly
- **Spring Animations**: All movements use React Spring for natural motion
- **Camera Controls**: Scroll to move through the stack, mouse movement for rotation
- **Global State**: Valtio manages featured book state and thickness data

## Configuration Notes

- TypeScript configured with strict mode and bundler module resolution
- ESLint extends `next/core-web-vitals` with relaxed a11y rules for 3D interactions
- Prettier configured with standard settings (semicolons, double quotes, 80 char width)