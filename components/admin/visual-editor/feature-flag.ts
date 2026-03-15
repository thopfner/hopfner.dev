/**
 * Visual editor feature flag.
 * Hard gate for initial rollout — defaults to off, set to "true" to enable.
 */
export const VISUAL_EDITOR_ENABLED =
  process.env.NEXT_PUBLIC_VISUAL_EDITOR_ENABLED === "true"
