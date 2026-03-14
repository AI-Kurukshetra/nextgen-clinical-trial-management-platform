"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

const THEME_IDS = ["light", "dark", "claude", "vercel"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const THEMES: readonly ThemeId[] = THEME_IDS;

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={[...THEME_IDS]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
