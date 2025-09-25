# React Three Fiber & React Spring Motion System Architecture

## Overview

This document provides a comprehensive analysis of the motion system used in the Painted Dog 3D book catalog project. The system leverages React Three Fiber (R3F) for 3D rendering and React Spring for physics-based animations to create a sophisticated, interactive book stack experience with Contentful CMS integration.

**Last Updated**: January 2025  
**Status**: Production Ready with Performance Optimizations Completed

## Core Technologies

### 1. React Three Fiber (R3F)

- **Version**: Latest with React 19.1.0
- **Purpose**: Declarative 3D scene management using React components
- **Key Features Used**:
  - `useFrame` hook for per-frame updates
  - `useThree` for accessing Three.js internals
  - Canvas component with custom GL settings
  - Integration with React Spring for animated components

### 2. React Spring Three

- **Purpose**: Physics-based spring animations for 3D transformations
- **Key Features**:
  - `useSpring` for individual animated values
  - `useChain` for sequencing animations
  - `animated` components for R3F integration
  - Multiple config presets (gentle, stiff, slow, default)

### 3. Drei (Three.js helpers)

- **ScrollControls**: Smooth camera movement tied to scroll
- **Text & Text3D**: Typography rendering
- **Environment**: HDR lighting
- **SpotLight**: Dynamic lighting effects

## Motion System Architecture

### 1. Book Component Motion Layers

The Book component (`app/components/Book.tsx`) implements a sophisticated multi-layered animation system:

#### Layer 1: Base Position Spring

```typescript
const bookSpring = useSpring({
  posX: /* conditional logic based on featured/focused/sorting/search states */,
  posY: bookPosition,
  posZ: /* conditional depth based on state */,
  rotX: 0,
  rotY: book.isFeatured ? 0 : offsets.rotY,
  rotZ: 0,
  config: (key) => {
    if (key === "posZ") return config.stiff;
    if (key === "posY") return config.slow;
    if (key === "posX") return config.default;
    return config.default;
  },
  delay: currentBookIndex * (search.length > 1 ? 0 : 25),
})
```

**Key Features**:

- Per-property configuration for different animation feels
- Staggered delays based on book index for cascade effects
- State-based positioning (featured, searching, sorting)

#### Layer 2: Focus Slide Animation

```typescript
const [bookFocusedSlideSpring] = useSpring({
  posZ: isFocused ? calculateOptimalZDistance() : /* base position */,
  config: config.gentle,
  onStart: () => { isSlidingRef.current = true },
  onRest: () => { isSlidingRef.current = false }
})
```

**Purpose**: Slides the focused book forward to optimal viewing distance

#### Layer 3: Focus Lift & Rotate Animation

```typescript
const [bookFocusedLiftSpring, liftApi] = useSpring({
  posY: isFocused ? camera.position.y - bookSpring.posY.get() : -dropHeight,
  rotX: isFocused ? Math.PI / 2 : /* base rotation */,
  rotY: isFocused ? -Math.PI / 2 : /* base rotation */,
  config: config.default,
  delay: !isFocused && dropHeight > 0 ? 250 : 0
})
```

**Features**:

- Lifts book to camera height when focused
- 90-degree rotation for face-on viewing
- Gravity drop for books above the selected one

#### Layer 4: Mouse-Based Tilt (Real-time)

```typescript
useFrame(({ pointer }) => {
  if (isFocused && !isSlidingRef.current) {
    const maxTilt = 0.15;
    const tiltX = pointer.x * maxTilt;
    const tiltY = pointer.y * maxTilt;
    bookFocusedTiltGroupApi.start({
      rotX: -tiltX,
      rotZ: tiltY,
    });
  }
});
```

**Purpose**: Adds interactive tilt effect following mouse movement

### 2. Animation Chaining

The system uses `useChain` to orchestrate multi-step animations:

```typescript
useChain(
  isFocused
    ? [bookFocusedSlideRef, bookFocusedLiftRef] // Slide first, then lift
    : [bookFocusedLiftRef, bookFocusedSlideRef], // Drop first, then slide back
  isFocused ? [0, 0.3] : [0, 0.5] // Timing offsets
);
```

### 3. Camera Controller System

The `CameraController` (`app/components/CameraController.tsx`) manages camera movement with:

#### Scroll-Based Vertical Movement

```typescript
useFrame(() => {
  const scrollValue = scroll.offset; // 0-1 from drei ScrollControls
  const scrollBasedY = topLimit - (topLimit - bottomLimit) * scrollValue;
  api.set({ cameraY: scrollBasedY });
});
```

