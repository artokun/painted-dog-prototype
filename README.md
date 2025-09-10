# Painted Dog - 3D Book Catalog

An interactive 3D book visualization platform showcasing African literature with advanced React Three Fiber animations and Contentful CMS integration.

## 🌟 Features

- **Interactive 3D Book Stack**: Physically accurate book models with multi-layer animations
- **Contentful CMS Integration**: Dynamic content management with auto-generated TypeScript types
- **Advanced Material System**: PBR materials with real-time property controls
- **Fuzzy Search**: Intelligent book search with Fuse.js
- **Performance Optimized**: Efficient rendering with local state management and conditional animations
- **Responsive Design**: Optimized for both desktop and mobile experiences

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Contentful account and space

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd painted-dog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Contentful credentials:
   ```env
   CONTENTFUL_SPACE_ID=your_space_id
   CONTENTFUL_ACCESS_TOKEN=your_delivery_token
   CONTENTFUL_ENVIRONMENT=master
   CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
   ```

4. **Generate Contentful Types**
   ```bash
   npm run generate-types
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Book Size Specifications

The project uses five precisely measured book sizes based on actual 3D models:

| Size | Dimensions (W × T × H) | Use Case |
|------|----------------------|-----------|
| XS   | 113.0 × 34.7 × 179.3mm | Pocket books, poetry collections |
| SM   | 131.7 × 18.7 × 207.2mm | Standard paperbacks |
| MD   | 138.0 × 19.5 × 207.5mm | Trade paperbacks |
| LG   | 145.2 × 29.7 × 220.4mm | Larger format books |
| XL   | 157.2 × 22.6 × 233.3mm | Large format, coffee table books |

## 🎨 3D Animation System

### Four-Layer Animation Architecture

1. **Base Position Layer**: Handles stack positioning, sorting, and search states
2. **Focus Slide Layer**: Smooth forward movement when books are selected
3. **Focus Lift & Rotate Layer**: Vertical lift and 90° rotation for detailed viewing
4. **Real-time Interaction Layer**: Mouse-based tilt effects and hover states

### Performance Optimizations

- **Local State Management**: Hover states managed locally to prevent global re-renders
- **Conditional Animations**: Animations only active when visible or relevant
- **Staggered Timing**: Sequential animation timing prevents frame drops
- **Material Optimization**: Direct material property access in useFrame loops

## 🛠 Technology Stack

- **Frontend**: Next.js 15.4.4 with React 19.1.0
- **3D Graphics**: React Three Fiber + React Three Drei
- **Animations**: React Spring Three with custom physics configurations
- **State Management**: Valtio proxy stores
- **CMS**: Contentful with auto-generated TypeScript types
- **Validation**: Zod schemas for runtime type safety
- **Styling**: Tailwind CSS v4
- **Search**: Fuse.js for fuzzy searching
- **Development**: TypeScript (strict mode), ESLint, Prettier

## 📖 Content Management

### Adding New Books

Use the interactive book creation script:

```bash
npm run create-book
```

This script will:
- Guide you through book metadata entry
- Research additional book information
- Upload cover images to Contentful
- Create all necessary linked entities (authors, genres, etc.)

### Contentful Schema

The project uses a linked data structure:

- **Book** entries contain core metadata and references
- **Author** entries with biographical information
- **Genre** entries with category and subcategory
- **Price** entries for different vendors/formats
- **Link** entries for articles and podcast references

## 🎯 Performance & Best Practices

### Rendering Optimizations

- Shadow maps optimized at 4096×4096 resolution
- Conditional material loading based on visibility
- Efficient texture management with proper color space handling
- Strategic use of `useFrame` vs reactive state updates

### Animation Best Practices

- **Spring Configurations**:
  - `config.gentle`: Smooth, deliberate movements
  - `config.stiff`: Quick, responsive updates
  - `config.slow`: Heavy, gravity-like motions
  - `config.default`: Standard spring physics

- **Conflict Prevention**: Ref-based flags prevent overlapping animations
- **Memory Management**: Proper cleanup of Three.js objects and textures

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Create production build
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Run ESLint with auto-fix
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run typecheck       # Run TypeScript type checking

# Contentful
npm run generate-types  # Generate TypeScript types from Contentful
npm run create-book     # Interactive book creation wizard
```

## 📁 Project Structure

```
painted-dog/
├── app/                    # Next.js App Router
│   ├── components/         # React components
│   │   ├── models/books/   # 3D book model components
│   │   └── icons/          # SVG icons
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Valtio state stores
│   └── utils/              # Utility functions
├── types/                  # TypeScript type definitions
├── scripts/                # Contentful management scripts
├── docs/                   # Technical documentation
└── public/
    ├── models/             # 3D model files (.gltf)
    └── fonts/              # Custom font assets
```

## 🎮 User Interactions

- **Click Book**: Focus and rotate for detailed view
- **Mouse Movement**: Subtle tilt effect on focused books
- **Scroll**: Navigate vertically through the book stack
- **Search**: Real-time fuzzy search with instant filtering
- **Sort**: Toggle between title and author sorting (A-Z, Z-A)

## 🌍 Environment Variables

```env
# Required for Contentful integration
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_token
CONTENTFUL_ENVIRONMENT=master

# Required for content creation scripts
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
```

## 🚧 Upcoming Features

- **Grid View Mode**: Alternative layout with aerial camera view
- **Advanced Search**: Genre filtering, date ranges, price filtering
- **Book Details Modal**: Expanded information panels
- **Reading List**: Personal collection management
- **Social Features**: Sharing and recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- African literature authors and publishers
- Three.js and React Three Fiber communities
- Contentful for CMS infrastructure
- Vercel for hosting and deployment