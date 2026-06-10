import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function createEntityAdapter(tableName) {
  return {
    async list(orderBy = '-created_at', limit = 200) {
      const ascending = !orderBy.startsWith('-');
      const column = orderBy.replace(/^-/, '');
      const { data, error } = await supabase.from(tableName).select('*').order(column, { ascending }).limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    async filter(filters = {}, orderBy = '-created_at') {
      const ascending = !orderBy.startsWith('-');
      const column = orderBy.replace(/^-/, '');
      let query = supabase.from(tableName).select('*');
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) query = query.eq(key, value);
      });
      const { data, error } = await query.order(column, { ascending });
      if (error) throw error;
      return data ?? [];
    },
    async get(id) {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    async create(payload) {
      const { data, error } = await supabase.from(tableName).insert([{ ...payload, created_at: new Date().toISOString() }]).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase.from(tableName).update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
    },
  };
}

export const base44 = {
  entities: {
    Domain: createEntityAdapter('domains'),
    Cuvee: createEntityAdapter('cuvees'),
    Appellation: createEntityAdapter('appellations'),
    Region: createEntityAdapter('regions'),
    Vintage: createEntityAdapter('vintages'),
    GrapeVariety: createEntityAdapter('grape_varieties'),
    PriceHistory: createEntityAdapter('price_histories'),
    Tasting: createEntityAdapter('tastings'),
    WineCellar: createEntityAdapter('wine_cellars'),
    WineEvent: createEntityAdapter('wine_events'),
    Wishlist: createEntityAdapter('wishlists'),
  },
};

export default base44;
