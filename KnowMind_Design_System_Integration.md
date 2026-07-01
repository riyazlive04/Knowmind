# KnowMind - Design System Integration Guide (Frontend)

Version 1.0 | For: KnowMind Next.js 14 frontend | Codebase: `C:\dev\Knowmind_application`

This guide installs the KnowMind design system into the existing frontend. It is additive and incremental: tokens go in first, existing components adopt them screen by screen, and the blue UI states are migrated to brand tokens. It doubles as a Claude Code prompt (see Section 9).

Assumed setup: Next.js 14 App Router + Tailwind CSS. If the project uses CSS Modules instead of Tailwind, skip Section 3 and use the CSS variables from Section 2 directly. Adapt the `app/` paths below to `src/app/` if that is the project structure.

---

## 0. Scope and order of work

| # | Task | Files touched | Breaking? |
|---|---|---|---|
| 1 | Load fonts (Fraunces + Inter) | `app/layout.tsx` | No |
| 2 | Add CSS variable tokens + base styles | `app/globals.css` | No |
| 3 | Extend Tailwind theme | `tailwind.config.ts` | No |
| 4 | Add JS token export (optional) | `lib/tokens.ts` | No |
| 5 | Add UI primitives | `components/ui/*` | No (new files) |
| 6 | Migrate blue states to brand | existing components | Visual only |
| 7 | Verify and QA | - | - |

Do tasks 1 to 5 first (foundation), commit, then migrate (task 6) incrementally per screen so nothing breaks in one large pass.

---

## 1. Fonts

Use `next/font/google` so the fonts self-host and expose CSS variables. Do not add `<link>` tags to `<head>`.

`app/layout.tsx`:

```tsx
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

This sets `--font-display` (Fraunces) and `--font-ui` (Inter) globally. Section 2 wires them into `body` and headings.

---

## 2. Tokens and base styles

Append the following to `app/globals.css`. Keep any existing Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`) at the top.

```css
:root {
  /* Brand */
  --color-deep-purple:#3B1C5A; --color-golden:#E6B44C; --color-honey:#FEB737;
  --color-lavender:#C6B7E2; --color-cream:#F6F1E8;

  /* Purple ramp */
  --purple-50:#F2ECF9; --purple-100:#E2D8F0; --purple-200:#C6B7E2; --purple-300:#B795DA;
  --purple-400:#9A6BC7; --purple-500:#7B45B0; --purple-600:#633394; --purple-700:#4E2775;
  --purple-800:#3B1C5A; --purple-900:#2A1342;

  /* Gold ramp */
  --gold-100:#FFF2D6; --gold-200:#FFE3AD; --gold-300:#FFD27A;
  --gold-400:#FEB737; --gold-500:#E6B44C; --gold-600:#C9952F;

  /* Neutrals */
  --neutral-0:#FFFFFF; --neutral-50:#FBF9F5; --neutral-100:#F1ECE3; --neutral-200:#E4DDD1;
  --neutral-300:#C9C1B5; --neutral-400:#9A9388; --neutral-500:#6E675D;
  --neutral-700:#403A33; --neutral-900:#231F1A;

  /* Semantic */
  --success:#3FA66A; --success-soft:#E4F2EA;
  --warning:#E08A1E; --warning-soft:#FCEFD9;
  --danger:#D1495B;  --danger-soft:#FAE5E8;
  --info:#5468C9;    --info-soft:#E7EAF8;

  /* Gradients */
  --grad-hero:linear-gradient(135deg,#4E2775 0%,#3B1C5A 60%,#2A1342 100%);
  --grad-hero-soft:linear-gradient(135deg,#7B45B0 0%,#633394 100%);
  --grad-accent:linear-gradient(135deg,#FEB737 0%,#E6B44C 100%);
  --grad-lavender:linear-gradient(135deg,#E2D8F0 0%,#C6B7E2 100%);

  /* Radius */
  --r-sm:8px; --r-md:12px; --r-lg:16px; --r-xl:20px; --r-2xl:24px; --r-full:9999px;

  /* Shadows (tinted purple, never black) */
  --sh-xs:0 1px 2px rgba(43,19,66,.06);
  --sh-sm:0 2px 8px rgba(43,19,66,.06);
  --sh-md:0 8px 24px rgba(43,19,66,.08);
  --sh-lg:0 16px 40px rgba(43,19,66,.12);
  --sh-hero:0 18px 48px rgba(59,28,90,.28);
}

@layer base {
  body {
    background: var(--color-cream);
    color: var(--neutral-700);
    font-family: var(--font-ui), system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4 {
    font-family: var(--font-display), Georgia, serif;
    color: var(--neutral-900);
    letter-spacing: -0.01em;
  }
  /* Quality floor: visible focus everywhere, never removed */
  :where(a, button, input, select, textarea, [tabindex]):focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--neutral-0), 0 0 0 4px var(--purple-400);
    border-radius: var(--r-sm);
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
  }
}
```

