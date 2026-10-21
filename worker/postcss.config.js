// Empty on purpose: the Worker tests consume no CSS. This config stops
// Vite's PostCSS discovery from walking up into the SPA root config
// (which needs tailwindcss and is irrelevant to the Worker).
export default {};