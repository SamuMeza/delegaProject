import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/servicios", label: "Servicios" },
  { to: "/delegar", label: "Delegar" },
  { to: "/contacto", label: "Contacto" },
];

export function LandingLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>
      <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-xl font-bold text-primary">
            Delega
          </Link>
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px] inline-flex items-center",
                    pathname === link.to
                      ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground",
                  )}
                  aria-current={pathname === link.to ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border bg-surface py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Delega — Apoyo Escolar en Venezuela
        </div>
      </footer>
    </div>
  );
}