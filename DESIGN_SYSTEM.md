# Design System (LOCKED)

This document defines the locked design tokens used across the project. Use CSS variables from `app/globals.css` for consistency.

## Colors

| Token | Value | Usage |
|-------|--------|--------|
| Primary | `#16A34A` | Green button, links, focus |
| Background | `#F9FAFB` | Page background |
| Surface | `#FFFFFF` | Cards, inputs, modals |
| Border | `#E5E7EB` | Borders, dividers |
| Text main | `#0F172A` | Body, headings |
| Text secondary | `#64748B` | Labels, hints |

**CSS variables:** `--primary`, `--background`, `--surface`, `--border`, `--text-main`, `--text-secondary`

## Layout

| Token | Value | Usage |
|-------|--------|--------|
| Container max-width | `1200px` | Main content width |
| Input height | `64px` | Search bar, inputs |
| Border radius | `14px` | Cards, inputs, buttons |
| Section spacing | `24px` | Gaps between sections |
| Card padding | `20px` | Inner padding of cards |

**CSS variables:** `--container-max`, `--input-height`, `--radius`, `--section-spacing`, `--card-padding`

**Utility class:** `.ds-container` — max-width 1200px, horizontal padding, centered.

## Typography

- **Font:** Inter (loaded via `next/font/google`, variable `--font-inter`).
- **Input value:** 16px / weight 500 → `--input-font-size`, `--input-font-weight`
- **Label:** 12px / weight 400 → `--label-font-size`, `--label-font-weight`
- **Button:** 16px / weight 600 → `--button-font-size`, `--button-font-weight`

**Utility classes:** `.ds-label`, `.ds-input-value`, `.ds-button`

## Usage

- Prefer Tailwind with design tokens: `bg-[var(--surface)]`, `rounded-[var(--radius)]`, `text-[var(--text-main)]`.
- Use `.ds-container` for page-width content.
- Use `h-[var(--input-height)]` for form fields and the search bar.
- Use `p-[var(--card-padding)]` for card content.