---

## 3. Tailwind theme

Extend `tailwind.config.ts` so the team can use brand classes (`bg-purple-800`, `text-gold-600`, `rounded-2xl`, `shadow-hero`, `bg-grad-hero`, `font-display`).

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: {
          50:"#F2ECF9",100:"#E2D8F0",200:"#C6B7E2",300:"#B795DA",400:"#9A6BC7",
          500:"#7B45B0",600:"#633394",700:"#4E2775",800:"#3B1C5A",900:"#2A1342",
        },
        gold: {
          100:"#FFF2D6",200:"#FFE3AD",300:"#FFD27A",400:"#FEB737",500:"#E6B44C",600:"#C9952F",
        },
        cream:"#F6F1E8",
        ink: {
          0:"#FFFFFF",50:"#FBF9F5",100:"#F1ECE3",200:"#E4DDD1",300:"#C9C1B5",
          400:"#9A9388",500:"#6E675D",700:"#403A33",900:"#231F1A",
        },
        success:"#3FA66A", warning:"#E08A1E", danger:"#D1495B", info:"#5468C9",
      },
      fontFamily: {
        display:["var(--font-display)","Georgia","serif"],
        sans:["var(--font-ui)","system-ui","sans-serif"],
      },
      borderRadius: { sm:"8px", md:"12px", lg:"16px", xl:"20px", "2xl":"24px" },
      boxShadow: {
        xs:"0 1px 2px rgba(43,19,66,.06)",
        sm:"0 2px 8px rgba(43,19,66,.06)",
        md:"0 8px 24px rgba(43,19,66,.08)",
        lg:"0 16px 40px rgba(43,19,66,.12)",
        hero:"0 18px 48px rgba(59,28,90,.28)",
      },
      backgroundImage: {
        "grad-hero":"linear-gradient(135deg,#4E2775 0%,#3B1C5A 60%,#2A1342 100%)",
        "grad-hero-soft":"linear-gradient(135deg,#7B45B0 0%,#633394 100%)",
        "grad-accent":"linear-gradient(135deg,#FEB737 0%,#E6B44C 100%)",
        "grad-lavender":"linear-gradient(135deg,#E2D8F0 0%,#C6B7E2 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
```

Note: the neutral ramp is named `ink` (not `neutral`) to avoid colliding with Tailwind's built-in `neutral`. Use `bg-cream`, `text-ink-700`, etc.

---

## 4. JS token export (optional)

For charts (Recharts/SVG) and any inline-style needs, expose tokens to JS in `lib/tokens.ts`:

```ts
export const tokens = {
  purple: { 500:"#7B45B0", 600:"#633394", 800:"#3B1C5A" },
  gold:   { 400:"#FEB737", 500:"#E6B44C", 600:"#C9952F" },
  band:   { developing:"#C9952F", emerging:"#7B45B0", strong:"#3FA66A" },
  series: ["#633394","#E6B44C","#9A6BC7","#3FA66A","#5468C9","#B795DA"],
} as const;
```

Reminder: band thresholds and labels are still pending Kaleeswaran sign-off. Use these as the chart palette only, not as confirmed score logic.

---

## 5. UI primitives

Add small, dependency-free primitives so existing screens adopt the system without rewrites. Place in `components/ui/`.

### `components/ui/Button.tsx`

```tsx
import { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "purple" | "secondary" | "ghost" | "danger";
const styles: Record<Variant, string> = {
  primary:   "bg-gold-400 text-purple-900 shadow-sm hover:bg-gold-300",
  purple:    "bg-purple-800 text-white hover:bg-purple-700",
  secondary: "bg-purple-50 text-purple-700 hover:bg-purple-100",
  ghost:     "bg-transparent text-purple-600 hover:bg-purple-50",
  danger:    "bg-danger text-white hover:opacity-90",
};

export function Button({
  variant = "primary", className, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-sans font-semibold text-[15px]",
        "h-11 px-5 rounded-md transition-all duration-150",
        "disabled:bg-ink-200 disabled:text-ink-400 disabled:shadow-none disabled:cursor-not-allowed",
        styles[variant], className
      )}
      {...props}
    />
  );
}
```

### `components/ui/Card.tsx`

```tsx
import { HTMLAttributes } from "react";
import { clsx } from "clsx";

