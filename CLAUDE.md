# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 project with TypeScript and React Three Fiber for 3D graphics. The project uses:
- Next.js 15.4.4 with App Router
- React 19.1.0 
- React Three Fiber for 3D rendering
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
    - `App.tsx` - Main 3D scene component with interactive boxes
- Uses `"use client"` directive for components using React Three Fiber
- Path alias `@/*` maps to project root

## Three.js/R3F Patterns

- Components using Three.js must be client components
- Main scene setup in `App.tsx` includes lights and interactive mesh objects
- Interactive elements use `useFrame` hook for animations
- Event handlers for hover and click interactions on 3D objects

## Configuration Notes

- TypeScript configured with strict mode and bundler module resolution
- ESLint extends `next/core-web-vitals` with relaxed a11y rules for 3D interactions
- Prettier configured with standard settings (semicolons, double quotes, 80 char width)