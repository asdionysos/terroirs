import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Explorer() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tab, setTab] = useState('cuvees');

  const { data: cuvees = [] } = useQuery({
    queryKey: ['cuvees'],
    queryFn: () => base44.entities.Cuvee.list('-created_at', 100),
  });

  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: () => base44.entities.Domain.list('-created_at', 100),
  });

  const filteredCuvees = cuvees.filter(c => c.name?.toLowerCase().includes(query.toLowerCase()));
  const filteredDomains = domains.filter(d => d.name?.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-10">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Explorer</h1>
      <p className="text-muted-foreground mb-6">Parcourez notre base de données viticole</p>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un vin, domaine, appellation…"
          className="w-full pl-10 pr-4 h-11 rounded-xl border border-border/60 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('cuvees')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'cuvees' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
          Cuvées ({filteredCuvees.length})
        </button>
        <button onClick={() => setTab('domains')} className={`px-4 py-2 rounded-lg text-sm font-medium transitiolors ${tab === 'domains' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
          Domaines ({filteredDomains.length})
        </button>
      </div>

      <div className="space-y-3">
        {tab === 'cuvees' && filteredCuvees.map((cuvee, i) => (
          <motion.div key={cuvee.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Link to={`/cuvee/${cuvee.id}`} className="block bg-card rounded-2xl border border-border/50 hover:border-primary/20 hover:shadow-md transition-all p-4">
              <h3 className="font-heading text-base font-semibold text-foreground">{cuvee.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{cuvee.wine_type} {cuvee.price_range && `· ${cuvee.price_range}`}</p>
            </Link>
          </motion.div>
        ))}
        {tab === 'domains' && filteredDomains.map((domain, i) => (
          <motion.div key={domain.id} initial={{ opacity: 0,y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Link to={`/domaine/${domain.id}`} className="block bg-card rounded-2xl border border-border/50 hover:border-primary/20 hover:shadow-md transition-all p-4">
              <h3 className="font-heading text-base font-semibold text-foreground">{domain.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{domain.farming_method} {domain.area_hectares && `· ${domain.area_hectares} ha`}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