type Tone = "base" | "hero" | "lavender" | "accent";
const tone: Record<Tone, string> = {
  base:     "bg-white shadow-sm rounded-xl",
  hero:     "bg-grad-hero text-white shadow-hero rounded-2xl",
  lavender: "bg-grad-lavender shadow-md rounded-2xl",
  accent:   "bg-grad-accent text-purple-900 shadow-md rounded-2xl",
};

export function Card({
  tone: t = "base", className, ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={clsx("p-6", tone[t], className)} {...props} />;
}
```

### `components/ui/Pill.tsx`

```tsx
import { clsx } from "clsx";

type Band = "developing" | "emerging" | "strong" | "pending";
const band: Record<Band, string> = {
  developing: "bg-gold-100 text-gold-600",
  emerging:   "bg-purple-50 text-purple-600",
  strong:     "bg-success-soft text-success",
  pending:    "bg-info-soft text-info",
};

export function Pill({ band: b, children }: { band: Band; children: React.ReactNode }) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
      band[b]
    )}>
      <i className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
```

Note: `success-soft` / `info-soft` need to exist as Tailwind colors or be applied via the CSS vars. Add them to the Tailwind `colors` block (e.g. `"success-soft":"#E4F2EA"`) or swap to `style={{background:"var(--success-soft)"}}`.

### `components/ui/Input.tsx`

```tsx
import { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full h-11 px-3.5 rounded-md bg-white border border-ink-200",
        "text-[14px] text-ink-700 placeholder:text-ink-400 outline-none transition-all duration-150",
        "focus:border-purple-400 focus:ring-4 focus:ring-purple-50",
        className
      )}
      {...props}
    />
  );
}
```

If `clsx` is not already a dependency: `npm i clsx`.

---

## 6. Migrate blue states to brand tokens

The build currently has blue UI states. Replace them with brand tokens. Default the primary call to action to Honey (`gold-400`) and primary surfaces/links to purple. Do this per screen, not in one global sweep.

| Old (blue) | New (brand) | Use |
|---|---|---|
| `bg-blue-600` (CTA) | `bg-gold-400 text-purple-900` | Primary CTA |
| `bg-blue-600` (header/surface) | `bg-purple-800` or `bg-grad-hero` | Primary surface |
| `text-blue-600` | `text-purple-600` | Links, accents |
| `hover:bg-blue-700` | `hover:bg-gold-300` or `hover:bg-purple-700` | Hover |
| `ring-blue-500` / focus | `ring-purple-400` | Focus ring |
| `border-blue-*` | `border-purple-300` | Active borders |
| `bg-blue-50` | `bg-purple-50` | Soft fills |
| `text-blue-*` badges | brand `Pill` component | Status / band |

Find candidates:

```bash
# from C:\dev\Knowmind_application
grep -rn "blue-" app components --include="*.tsx"
```

Decision rule: action that submits or advances = Honey CTA. Navigation, links, secondary actions = purple. Never use blue, and never use red for low EI bands.

---

## 7. Surface-specific guidance

| Surface | Background | Containers | Notes |
|---|---|---|---|
| Assessment funnel | `bg-cream` | one centered `Card` per step, max-width 560px | One question/decision per view; Honey CTA; consent block never pre-checked |
| Ops console | `bg-cream` | `Card` grid, `Card tone="hero"` for the lead figure | Sidebar `bg-grad-hero`; right rail with avatar lists; lead with one key number |
| Landing page | per existing redesign | adopt tokens, keep `[KALEE-1..6]` placeholders | Do not pull Germany Summit palette or "90 seconds" copy |

---

## 8. Verification checklist

| Check | Pass criteria |
|---|---|
| Fonts | Headings render in Fraunces, body in Inter; no FOUT flash |
| Background | App canvas is Cream `#F6F1E8`, cards are white |
| Tokens | `bg-purple-800`, `text-gold-600`, `shadow-hero`, `bg-grad-hero` all resolve |
| No blue | `grep "blue-"` returns no UI matches |
| CTAs | Primary actions use Honey; links/secondary use purple |
| Focus | Every interactive element shows a purple focus ring on keyboard nav |
| Contrast | Body text >= 4.5:1; gold text only on purple, never white-on-gold |
| Bands | No red used for low scores; band shown by color + label |
| Reduced motion | Transitions collapse when `prefers-reduced-motion` is set |
| Build | `npm run build` passes with no Tailwind class warnings |

