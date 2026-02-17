# TODO - Painted Dog Book Catalog

## High Priority (Client Demo Ready)

### Search & Filter Improvements
- [ ] When searching is enabled, move the featured book back into the stack (remove "featured" state)
- [ ] Center the filtered stack of books during searching, so the center of the filtered stack aligns with the camera center (similar to focused book centering)
- [ ] Fix search state persistence - search should reset when changing sort order
- [ ] Add search result count display in UI

### Visual Polish
- [x] ~~Add hover states to books~~ ✅ **COMPLETED** - Local hover state implemented
- [ ] Implement cursor changes on book hover (pointer cursor)
- [ ] Add subtle animation feedback on book hover (slight scale or glow)
- [ ] Improve backdrop timing and opacity transitions

### Performance & Stability
- [x] ~~Fix global re-renders on hover~~ ✅ **COMPLETED** - Local state implementation
- [x] ~~Optimize material property updates~~ ✅ **COMPLETED** - Material store with direct access
- [ ] Add error boundaries for 3D components
- [ ] Implement loading states for texture loading
- [ ] Add performance monitoring and FPS display (development only)

## Medium Priority

### Grid View Implementation
- [x] ~~Grid position calculation functions~~ ✅ **COMPLETED** - `calculateSortGridPosition` implemented
- [ ] Activate grid view mode in UI toggle
- [ ] Implement grid-to-stack transition animations
- [ ] Add grid-specific camera controller
- [ ] Test grid view with different screen sizes

### Content & Information Display
- [ ] Implement cursor controls that, on hover, display additional text information to the right and left of the hovered book
- [ ] Add book detail modal/panel when book is focused
- [ ] Display critical reception text and podcast information
- [ ] Add links to featured articles and podcast episodes
- [ ] Show book pricing information

### Responsive Design
- [ ] Adjust stack responsiveness so the stack always takes up 50% of the screen width, ensuring equal space on both sides for extra information panels
- [ ] Optimize mobile interactions (touch gestures)
- [ ] Add mobile-specific UI adjustments
- [ ] Test on various screen sizes and devices

## Low Priority (Post-Demo)

### Advanced Features
- [ ] Implement book sorting animations (spiral, shuffle, fountain - see SHUFFLE_IDEAS.md)
- [ ] Add genre filtering capabilities
- [ ] Implement date range filtering (publication year)
- [ ] Add reading list/favorites functionality
- [ ] Social sharing features

### Developer Experience
- [ ] Add comprehensive error handling for Contentful API failures
- [ ] Implement better development debugging tools
- [ ] Add automated testing for 3D components
- [ ] Create component documentation with Storybook

### Content Management
- [ ] Bulk book import functionality
- [ ] Asset optimization pipeline for book covers
- [ ] Content preview system before publishing
- [ ] Analytics integration for book interaction tracking

## Technical Debt & Refactoring

### Code Organization
- [ ] Extract animation constants to configuration file
- [ ] Create reusable animation hook patterns
- [ ] Consolidate material property management
- [ ] Improve type safety for book size mappings

### Documentation Updates
- [x] ~~Update CLAUDE.md with current architecture~~ ✅ **COMPLETED**
- [x] ~~Update README.md with current features~~ ✅ **COMPLETED**
- [ ] Create deployment and production setup guide
- [ ] Document Contentful schema migration procedures

### Performance Monitoring
- [ ] Add bundle size analysis
- [ ] Implement performance metrics collection
- [ ] Create performance regression testing
- [ ] Add memory leak detection for 3D objects

## Completed Features ✅

- [x] **Contentful CMS Integration** - Full integration with type generation
- [x] **Multi-layer Animation System** - Four-layer architecture implemented
- [x] **Performance Optimizations** - Local hover state, material store optimization
- [x] **Book Size System** - Precise GLTF-based measurements (XS, SM, MD, LG, XL)
- [x] **Advanced Material System** - PBR materials with real-time controls
- [x] **Search System** - Fuzzy search with Fuse.js
- [x] **Sorting System** - Title and author sorting with featured book priority
- [x] **Texture Management** - Custom hook with optimized loading
- [x] **Development Tools** - Leva controls for material debugging
- [x] **Type Safety** - Auto-generated Contentful types with Zod validation

---

**Note**: This TODO list reflects the current state as of the latest commit. Priority levels are set based on client demo requirements and technical stability needs.