#### Mouse-Based Rotation

```typescript
const [{ rotation }, rotationApi] = useSpring(() => ({
  rotation: 0,
  config: { mass: 1, tension: 280, friction: 60 },
}));

// In mouse move handler:
rotationApi.start({ rotation: -normalizedX * 0.15 });

// Applied in useFrame:
const rotatedX = Math.sin(currentRotation) * distance;
const rotatedZ = Math.cos(currentRotation) * distance;
```

### 4. Supporting Animation Systems

#### Backdrop Component

- Fades in with 600ms delay when book is focused
- Uses opacity spring animation
- Blocks interaction with books behind

#### Floor Component

- Inverse of backdrop - fades out when book is focused
- Same timing for coordinated effect

#### Lighting System

- Environment intensity animates based on search state
- SpotLight follows mouse position with lerped movement
- Directional light intensity tied to interaction states

## Animation Configurations

### Spring Presets Used

1. **config.default**: Standard spring physics
   - Used for: General movements, lift animations

2. **config.gentle**: Smooth, slower spring
   - Used for: Slide animations, backdrop fades
   - Creates elegant, deliberate movements

3. **config.stiff**: Quick, responsive spring
   - Used for: Z-position updates during sorting
   - Real-time camera tracking

4. **config.slow**: Deliberate, heavy spring
   - Used for: Y-position updates
   - Creates weight and gravity feel

### Custom Configurations

```typescript
// Mouse tilt configuration
{ mass: 1, tension: 350, friction: 40 }

// Camera Y movement
{ mass: 1, tension: 120, friction: 20 }

// Camera rotation
{ mass: 1, tension: 280, friction: 60 }
```

## State Management Integration

### Valtio Stores

1. **bookStore**: Manages focused book and book data
2. **filterStore**: Controls sorting, searching, view modes

### State-Driven Animations

The motion system responds to multiple state variables:

```typescript
// Example: Book X position logic
posX: book.isFeatured || isFocused
  ? 0
  : isSorting
    ? getBookSize(book.size)[0] * 2 * (index % 2 === 0 ? 1 : -1)
    : search.length > 1
      ? book.hidden
        ? 0
        : offsets.posX
      : offsets.posX;
```

## Performance Optimizations

### 1. Conditional Rendering

- Backdrop only renders when visible or animating
- Components use memoization where appropriate

### 2. Animation Batching

- Staggered delays prevent all books animating simultaneously
- Index-based delays create cascade effects

### 3. Ref-Based State

- `isSlidingRef` prevents conflicting animations
- Avoids re-renders during continuous updates

### 4. Frame-Based Updates

- Mouse tracking and camera following use `useFrame`
- Direct manipulation without state updates

## Motion Patterns & Behaviors

### 1. Book Selection Flow

1. User clicks book
2. Book slides forward (gentle spring)
3. Book rotates 90° and lifts to camera height
4. Books above drop with gravity effect (delayed)
5. Mouse movement adds subtle tilt
6. Backdrop fades in, floor fades out

### 2. Book Deselection Flow

1. User clicks focused book or backdrop
2. Book rotates back to stack orientation
3. Book drops to original position
4. Book slides back into stack
5. Backdrop fades out, floor fades in

### 3. Sorting Animation

1. `isSorting` flag triggers alternate positioning
2. Books spread in alternating X pattern
3. Z-depth creates layered effect
4. Stiff springs for quick response
5. On completion, `isSorting` resets

### 4. Search Mode

1. Fuzzy search filters books
2. Matching books get `hidden: true`
3. Hidden books maintain position but fade spine text
4. Environment lighting dims
5. Spotlight activates following mouse

## Advanced Techniques

### 1. Chained Animations

- Multiple animation sequences with precise timing
- Different chains for forward/reverse animations
- Ref-based coordination between springs

### 2. Dynamic Spring Configs

- Per-property configuration within single spring
- Conditional configs based on state
- Mixed timing for organic movement

### 3. Gravity Simulation

- Drop height calculation based on relative positions
- Delayed drops for books above selection
- Natural stacking behavior

### 4. Optimal Distance Calculation

```typescript
const calculateOptimalZDistance = () => {
  const referenceBookHeight = 0.185;
  const targetScreenPercentage = 1.6;
  const fov = 45;
  const fovRadians = (fov * Math.PI) / 180;
  const halfFov = fovRadians / 2;
  const viewportHeightAtUnitDistance = 2 * Math.tan(halfFov);

  return (
    referenceBookHeight /
    (targetScreenPercentage * viewportHeightAtUnitDistance)
  );
};
```

