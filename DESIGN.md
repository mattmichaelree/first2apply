# CareerOS Design System

## 1. Atmosphere & Identity

CareerOS is a restrained operational workspace: direct, calm, and information-first. Its signature is compact bordered settings surfaces that pair a plain-language explanation with one clear control.

## 2. Color

CareerOS uses the existing Tailwind theme tokens from `libraries/ui`: `background`, `foreground`, `muted`, `muted-foreground`, `border`, `primary`, `secondary`, and `destructive`. New UI must use semantic theme classes rather than raw color values.

## 3. Typography

Use the inherited application font stack. Page titles use `text-2xl font-medium tracking-wide`; section titles use `text-lg`; explanatory and metadata text use `text-sm`, with `text-muted-foreground` when secondary.

## 4. Spacing & Layout

Spacing follows Tailwind's four-pixel scale. Settings pages use `p-6 md:p-10`, `space-y-3`, and bordered sections with `gap-6 rounded-lg border p-6`. Controls must collapse to a readable single column on narrow widths.

## 5. Components

### Settings Section

- **Structure**: semantic heading and description paired with a form control.
- **Variants**: single control; repeated board rows.
- **States**: default, keyboard focus, disabled while saving, and inherited loading skeleton.
- **Accessibility**: every select has a visible board label; keyboard behavior comes from the shared Radix Select primitive.
- **Motion**: inherited primitive transitions only.
- **Layout**: responsive stack on mobile and aligned row on wider screens.

### Select

- **Structure**: shared `Select`, `SelectTrigger`, `SelectValue`, and `SelectContent` primitives.
- **States**: default, hover, focus, open, and disabled as implemented by the shared component.
- **Accessibility**: preserve Radix labeling and keyboard navigation.

## 6. Motion & Interaction

Motion communicates control state only and uses the shared component behavior. Do not add decorative animation. Respect reduced-motion preferences through the existing primitives.

## 7. Depth & Surface

Use a borders-only strategy for settings sections. Do not add one-off shadows or decorative gradients.

## 8. Accessibility Constraints & Accepted Debt

Target WCAG 2.2 AA. Preserve visible focus, keyboard reachability, readable labels, and responsive reflow without horizontal scrolling.

Accepted debt: the inherited application has not yet been comprehensively audited against this extracted contract; this feature must not expand that debt.
