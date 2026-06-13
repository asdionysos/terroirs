# Terroirs — Contexte projet complet

## Identité
App encyclopédique du vin — "Google Maps + Wikipedia + Sommelier IA du vin"
Interface adaptative néophyte vers expert
Traducteur sensoriel = innovation centrale

## Nom & Domaine
Nom : Terroirs (provisoire)
Domaine : terroirs.app (acheté sur Namecheap, 11€/an)
Marque : libre en classes 9 et 42 (EUIPO et USPTO vérifiés)

## Stack technique
- React + Vite + Tailwind v3
- Supabase (PostgreSQL + Auth + RLS)
- Vercel (déploiement)
- GitHub : asdionysos/terroirs
- Leaflet (carte interactive)

## URLs
- Local : http://localhost:5173
- Production : https://terroirs-sepia.vercel.app
- Supabase : https://qcdiusfwjlahvzocmpom.supabase.co
- Supabase anon key : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZGl1c2Z3amxhaHZ6b2NtcG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzkzMTMsImV4cCI6MjA5NjY1NTMxM30.atrsZD0MxMx0UcSGJPhJxqVLvzL3JlmnP0VdtxsUjFg

## Tables Supabase créées
regions, appellations, domains, cuvees, grape_varieties, vintages,
price_histories, tastings, wine_cellars, wishlists, wine_events, user_profiles

## Données insérées
- 5 régions : Bourgogne, Bordeaux, Champagne, Rhône, Alsace
- 18 appellations avec coordonnées GPS
- ~45 domaines de référence avec coordonnées GPS
(DRC, Pétrus, Margaux, Rayas, Leroy, Rousseau, Chave, Zind-Humbrecht, Krug, Salon, Selosse...)

## Pages créées
- Home.jsx — page accueil avec recherche
- Explorer.jsx — liste cuvées/domaines avec recherche
- Carte.jsx — carte interactive Leaflet avec filtres

## Pages à créer
- Identifier.jsx — scan photo étiquette IA
- MaCave.jsx — cave virtuelle
- SommelierIA.jsx — traducteur sensoriel
- Degustations.jsx — journal de dégustation
- Millesimes.jsx — base millésimes
- Cepages.jsx — encyclopédie cépages
- Comparateur.jsx — comparaison vins
- Recommandations.jsx — IA personnalisée
- VinsSimilaires.jsx

## État de la carte (priorité)
La carte Leaflet fonctionne avec :
- 4 fonds : Neutre, Administratif, Satellite, Terrain
- Filtres : Régions, Appellations, Géologie BRGM, Domaines
- Tooltip au survol + Popup au clic avec bouton "Voir la fiche"
- Légende méthodes culturales + légende géologie

Problèmes identifiés à résoudre :
1. Appellations en cercles → besoin vrais polygones GeoJSON INAO
   Source : https://www.pigma.org/portail/fr/jeux-de-donnees/delimitation_parcellaire_des_aoc_viticoles_de_l_inao/telechargements
   Alternative : API IGN Carto (clé gratuite sur geoservices.ign.fr)
2. Géologie BRGM déborde sur les océans → besoin masque frontières France
3. Coloris géologie trop scolaire → palette plus sobre à implémenter
4. Clic "Voir la fiche" → page domaine à créer

## Prochaines étapes dans l'ordre
1. Récupérer polygones GeoJSON appellations (INAO/IGN)
2. Améliorer carte (masque géologie, coloris, polygones)
3. Créer page Domaine (fiche complète)
4. Créer page Identifier (scan étiquette)
5. Créer page Ma Cave
6. Déployer sur terroirs.app (DNS Namecheap configuré mais domaine pas encore acheté)

## Composants spéciaux conçus (à intégrer)
- SensoryTranslator.jsx — sommelier IA conversationnel
- CavisteLocator.jsx — géolocalisation cavistes
- WineLearning.jsx — apprentissage ludique

## Pour lancer le projet en local
cd ~/terroirs
npm run dev
→ http://localhost:5173
