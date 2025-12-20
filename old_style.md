# Old Design System Documentation

This document captures the original design system used in the Monopoly game before the shadcn/ui migration.

## Overview

The original design follows a **dark mode glassmorphism aesthetic** with:
- Semi-transparent panels with backdrop blur
- Discord-style panel hierarchy (layered depth)
- Amber accent color with glow effects
- Multiple display fonts for elegant headers

---

## Color Palette

### Background Colors
| Variable | Value | Description |
|----------|-------|-------------|
| `--color-bg-primary` | `#0f1419` | Darkest background |
| `--color-bg-secondary` | `#1a1f26` | Card backgrounds |
| `--color-bg-tertiary` | `#242b33` | Elevated elements |
| `--color-bg-hover` | `#2d353f` | Hover states |

### Panel Hierarchy (Discord-style depth)
| Variable | Value |
|----------|-------|
| `--panel-bg-base` | `#0d1117` |
| `--panel-bg-secondary` | `#161b22` |
| `--panel-bg-elevated` | `#1c2128` |
| `--panel-bg-surface` | `#21262d` |
| `--panel-bg-overlay` | `#2d333b` |

### Primary/Secondary Colors
| Variable | Value | Description |
|----------|-------|-------------|
| `--color-primary` | `#1a365d` | Deep navy blue |
| `--color-primary-light` | `#2c5282` | |
| `--color-primary-dark` | `#0d1f3c` | |
| `--color-secondary` | `#2d3748` | Slate gray |
| `--color-secondary-light` | `#4a5568` | |
| `--color-secondary-dark` | `#1a202c` | |

### Accent Colors (Amber)
| Variable | Value |
|----------|-------|
| `--color-accent` | `#f59e0b` |
| `--color-accent-light` | `#fbbf24` |
| `--color-accent-dark` | `#d97706` |
| `--color-accent-50` | `#fffbeb` |
| `--color-accent-100` | `#fef3c7` |
| `--color-accent-200` | `#fde68a` |
| `--color-accent-300` | `#fcd34d` |
| `--color-accent-400` | `#fbbf24` |
| `--color-accent-500` | `#f59e0b` |
| `--color-accent-600` | `#d97706` |
| `--color-accent-700` | `#b45309` |
| `--color-accent-muted` | `rgba(245, 158, 11, 0.15)` |
| `--color-accent-glow` | `rgba(245, 158, 11, 0.25)` |

### Status Colors
| Status | Base | Light | Dark |
|--------|------|-------|------|
| Success | `#38a169` | `#48bb78` | `#276749` |
| Warning | `#dd6b20` | `#ed8936` | `#c05621` |
| Danger | `#e53e3e` | `#fc8181` | `#c53030` |
| Info | `#4299e1` | `#63b3ed` | `#3182ce` |

### Text Colors
| Variable | Value | Description |
|----------|-------|-------------|
| `--color-text-primary` | `#f7fafc` | Primary text |
| `--color-text-secondary` | `#a0aec0` | Secondary text |
| `--color-text-muted` | `#718096` | Muted text |
| `--color-text-inverted` | `#1a202c` | Text on light backgrounds |

### Gray Scale
```
--color-gray-50:  #f7fafc
--color-gray-100: #edf2f7
--color-gray-200: #e2e8f0
--color-gray-300: #cbd5e0
--color-gray-400: #a0aec0
--color-gray-500: #718096
--color-gray-600: #4a5568
--color-gray-700: #2d3748
--color-gray-800: #1a202c
--color-gray-900: #171923
```

### Monopoly Property Colors
```
--property-brown:      #8B4513
--property-light-blue: #87CEEB
--property-pink:       #FF69B4
--property-orange:     #FF8C00
--property-red:        #FF0000
--property-yellow:     #FFD700
--property-green:      #228B22
--property-dark-blue:  #00008B
--property-railroad:   #333333
--property-utility:    #808080
```

---

## Typography

### Font Families
```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-display: 'Cinzel', 'Playfair Display', Georgia, serif;
--font-family-elegant: 'Cormorant Garamond', Georgia, serif;
--font-family-mono: 'SF Mono', Monaco, 'Courier New', monospace;
```

### Font Import
```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
```

### Font Sizes
| Variable | Value |
|----------|-------|
| `--font-size-xs` | `0.75rem` (12px) |
| `--font-size-sm` | `0.875rem` (14px) |
| `--font-size-base` | `1rem` (16px) |
| `--font-size-lg` | `1.125rem` (18px) |
| `--font-size-xl` | `1.25rem` (20px) |
| `--font-size-2xl` | `1.5rem` (24px) |
| `--font-size-3xl` | `1.875rem` (30px) |
| `--font-size-4xl` | `2.25rem` (36px) |
| `--font-size-5xl` | `3rem` (48px) |

### Font Weights
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Line Heights
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

---

## Spacing Scale

