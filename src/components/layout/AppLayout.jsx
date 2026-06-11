import { Outlet, Link, useLocation } from 'react-router-dom';
import { Wine, Search, Map, Camera, GlassWater, GitCompare, Sparkles, BookOpen, Calendar, Grape, Home, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/explorer', label: 'Explorer', icon: Search },
  { path: '/carte', label: 'Carte', icon: Map },
  { path: '/identifier', label: 'Identifier', icon: Camera },
  { path: '/decouvrir', label: 'Decouvrir', icon: GlassWater },
  { path: '/comparateur', label: 'Comparer', icon: GitCompare },
  { path: '/recommandations', label: 'Recommandations', icon: Sparkles },
  { path: '/ma-cave', label: 'Ma Cave', icon: Wine },
  { path: '/degustations', label: 'Degustations', icon: BookOpen },
  { path: '/millesimes', label: 'Millesimes', icon: Calendar },
  { path: '/cepages', label: 'Cepages', icon: Grape },
];

export default function AppLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMapPage = location.pathname === '/carte';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50" style={{ height: '64px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
          <div className="flex items-center justify-between h-full">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Wine className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
                Terroirs
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-primary/8 rounded-lg"
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link to="/profil" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <User className="w-4 h-4" />
                <span>Profil</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border/50"
            >
              <nav className="px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main
        style={{
          height: isMapPage ? 'calc(100vh - 64px)' : 'auto',
          overflow: isMapPage ? 'hidden' : 'auto',
        }}
      >
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/50">
        <div className="flex items-center justify-around px-2 py-1.5">
          {[
            { path: '/', label: 'Accueil', icon: Home },
            { path: '/explorer', label: 'Explorer', icon: Search },
            { path: '/identifier', label: 'Identifier', icon: Camera },
            { path: '/ma-cave', label: 'Cave', icon: Wine },
            { path: '/recommandations', label: 'Pour moi', icon: Sparkles },
          ].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
