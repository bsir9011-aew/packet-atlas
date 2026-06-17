# Packet Atlas v15.0 — Bilingual Play Overlay

v15.0 adds a bilingual learning overlay on top of the v14.9 PL/EN switch.

## v15.0A

Adds `getScenarioTranslation(language, text)`.

When Polish has a translation, it returns:

```ts
{
  primary: 'Szyfrowana sesja',
  secondary: 'Encrypted session',
}
```

When there is no translation, it safely falls back to the original text.

## v15.0B

Play Mode can show the Polish stage label while preserving the English source line.

## v15.0C

The animated motion layer can show the translated current stage with the English source underneath.

## Product rule

This is not a full scenario data refactor yet.

English remains the source of truth until the project migrates to structured bilingual scenario fields.