4px base unit:
| Variable | Value |
|----------|-------|
| `--space-1` | `0.25rem` (4px) |
| `--space-2` | `0.5rem` (8px) |
| `--space-3` | `0.75rem` (12px) |
| `--space-4` | `1rem` (16px) |
| `--space-5` | `1.25rem` (20px) |
| `--space-6` | `1.5rem` (24px) |
| `--space-8` | `2rem` (32px) |
| `--space-10` | `2.5rem` (40px) |
| `--space-12` | `3rem` (48px) |
| `--space-16` | `4rem` (64px) |

---

## Border Radius

| Variable | Value |
|----------|-------|
| `--radius-sm` | `0.25rem` (4px) |
| `--radius-md` | `0.5rem` (8px) |
| `--radius-lg` | `0.75rem` (12px) |
| `--radius-xl` | `1rem` (16px) |
| `--radius-2xl` | `1.5rem` (24px) |
| `--radius-full` | `9999px` |

---

## Glassmorphism Effects

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

### Backdrop Blur
```css
--glass-blur: blur(16px);
--glass-blur-strong: blur(24px);
--glass-blur-subtle: blur(8px);
```

### Usage Pattern
```css
.glass-panel {
  background: var(--glass-bg-elevated);
  backdrop-filter: var(--glass-blur-strong);
  -webkit-backdrop-filter: var(--glass-blur-strong);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
}
```

---

## Shadow System

### Standard Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
```

### Gold/Glow Shadows (Legacy)
```css
--shadow-gold: 0 4px 14px 0 rgba(212, 175, 55, 0.3);
--shadow-glow: 0 0 20px rgba(212, 175, 55, 0.2);
```

### Glass Shadows
```css
--shadow-glass-sm: 0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.4);
--shadow-glass-lg: 0 16px 48px rgba(0, 0, 0, 0.5);
--shadow-glass-xl: 0 24px 64px rgba(0, 0, 0, 0.6);
```

### Inset Shadows
```css
--shadow-inset-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.05);
--shadow-inset-dark: inset 0 2px 4px rgba(0, 0, 0, 0.2);
```

### Accent Glow Shadows
```css
--shadow-accent-glow-sm: 0 0 16px rgba(245, 158, 11, 0.15);
--shadow-accent-glow: 0 0 24px rgba(245, 158, 11, 0.2);
--shadow-accent-glow-lg: 0 0 40px rgba(245, 158, 11, 0.25);
--shadow-success-glow: 0 0 20px rgba(56, 161, 105, 0.2);
--shadow-danger-glow: 0 0 20px rgba(229, 62, 62, 0.2);
```

---

## Transitions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Z-Index Layers

| Variable | Value | Description |
|----------|-------|-------------|
| `--z-base` | `0` | Default |
| `--z-dropdown` | `100` | Dropdowns, popovers |
| `--z-sticky` | `200` | Sticky headers |
| `--z-modal-backdrop` | `900` | Dark overlay |
| `--z-modal` | `1000` | Modal dialogs |
| `--z-notification` | `2000` | Toast notifications |
| `--z-overlay` | `3000` | Full-screen overlays |

---

## Key Component Patterns

### Card/Panel Pattern
```css
.card {
  background: var(--glass-bg-elevated);
  backdrop-filter: var(--glass-blur-strong);
  -webkit-backdrop-filter: var(--glass-blur-strong);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-glass-lg), var(--shadow-inset-highlight);
  border: 1px solid var(--glass-border);
  position: relative;
  overflow: hidden;
}

/* Top accent line */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--color-accent-600) 20%,
    var(--color-accent-400) 50%,
    var(--color-accent-600) 80%,
    transparent 100%);
  box-shadow: var(--shadow-accent-glow-sm);
}
```

### Primary Button Pattern
```css
.btn-primary {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
  color: #1a1a1a;
  border: none;
  box-shadow:
    0 4px 16px rgba(245, 158, 11, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -2px 0 rgba(0, 0, 0, 0.2);
}

/* Shine sweep effect on hover */
.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  transition: left 0.5s ease;
}
```

### Input Pattern
```css
input {
  background: var(--panel-bg-base);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-inset-dark);
}

input:focus {
  border-color: var(--color-accent);
  box-shadow:
    var(--shadow-inset-dark),
    0 0 0 2px var(--color-accent-muted),
    var(--shadow-accent-glow-sm);
}
```

---

## Icons

The old design uses **inline SVG icons** (47 total across 4 files):
- `Lobby.jsx` - 25 SVGs
- `RoomBrowser.jsx` - 11 SVGs
- `Home.jsx` - 10 SVGs
- `Board2D.jsx` - 1 SVG

---

## App Background Effect

```css
.App::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(ellipse at 20% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(245, 158, 11, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(22, 27, 34, 0.4) 0%, transparent 70%);
  pointer-events: none;
}
```

---

## Summary

This design system is characterized by:
1. **Glassmorphism** - Translucent panels with blur effects
2. **Layered depth** - Discord-style panel hierarchy
3. **Amber accents** - Warm golden glow effects
4. **Multiple fonts** - Display fonts for headers (Cinzel, Playfair)
5. **Complex shadows** - Multi-layer shadows with inset highlights
6. **Subtle borders** - Semi-transparent white/amber borders