---

## 9. Claude Code prompt (paste-ready)

> Apply the KnowMind design system to the existing Next.js 14 frontend at the repo root. Work in this order and commit after each numbered step.
>
> 1. In `app/layout.tsx`, load Fraunces (400,500,600,700) and Inter (400,500,600,700) via `next/font/google`, exposing them as `--font-display` and `--font-ui`, and add both variables to the `<html>` className.
> 2. In `app/globals.css`, add the `:root` token block, `@layer base` styles (cream body, Inter body / Fraunces headings, a global `:focus-visible` purple ring, and a `prefers-reduced-motion` reset) exactly as specified in the integration guide.
> 3. In `tailwind.config.ts`, extend `colors` (purple 50-900, gold 100-600, cream, `ink` neutral ramp, semantic colors), `fontFamily` (display, sans), `borderRadius`, `boxShadow` (xs-lg + hero), and `backgroundImage` (grad-hero, grad-hero-soft, grad-accent, grad-lavender) per the guide. Use `ink` for neutrals to avoid clashing with Tailwind's `neutral`.
> 4. Create `lib/tokens.ts` exporting the chart palette and band colors.
> 5. Create `components/ui/Button.tsx`, `Card.tsx`, `Pill.tsx`, and `Input.tsx` per the guide. Install `clsx` if missing.
> 6. Replace existing blue UI states with brand tokens using the migration table: Honey for primary CTAs, purple for links/secondary/surfaces, purple-400 focus rings. Do this per screen. Never introduce red for low EI score bands.
> 7. Run `npm run build` and fix any class or type errors.
>
> Constraints: do not change any backend, Supabase, or data logic. Do not invent question text, respondent names, or scores. Leave all `[KALEE-1..6]` content placeholders untouched. Do not pre-check or remove the consent block. Do not import the Germany Summit palette or copy. Report which files changed after each step.

---

End of guide.
