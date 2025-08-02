import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useEffect, useState } from "react";

// This component provides the overall page structure and dark mode toggle
export function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(
    () =>
      (localStorage.getItem("theme") as "light" | "dark" | "system") || "system"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    let systemTheme = "light";
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      systemTheme = "dark";
    }
    root.classList.add(theme === "system" ? systemTheme : theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="h-6 w-6"
              >
                <rect width="256" height="256" fill="none" />
                <path
                  d="M208,88H152a8,8,0,0,1-8-8V24a8,8,0,0,1,8-8h56a8,8,0,0,1,8,8V80A8,8,0,0,1,208,88Zm-56-8h48V32H152Z"
                  opacity="0.2"
                />
                <path
                  d="M48,168H104a8,8,0,0,0,8-8V104a8,8,0,0,0-8-8H48a8,8,0,0,0-8,8v56A8,8,0,0,0,48,168Zm8-56h48v48H56Z"
                  opacity="0.2"
                />
                <path
                  d="M144,24V80a8,8,0,0,1-8,8H80"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                />
                <polyline
                  points="104 232 104 168 48 168"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                />
                <path
                  d="M208,88h16a8,8,0,0,1,8,8v56a8,8,0,0,1-8,8H168"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                />
                <path
                  d="M112,96H48a8,8,0,0,0-8,8v56a8,8,0,0,0,8,8h56a8,8,0,0,0,8-8V104A8,8,0,0,0,112,96Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                />
                <path
                  d="M216,24V80a8,8,0,0,1-8,8H152a8,8,0,0,1-8-8V24a8,8,0,0,1,8-8h56A8,8,0,0,1,216,24Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                />
              </svg>
              <span className="hidden font-bold sm:inline-block">
                Apify Runner
              </span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
