# Rivage — Frontend Vue.js (Groupe 10, réservation d'hôtels)

Interface web (Vue 3 + Vite + Vue Router + Pinia + Axios) qui consomme l'API `hotel-booking-api` **uniquement via ses endpoints REST**.

## Prérequis
- Node.js 18+ (npm)
- L'API démarrée sur `http://localhost:8080` (voir le README du backend)

## Installation et lancement
```bash
npm install
cp .env.example .env     # puis ajustez VITE_API_URL si besoin
npm run dev              # http://localhost:5173
npm run build            # version de production dans dist/
```
Le backend autorise par défaut les origines `http://localhost:5173` et `http://localhost:3000` (variable `CORS_ORIGINS`).

## Comptes de test
`admin@hotel.com` / `Admin@123` (administrateur) · `jean@example.com` / `User@1234` (client)

## Pages
| Route | Accès | Contenu |
|---|---|---|
| `/` | public | Recherche de chambres (ville, dates, personnes, prix) + résultats paginés |
| `/hotels`, `/hotels/:id` | public | Liste filtrable, détail, chambres disponibles, avis |
| `/login`, `/register` | public | Connexion / inscription (messages d'erreur du serveur par champ) |
| `/book/:roomId` | connecté | Réservation avec devis détaillé (tarif de base / saison) puis paiement |
| `/my-reservations` | connecté | Historique, paiement, modification, annulation |
| `/profile` | connecté | Profil client |
| `/admin/*` | ADMIN | Tableau de bord (taux d'occupation), CRUD hôtels, chambres, **tarifs saisonniers**, types, équipements, clients ; réservations et paiements |

## Organisation
```
src/api/http.js          client Axios (jeton JWT, gestion 401, messages d'erreur)
src/stores/              Pinia : session (auth) et notifications (toast)
src/router/index.js      routes + garde (connexion / rôle admin)
src/components/          NavBar, Pagination, HotelCard, RoomCard, AdminResource (CRUD générique)…
src/admin/resources.js   configuration déclarative des écrans d'administration
src/views/               pages publiques ; src/views/admin/ pages d'administration
```
Remarque sécurité : le jeton est conservé dans `localStorage` (simple, adapté au TP). Pour un durcissement, utiliser un cookie `HttpOnly` côté serveur.
