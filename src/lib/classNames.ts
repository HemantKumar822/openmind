/**
 * Combines class names into a single string, filtering out any falsy values.
 */
export const cn = (...classes: (string | undefined)[]) => {
  return classes
    .filter(Boolean)
    .join(' ');
};
