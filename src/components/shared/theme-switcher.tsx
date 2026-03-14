"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Palette } from "lucide-react";
import { THEMES, type ThemeId } from "@/components/shared/theme-provider";

const THEME_LABELS: Record<ThemeId, string> = {
  light: "Light",
  dark: "Dark",
  claude: "Claude",
  vercel: "Vercel",
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {THEMES.map((t) => (
          <DropdownMenuItem key={t} onClick={() => setTheme(t)}>
            {theme === t ? <Check className="mr-2 h-4 w-4" /> : <span className="mr-2 w-4" />}
            {THEME_LABELS[t]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
