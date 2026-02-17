# Grid Mode Implementation Plan

## Overview

This document outlines the implementation plan for transitioning from stack view to a responsive 4-column grid layout with featured books occupying 2x2 spaces, hover tilt effects, and smooth animations.

## Visual Requirements (Based on Screenshots)

1. **Grid Layout**: 4 columns with responsive spacing
2. **Featured Books**: Take up 2x2 grid spaces (shown larger)
3. **Hover Effect**: Books tilt to reveal pages on the opposite side of spine
4. **Focus State**: Clicking a book brings it forward (similar to stack mode)
5. **Responsive**: Grid adapts to browser width

## Phase 1: Grid Layout System

### 1.1 Responsive Grid Calculations

```typescript
// app/utils/grid.ts
export interface GridConfig {
  columns: number;
  baseSpacing: number;
  bookWidth: number;
  bookHeight: number;
  bookDepth: number;
  featuredScale: number; // 2x2 for featured books
}

export const calculateResponsiveGrid = (
  viewportWidth: number,
  viewportHeight: number
): GridConfig => {
  // Fixed 4 columns as per requirement
  const columns = 4;
  
  // Calculate responsive spacing based on viewport
  const padding = viewportWidth * 0.05; // 5% padding on sides
  const availableWidth = viewportWidth - (padding * 2);
  
  // Calculate book dimensions to fit 4 columns
  const spacing = availableWidth * 0.03; // 3% spacing between books
  const bookWidth = (availableWidth - (spacing * (columns - 1))) / columns;
  
  // Maintain book aspect ratio
  const bookHeight = bookWidth * 1.4; // Standard book ratio
  const bookDepth = bookWidth * 0.15;
  
  return {
    columns,
    baseSpacing: spacing,
    bookWidth,
    bookHeight,
    bookDepth,
    featuredScale: 2, // 2x2 grid spaces
  };
};
```

### 1.2 Grid Position Calculator with Featured Book Support

```typescript
// app/utils/grid.ts
export interface GridPosition {
  x: number;
  y: number;
  z: number;
  row: number;
  col: number;
  gridIndex: number;
}

export const calculateGridPositions = (
  books: Book[],
  gridConfig: GridConfig
): Map<BookId, GridPosition> => {
  const positions = new Map<BookId, GridPosition>();
  const grid: (BookId | null)[][] = [];
  
  let currentRow = 0;
  let currentCol = 0;
  
  books.forEach((book) => {
    if (book.isFeatured) {
      // Featured books take 2x2 spaces
      // Find next available 2x2 slot
      const position = findNext2x2Slot(grid, currentRow, currentCol, gridConfig.columns);
      
      // Mark the 2x2 area as occupied
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          if (!grid[position.row + r]) grid[position.row + r] = [];
          grid[position.row + r][position.col + c] = book.id;
        }
      }
      
      // Calculate world position (center of 2x2 area)
      const x = calculateXPosition(position.col, gridConfig, true);
      const y = calculateYPosition(position.row, gridConfig, true);
      
      positions.set(book.id, {
        x,
        y,
        z: 0,
        row: position.row,
        col: position.col,
        gridIndex: position.row * gridConfig.columns + position.col,
      });
      
      currentRow = position.row;
      currentCol = position.col + 2; // Move past the 2x2 block
    } else {
      // Regular books take 1x1 space
      const position = findNext1x1Slot(grid, currentRow, currentCol, gridConfig.columns);
      
      if (!grid[position.row]) grid[position.row] = [];
      grid[position.row][position.col] = book.id;
      
      const x = calculateXPosition(position.col, gridConfig, false);
      const y = calculateYPosition(position.row, gridConfig, false);
      
      positions.set(book.id, {
        x,
        y,
        z: 0,
        row: position.row,
        col: position.col,
        gridIndex: position.row * gridConfig.columns + position.col,
      });
      
      currentRow = position.row;
      currentCol = position.col + 1;
    }
  });
  
  return positions;
};

const calculateXPosition = (
  col: number,
  config: GridConfig,
  isFeatured: boolean
): number => {
  const { columns, bookWidth, baseSpacing } = config;
  const totalWidth = (bookWidth * columns) + (baseSpacing * (columns - 1));
  
  if (isFeatured) {
    // Center of 2x2 block
    const leftEdge = col * (bookWidth + baseSpacing);
    const blockWidth = (bookWidth * 2) + baseSpacing;
    return leftEdge + (blockWidth / 2) - (totalWidth / 2);
  } else {
    // Center of 1x1 block
    return (col * (bookWidth + baseSpacing)) + (bookWidth / 2) - (totalWidth / 2);
  }
};

const calculateYPosition = (
  row: number,
  config: GridConfig,
  isFeatured: boolean
): number => {
  const { bookHeight, baseSpacing } = config;
  
  if (isFeatured) {
    // Center of 2x2 block
    const topEdge = row * (bookHeight + baseSpacing);
    const blockHeight = (bookHeight * 2) + baseSpacing;
    return -(topEdge + (blockHeight / 2)); // Negative Y for Three.js
  } else {
    // Center of 1x1 block
    return -(row * (bookHeight + baseSpacing) + (bookHeight / 2));
  }
};
```

