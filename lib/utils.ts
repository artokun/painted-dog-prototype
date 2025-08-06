import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUUID(input?: string): string {
  if (input) {
    // Create a deterministic UUID from input string using a hash function
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Simple hash function to generate 16 bytes (128 bits)
    const hashArray = new Uint8Array(16);
    let hash = 0;

    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data[i];
      hash |= 0; // Convert to 32bit integer
    }

    // Distribute the hash value across the array
    for (let i = 0; i < 16; i++) {
      hashArray[i] = (hash >> ((i % 4) * 8)) & 0xff;
    }

    // Set version bits to 4 (UUID v4)
    hashArray[6] = (hashArray[6] & 0x0f) | 0x40;

    // Set variant bits according to RFC4122
    hashArray[8] = (hashArray[8] & 0x3f) | 0x80;

    // Convert to hex and format as UUID
    const hexArray = Array.from(hashArray).map((b) => b.toString(16).padStart(2, '0'));

    return [
      hexArray.slice(0, 4).join(''),
      hexArray.slice(4, 6).join(''),
      hexArray.slice(6, 8).join(''),
      hexArray.slice(8, 10).join(''),
      hexArray.slice(10, 16).join(''),
    ].join('-');
  }

  // Original random UUID generation when no input is provided
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
