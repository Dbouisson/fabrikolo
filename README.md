# Fabrikolo : mise en ligne

Ce dossier contient la version publique du site : une vraie adresse par activité (pour Google), un plan du site, une page de mentions légales, la newsletter du lundi et une mesure d'audience sans cookie.

## 1. Remplir `config.json`

| Champ | À mettre |
| --- | --- |
| `domaine` | Ton nom de domaine, par exemple `https://www.fabrikolo.com` |
| `editeur.nom`, `editeur.contact` | Ton nom et une adresse e-mail de contact dédiée au site |
| `newsletterAction` | L'adresse du formulaire Brevo (étape 4). Vide = « Inscriptions très bientôt » |
| `cloudflareAnalyticsToken` | Le jeton Cloudflare Web Analytics (étape 3). Vide = pas de mesure |
| `affiliationActive` | Laisser `false` tant qu'il n'y a pas de liens affiliés |

Puis : `node build.js` → tout est généré dans `dist/`.

Pour ajouter une activité : on met à jour `src/app.html` (le même fichier que la page Claude), puis on relance `node build.js`.

## 2. Nom de domaine et hébergement (gratuit sauf le domaine)

1. Acheter le domaine (environ 10 € par an) chez un registraire, ou directement chez Cloudflare.
2. Créer un compte Cloudflare, puis *Workers & Pages* → *Create* → *Pages* → *Upload assets* et déposer le dossier `dist/`.
   Ou en ligne de commande : `npx wrangler pages deploy dist --project-name fabrikolo`.
3. Dans le projet Pages : *Custom domains* → ajouter le domaine.

Alternatives équivalentes : GitHub Pages, Netlify, Firebase Hosting.

## 3. Mesurer la fréquentation

Cloudflare → *Web Analytics* → ajouter le site → copier le jeton dans `cloudflareAnalyticsToken` → `node build.js` → redéployer.
Sans cookie, donc pas de bandeau de consentement à afficher.

Pour que Google trouve le site : créer un compte Google Search Console, valider le domaine, et déclarer `https://ton-domaine/sitemap.xml`.

## 4. Newsletter du lundi

1. Compte gratuit Brevo (ou MailerLite).
2. Créer un formulaire d'inscription avec un champ `EMAIL` et la double confirmation activée.
3. Copier l'adresse d'envoi du formulaire (`action` du code HTML fourni par Brevo) dans `newsletterAction`.
4. Chaque lundi : une activité, la liste du matériel, le lien vers la fiche.

## 5. Quand passer à l'affiliation Amazon

Conditions pour s'inscrire sereinement :

- le site est sur ton domaine, avec au moins 30 activités ;
- au moins **30 visites par jour en moyenne pendant 4 semaines** (environ 900 par mois), d'après Cloudflare Web Analytics ;
- la déclaration de cumul d'activités est faite auprès de ta hiérarchie.

Calcul d'ordre de grandeur : 900 visites × 5 % qui cliquent sur un lien matériel × 7 % qui achètent ≈ 3 ventes par mois. La règle souvent citée de 3 ventes en 180 jours serait alors largement tenue. Ces pourcentages sont des hypothèses, pas des chiffres d'Amazon.

Le jour venu : `affiliationActive: true` ajoute le paragraphe obligatoire dans les mentions légales. Il restera à ajouter les encarts « Le matériel qu'on utilise » et les packs.

## 6. Galerie des réalisations et coup de cœur du mois

### Le formulaire d'envoi (Tally, gratuit, photos jusqu'à 10 Mo)