## Phase 2: Book Component Grid Mode Updates

### 2.1 Enhanced Book Component with Grid Support

```typescript
// app/components/Book.tsx updates
function Book(book: BookType) {
  const { view } = useSnapshot(filterStore);
  const isGridMode = view === FilterView.Grid;
  const [hovered, setHovered] = useState(false);
  
  // Grid position calculation
  const gridPosition = useMemo(() => {
    if (!isGridMode) return null;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const gridConfig = calculateResponsiveGrid(viewport.width, viewport.height);
    const positions = calculateGridPositions(Object.values(books), gridConfig);
    return positions.get(book.id);
  }, [isGridMode, books, book.id]);
  
  // Base position spring (stack or grid)
  const bookSpring = useSpring({
    posX: isGridMode ? gridPosition?.x ?? 0 : /* existing stack logic */,
    posY: isGridMode ? gridPosition?.y ?? 0 : /* existing stack logic */,
    posZ: isGridMode ? 0 : /* existing stack logic */,
    rotX: isGridMode ? -Math.PI / 2 : 0, // Lay flat in grid mode
    rotY: 0,
    rotZ: 0,
    scale: book.isFeatured && isGridMode ? 2 : 1, // Scale up featured books
    config: (key) => {
      if (isGridMode && filterStore.isChangingView) {
        return config.gentle; // Smooth transition
      }
      // Existing config logic
    },
    delay: isGridMode && filterStore.isChangingView 
      ? gridPosition?.gridIndex * 50 // Stagger grid formation
      : /* existing delay logic */,
  });
  
  // Grid hover tilt animation
  const [hoverTiltSpring, hoverTiltApi] = useSpring(() => ({
    rotX: 0,
    rotZ: 0,
    config: { mass: 1, tension: 300, friction: 30 },
  }));
  
  useEffect(() => {
    if (isGridMode && hovered && !isFocused) {
      // Tilt to show pages (opposite of spine)
      const tiltAngle = 0.15; // ~8.5 degrees
      hoverTiltApi.start({
        rotX: -Math.PI / 2 + tiltAngle, // Lift slightly from flat
        rotZ: 0.05, // Slight rotation
      });
    } else if (isGridMode) {
      hoverTiltApi.start({
        rotX: -Math.PI / 2, // Flat
        rotZ: 0,
      });
    }
  }, [hovered, isGridMode, isFocused, hoverTiltApi]);
  
  // Focus behavior in grid mode
  const [bookFocusedSlideSpring] = useSpring({
    posZ: isFocused 
      ? calculateOptimalZDistance() 
      : isGridMode 
        ? 0.1 // Slight elevation in grid
        : /* existing stack logic */,
    config: config.gentle,
  });
  
  const [bookFocusedLiftSpring] = useSpring({
    posY: isFocused && isGridMode 
      ? 0 // Center vertically when focused in grid
      : /* existing logic */,
    rotX: isFocused 
      ? 0 // Face camera when focused
      : isGridMode 
        ? hoverTiltSpring.rotX.get()
        : /* existing logic */,
    config: config.default,
  });
  
  return (
    <animated.group
      // Existing props
      scale={bookSpring.scale}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <animated.group
        position-z={bookFocusedSlideSpring.posZ}
        position-y={bookFocusedLiftSpring.posY}
        rotation-x={isGridMode && !isFocused ? hoverTiltSpring.rotX : bookFocusedLiftSpring.rotX}
        rotation-z={isGridMode && !isFocused ? hoverTiltSpring.rotZ : 0}
      >
        {/* Existing book mesh and text */}
      </animated.group>
    </animated.group>
  );
}
```

## Phase 3: Camera System for Grid Mode

### 3.1 Grid-Aware Camera Controller

