/**
 * TypeScript declarations for CSS imports
 * Allows importing CSS files as text strings in TypeScript
 */

declare module '*.css' {
  const content: string;
  export default content;
} 