# Draft Report: numeric-unit-parse-kit

## Verdict

GO local uniquement. Le brouillon est une réécriture clean-room, sans reprise du code, du README ou des tests de `parse-unit`.

## Candidat source de demande

- Package abandonné: `parse-unit`.
- Dernière vraie version: `1.0.1`, publiée le 22 septembre 2014 d'après `npm view parse-unit time`.
- Description npm: parse une valeur comme `20px` en nombre + unité.
- Licence de l'ancien package: MIT.
- Preuve d'usage: Ecosyste.ms/data.code.gouv.fr indiquait environ 1 022 910 téléchargements sur le dernier mois pour `parse-unit` au moment de la qualification.

## Score anti-emballement

- Usage actuel vérifié: 2/2. Téléchargements mensuels élevés pour un micro-package.
- Abandon ou maintenance faible: 2/2. Pas de release fonctionnelle depuis 2014.
- Scope livrable en 1 journée: 2/2. Parsing d'une valeur numérique + unité, diagnostics, sérialisation.
- Douleur utilisateur visible: 2/2. L'ancien comportement retourne un tuple peu descriptif et ne donne pas de raison d'échec.
- Différenciation non triviale: 2/2. Diagnostics structurés, allowlist d'unités, règles métier explicites et formatage normalisé.

Score total: 10/10.

## Différenciation en 1 journée

`numeric-unit-parse-kit` parse une valeur numérique avec unité arbitraire, compacte ou séparée par espace (`12px`, `50 gold`, `100%`), et retourne en moins de 30 secondes un résultat typé avec `{ amount, unit, raw }` ou un diagnostic exploitable, plus des options concrètes (`allowedUnits`, `requireUnit`, `allowPercent`, `allowNegative`) et une sérialisation normalisée.

## Alternatives maintenues

- `css-tree`: maintenu et puissant, mais vise un parsing CSS complet et un AST; trop lourd pour valider une seule valeur numérique avec unité.
- `postcss-value-parser`: maintenu historiquement et utile pour des valeurs CSS complexes, mais expose un arbre de tokens plutôt qu'une API ciblée nombre + unité + diagnostics.
- `css-unit-converter`: convertit des unités CSS, dernière release en 2020; ce n'est pas le même besoin qu'un parseur générique de validation.
- `unit-value` et petits packages similaires: proches mais anciens ou orientés objet/conversion, sans angle diagnostic strict.

Conclusion concurrence: pas de leader récent et meilleur sur le micro-besoin "parse une valeur numérique avec unité arbitraire, diagnostics structurés et garde-fous".

## Nom retenu

`numeric-unit-parse-kit`.

Justification: nom explicite et descriptif, cohérent avec les brouillons en `*-kit`, compréhensible dans une liste npm/GitHub, et suffisamment distinct de `parse-unit`. Le nom indique clairement le domaine (`numeric-unit`) et l'action (`parse`) sans prétendre à un domaine CSS.

## Compatibilité navigateur

Le coeur utilise uniquement des primitives ECMAScript (`String`, `Number`, `RegExp`, `Array.includes`, `toLocaleString`) et n'importe aucune API Node (`fs`, `path`, `Buffer`, `process`, réseau, modules natifs). La librairie est donc browser-friendly. Les dépendances sont uniquement de développement.

## CLI

Pas de CLI dans ce brouillon. L'usage naturel est la validation ou normalisation inline dans une application, un formulaire, un outil de configuration ou un pipeline de données léger. Une CLI ajouterait du bruit sans bénéfice évident.

## API proposée

- `parseNumericUnit(input, options?)`: retourne `{ ok: true, value, issues: [] }` ou `{ ok: false, value: null, issues }`.
- `isNumericUnit(input, options?)`: helper booléen.
- `formatNumericUnit(value, options?)`: sérialise une valeur parsée ou compatible.

Options principales: `allowedUnits`, `requireUnit`, `allowUnitlessZero`, `allowNegative`, `allowPercent`, `trim`.

## Risques et limites

- Le package ne parse pas les formules, plages, dimensions composées, couleurs, shorthands ou grammaires complètes.
- La sérialisation normalisée supprime l'espace entre nombre et unité; c'est volontaire mais à relire.
- Les unités restent arbitraires sauf si l'utilisateur fournit `allowedUnits`.
- Avant publication, il faudrait tester l'ergonomie du nom et vérifier qu'il ne promet pas un parseur de dimensions complet.

## Ce qui manque avant publication

- Revue humaine du scope et du nom.
- Décision sur une éventuelle liste d'unités communes exportée: rester permissif ou fournir une constante optionnelle.
- Tests supplémentaires sur les valeurs extrêmes si le package devient public.
- Vérification finale du nom npm juste avant publication éventuelle.

## État du Git local du brouillon

- `git init`: OK dans le dossier du brouillon uniquement.
- `git branch -M main`: a signalé une erreur de verrouillage `HEAD.lock`, mais la branche courante est ensuite bien `main`.
- `git config user.name "Recoveredd"` et `git config user.email "recoveredd@users.noreply.github.com"`: OK.
- `git add .` et `git commit -m "Create numeric-unit-parse-kit draft"`: OK.
- Commit local créé: `9da7aae Create numeric-unit-parse-kit draft`.
- Aucun remote ajouté, aucun push, aucune commande Git lancée dans le workspace parent.

## Validations locales

- `npm install --cache ./.npm-cache`: OK, 54 packages ajoutés, 0 vulnérabilité signalée.
- `npm run typecheck`: OK.
- `npm test`: OK après correction de scope, 10 tests passés.
- `npm run build`: OK.
- `npm pack --dry-run --cache ./.npm-cache`: OK après correction de scope, tarball simulé `numeric-unit-parse-kit-0.1.0.tgz`, 9.1 kB.

## Verdict humain recommandé

Relire le nom et confirmer que le périmètre "nombre + unité arbitraire" est assez clair. Si oui, le draft est petit, jetable et raisonnable pour une revue du matin.
