import { Button } from "@components/ui/button";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { LuScroll } from "react-icons/lu";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light"; // Default to light
    }
    return "light";
  });

  useEffect(() => {
    document.body.classList.remove("dark", "light", "c-beige"); // Remove all themes first
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "m") {
        setTheme((prev) =>
          prev === "dark" ? "light" : prev === "light" ? "c-beige" : "dark"
        );
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  if (!isClient) return null;

  return (
    <Button
      aria-label="Toggle theme"
      onClick={() =>
        setTheme((prev) =>
          prev === "dark" ? "light" : prev === "light" ? "c-beige" : "dark"
        )
      }
      variant="ghost"
      size="icon"
      className="w-5 h-5 transition-all duration-200 hover:bg-transparent !bg-transparent"
    >
      {theme === "dark" ? (
        <Moon size={20} className="dark:text-white" />
      ) : theme === "c-beige" ? (
        <LuScroll size={20} />
      ) : (
        <Sun size={20} />
      )}
    </Button>
  );
};
