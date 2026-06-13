const REGION_PATTERNS = [
  [/^alsace|crémant d'alsace/i, 'Alsace'],
  [/côte rôtie|condrieu|saint-joseph|hermitage|ermitage|crozes/i, 'RhoneNord'],
  [/bordeaux|médoc|sauternes|barsac|pomerol|saint-emilion|fronsac|graves|entre-deux-mers|margaux|pauillac|saint-julien|moulis|crémant de bordeaux|cadillac|loupiac|cérons|premières côtes|montagne-saint|bourg et bourgeais|côtes de bourg/i, 'Bordeaux'],
  [/beaujolais|brouilly|chénas|moulin-à-vent|fleurie|juliénas|morgon|chiroubles|régnié|saint-amour|coteaux du lyonnais/i, 'Beaujolais'],
  [/bourgogne|chablis|mâcon|givry|mercurey|rully|santenay|auxey|bouzeron|corton|côte de beaune|côte de nuits|nuits-saint|vosne|fixin|crémant de bourgogne|saint-bris|saint-romain|saint-véran|vézelay|viré|pouilly-fuissé|pouilly-loché|pouilly-vinzelles|montagny|petit chablis|marsannay/i, 'Bourgogne'],
  [/côtes du rhône|châteauneuf|gigondas|vacqueyras|rasteau|cairanne|tavel|lirac|beaumes de venise|muscat de beaumes|grignan|ventoux|luberon|vinsobres|vivarais|coteaux de die|châtillon-en-diois/i, 'RhoneSud'],
  [/anjou|muscadet|saumur|chinon|vouvray|sancerre|pouilly-fumé|pouilly-sur-loire|menetou|touraine|montlouis|savennières|bonnezeaux|quarts de chaume|coteaux du layon|coteaux de l'aubance|crémant de loire|gros plant|fiefs vendéens|reuilly|quincy|valençay|cheverny|jasnières|coteaux du loir|coteaux du vendômois|coteaux du giennois|coteaux d'ancenis|bourgueil|saint-pourçain|orléans|rosé de loire|cabernet d'anjou|côte roannaise|côtes du forez|châteaumeillant/i, 'Loire'],
  [/provence|bandol|palette|coteaux d'aix|coteaux varois|côtes de provence|baux de provence|pierrevert|sable de camargue/i, 'Provence'],
  [/roussillon|maury|béa|banyuls|rivesaltes|grand roussillon/i, 'Roussillon'],
  [/languedoc|corbières|minervois|faugères|saint-chinian|picpoul|fitou|clairette|muscat de frontignan|muscat de lunel|muscat de mireval|muscat de saint-jean|la clape|terrasses du larzac|grés de montpellier|malepère|cabardès|limoux|costières de nîmes|pic saint-loup|laudun|boutenac|la livinière/i, 'Languedoc'],
  [/bergerac|cahors|gaillac|madiran|irouléguy|fronton|buzet|côtes de duras|montravel|marcillac|estaing|entraygues|tursan|saint-mont|brulhois|côtes du marmandais|côtes de millau|coteaux du quercy|saint-sardos|saussignac|côtes d'auvergne|béarn|haut-poitou|châteaumeillant/i, 'SudOuest'],
  [/jura|savoie|arbois|château-chalon|l.étoile|l.etoile|macvin|bugey|roussette|seyssel|crémant du jura|côtes du jura|moselle|vin de savoie|côtes de toul/i, 'JuraSavoie'],
  [/corse|ajaccio|patrimonio|muscat du cap/i, 'Corse'],
]

const BOURGOGNE_GRANDS_CRUS = new Set([
  'Chambertin', 'Chambertin-Clos de Bèze', 'Chapelle-Chambertin',
  'Charmes-Chambertin', 'Griotte-Chambertin', 'Latricières-Chambertin',
  'Mazis-Chambertin', 'Mazoyères-Chambertin', 'Ruchottes-Chambertin',
  'Clos Saint-Denis', 'Clos de la Roche', 'Clos de Tart', 'Clos des Lambrays',
  'Clos de Vougeot ou Clos Vougeot',
  'Richebourg', 'La Romanée', 'Romanée-Conti', 'Romanée-Saint-Vivant',
  'La Grande Rue', 'La Tâche', 'Echezeaux', 'Grands-Echezeaux',
  'Musigny', 'Bonnes-Mares',
  'Montrachet', 'Chevalier-Montrachet', 'Bâtard-Montrachet',
  'Bienvenues-Bâtard-Montrachet', 'Criots-Bâtard-Montrachet',
  'Corton-Charlemagne', 'Charlemagne', 'Corton',
  'Coulée de Serrant', 'Savennières Roche aux Moines',
])

export function getRegion(app) {
  if (!app) return 'default'
  for (const [pattern, region] of REGION_PATTERNS) {
    if (pattern.test(app)) return region
  }
  return 'default'
}

export function getLevel(app) {
  if (!app) return 2
  const a = app.toLowerCase()
  if (/grand cru|premier cru|1er cru/.test(a)) return 3
  if (BOURGOGNE_GRANDS_CRUS.has(app)) return 3
  if (/^bordeaux$|^bordeaux supérieur$/.test(a)) return 1
  if (/^crémant d[e']/.test(a)) return 1
  if (/^bourgogne$|^bourgogne aligoté$|^bourgogne passe|^bourgogne mousseux$|coteaux bourguignons/.test(a)) return 1
  if (/^beaujolais$/.test(a)) return 1
  if (/^côtes du rhône$/.test(a)) return 1
  if (/^languedoc$/.test(a)) return 1
  if (/^alsace ou/.test(a)) return 1
  if (/rosé de/.test(a)) return 1
  if (/^muscat du cap|^muscat de beaumes|^muscat de front|^muscat de lun|^muscat de mir|^muscat de saint-jean/.test(a)) return 1
  if (/^rivesaltes$|^grand roussillon$|^banyuls$/.test(a)) return 1
  if (/^côtes du /.test(a)) return 1
  if (/^coteaux du /.test(a)) return 1
  if (/^côtes d[e'] /.test(a)) return 1
  if (/^coteaux d[e'] /.test(a)) return 1
  if (/^gros plant|^fiefs vendéens|^vin de savoie$|^sable de camargue/.test(a)) return 1
  return 2
}
