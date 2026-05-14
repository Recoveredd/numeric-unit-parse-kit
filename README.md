# numeric-unit-parse-kit

[![License: MPL-2.0](https://img.shields.io/badge/license-MPL--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/Recoveredd/numeric-unit-parse-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/Recoveredd/numeric-unit-parse-kit/actions/workflows/ci.yml)

Parse numeric values with units such as `12px`, `50 gold`, `-1.5turn`, `100%`, or `0` into structured results with readable diagnostics.

`numeric-unit-parse-kit` is a small clean-room toolkit for forms, config editors, import tools and design-token utilities that need to validate a single number plus an optional unit. It is deliberately narrower than a CSS parser, expression parser or unit converter.

Links: [Demo](https://packages.wasta-wocket.fr/numeric-unit-parse-kit/) · [GitHub](https://github.com/Recoveredd/numeric-unit-parse-kit)

## Package quality

- TypeScript types are generated from the source.
- ESM-only package with no runtime dependencies.
- Marked as side-effect free for bundlers.
- Browser-friendly implementation with no Node-only APIs.
- CI runs `npm ci`, `typecheck`, `build`, and `test`.
- Tested on Node.js 20 and 22 with GitHub Actions.

## Install

```bash
npm install numeric-unit-parse-kit
```

## Quick Start

```ts
import {
  createNumericUnitParser,
  formatNumericUnit,
  isNumericUnit,
  parseNumericUnit
} from "numeric-unit-parse-kit";

const parsed = parseNumericUnit("  50 gold  ", {
  allowedUnits: ["gold", "silver"],
  requireUnit: true
});

if (parsed.ok) {
  parsed.value.amount;
  // 50

  parsed.value.unit;
  // "gold"

  parsed.value.normalized;
  // "50gold"
}

isNumericUnit("12px", { allowedUnits: ["px", "rem"] });
// true

formatNumericUnit({ amount: 12, unit: "gold" }, { separator: " " });
// "12 gold"

const cssLength = createNumericUnitParser({
  allowedUnits: ["px", "rem", "%"],
  requireUnit: true
});

cssLength.isValid("1.5rem");
// true
```

## Why this package

Small numeric-unit inputs show up in many places: design tokens, spacing controls, game configs, quota settings, billing quantities, virtual currencies, custom measurements and import columns.

Boolean validation is often not enough. This package returns stable issue codes and keeps the parsed value small:

```ts
const result = parseNumericUnit("12bananas", {
  allowedUnits: ["px", "rem"]
});

result.issues;
// [
//   {
//     code: "unit-not-allowed",
//     message: "Unit \"bananas\" is not in the allowed unit list.",
//     input: "12bananas",
//     normalizedInput: "12bananas",
//     unit: "bananas"
//   }
// ]
```

## API

### `parseNumericUnit(input, options?)`

Returns a discriminated result:

```ts
type ParseNumericUnitResult =
  | { ok: true; value: NumericUnit; issues: [] }
  | { ok: false; value: null; issues: NumericUnitIssue[] };

type NumericUnit = {
  amount: number;
  unit: string;
  raw: string;
  normalized: string;
};
```

Example:

```ts
const result = parseNumericUnit("-1.5turn", {
  allowedUnits: ["deg", "rad", "turn"],
  allowNegative: true
});
```

### `isNumericUnit(input, options?)`

Boolean shortcut for `parseNumericUnit(input, options).ok`.

```ts
isNumericUnit("100%", { allowPercent: true });
// true
```

### `formatNumericUnit(value, options?)`

Formats `{ amount, unit }` back to a string.

```ts
formatNumericUnit({ amount: 1.2345, unit: "px" }, { maximumFractionDigits: 2 });
// "1.23px"

formatNumericUnit({ amount: 12, unit: "gold" }, { separator: " " });
// "12 gold"
```

By default, `formatNumericUnit({ amount: 0, unit: "px" })` returns `"0"`. Pass `{ unitlessZero: false }` when the unit should be preserved.

### `createNumericUnitParser(defaultOptions?)`

Creates a small parser object that reuses the same defaults across a form, importer or config validator. Per-call options override the defaults.

```ts
const cssLength = createNumericUnitParser({
  allowedUnits: ["px", "rem"],
  allowPercent: false,
  requireUnit: true
});

cssLength.parse("12px");
cssLength.isValid("12rem");
cssLength.format({ amount: 12, unit: "px" });

cssLength.isValid("50%", {
  allowPercent: true,
  allowedUnits: ["px", "%"]
});
// true
```

## Options

### Parse options

| Option | Default | Description |
| --- | --- | --- |
| `allowedUnits` | none | Optional list of accepted units. Empty unit values are still allowed unless `requireUnit` rejects them. |
| `caseSensitiveUnits` | `true` | Compare `allowedUnits` using exact casing by default. |
| `requireUnit` | `false` | Reject values without units. |
| `allowUnitlessZero` | `true` | Allow `0` when `requireUnit` is enabled. |
| `allowNegative` | `true` | Allow negative numeric amounts. |
| `allowPercent` | `true` | Allow `%` as a unit. |
| `trim` | `true` | Trim surrounding whitespace before parsing. |

### Format options

| Option | Default | Description |
| --- | --- | --- |
| `unitlessZero` | `true` | Format zero as `0` even when a unit is present. |
| `maximumFractionDigits` | none | Round the amount with `Intl.NumberFormat`. |
| `separator` | `""` | String placed between amount and unit. |

## Diagnostics

Issue codes are stable and intended for UI messages, logs or localization:

- `empty`
- `invalid-type`
- `invalid-syntax`
- `non-finite`
- `negative-not-allowed`
- `unit-required`
- `unit-not-allowed`
- `percent-not-allowed`

## Limits

This package parses one numeric value and one unit. It does not:

- parse formulas such as `calc(100% - 1rem)`;
- parse ranges such as `1-3px`;
- parse compound dimensions such as `10px 20px`;
- convert between units;
- validate CSS grammar;
- infer whether a unit makes sense for a domain.

Use it as a small validation layer before domain-specific checks.

## License

MPL-2.0