1. Créer un compte sur tally.so, puis un formulaire « Montre ta réalisation » avec :
   - E-mail du parent (obligatoire)
   - Activité réalisée (liste déroulante avec les titres des fiches)
   - Prénom de l'enfant (facultatif) et âge (facultatif)
   - Photo (champ « File upload », une image)
   - Case obligatoire : « Je suis le parent ou le représentant légal de l'enfant, je suis l'auteur de la photo ou j'ai son accord, et personne n'est reconnaissable sur la photo. »
   - Case obligatoire : « J'accepte les règles de la galerie et j'autorise Fabrikolo à utiliser cette photo dans les conditions décrites sur la page Participer (gratuitement, 5 ans, site, newsletter et réseaux sociaux, retrait possible à tout moment). » avec un lien vers `https://ton-domaine/participer/`
   - Case facultative : « Je participe au coup de cœur du mois et j'accepte son règlement. »
   - Case facultative, **non cochée par défaut** : « Je veux recevoir la newsletter du lundi (une idée d'activité par semaine, désinscription en un clic). »
2. Page de remerciement du formulaire (*Thank you page* dans Tally) : écrire « Bravo ! Ton code magique pour le tampon doré est : **XXXX**. Tape-le sur la fiche de l'activité. » en remplaçant XXXX par le code du mois.
3. Mettre le même code dans `codeDore` de `config.json` (lettres et chiffres, par exemple `ARCENCIEL`). Le changer chaque mois, sur les deux côtés en même temps.
4. Publier le formulaire et copier son lien dans `contributionFormUrl`.

### Newsletter : qui ajouter

Dans les réponses Tally, filtrer celles où la case newsletter est cochée, exporter en CSV, et importer seulement ces adresses dans Brevo. Les autres adresses ne vont jamais dans la newsletter : elles ont été données pour le tampon et le concours, pas pour recevoir des e-mails.

### Publier une photo

1. Vérifier la photo : pas de visage, rien qui identifie l'enfant ou la famille.
2. La déposer dans le dossier `galerie/` du projet (par exemple `vitraux-lea.jpg`, en JPG de moins de 500 Ko).
3. L'ajouter dans `config.json` :
   ```json
   "galerie": [
     { "fichier": "vitraux-lea.jpg", "activite": "vitraux", "prenom": "Léa", "age": 7, "coupDeCoeur": false }
   ]
   ```
   Pour qu'une photo devienne l'image principale de la fiche (à la place du dessin, avec le crédit « Réalisation de Léa, 7 ans ») : ajouter `"illustration": true`. Une seule photo « illustration » par activité ; si la photo est retirée, le dessin revient tout seul.
4. `node build.js` puis redéployer.

### Le concours

Remplir `concours` dans `config.json` (dates, lot), passer `actif` à `true`, reconstruire. La page `/participer/` contient le règlement complet, généré à partir de ces informations et de `editeur`.
Lot à coût zéro : la photo à la une de l'accueil + un diplôme « petit artiste du mois » personnalisé en PDF, envoyé par e-mail.

## 7. Les 5 langues

`node build.js` fabrique automatiquement une version par langue :

- français à la racine : `fabrikolo.com/`, `fabrikolo.com/activites/volcan/` ;
- anglais, allemand, italien, espagnol dans `/en/`, `/de/`, `/it/`, `/es/` (par exemple `fabrikolo.com/de/activites/volcan/`).

Chaque page indique à Google ses versions dans les autres langues (balises hreflang), et toutes sont dans le plan du site. Le menu de langue en haut de page envoie vers la même fiche dans l'autre langue.

Les pages « Participer » et « Mentions légales » restent en français : le concours est réservé aux familles résidant en France.

Pour ajouter une activité, il faut l'ajouter dans `ACTIVITIES` (en français) puis ajouter sa traduction dans `TRAD.en`, `TRAD.de`, `TRAD.it` et `TRAD.es`. Si une traduction manque, la fiche s'affiche en français dans cette langue, sans erreur.

## 8. Crédits Instagram

Chaque fiche inspirée d'une vidéo cite le compte et donne un lien simple vers la vidéo. On n'intègre jamais la vidéo elle-même : cela déposerait des cookies de Meta et imposerait un bandeau de consentement.

## 9. La page d'accueil suit le calendrier

Le bloc en haut de l'accueil change tout seul selon la date :

| Période | Bloc affiché |
|---|---|
| 1er au 24 septembre, 3 au 14 novembre | 🍂 C'est l'automne |
| 25 septembre au 2 novembre | 🎃 Spécial Halloween, avec compte à rebours |
| 15 novembre au 26 décembre | 🎄 En route vers Noël, avec compte à rebours |
| 27 décembre à fin février | ❄️ Bricoler au chaud |
| 3 semaines avant Pâques jusqu'au lundi de Pâques (date calculée chaque année) | 🐣 Spécial Pâques, avec compte à rebours |
| le reste de mars à mai | 🌷 Le printemps est là |
| juin à août | ☀️ Spécial vacances |

Six activités sont montrées, et la sélection tourne chaque semaine. Dans la liste complète, les activités de la saison passent en premier, et un bouton de filtre de la saison apparaît.

Les couleurs de fond, les confettis et le bandeau du haut prennent aussi les teintes de la saison (orange et noir pour Halloween, rouge et or pour Noël…). Les couleurs des fiches, elles, ne changent pas.

Pour voir l'accueil à une autre date : ajouter `?date=2026-12-10` à l'adresse.

Pour ranger une nouvelle activité dans Halloween, Noël ou l'été, ajouter son identifiant dans `HALLOWEEN_IDS`, `NOEL_IDS`, `PAQUES_IDS` ou `ETE_IDS` (dans `src/app.html`). Pour l'automne, l'hiver et le printemps, le champ `saisons` de la fiche suffit.

## 10. Mise à jour automatique avec GitHub

Le site est construit par Cloudflare à chaque envoi sur GitHub.

Réglages du projet Cloudflare Pages (une seule fois) :
- dépôt : `fabrikolo` ;
- branche de production : `main` ;
- commande de construction : `node build.js` ;
- dossier de sortie : `dist`.

Ensuite, chaque modification envoyée sur la branche `main` est en ligne en une à deux minutes.
