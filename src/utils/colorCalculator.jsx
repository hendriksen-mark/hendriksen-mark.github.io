import { TOTAL_FUNCTIONS, VIEW_TO_INDEX } from '../config/functionCards';

/**
 * Calculate HSL color based on view ID and color scheme preference
 * @param {string} viewId - The view identifier (e.g., 'thread-calculator')
 * @param {boolean} isDark - Whether to use dark mode colors (default: false)
 * @returns {string|null} - HSL color string or null if viewId not found
 */
export const getViewColor = (viewId, isDark = false) => {
  const funcIndex = VIEW_TO_INDEX[viewId];
  if (funcIndex === undefined) return null;

  const hue = (360 / TOTAL_FUNCTIONS) * funcIndex;
  const saturation = isDark ? 60 : 79;
  const lightness = isDark ? 25 : 43;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Calculate gradient colors for a view
 * @param {string} viewId - The view identifier
 * @param {boolean} isDark - Whether to use dark mode colors
 * @returns {Object} - Object with color1 and color2
 */
export const getViewGradientColors = (viewId, isDark = false) => {
  const funcIndex = VIEW_TO_INDEX[viewId];
  if (funcIndex === undefined) return null;

  const hue = (360 / TOTAL_FUNCTIONS) * funcIndex;
  const saturation = isDark ? 60 : 79;
  const lightness = isDark ? 25 : 43;

  const color1 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  const hue2 = ((360 / TOTAL_FUNCTIONS) * funcIndex + 30) % 360;
  const lightness2 = isDark ? 20 : 38;
  const color2 = `hsl(${hue2}, ${saturation}%, ${lightness2}%)`;

  return { color1, color2, hue, saturation, lightness };
};
