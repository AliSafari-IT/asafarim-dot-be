// Re-export the tailwind preset
import preset from './tailwind-preset.cjs';

// Note: CSS files are imported directly in consuming files with:
// import '@asafarim/shared-tokens';

export { preset as tailwindPreset };
export default preset;
