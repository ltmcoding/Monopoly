# New Design System Documentation

This document describes the target design system based on **shadcn/ui Maia style** with stone/amber theme.

## Overview

The new design uses:
- **Style**: Maia (soft, rounded, generous spacing)
- **Base Color**: Stone (warm gray tones)
- **Theme**: Amber (accent color)
- **Radius**: Small
- **Font**: Noto Sans
- **Icons**: Phosphor
- **Color Space**: OKLCH (perceptually uniform)

---

## Why OKLCH?

OKLCH is recommended because:
- Perceptually uniform - consistent brightness/vibrancy changes
- Better for creating harmonious color palettes
- More predictable than HSL or RGB
- Native support in modern CSS

Format: `oklch(lightness chroma hue)`
- **Lightness**: 0 (black) to 1 (white)
- **Chroma**: 0 (gray) to ~0.4 (saturated)
- **Hue**: 0-360 degrees (color wheel)

---

## Color Palette

### Core Theme Colors (Dark Mode)

| Semantic | OKLCH Value | Hex Equivalent | Description |
|----------|-------------|----------------|-------------|
| `--background` | `oklch(0.1 0.01 60)` | ~#0c0a09 | App background (stone-950) |
| `--foreground` | `oklch(0.95 0.01 60)` | ~#fafaf9 | Primary text (stone-50) |
| `--card` | `oklch(0.15 0.01 60)` | ~#1c1917 | Card backgrounds (stone-900) |
| `--card-foreground` | `oklch(0.95 0.01 60)` | ~#fafaf9 | Card text |
| `--popover` | `oklch(0.12 0.01 60)` | ~#0c0a09 | Popover backgrounds |
| `--popover-foreground` | `oklch(0.95 0.01 60)` | ~#fafaf9 | Popover text |
| `--primary` | `oklch(0.7 0.18 70)` | ~#f59e0b | Amber accent |
| `--primary-foreground` | `oklch(0.1 0.01 60)` | ~#0c0a09 | Text on primary |
| `--secondary` | `oklch(0.25 0.02 60)` | ~#292524 | Secondary backgrounds (stone-800) |
| `--secondary-foreground` | `oklch(0.95 0.01 60)` | ~#fafaf9 | Text on secondary |
| `--muted` | `oklch(0.3 0.02 60)` | ~#44403c | Muted backgrounds (stone-700) |
| `--muted-foreground` | `oklch(0.65 0.02 60)` | ~#a8a29e | Muted text (stone-400) |
| `--accent` | `oklch(0.25 0.02 60)` | ~#292524 | Accent backgrounds |
| `--accent-foreground` | `oklch(0.95 0.01 60)` | ~#fafaf9 | Text on accent |
| `--destructive` | `oklch(0.6 0.22 25)` | ~#ef4444 | Error/danger |
| `--destructive-foreground` | `oklch(0.95 0.01 60)` | ~#fafaf9 | Text on destructive |
| `--border` | `oklch(0.25 0.02 60)` | ~#292524 | Borders (stone-800) |
| `--input` | `oklch(0.25 0.02 60)` | ~#292524 | Input borders |
| `--ring` | `oklch(0.7 0.18 70)` | ~#f59e0b | Focus rings (amber) |

### Stone Palette (Base)

| Step | OKLCH | Hex |
|------|-------|-----|
| 50 | `oklch(0.98 0.01 60)` | #fafaf9 |
| 100 | `oklch(0.96 0.01 60)` | #f5f5f4 |
| 200 | `oklch(0.90 0.01 60)` | #e7e5e4 |
| 300 | `oklch(0.83 0.01 60)` | #d6d3d1 |
| 400 | `oklch(0.64 0.01 60)` | #a8a29e |
| 500 | `oklch(0.45 0.01 60)` | #78716c |
| 600 | `oklch(0.32 0.01 60)` | #57534e |
| 700 | `oklch(0.25 0.01 60)` | #44403c |
| 800 | `oklch(0.15 0.01 60)` | #292524 |
| 900 | `oklch(0.10 0.01 60)` | #1c1917 |
| 950 | `oklch(0.04 0.01 60)` | #0c0a09 |

### Amber Palette (Accent)

| Step | OKLCH | Hex |
|------|-------|-----|
| 50 | `oklch(0.96 0.03 90)` | #fffbeb |
| 100 | `oklch(0.91 0.08 85)` | #fef3c7 |
| 200 | `oklch(0.84 0.13 80)` | #fde68a |
| 300 | `oklch(0.77 0.17 75)` | #fcd34d |
| 400 | `oklch(0.73 0.19 72)` | #fbbf24 |
| 500 | `oklch(0.70 0.18 70)` | #f59e0b |
| 600 | `oklch(0.60 0.17 55)` | #d97706 |
| 700 | `oklch(0.50 0.14 45)` | #b45309 |
| 800 | `oklch(0.42 0.11 40)` | #92400e |
| 900 | `oklch(0.35 0.09 35)` | #78350f |
| 950 | `oklch(0.20 0.06 30)` | #451a03 |

### Status Colors

| Status | OKLCH | Hex |
|--------|-------|-----|
| Success | `oklch(0.65 0.18 145)` | ~#22c55e |
| Warning | `oklch(0.70 0.18 70)` | ~#f59e0b |
| Error | `oklch(0.60 0.22 25)` | ~#ef4444 |
| Info | `oklch(0.65 0.15 240)` | ~#3b82f6 |

---

## Typography

### Font Family

