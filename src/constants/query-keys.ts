export const QUERY_KEYS = {
  items: {
    all: ["items"] as const,
  },
  profile: {
    current: ["profile", "current"] as const,
  },
  users: {
    all: ["users"] as const,
  },
} as const;