```typescript
// app/components/CameraController.tsx updates
const CameraController = memo(function CameraController() {
  const { camera } = useThree();
  const { view } = useSnapshot(filterStore);
  const { focusedBookId, books } = useSnapshot(bookStore);
  const isGridMode = view === FilterView.Grid;
  
  // Calculate grid overview position
  const gridCameraPosition = useMemo(() => {
    if (!isGridMode) return null;
    
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const gridConfig = calculateResponsiveGrid(viewport.width, viewport.height);
    const positions = calculateGridPositions(Object.values(books), gridConfig);
    
    // Find grid bounds
    const bounds = calculateGridBounds(positions);
    
    // Calculate camera distance to fit all books
    const fov = 45;
    const aspect = viewport.width / viewport.height;
    const distance = calculateCameraDistance(bounds, fov, aspect);
    
    return {
      x: 0,
      y: bounds.center.y,
      z: distance,
    };
  }, [isGridMode, books]);
  
  // Spring for view mode transitions
  const [viewModeSpring, viewModeApi] = useSpring(() => ({
    cameraX: 0,
    cameraY: 0.5,
    cameraZ: 1.2,
    lookAtY: 0,
    config: config.gentle,
  }));
  
  useEffect(() => {
    if (isGridMode && gridCameraPosition) {
      viewModeApi.start({
        cameraX: gridCameraPosition.x,
        cameraY: gridCameraPosition.y,
        cameraZ: gridCameraPosition.z,
        lookAtY: gridCameraPosition.y,
      });
    } else {
      // Return to stack view camera
      viewModeApi.start({
        cameraX: 0,
        cameraY: /* scroll-based Y */,
        cameraZ: /* calculated distance */,
        lookAtY: /* scroll-based Y */,
      });
    }
  }, [isGridMode, gridCameraPosition, viewModeApi]);
  
  // Handle focused book in grid mode
  useEffect(() => {
    if (isGridMode && focusedBookId) {
      const focusedBook = books[focusedBookId];
      const positions = calculateGridPositions(Object.values(books), gridConfig);
      const bookPos = positions.get(focusedBookId);
      
      if (bookPos) {
        viewModeApi.start({
          cameraX: bookPos.x,
          cameraY: bookPos.y,
          cameraZ: calculateOptimalZDistance(),
          lookAtY: bookPos.y,
        });
      }
    }
  }, [isGridMode, focusedBookId, books, viewModeApi]);
  
  useFrame(() => {
    if (isGridMode) {
      // Use spring values for grid mode
      const x = viewModeSpring.cameraX.get();
      const y = viewModeSpring.cameraY.get();
      const z = viewModeSpring.cameraZ.get();
      const lookAtY = viewModeSpring.lookAtY.get();
      
      camera.position.set(x, y, z);
      camera.lookAt(x, lookAtY, 0);
    } else {
      // Existing stack mode camera logic
    }
  });
  
  return null;
});
```

## Phase 4: View Transition Orchestration

### 4.1 Transition Controller

```typescript
// app/components/ViewTransitionController.tsx
export const ViewTransitionController = () => {
  const { view } = useSnapshot(filterStore);
  const { books } = useSnapshot(bookStore);
  
  const handleViewChange = useCallback((newView: FilterView) => {
    if (filterStore.view === newView) return;
    
    // Start transition
    filterStore.isChangingView = true;
    
    // Clear any focused book
    bookStore.focusedBookId = null;
    
    // Orchestrate the transition
    const transitionSteps = [
      // Step 1: Start camera movement
      () => {
        // Camera controller will react to view change
        filterStore.view = newView;
      },
      
      // Step 2: Stagger book animations
      () => {
        const bookCount = Object.keys(books).length;
        const totalDuration = bookCount * 50 + 500; // Stagger + buffer
        
        setTimeout(() => {
          filterStore.isChangingView = false;
        }, totalDuration);
      },
    ];
    
    // Execute transition steps
    transitionSteps.forEach((step, index) => {
      setTimeout(step, index * 100);
    });
  }, [books]);
  
  return { handleViewChange };
};
```

### 4.2 Update FloatingBar Component

```typescript
// app/components/FloatingBar.tsx updates
const FloatingBar = () => {
  const { view } = useSnapshot(filterStore);
  const { handleViewChange } = ViewTransitionController();
  
  return (
    <div className="floating-bar">
      <button
        onClick={() => handleViewChange(FilterView.Stack)}
        className={view === FilterView.Stack ? 'active' : ''}
      >
        Stack
      </button>
      <button
        onClick={() => handleViewChange(FilterView.Grid)}
        className={view === FilterView.Grid ? 'active' : ''}
      >
        Grid
      </button>
      {/* Other controls */}
    </div>
  );
};
```

## Phase 5: Responsive Updates

### 5.1 Window Resize Handler

```typescript
// app/hooks/useResponsiveGrid.ts
export const useResponsiveGrid = () => {
  const [gridConfig, setGridConfig] = useState<GridConfig | null>(null);
  const { view } = useSnapshot(filterStore);
  
  useEffect(() => {
    if (view !== FilterView.Grid) return;
    
    const updateGrid = () => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      
      const newConfig = calculateResponsiveGrid(viewport.width, viewport.height);
      setGridConfig(newConfig);
    };
    
    updateGrid();
    
    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateGrid, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [view]);
  
  return gridConfig;
};
```