```css
--font-sans: 'Noto Sans', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Font Sizes (Tailwind)

| Class | Size |
|-------|------|
| `text-xs` | 0.75rem (12px) |
| `text-sm` | 0.875rem (14px) |
| `text-base` | 1rem (16px) |
| `text-lg` | 1.125rem (18px) |
| `text-xl` | 1.25rem (20px) |
| `text-2xl` | 1.5rem (24px) |
| `text-3xl` | 1.875rem (30px) |
| `text-4xl` | 2.25rem (36px) |

### Font Weights

| Weight | Value |
|--------|-------|
| `font-normal` | 400 |
| `font-medium` | 500 |
| `font-semibold` | 600 |
| `font-bold` | 700 |

---

## Border Radius

Maia style uses **small** radius values:

| Variable | Value |
|----------|-------|
| `--radius` | `0.375rem` (6px) |
| `--radius-sm` | `0.25rem` (4px) |
| `--radius-md` | `0.375rem` (6px) |
| `--radius-lg` | `0.5rem` (8px) |
| `--radius-xl` | `0.75rem` (12px) |

---

## Spacing

Maia style emphasizes **generous spacing**. Use Tailwind's spacing scale:

| Class | Value |
|-------|-------|
| `p-1` | 0.25rem (4px) |
| `p-2` | 0.5rem (8px) |
| `p-3` | 0.75rem (12px) |
| `p-4` | 1rem (16px) |
| `p-5` | 1.25rem (20px) |
| `p-6` | 1.5rem (24px) |
| `p-8` | 2rem (32px) |
| `p-10` | 2.5rem (40px) |
| `p-12` | 3rem (48px) |

---

## Shadows

Simple, clean shadows (no glass effects):

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

---

## Icons (Phosphor)

### Installation

```bash
npm install @phosphor-icons/react
```

### Usage

```jsx
import { House, Users, Play, Gear, X, Check } from '@phosphor-icons/react';

// Default (regular weight)
<House size={24} />

// With color
<House size={24} className="text-primary" />

// Different weights: thin, light, regular, bold, fill, duotone
<House size={24} weight="bold" />
```

### Common Icon Mappings

| Purpose | Phosphor Icon |
|---------|---------------|
| Home | `House` |
| Users/Players | `Users` |
| Play | `Play` |
| Settings | `Gear` or `GearSix` |
| Close | `X` |
| Check/Success | `Check` |
| Warning | `Warning` |
| Error | `XCircle` |
| Info | `Info` |
| Copy | `Copy` |
| Refresh | `ArrowClockwise` |
| Dice | `Dice` |
| Money | `Money` or `CurrencyDollar` |
| Building | `Buildings` |
| Trade | `ArrowsLeftRight` |

---

## shadcn/ui Components

### Button

```jsx
import { Button } from "@/components/ui/button"

<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Card

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Input

```jsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="grid gap-2">
  <Label htmlFor="name">Name</Label>
  <Input id="name" placeholder="Enter name" />
</div>
```

### Dialog

```jsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Badge

```jsx
import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

---

## CSS Variables (globals.css)

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-background: oklch(0.1 0.01 60);
  --color-foreground: oklch(0.95 0.01 60);
  --color-card: oklch(0.15 0.01 60);
  --color-card-foreground: oklch(0.95 0.01 60);
  --color-popover: oklch(0.12 0.01 60);
  --color-popover-foreground: oklch(0.95 0.01 60);
  --color-primary: oklch(0.7 0.18 70);
  --color-primary-foreground: oklch(0.1 0.01 60);
  --color-secondary: oklch(0.25 0.02 60);
  --color-secondary-foreground: oklch(0.95 0.01 60);
  --color-muted: oklch(0.3 0.02 60);
  --color-muted-foreground: oklch(0.65 0.02 60);
  --color-accent: oklch(0.25 0.02 60);
  --color-accent-foreground: oklch(0.95 0.01 60);
  --color-destructive: oklch(0.6 0.22 25);
  --color-destructive-foreground: oklch(0.95 0.01 60);
  --color-border: oklch(0.25 0.02 60);
  --color-input: oklch(0.25 0.02 60);
  --color-ring: oklch(0.7 0.18 70);

  /* Radius */
  --radius: 0.375rem;

  /* Fonts */
  --font-sans: 'Noto Sans', system-ui, sans-serif;
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
}
```

---

## Key Differences from Old Design

| Aspect | Old | New |
|--------|-----|-----|
| Color Format | Hex/RGB | OKLCH |
| Backgrounds | Glass (translucent + blur) | Solid colors |
| Borders | Semi-transparent white | Stone-800 solid |
| Shadows | Complex multi-layer + glow | Simple, clean |
| Fonts | Inter + Cinzel + Playfair | Noto Sans only |
| Icons | Inline SVG | Phosphor components |
| Radius | 4-24px (large cards) | 4-12px (smaller) |
| Spacing | Custom scale | Tailwind utilities |

---

## Monopoly-Specific Colors (Preserved)

These game-specific colors remain unchanged:

```css
--property-brown:      #8B4513;
--property-light-blue: #87CEEB;
--property-pink:       #FF69B4;
--property-orange:     #FF8C00;
--property-red:        #FF0000;
--property-yellow:     #FFD700;
--property-green:      #228B22;
--property-dark-blue:  #00008B;
--property-railroad:   #333333;
--property-utility:    #808080;
```

---

## Summary

The new design is:
1. **Cleaner** - No blur effects, solid backgrounds
2. **Simpler** - Single font family, consistent patterns
3. **Warmer** - Stone grays with amber accents
4. **Modern** - OKLCH colors, Tailwind CSS v4
5. **Accessible** - Better contrast, clearer hierarchy
6. **Maintainable** - shadcn/ui components, utility classes
