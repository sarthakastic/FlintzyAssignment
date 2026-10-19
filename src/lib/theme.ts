import { useCallback, useState } from "react"

type Theme = "dark" | "light"

// Kept in sync with the pre-paint script in index.html.
const THEME_STORAGE_KEY = "flintzy.theme"

function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this visit.
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  const toggleTheme = useCallback(() => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark"
    applyTheme(next)
    setTheme(next)
  }, [])

  return { theme, toggleTheme }
}
