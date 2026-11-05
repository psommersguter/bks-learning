import type { SessionMode } from "../domain/studySession";

/**
 * App routes. Hash-based (`#/learn`) because GitHub Pages can't serve an SPA fallback.
 */
export const ROUTES = {
  home: "/",
  learn: "/learn",
  learnAhead: "/learn/ahead",
  practice: "/learn/practice",
  settings: "/settings",
} as const;

const SESSION_ROUTES: Record<SessionMode, string> = {
  regular: ROUTES.learn,
  ahead: ROUTES.learnAhead,
  practice: ROUTES.practice,
};

export function sessionRoute(mode: SessionMode): string {
  return SESSION_ROUTES[mode];
}
