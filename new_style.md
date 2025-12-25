# Design System Documentation

This document describes the **Gilded Luxury Art Deco** design system used throughout the Monopoly game.

## Overview

The design uses:
- **Style**: Gilded luxury with Art Deco influences
- **Base**: Deep dark backgrounds with warm undertones
- **Accent**: Gold/amber with metallic gradients
- **Effects**: Glassmorphism, gold glows, subtle noise texture
- **Typography**: Cinzel (display), Inter (body)
- **Aesthetic**: 1920s luxury meets modern dark UI

---

## Design Philosophy

The Art Deco aesthetic draws from:
- Geometric patterns (fan shapes, sunbursts)
- Metallic gold embellishments
- Rich, dark backgrounds with subtle warmth
- Elegant serif display typography
- Luxurious materials (glass, gold, velvet darkness)

---

## Color Palette

### Dark Background Hierarchy

| Token | Hex | Description |
|-------|-----|-------------|
| `--panel-bg-base` | `#0d1117` | Deepest background |
| `--panel-bg-secondary` | `#161b22` | Card backgrounds |
| `--panel-bg-elevated` | `#1c2128` | Elevated elements |
| `--panel-bg-surface` | `#21262d` | Surface elements |
| `--panel-bg-overlay` | `#2d333b` | Overlay/modal |

### Gold Palette (Primary Accent)

| Step | Hex | Description |
|------|-----|-------------|
| 50 | `#fffdf5` | Lightest gold tint |
| 100 | `#fff9e6` | Very light gold |
| 200 | `#fef0c3` | Light gold |
| 300 | `#fde68a` | Soft gold |
| 400 | `#fcd34d` | Warm gold |
| 500 | `#fbbf24` | Bright gold |
| 600 | `#d4af37` | **Classic gold** (primary) |
| 700 | `#b8860b` | Goldenrod |
| 800 | `#92681a` | Deep gold |
| 900 | `#6b4c12` | Dark gold |

### Amber Accent Scale

| Step | Hex | Description |
|------|-----|-------------|
| 400 | `#fbbf24` | Highlight amber |
| 500 | `#f59e0b` | Primary amber |
| 600 | `#d97706` | Deep amber |
| 700 | `#b45309` | Dark amber |

### Semantic Colors

| Purpose | Hex | Description |
|---------|-----|-------------|
| Success | `#38a169` | Emerald green |
| Warning | `#dd6b20` | Burnt orange |
| Danger | `#e53e3e` | Ruby red |
| Info | `#4299e1` | Royal blue |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#f7fafc` | Primary text |
| `--color-text-secondary` | `#a0aec0` | Secondary text |
| `--color-text-muted` | `#718096` | Muted/disabled text |
| `--color-text-inverted` | `#1a202c` | Text on light backgrounds |

---

## Typography

### Font Families

```css
--font-family-display: 'Cinzel', 'Playfair Display', Georgia, serif;
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-family-elegant: 'Cormorant Garamond', Georgia, serif;
--font-family-mono: 'SF Mono', Monaco, 'Courier New', monospace;
```

### Usage Guidelines

| Context | Font | Style |
|---------|------|-------|
| Game logo/titles | Cinzel | Bold, letter-spacing: 0.15em, gold gradient |
| Headings | Cinzel or Inter | Semibold to Bold |
| Body text | Inter | Regular to Medium |
| Labels/captions | Inter | Medium, smaller size |
| Buttons (large) | Cinzel | Uppercase, tracking |

### Font Import

```html
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
```

### Font Sizes

| Token | Value |
|-------|-------|
| `--font-size-xs` | 0.75rem (12px) |
| `--font-size-sm` | 0.875rem (14px) |
| `--font-size-base` | 1rem (16px) |
| `--font-size-lg` | 1.125rem (18px) |
| `--font-size-xl` | 1.25rem (20px) |
| `--font-size-2xl` | 1.5rem (24px) |
| `--font-size-3xl` | 1.875rem (30px) |
| `--font-size-4xl` | 2.25rem (36px) |
| `--font-size-5xl` | 3rem (48px) |

---

## Gold Gradients

### Metallic Gold Gradient

```css
--gradient-gold: linear-gradient(135deg,
  #b8860b 0%,
  #d4af37 25%,
  #ffd700 50%,
  #d4af37 75%,
  #b8860b 100%
);
```

### Gold Border Gradient

```css
--gradient-gold-border: linear-gradient(90deg,
  transparent 0%,
  #8b5a2b 15%,
  #d4af37 35%,
  #ffd700 50%,
  #d4af37 65%,
  #8b5a2b 85%,
  transparent 100%
);
```

### Subtle Gold Sweep

```css
--gradient-gold-subtle: linear-gradient(90deg,
  transparent 0%,
  rgba(212, 175, 55, 0.3) 20%,
  rgba(255, 215, 0, 0.5) 50%,
  rgba(212, 175, 55, 0.3) 80%,
  transparent 100%
);
```

---

## Gold Glow Shadows

```css
/* Small glow */
--shadow-gold-sm: 0 0 10px rgba(212, 175, 55, 0.2);

/* Medium glow */
--shadow-gold-md: 0 0 20px rgba(212, 175, 55, 0.3);

/* Large glow */
--shadow-gold-lg: 0 0 40px rgba(212, 175, 55, 0.25);

/* Intense glow (for hover states) */
--shadow-gold-intense: 0 0 30px rgba(255, 215, 0, 0.4);

/* Accent glow variants */
--shadow-accent-glow-sm: 0 0 16px rgba(245, 158, 11, 0.15);
--shadow-accent-glow: 0 0 24px rgba(245, 158, 11, 0.2);
--shadow-accent-glow-lg: 0 0 40px rgba(245, 158, 11, 0.25);
```