## Phase 6: Visual Enhancements

### 6.1 Grid-Specific Lighting

```typescript
// app/components/App.tsx updates
export default function App() {
  const { view } = useSnapshot(filterStore);
  const isGridMode = view === FilterView.Grid;
  
  const lightingSpring = useSpring({
    ambientIntensity: isGridMode ? 0.6 : 0.3,
    directionalIntensity: isGridMode ? 1.2 : 2.2,
    directionalY: isGridMode ? 10 : 4,
    config: config.slow,
  });
  
  return (
    <>
      <animated.ambientLight 
        intensity={lightingSpring.ambientIntensity} 
      />
      <animated.directionalLight
        position={[2, lightingSpring.directionalY, 2]}
        intensity={lightingSpring.directionalIntensity}
        // Shadow settings
      />
      {/* Rest of scene */}
    </>
  );
}
```

### 6.2 Grid Background Effect

```typescript
// app/components/GridBackground.tsx
export const GridBackground = () => {
  const { view } = useSnapshot(filterStore);
  const visible = view === FilterView.Grid;
  
  const fadeSpring = useSpring({
    opacity: visible ? 0.1 : 0,
    config: config.slow,
  });
  
  return (
    <animated.mesh
      position={[0, 0, -5]}
      visible={visible || fadeSpring.opacity.get() > 0.01}
    >
      <planeGeometry args={[100, 100, 50, 50]} />
      <animated.meshBasicMaterial
        wireframe
        color="#666666"
        transparent
        opacity={fadeSpring.opacity}
      />
    </animated.mesh>
  );
};
```

## Implementation Timeline

### Week 1: Core Grid System
- [ ] Implement grid calculation utilities
- [ ] Add featured book 2x2 support
- [ ] Create responsive grid config

### Week 2: Book Component Updates
- [ ] Add grid mode positioning
- [ ] Implement hover tilt animations
- [ ] Update focus behavior for grid

### Week 3: Camera and Transitions
- [ ] Update camera controller for grid
- [ ] Implement view transition orchestration
- [ ] Add smooth animation sequences

### Week 4: Polish and Optimization
- [ ] Fine-tune animations and timing
- [ ] Optimize performance for large grids
- [ ] Add visual enhancements
- [ ] Test responsive behavior

## Performance Considerations

1. **Staggered Rendering**: Books animate into grid positions with delays to prevent frame drops
2. **LOD System**: Consider implementing level-of-detail for books far from camera
3. **Culling**: Only render books within viewport bounds
4. **Texture Optimization**: Lower resolution textures for grid view
5. **Shadow Optimization**: Reduce shadow quality or disable for distant books

## Testing Checklist

- [ ] Grid layout with 25+ books
- [ ] Featured books display at 2x2 size
- [ ] Hover tilt reveals pages correctly
- [ ] Focus animation works in grid mode
- [ ] Smooth transition from stack to grid
- [ ] Smooth transition from grid to stack
- [ ] Responsive behavior on window resize
- [ ] Performance remains smooth with all books
- [ ] Camera properly frames grid at different viewport sizes
- [ ] Interactions remain responsive during transitions

## Known Challenges & Solutions

### Challenge 1: Featured Book Placement
**Problem**: 2x2 books may create gaps in grid
**Solution**: Smart placement algorithm that minimizes gaps and reflows regular books around featured ones

### Challenge 2: Responsive Scaling
**Problem**: Books may be too small on large screens or too large on small screens
**Solution**: Implement min/max book sizes with dynamic column count if needed

### Challenge 3: Transition Performance
**Problem**: All books animating simultaneously causes frame drops
**Solution**: Staggered animations with optimized spring configs and conditional rendering

### Challenge 4: Focus State in Grid
**Problem**: Focused book needs different behavior than stack mode
**Solution**: Separate focus logic for grid that centers book in viewport while dimming others

## Next Steps

1. Review plan with team
2. Create feature branch `feature/grid-mode`
3. Implement Phase 1 (Grid Layout System)
4. Test and iterate on responsive behavior
5. Continue with subsequent phases

## R3F Motion Expert Integration

This implementation leverages the motion patterns documented in the R3F Motion Expert specification:
- Multi-layered animation architecture
- Spring configuration strategies
- State-driven animation logic
- Performance optimization techniques
- Transition orchestration patterns

The grid mode will integrate seamlessly with the existing motion system while adding new grid-specific behaviors.