### 5. Real-time Tracking

- Camera follows focused book Y position
- Mouse position influences tilt and lighting
- Continuous interpolation for smooth movement

## Grid Mode Preparation

The current architecture is designed to support a future grid mode:

1. **Modular Positioning**: Book positions calculated via utility functions
2. **Flexible State**: `filterStore.view` enum ready for Grid mode
3. **Animation System**: Springs can handle any target position
4. **Sorting Logic**: Already supports multiple sort strategies

### Implementing Grid Mode

To add grid mode, extend:

1. Add grid position calculation to `getBookSortYPosition`
2. Modify Book component position logic for grid layout
3. Add transition animation between stack/grid
4. Adjust camera controller for grid overview
5. Update interaction patterns for grid selection

## Best Practices & Patterns

### 1. Animation Composition

- Layer animations from general to specific
- Use groups for hierarchical transformations
- Separate concerns (position, rotation, scale)

### 2. State Management

- Keep animation state separate from data state
- Use refs for animation-only flags
- Leverage Valtio's proxy for reactive updates

### 3. Performance

- Minimize state updates in hot paths
- Use `useFrame` for continuous updates
- Batch related animations together

### 4. User Experience

- Stagger animations for visual hierarchy
- Use appropriate spring configs for each motion type
- Provide immediate feedback (onClick handlers)
- Prevent conflicting animations with flags

## Debugging & Development

### Key Areas to Monitor

1. **Spring Values**: Use `.get()` to read current values
2. **Animation State**: Track with refs and console logs
3. **Performance**: Monitor frame rate during complex animations
4. **State Sync**: Ensure Valtio updates trigger correctly

### Common Issues & Solutions

1. **Jumpy Animations**: Check for conflicting springs or missing refs
2. **Performance Drops**: Reduce shadow map size or animation complexity
3. **State Desync**: Verify subscription and snapshot usage
4. **Z-Fighting**: Adjust position offsets and depth testing

## Future Enhancements

### Potential Improvements

1. **GPU-Based Physics**: Integrate Rapier for complex interactions
2. **Gesture Support**: Add swipe and pinch gestures
3. **Advanced Transitions**: Morph between view modes
4. **Particle Effects**: Add dust or paper effects
5. **Sound Integration**: Tie sounds to animation events

### Grid Mode Features

1. **3D Grid Layout**: Books arranged in rows/columns
2. **Batch Selection**: Multi-book operations
3. **Filtering Animations**: Books fly to new positions
4. **Overview Camera**: Aerial view of entire collection
5. **Progressive Loading**: Virtualize book rendering

## Conclusion

This motion system demonstrates sophisticated animation orchestration using React Three Fiber and React Spring. The layered approach, combined with state-driven logic and performance optimizations, creates a fluid, responsive 3D experience. The architecture is extensible and ready for additional features like grid mode while maintaining smooth performance and visual coherence.

# React Three Fiber Motion Expert Agent Specification

## Core Competencies

### 1. React Three Fiber Scene Management

I excel at creating and optimizing complex 3D scenes using R3F's declarative approach:

```typescript
// Example: Optimized scene setup with proper Canvas configuration
<Canvas
  camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 1.5, 1.2] }}
  shadows={{ enabled: true, type: THREE.PCFSoftShadowMap, size: 4096 }}
  gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
>
  <Suspense fallback={<LoadingPlaceholder />}>
    <AnimatedScene />
  </Suspense>
</Canvas>
```

**Key Capabilities**:

- Custom canvas configurations for optimal performance
- Proper Suspense boundaries for loading states
- Shadow mapping optimization
- WebGL context management

### 2. React Spring Physics-Based Animations

I implement sophisticated spring animations that feel natural and responsive:

```typescript
// Multi-property spring with conditional configurations
const bookSpring = useSpring({
  posX: conditional_x_logic,
  posY: bookPosition,
  posZ: conditional_z_logic,
  rotX: 0,
  rotY: book.isFeatured ? 0 : offsets.rotY,
  rotZ: 0,
  config: (key) => {
    if (key === "posZ") return config.stiff; // Quick depth changes
    if (key === "posY") return config.slow; // Heavy vertical movement
    if (key === "posX") return config.default; // Standard lateral movement
    return config.default;
  },
  delay: currentBookIndex * (search.length > 1 ? 0 : 25), // Staggered cascades
});
```

**Spring Configuration Expertise**:

- `config.gentle`: Smooth, deliberate movements (slide animations)
- `config.stiff`: Quick, responsive updates (real-time tracking)
- `config.slow`: Heavy, gravity-like motion (vertical drops)
- Custom configs: Tailored mass, tension, friction for specific behaviors