---

## Glassmorphism System

### Glass Backgrounds

```css
--glass-bg: rgba(22, 27, 34, 0.75);
--glass-bg-elevated: rgba(28, 33, 40, 0.85);
--glass-bg-solid: rgba(22, 27, 34, 0.95);
--glass-bg-subtle: rgba(22, 27, 34, 0.6);
```

### Glass Borders

```css
--glass-border: rgba(255, 255, 255, 0.08);
--glass-border-hover: rgba(255, 255, 255, 0.12);
--glass-border-accent: rgba(245, 158, 11, 0.25);
--glass-border-accent-strong: rgba(245, 158, 11, 0.4);
```

### Gold Borders

```css
--border-gold: rgba(212, 175, 55, 0.4);
--border-gold-strong: rgba(212, 175, 55, 0.6);
--border-gold-subtle: rgba(212, 175, 55, 0.2);
```

### Backdrop Blur

```css
--glass-blur: blur(16px);
--glass-blur-strong: blur(24px);
--glass-blur-subtle: blur(8px);
```

### Glass Shadows

```css
--shadow-glass-sm: 0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.4);
--shadow-glass-lg: 0 16px 48px rgba(0, 0, 0, 0.5);
--shadow-glass-xl: 0 24px 64px rgba(0, 0, 0, 0.6);
--shadow-inset-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.05);
--shadow-inset-dark: inset 0 2px 4px rgba(0, 0, 0, 0.2);
```

---

## Art Deco Elements

### Background Pattern

The app uses layered Art Deco patterns:

1. **Gold spotlight** from top center (subtle radial gradient)
2. **Corner glows** in amber/gold tones
3. **Fan pattern** using `repeating-conic-gradient`
4. **Vignette** for depth around edges
5. **Noise texture** overlay for sophistication

### Gilded Card Component

Cards with gold accent border:

```css
.card-gilded {
  position: relative;
  border-color: var(--border-gold-subtle);
}

.card-gilded::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-gold-border);
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
}
```

### Gilded Divider

Decorative gold line with diamond ornament:

```css
.divider-gilded {
  display: flex;
  align-items: center;
  gap: 12px;
}

.divider-gilded::before,
.divider-gilded::after {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(212, 175, 55, 0.4) 30%,
    rgba(255, 215, 0, 0.6) 50%,
    rgba(212, 175, 55, 0.4) 70%,
    transparent 100%);
}

.divider-gilded .ornament {
  width: 8px;
  height: 8px;
  background: var(--gold-600);
  transform: rotate(45deg);
  box-shadow: var(--shadow-gold-sm);
}
```

### Gold Text Effect

```css
.game-logo {
  font-family: var(--font-family-display);
  font-weight: 700;
  letter-spacing: 0.15em;
  background: linear-gradient(180deg,
    #ffd700 0%,
    #d4af37 30%,
    #b8860b 50%,
    #d4af37 70%,
    #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}
```

---

## Button System

### Primary Button (Gold/Amber)

```css
.btn-primary {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
  color: #1a1a1a;
  box-shadow:
    0 4px 16px rgba(245, 158, 11, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -2px 0 rgba(0, 0, 0, 0.2);
}

/* Shine sweep on hover */
.btn-primary::before {
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%);
  /* Animates left to right on hover */
}
```

### Secondary Button (Dark Glass)

```css
.btn-secondary {
  background: linear-gradient(180deg,
    rgba(36, 43, 51, 0.95) 0%,
    rgba(26, 31, 38, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

### Large Button (Display Typography)

```css
.btn-large {
  font-family: var(--font-family-display);
  font-size: var(--font-size-lg);
  letter-spacing: 2px;
  text-transform: uppercase;
}
```

---

## Spacing Scale

| Token | Value |
|-------|-------|
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-3` | 0.75rem (12px) |
| `--space-4` | 1rem (16px) |
| `--space-5` | 1.25rem (20px) |
| `--space-6` | 1.5rem (24px) |
| `--space-8` | 2rem (32px) |
| `--space-10` | 2.5rem (40px) |
| `--space-12` | 3rem (48px) |
| `--space-16` | 4rem (64px) |

---

## Border Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | 0.25rem (4px) |
| `--radius-md` | 0.5rem (8px) |
| `--radius-lg` | 0.75rem (12px) |
| `--radius-xl` | 1rem (16px) |
| `--radius-2xl` | 1.5rem (24px) |
| `--radius-full` | 9999px |

---

## Transitions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Monopoly Property Colors

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

## Key Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Luxury** | Gold accents, metallic gradients, elegant serif typography |
| **Depth** | Multi-layer backgrounds, glass effects, strategic shadows |
| **Warmth** | Amber/gold tones against cool dark backgrounds |
| **Elegance** | Geometric Art Deco patterns, restrained ornamentation |
| **Refinement** | Noise texture overlay, subtle animations, polished details |
| **Hierarchy** | Clear panel depth system (base -> secondary -> elevated -> surface -> overlay) |

---

## Summary

The Gilded Luxury Art Deco design is:

1. **Opulent** - Gold gradients, metallic sheens, luxurious materials
2. **Dark & Sophisticated** - Deep backgrounds with warm undertones
3. **Geometric** - Art Deco patterns, clean lines, symmetric ornamentation
4. **Glassy** - Backdrop blur effects with translucent panels
5. **Elegant** - Cinzel serif for display, Inter for readability
6. **Atmospheric** - Subtle glows, noise texture, ambient lighting effects
