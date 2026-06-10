import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Wine, BookOpen, Camera, Sparkles, GitCompare, Calendar, Grape } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Camera, title: 'Identifier', desc: 'Photo etiquette — identification IA instantanee', href: '/identifier' },
  { icon: MapPin, title: 'Carte', desc: 'Naviguez sur la carte interactive des vignobles', href: '/carte' },
  { icon: GitCompare, title: 'Comparer', desc: 'Comparez 2 a 3 vins cote a cote', href: '/comparateur' },
  { icon: Sparkles, title: 'Recommandations', desc: 'IA personnalisee selon vos gouts', href: '/recommandations' },
  { icon: Wine, title: 'Ma Cave', desc: 'Gerez votre inventaire de bouteilles', href: '/ma-cave' },
  { icon: BookOpen, title: 'Degustations', desc: 'Journal de degustation personnel', href: '/degustations' },
  { icon: Calendar, title: 'Millesimes', desc: 'Base complete ec comparaison inter-annees', href: '/millesimes' },
  { icon: Grape, title: 'Cepages', desc: 'Encyclopedie des cepages du monde', href: '/cepages' },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/explorer?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="pb-24 md:pb-0">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              L encyclopedie vivante du vin
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Explorez le monde
              <span className="block text-primary mt-1">du vin</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Identifiez, decouvrez et suivez les plus grands vins. Domaines, appellations, millesimes.
            </p>
            <form onSubmit={handleSearch} className="mt-10 max-w-xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un vin, domaine, appellation..."
                  className="w-full pl-12 pr-32 h-14 text-base rounded-xl border border-border/60 bg-card shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">
                  Rechercher
                </button>
              </div>
            </form>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Populaires :</span>
              {['Romanee-Conti', 'Petrus', 'Margaux', 'Rayas'].map((tag) => (
                <Link key={tag} to={`/explorer?q=${encodeURIComponent(tag)}`} className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">
                  {tag}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Toutes les fonctionnalites</h2>
          <p className="mt-1.5 text-muted-foreground">L encyclopedie du vin et votre espace personnel</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((feat, i) => (
            <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }}>
              <Link to={feat.href} className="group block p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300 h-full">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-3 group-hover:bg-primary/12 transition-colors">
                  <feat.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground">{feat.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
