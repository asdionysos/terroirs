// Wine category terms — keyed by lowercase French, translated per lang
export const WINE_TYPES = {
  'vin rouge':          { en: 'Red wine',           de: 'Rotwein',        es: 'Vino tinto',      it: 'Vino rosso',     zh: '红葡萄酒' },
  'vin blanc':          { en: 'White wine',          de: 'Weißwein',       es: 'Vino blanco',     it: 'Vino bianco',    zh: '白葡萄酒' },
  'vin rosé':           { en: 'Rosé wine',           de: 'Roséwein',       es: 'Vino rosado',     it: 'Vino rosato',    zh: '桃红葡萄酒' },
  'vin mousseux':       { en: 'Sparkling wine',      de: 'Schaumwein',     es: 'Vino espumoso',   it: 'Vino spumante',  zh: '起泡酒' },
  'vin tranquille':     { en: 'Still wine',          de: 'Stillwein',      es: 'Vino tranquilo',  it: 'Vino fermo',     zh: '静止葡萄酒' },
  'vin de liqueur':     { en: 'Liqueur wine',        de: 'Likörwein',      es: 'Vino de licor',   it: 'Vino liquoroso', zh: '加强葡萄酒' },
  'vin doux naturel':   { en: 'Natural sweet wine',  de: 'Natursüßwein',   es: 'Vino dulce nat.', it: 'Vino dolce nat.',zh: '天然甜葡萄酒' },
  'vin primeur':        { en: 'Primeur wine',        de: 'Jungwein',       es: 'Vino primeur',    it: 'Vino novello',   zh: '新酒' },
  'eau-de-vie':         { en: 'Brandy',              de: 'Branntwein',     es: 'Aguardiente',     it: 'Acquavite',      zh: '白兰地' },
  "eau-de-vie de vin":  { en: 'Wine brandy',         de: 'Weinbrand',      es: 'Aguardiente de vino', it: 'Grappa', zh: '葡萄白兰地' },
  'crémant':            { en: 'Crémant',             de: 'Crémant',        es: 'Crémant',         it: 'Crémant',        zh: '克雷芒' },
  'cidre':              { en: 'Cider',               de: 'Apfelwein',      es: 'Sidra',           it: 'Sidro',          zh: '苹果酒' },
  'poiré':              { en: 'Perry',               de: 'Birnenmost',     es: 'Sidra de pera',   it: 'Sidro di pere',  zh: '梨酒' },
  'vin de paille':      { en: 'Straw wine',          de: 'Strohwein',      es: 'Vino de paja',    it: 'Vino di paglia', zh: '稻草酒' },
  'vin jaune':          { en: 'Yellow wine',         de: 'Gelbwein',       es: 'Vino amarillo',   it: 'Vino giallo',    zh: '黄葡萄酒' },
  'vin de triees successives': { en: 'Botrytized wine', de: 'Edelfaulwein', es: 'Vino botritizado', it: 'Vino botritizzato', zh: '贵腐酒' },
  'vin de glace':       { en: 'Ice wine',            de: 'Eiswein',        es: 'Vino de hielo',   it: 'Vino di ghiaccio', zh: '冰葡萄酒' },
}

export const UI = {
  fr: {
    aoc:              'Appellation AOC',
    denomination:     'Dénomination',
    wineTypes:        'Types de vin',
    viewFull:         'Voir la fiche complète →',
    inao:             "Appellation d'Origine Contrôlée reconnue par l'INAO — Institut National de l'Origine et de la Qualité.",
    appellations:     'Appellations',
    geology:          'Géologie',
    domains:          'Domaines',
    searchPlaceholder:'Appellation, domaine…',
    methodTitle:      'Méthode culturale',
    region:           'Région viticole',
    appellation:      'Appellation',
  },
  en: {
    aoc:              'AOC Appellation',
    denomination:     'Denomination',
    wineTypes:        'Wine types',
    viewFull:         'View full profile →',
    inao:             'Protected Designation of Origin recognized by INAO — France\'s National Institute of Origin and Quality.',
    appellations:     'Appellations',
    geology:          'Geology',
    domains:          'Estates',
    searchPlaceholder:'Appellation, estate…',
    methodTitle:      'Farming method',
    region:           'Wine region',
    appellation:      'Appellation',
  },
  de: {
    aoc:              'AOC-Appellation',
    denomination:     'Bezeichnung',
    wineTypes:        'Weintypen',
    viewFull:         'Vollständiges Profil →',
    inao:             'Geschützte Ursprungsbezeichnung, anerkannt vom INAO — Nationales Institut für Herkunft und Qualität.',
    appellations:     'Appellationen',
    geology:          'Geologie',
    domains:          'Weingüter',
    searchPlaceholder:'Appellation, Weingut…',
    methodTitle:      'Anbaumethode',
    region:           'Weinregion',
    appellation:      'Appellation',
  },
  es: {
    aoc:              'Apelación AOC',
    denomination:     'Denominación',
    wineTypes:        'Tipos de vino',
    viewFull:         'Ver ficha completa →',
    inao:             'Denominación de Origen Protegida reconocida por el INAO — Instituto Nacional del Origen y la Calidad.',
    appellations:     'Apelaciones',
    geology:          'Geología',
    domains:          'Bodegas',
    searchPlaceholder:'Apelación, bodega…',
    methodTitle:      'Método de cultivo',
    region:           'Región vinícola',
    appellation:      'Apelación',
  },
  it: {
    aoc:              'Denominazione AOC',
    denomination:     'Denominazione',
    wineTypes:        'Tipi di vino',
    viewFull:         'Vedi scheda completa →',
    inao:             'Denominazione di Origine Protetta riconosciuta dall\'INAO — Istituto Nazionale dell\'Origine e della Qualità.',
    appellations:     'Denominazioni',
    geology:          'Geologia',
    domains:          'Cantine',
    searchPlaceholder:'Denominazione, cantina…',
    methodTitle:      'Metodo di coltivazione',
    region:           'Regione vinicola',
    appellation:      'Denominazione',
  },
  zh: {
    aoc:              'AOC产区',
    denomination:     '名称',
    wineTypes:        '葡萄酒类型',
    viewFull:         '查看完整信息 →',
    inao:             '由INAO（法国国家原产地与质量研究院）认证的受保护原产地名称。',
    appellations:     '产区',
    geology:          '地质',
    domains:          '酒庄',
    searchPlaceholder:'产区、酒庄…',
    methodTitle:      '种植方式',
    region:           '葡萄酒产区',
    appellation:      '产区',
  },
}

export function t(lang, key) {
  return UI[lang]?.[key] ?? UI.fr[key] ?? key
}

export function translateCategorie(categorie, lang) {
  if (!categorie || lang === 'fr') return categorie
  return categorie
    .split(',')
    .map(raw => {
      const term = raw.trim().toLowerCase()
      // Try exact match first, then partial
      for (const [key, trans] of Object.entries(WINE_TYPES)) {
        if (term === key || term.includes(key)) {
          return trans[lang] ?? raw.trim()
        }
      }
      return raw.trim()
    })
    .join(', ')
}
