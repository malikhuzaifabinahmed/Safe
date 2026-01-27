import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    console.log("Current theme:", theme)
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  const isDark = theme === "dark" || 
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all duration-200"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-500" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" />
      )}
    </button>
  )
}