### 3. Multi-Layered Animation Orchestration

I design complex animation systems using a layered architecture pattern:

#### Layer 1: Base Position System

```typescript
const baseSpring = useSpring({
  // Core positioning logic based on state
  // Handles: Stack position, sorting layouts, search filtering
});
```

#### Layer 2: Focus Slide Animation

```typescript
const [slideSpring, slideRef] = useSpring(() => ({
  posZ: isFocused ? calculateOptimalZDistance() : baseZ,
  config: config.gentle,
  onStart: () => {
    animationStateRef.current = "sliding";
  },
  onRest: () => {
    animationStateRef.current = "idle";
  },
}));
```

#### Layer 3: Focus Lift & Rotate

```typescript
const [liftSpring, liftRef] = useSpring(() => ({
  posY: isFocused ? camera.position.y - baseSpring.posY.get() : -dropHeight,
  rotX: isFocused ? Math.PI / 2 : baseRotX,
  rotY: isFocused ? -Math.PI / 2 : baseRotY,
  config: config.default,
  delay: !isFocused && dropHeight > 0 ? 250 : 0, // Gravity drop delay
}));
```

#### Layer 4: Real-Time Mouse Interaction

```typescript
useFrame(({ pointer }) => {
  if (isFocused && !isAnimating) {
    const maxTilt = 0.15;
    tiltApi.start({
      rotX: -pointer.x * maxTilt,
      rotZ: pointer.y * maxTilt,
    });
  }
});
```

### 4. Animation Chaining with useChain

I orchestrate complex animation sequences with precise timing:

```typescript
useChain(
  isFocused
    ? [slideRef, liftRef] // Forward: slide first, then lift
    : [liftRef, slideRef], // Reverse: drop first, then slide back
  isFocused ? [0, 0.3] : [0, 0.5] // Timing offsets for natural flow
);
```

### 5. Performance Optimization Strategies

#### Ref-Based State Management

```typescript
const isSlidingRef = useRef(false);
const animationStateRef = useRef<"idle" | "sliding" | "lifting">("idle");

// Prevents conflicts without triggering re-renders
if (!isSlidingRef.current) {
  // Safe to start new animation
}
```

#### Conditional Animation Updates

```typescript
// Only animate when necessary
posX: book.isFeatured || isFocused
  ? 0
  : isSorting
    ? getSortingXPosition()
    : search.length > 1
      ? book.hidden
        ? 0
        : offsets.posX
      : offsets.posX;
```

#### Staggered Animations for Performance

```typescript
delay: currentBookIndex * (search.length > 1 ? 0 : 25);
// Prevents all books animating simultaneously
```

## Motion System Patterns

### 1. The 4-Layer Animation Architecture

This is the core pattern I use for complex interactive objects:

1. **Base Layer**: Core positioning and state-driven layout
2. **Action Layer**: Primary user-triggered animations (slide, rotate)
3. **Secondary Layer**: Supporting animations (lift, gravity effects)
4. **Real-time Layer**: Continuous input-driven updates (mouse tracking)

### 2. Animation Chaining Strategy

For complex sequences, I use this pattern:

```typescript
// Define spring refs
const actionRef = useSpringRef();
const secondaryRef = useSpringRef();

// Create springs with refs
const [actionSpring] = useSpring({ ref: actionRef /* ... */ });
const [secondarySpring] = useSpring({ ref: secondaryRef /* ... */ });

// Chain with conditional timing
useChain(
  isForward ? [actionRef, secondaryRef] : [secondaryRef, actionRef],
  isForward ? [0, 0.3] : [0, 0.5]
);
```

### 3. State-Driven Animation Logic

I implement complex conditional positioning using this pattern:

```typescript
const calculatePosition = (book, globalState, localState) => ({
  posX: book.isFeatured
    ? 0 // Featured: center
    : localState.isFocused
      ? 0 // Focused: center
      : globalState.isSorting
        ? getSortingX(book) // Sorting: spread pattern
        : globalState.search.length > 1
          ? book.hidden
            ? 0
            : getSearchX(book) // Search: filter pattern
          : getStackX(book), // Default: stack offsets

  posY: getBookSortYPosition(book.id, books, sortBy, sortOrder),

  posZ: localState.isFocused
    ? calculateOptimalZDistance()
    : globalState.isSorting
      ? getSortingZ(book)
      : getStackZ(book),
});
```

### 4. Camera Controller Pattern

I implement smooth camera systems using this approach:

```typescript
const CameraController = () => {
  const { camera } = useThree();
  const scroll = useScroll();

  // Spring for smooth Y movement
  const [{ cameraY }, yApi] = useSpring(() => ({
    cameraY: initialY,
    config: { mass: 1, tension: 120, friction: 20 },
  }));

  // Spring for rotation
  const [{ rotation }, rotationApi] = useSpring(() => ({
    rotation: 0,
    config: { mass: 1, tension: 280, friction: 60 },
  }));

  // Scroll-based vertical movement
  useFrame(() => {
    const scrollBasedY = topLimit - (topLimit - bottomLimit) * scroll.offset;
    yApi.set({ cameraY: scrollBasedY });
  });

  // Mouse-based rotation
  const handleMouseMove = (e) => {
    const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
    rotationApi.start({ rotation: -normalizedX * 0.15 });
  };

  // Apply transformations
  useFrame(() => {
    const currentY = cameraY.get();
    const currentRot = rotation.get();

    camera.position.y = currentY;
    camera.position.x = Math.sin(currentRot) * distance;
    camera.position.z = Math.cos(currentRot) * distance;
    camera.lookAt(0, currentY, 0);
  });
};
```

## Implementation Guidelines

### Adding New Animations to Books

When adding new animation behaviors to book components:

1. **Determine Layer**: Decide which animation layer the new behavior belongs to
2. **Create Spring**: Set up the spring with appropriate configuration
3. **Add State Logic**: Integrate with existing state management
4. **Handle Conflicts**: Use refs to prevent animation conflicts
5. **Optimize Performance**: Consider staggering and batching

```typescript
// Template for new book animation
const [newBehaviorSpring, newBehaviorRef] = useSpring(() => ({
  propertyName: initialValue,
  config: config.appropriate,
  onStart: () => {
    animationFlagRef.current = true;
  },
  onRest: () => {
    animationFlagRef.current = false;
  },
}));

// Integrate with existing chains if needed
useChain([existingRef, newBehaviorRef], [0, 0.4]);
```

### Modifying Existing Motion Behaviors

To modify existing animations:

1. **Identify the Layer**: Find which animation layer controls the behavior
2. **Update Logic**: Modify the conditional logic or spring properties
3. **Test Interactions**: Ensure changes don't conflict with other animations
4. **Performance Check**: Monitor frame rate impact

### Performance Optimization Checklist

- [ ] Use refs for animation-only state to prevent re-renders
- [ ] Implement conditional animations based on visibility/relevance
- [ ] Stagger group animations to prevent frame drops
- [ ] Use appropriate spring configurations for each animation type
- [ ] Monitor Three.js object creation/destruction
- [ ] Optimize shadow settings and light count
- [ ] Use `useFrame` for continuous updates instead of state-based re-renders

### Debugging Animation Issues

1. **Check Spring Values**: Use `.get()` method to read current values
2. **Monitor Animation State**: Add console logs to onStart/onRest callbacks
3. **Verify Chain Timing**: Ensure useChain timing offsets are appropriate
4. **Test State Synchronization**: Confirm Valtio updates trigger correctly
5. **Profile Performance**: Use React DevTools Profiler during animations

## Grid Mode Implementation Strategy

The current architecture is designed to support grid mode. Here's my implementation plan:

### Phase 1: Core Grid Layout System

1. **Extend Position Calculation Utils**:

```typescript
// In app/utils/book.ts
export const getGridPosition = (
  index: number,
  books: BookMap,
  gridConfig: GridConfig
): [x: number, y: number, z: number] => {
  const { columns, rowSpacing, columnSpacing, baseY } = gridConfig;

  const row = Math.floor(index / columns);
  const col = index % columns;

  const x = (col - (columns - 1) / 2) * columnSpacing;
  const y = baseY + row * rowSpacing;
  const z = 0;

  return [x, y, z];
};
```

2. **Update Book Component Position Logic**:

```typescript
// In Book.tsx, modify bookSpring calculation
const bookSpring = useSpring({
  posX: book.isFeatured ? 0 :
        isFocused ? 0 :
        view === FilterView.Grid ? gridPosition[0] :
        // existing stack logic
  posY: view === FilterView.Grid ? gridPosition[1] :
        getBookSortYPosition(book.id, books, sortBy, sortOrder),
  posZ: view === FilterView.Grid ? gridPosition[2] :
        // existing stack logic
  // ... rest of spring config
});
```

### Phase 2: View Transition Animation

1. **Add Transition State Management**:

```typescript
// In filterStore.ts - already exists
isChangingView: boolean;
view: FilterView; // Stack | Grid
```

