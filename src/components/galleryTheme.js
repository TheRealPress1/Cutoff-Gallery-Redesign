// A reversible transition sampled by the gallery's existing demand-render loop.
// Retargeting first samples the current animation so rapid toggles never jump.
export function createGalleryThemeTransition(initialTheme = 'dark', duration = 650) {
  let from = initialTheme === 'light' ? 1 : 0;
  let target = from;
  let startedAt = null;

  function sample(time) {
    if (startedAt === null) return { value: target, active: false };
    const progress = Math.min(1, Math.max(0, (time - startedAt) / duration));
    const ease = progress * progress * (3 - 2 * progress);
    const value = from + (target - from) * ease;
    if (progress === 1) startedAt = null;
    return { value, active: startedAt !== null };
  }

  return {
    update(theme, time, immediate = false) {
      const current = sample(time);
      const next = theme === 'light' ? 1 : 0;
      if (immediate) {
        from = target = next;
        startedAt = null;
        return { value: next, active: false };
      }
      if (next !== target) {
        from = current.value;
        target = next;
        startedAt = from === target ? null : time;
      }
      return { value: current.value, active: startedAt !== null };
    },
  };
}
