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
    <div className="flex min-h-screen flex-col bg-surface-studio">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface-container-lowest focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary focus:shadow-ambient"
      >
        Saltar al contenido principal
      </a>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-surface-studio shadow-ambient">
        <nav className="flex justify-between items-center h-16 w-full max-w-[1280px] mx-auto px-4 md:px-16">
          <Link to="/" className="font-display text-headline-md font-bold text-primary">
            Delega
          </Link>
          <ul className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={cn(
                    "text-sm font-semibold uppercase tracking-wide transition-colors min-h-[44px] inline-flex items-center",
                    pathname === link.to
                      ? "text-secondary border-b-2 border-secondary"
                      : "text-on-surface-variant hover:text-secondary",
                  )}
                  aria-current={pathname === link.to ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/login"
              className="hidden md:block px-4 py-2 text-primary text-sm font-semibold hover:bg-surface-container rounded-lg transition-colors"
            >
              Admin Login
            </Link>
            <Link
              to="/delegar"
              className="px-6 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-ambient hover:shadow-ambient-hover"
            >
              Delegar Ahora
            </Link>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main id="main-content" className="flex-1 pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-on-primary py-12 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 md:px-16 max-w-[1280px] mx-auto">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <span className="font-display text-headline-sm font-bold text-on-primary">Delega</span>
            <p className="text-sm text-on-primary-container">
              Tu apoyo académico estructurado y confiable.
            </p>
          </div>
          {/* Legal */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-on-primary-container">Legal</span>
            <a className="text-sm text-on-primary-container hover:text-white transition-colors" href="#">Términos de servicio</a>
            <a className="text-sm text-on-primary-container hover:text-white transition-colors" href="#">Política de privacidad</a>
            <a className="text-sm text-on-primary-container hover:text-white transition-colors" href="#">Aviso de integridad académica</a>
          </div>
          {/* Support */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-on-primary-container">Soporte</span>
            <a className="text-sm text-on-primary-container hover:text-white transition-colors" href="#">WhatsApp</a>
            <a className="text-sm text-on-primary-container hover:text-white transition-colors" href="#">FAQ</a>
          </div>
          {/* Services */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-on-primary-container">Servicios</span>
            <Link to="/servicios" className="text-sm text-on-primary-container hover:text-white transition-colors">Ver servicios</Link>
            <Link to="/delegar" className="text-sm text-on-primary-container hover:text-white transition-colors">Delegar tarea</Link>
            <Link to="/contacto" className="text-sm text-on-primary-container hover:text-white transition-colors">Contacto</Link>
          </div>
        </div>
        <div className="px-4 md:px-16 max-w-[1280px] mx-auto mt-12 pt-8 border-t border-primary-container">
          <p className="text-sm text-on-primary-container text-center">
            &copy; {new Date().getFullYear()} Delega — Apoyo Escolar en Venezuela
          </p>
        </div>
      </footer>
    </div>
  );
}