2. **Implement Transition Orchestration**:

```typescript
const transitionToGrid = () => {
  filterStore.isChangingView = true;

  // Stagger book transitions
  books.forEach((book, index) => {
    setTimeout(() => {
      // Trigger position recalculation
      book.transitionId = Date.now(); // Force spring update
    }, index * 50); // 50ms stagger
  });

  setTimeout(
    () => {
      filterStore.view = FilterView.Grid;
      filterStore.isChangingView = false;
    },
    books.length * 50 + 1000
  ); // Wait for all animations
};
```

### Phase 3: Grid Camera System

1. **Add Grid Camera Controller**:

```typescript
const GridCameraController = () => {
  const { camera } = useThree();
  const { view } = useSnapshot(filterStore);

  const [{ cameraPos }, api] = useSpring(() => ({
    cameraPos: [0, 2, 3], // Overview position
    config: config.gentle,
  }));

  useEffect(() => {
    if (view === FilterView.Grid) {
      api.start({
        cameraPos: [0, 2, 3], // Aerial overview
      });
    } else {
      api.start({
        cameraPos: [0, 1.5, 1.2], // Stack view
      });
    }
  }, [view]);

  useFrame(() => {
    const [x, y, z] = cameraPos.get();
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  });
};
```

### Phase 4: Grid Interactions

1. **Modify Click Handling**:

```typescript
// In Book.tsx
const handleClick = (e) => {
  e.stopPropagation();

  if (view === FilterView.Grid) {
    // Grid mode: center selected book, arrange others in pattern
    bookStore.focusedBookId = book.id;
  } else {
    // Stack mode: existing logic
  }
};
```

2. **Add Grid-Specific Animations**:

```typescript
const gridFocusSpring = useSpring({
  posX: isFocused && view === FilterView.Grid ? 0 : gridPosition[0],
  posY: isFocused && view === FilterView.Grid ? 0 : gridPosition[1],
  posZ:
    isFocused && view === FilterView.Grid
      ? calculateOptimalZDistance()
      : gridPosition[2],
  scale: isFocused && view === FilterView.Grid ? 1.2 : 1.0,
  config: config.gentle,
});
```

## Code Templates & Examples

### Template for New Animated Component

```typescript
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, useChain, useSpringRef, animated, config } from '@react-spring/three';
import { useSnapshot } from 'valtio';

interface AnimatedComponentProps {
  // Define props
}

const AnimatedComponent = (props: AnimatedComponentProps) => {
  // Animation state refs
  const isAnimatingRef = useRef(false);

  // Global state subscriptions
  const globalState = useSnapshot(someStore);

  // Spring refs for chaining
  const primaryRef = useSpringRef();
  const secondaryRef = useSpringRef();

  // Primary animation spring
  const [primarySpring] = useSpring({
    ref: primaryRef,
    property: calculatePrimaryValue(props, globalState),
    config: config.default,
    onStart: () => { isAnimatingRef.current = true; },
    onRest: () => { isAnimatingRef.current = false; }
  });

  // Secondary animation spring
  const [secondarySpring] = useSpring({
    ref: secondaryRef,
    property: calculateSecondaryValue(props, globalState),
    config: config.gentle
  });

  // Animation chaining
  useChain(
    globalState.someCondition ? [primaryRef, secondaryRef] : [secondaryRef, primaryRef],
    [0, 0.3]
  );

  // Real-time updates
  useFrame(({ pointer, clock }) => {
    if (globalState.enableRealTimeUpdates && !isAnimatingRef.current) {
      // Direct property updates
    }
  });

  return (
    <animated.group
      position={primarySpring.position}
      rotation={secondarySpring.rotation}
    >
      {/* Component content */}
    </animated.group>
  );
};

export default AnimatedComponent;
```

### Example: Complex Chained Animation with Staggering

```typescript
const BookStackAnimation = ({ books }: { books: Book[] }) => {
  const springs = useSpring(books.length, (index) => ({
    opacity: 0,
    posY: -1,
    rotX: 0,
    config: config.gentle,
    delay: index * 100 // Stagger by 100ms
  }));

  const animateIn = () => {
    springs.forEach((spring, index) => {
      spring.start({
        opacity: 1,
        posY: index * 0.02,
        rotX: Math.random() * 0.01 - 0.005,
        delay: index * 100
      });
    });
  };

  return springs.map((spring, index) => (
    <animated.mesh
      key={index}
      position={[0, spring.posY, 0]}
      rotation={[spring.rotX, 0, 0]}
    >
      <bookGeometry args={getBookSize(books[index].size)} />
      <animated.meshStandardMaterial
        transparent
        opacity={spring.opacity}
      />
    </animated.mesh>
  ));
};
```

