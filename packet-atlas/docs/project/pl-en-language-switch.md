# Packet Atlas v14.9 — PL/EN Language Switch

v14.9 adds a small language foundation for Packet Atlas.

## v14.9A

- adds `AtlasLanguage = 'en' | 'pl'`,
- stores language in `useAtlasStore`,
- persists the selected language in `localStorage`,
- adds a tiny internal i18n helper.

## v14.9B

- adds a PL/EN switch in Play Mode,
- translates the Play Mode shell labels,
- keeps Play Mode architecture unchanged.

## v14.9C

- adds safe scenario text translation through fallback dictionary,
- does not refactor the whole scenario data model yet,
- keeps English as the source of truth until the data model is ready for bilingual fields.
