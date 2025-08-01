// Dynamic font sizing for spine based on title length
export const getSpineFontSize = (text: string) => {
  if (text.length > 20) return 0.005; // Very small for long titles
  if (text.length > 15) return 0.006; // Small for medium titles
  if (text.length > 10) return 0.007; // Normal-small for slightly long titles
  return 0.008; // Normal size for short titles
};

// Text wrapping function for face titles - returns array of lines
export const wrapText = (text: string, maxLength: number = 12): string[] => {
  if (text.length <= maxLength) return [text];

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        // Word is too long, just add it
        lines.push(word);
      }
    } else {
      currentLine += word + " ";
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
};

// Calculate optimal Z distance for focused book to fill 75% of viewport height
export const calculateOptimalZDistance = () => {
  // Use a fixed reference book height so all books appear the same size on screen
  // Using medium book width (0.185) as the reference since it's in the middle of the range
  const referenceBookHeight = 0.185;

  // VIEWPORT_PERCENTAGE: Adjust this value to change how much of the screen the featured book fills
  const targetScreenPercentage = 1.6;

  // Camera FOV (from page.tsx)
  const fov = 45;
  const fovRadians = (fov * Math.PI) / 180;

  // Calculate distance needed for book to fill target percentage of viewport
  // Using: tan(fov/2) = (height/2) / distance
  // Rearranged: distance = (height/2) / tan(fov/2)
  const halfFov = fovRadians / 2;
  const viewportHeightAtUnitDistance = 2 * Math.tan(halfFov);

  // Same distance for all books so they appear the same size on screen
  const distance =
    referenceBookHeight /
    (targetScreenPercentage * viewportHeightAtUnitDistance);

  return distance;
};

const bookSizeMap: Record<
  string,
  [width: number, height: number, depth: number]
> = {
  thin: [0.18, 0.01, 0.13],
  thick: [0.19, 0.015, 0.14],
  medium: [0.185, 0.02, 0.135],
  veryThick: [0.175, 0.025, 0.12],
  extraThick: [0.182, 0.03, 0.138],
};

export const getBookSize = (
  size: string
): [width: number, height: number, depth: number] => {
  return bookSizeMap[size as keyof typeof bookSizeMap];
};