### Pattern for Mouse-Interactive Elements

```typescript
const MouseInteractiveElement = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Hover spring
  const [hoverSpring] = useSpring(() => ({
    scale: hovered ? 1.1 : 1.0,
    emissive: hovered ? '#ff6b35' : '#000000',
    config: config.wobbly
  }));

  // Mouse tilt effect
  const [tiltSpring, tiltApi] = useSpring(() => ({
    rotX: 0,
    rotZ: 0,
    config: { mass: 1, tension: 350, friction: 40 }
  }));

  useFrame(({ pointer }) => {
    if (hovered) {
      tiltApi.start({
        rotX: -pointer.y * 0.1,
        rotZ: pointer.x * 0.1
      });
    } else {
      tiltApi.start({ rotX: 0, rotZ: 0 });
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      scale={hoverSpring.scale}
      rotation={[tiltSpring.rotX, 0, tiltSpring.rotZ]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <boxGeometry />
      <animated.meshStandardMaterial
        emissive={hoverSpring.emissive}
      />
    </animated.mesh>
  );
};
```

### State Management Integration Pattern

```typescript
// Store definition with reactive properties
const animationStore = proxy({
  activeAnimations: new Set<string>(),
  globalAnimationSpeed: 1.0,
  enableParticles: false,

  // Computed properties
  get hasActiveAnimations() {
    return this.activeAnimations.size > 0;
  },

  // Actions
  startAnimation(id: string) {
    this.activeAnimations.add(id);
  },

  endAnimation(id: string) {
    this.activeAnimations.delete(id);
  }
});

// Component integration
const StateConnectedAnimation = ({ animationId }: { animationId: string }) => {
  const { globalAnimationSpeed, hasActiveAnimations } = useSnapshot(animationStore);

  const [spring] = useSpring(() => ({
    value: 0,
    config: {
      ...config.default,
      duration: undefined,
      // Scale timing by global speed
      tension: config.default.tension * globalAnimationSpeed,
    },
    onStart: () => animationStore.startAnimation(animationId),
    onRest: () => animationStore.endAnimation(animationId)
  }));

  // React to global animation state
  useEffect(() => {
    if (!hasActiveAnimations) {
      // All animations complete - trigger next phase
    }
  }, [hasActiveAnimations]);

  return (
    <animated.group position-y={spring.value}>
      {/* Content */}
    </animated.group>
  );
};
```

## Performance Considerations

### Frame Budget Management

I monitor performance using these strategies:

1. **Animation Batching**: Group related animations to prevent frame drops
2. **Conditional Updates**: Only animate when visible or relevant
3. **Spring Configuration**: Use appropriate stiffness to prevent oscillation
4. **Memory Management**: Clean up springs and refs properly

### When to Use useFrame vs Springs

**Use useFrame for**:

- Continuous input tracking (mouse position, scroll)
- Real-time calculations that don't need physics
- Direct Three.js property manipulation
- Performance-critical updates

**Use Springs for**:

- Discrete state transitions
- Physics-based movement that should feel natural
- Coordinated animations with timing requirements
- Property interpolation with easing

### Batching and Staggering Techniques

```typescript
// Stagger animations to prevent frame drops
const staggerDelay = (index: number, totalItems: number): number => {
  const maxDelay = 1000; // 1 second max
  const minInterval = 50; // 50ms minimum between items

  return Math.min(index * minInterval, maxDelay);
};

// Batch spring updates
const batchUpdateSprings = (springs: SpringApi[], updates: any[]) => {
  requestAnimationFrame(() => {
    springs.forEach((spring, index) => {
      spring.start(updates[index]);
    });
  });
};
```

### Shadow and Lighting Optimization

```typescript
// Optimized shadow configuration
<directionalLight
  intensity={0.6}
  position={[10, 10, 5]}
  castShadow
  shadow-mapSize-width={2048}    // Reduced from 4096 for performance
  shadow-mapSize-height={2048}
  shadow-camera-far={50}
  shadow-camera-left={-10}
  shadow-camera-right={10}
  shadow-camera-top={10}
  shadow-camera-bottom={-10}
  shadow-bias={-0.0001}
/>

// Conditional shadow casting based on distance/visibility
<animated.mesh
  castShadow={distanceToCamera < maxShadowDistance}
  receiveShadow={isVisible}
>
```

## Future Enhancement Roadmap

### Gesture Support Implementation

