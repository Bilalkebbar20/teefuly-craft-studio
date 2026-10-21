/** Vite/Vitest `?raw` imports (migrations + seeds) used by integration tests. */
declare module "*.sql?raw" {
  const content: string;
  export default content;
}