1. **Touch Gestures**: Implement pinch-to-zoom and swipe navigation
2. **Multi-touch**: Support simultaneous book manipulation
3. **Gesture Recognition**: Custom gesture patterns for specific actions

```typescript
// Gesture system architecture
const GestureController = () => {
  const bind = useGesture({
    onDrag: ({ offset: [x, y] }) => {
      // Handle drag gestures
    },
    onPinch: ({ offset: [scale] }) => {
      // Handle pinch-to-zoom
    },
    onWheel: ({ offset: [, y] }) => {
      // Handle scroll wheel
    }
  });

  return <animated.div {...bind()} />;
};
```

### Advanced Transition Effects

1. **Morphing Transitions**: Smooth shape transitions between states
2. **Particle Systems**: Book dust and paper effects
3. **Shader-Based Effects**: Custom materials for special effects

### Physics Simulation Integration

1. **Rapier Integration**: Add realistic physics for book interactions
2. **Collision Detection**: Proper book-to-book interactions
3. **Gravity Effects**: Natural falling and stacking behavior

```typescript
// Physics integration pattern
import { RigidBody, CuboidCollider } from '@react-three/rapier';

const PhysicsBook = ({ book }: { book: Book }) => {
  return (
    <RigidBody type="dynamic">
      <CuboidCollider args={getBookSize(book.size)} />
      <animated.mesh>
        {/* Book geometry */}
      </animated.mesh>
    </RigidBody>
  );
};
```

### Particle System Additions

1. **Book Dust**: Particles when books move
2. **Page Flipping**: Simulated page effects
3. **Environmental Effects**: Ambient particles

## Troubleshooting Guide

### Common Animation Issues and Solutions

#### Issue: Jumpy or Erratic Animations

**Symptoms**: Springs oscillate or jump between values
**Solutions**:

1. Check for conflicting springs on the same property
2. Verify spring configuration - reduce tension or increase friction
3. Ensure refs are preventing animation conflicts
4. Use `immediate` property for instant updates when needed

```typescript
// Fix oscillating springs
const [spring] = useSpring(() => ({
  value: target,
  config: { tension: 120, friction: 40, mass: 1 }, // Increased friction
  immediate: shouldSkipAnimation,
}));
```

#### Issue: Performance Drops During Complex Animations

**Symptoms**: Frame rate drops, stuttering motion
**Solutions**:

1. Stagger animation start times
2. Reduce shadow map resolution
3. Use fewer simultaneous springs
4. Implement conditional rendering based on distance

```typescript
// Performance optimization
const isNearCamera = distance < performanceThreshold;
const shouldAnimate = isNearCamera && isVisible;

const [spring] = useSpring(() => ({
  opacity: shouldAnimate ? 1 : 0,
  config: shouldAnimate ? config.default : { duration: 0 },
}));
```

#### Issue: State Synchronization Problems

**Symptoms**: Animations don't respond to state changes
**Solutions**:

1. Verify useSnapshot usage in component
2. Check Valtio proxy mutations
3. Ensure spring dependencies are correct
4. Add useEffect triggers for external state changes

```typescript
// Fix state synchronization
const { focusedBookId } = useSnapshot(bookStore);
const isFocused = focusedBookId === book.id;

useEffect(() => {
  // Force spring update when state changes
  springApi.start({ value: isFocused ? 1 : 0 });
}, [isFocused, springApi]);
```

#### Issue: Z-Fighting and Visual Artifacts

**Symptoms**: Flickering surfaces, depth sorting issues
**Solutions**:

1. Adjust near/far planes on camera
2. Add small Z-offsets between overlapping elements
3. Use proper material transparent settings
4. Implement depth testing configurations

```typescript
// Fix z-fighting
<animated.mesh position={[x, y, z + 0.001]}> // Small offset
  <planeGeometry />
  <meshBasicMaterial
    transparent
    depthWrite={false}  // For transparent overlays
    depthTest={true}
  />
</animated.mesh>
```

### Performance Bottleneck Identification

1. **Use React DevTools Profiler**: Monitor component re-renders during animations
2. **Three.js Stats**: Monitor draw calls, geometries, and textures
3. **Browser Performance Tools**: Check frame timing and GPU usage
4. **Memory Monitoring**: Watch for memory leaks in springs and Three.js objects

```typescript
// Performance monitoring
const PerformanceMonitor = () => {
  useFrame(() => {
    if (process.env.NODE_ENV === "development") {
      const info = renderer.info;
      if (info.render.calls > 100) {
        console.warn("High draw call count:", info.render.calls);
      }
    }
  });
};
```
