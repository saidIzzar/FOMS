# Design System Specification: Industrial Precision & Glassmorphism

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Control Room"**

This design system is engineered to transform complex factory data into a high-fidelity, cinematic experience. We are moving away from the "clunky industrial dashboard" and toward an "Elite Operator" interface. The aesthetic bridges the gap between high-end aerospace software and modern editorial design.

To break the "template" look, we utilize **intentional density**. Unlike consumer apps that prioritize white space, this system embraces the complexity of factory operations. We use overlapping glass layers, high-contrast technical typography, and asymmetrical data layouts to create a sense of focused, real-time urgency. It feels less like a website and more like a tactical heads-up display (HUD).

---

## 2. Colors: The Neon-on-Graphite Palette

Our color strategy relies on a "Vantablack" philosophy. By keeping the foundation incredibly dark and neutral, we allow the neon status indicators to command absolute attention.

### Core Tones
- **Background (`#111318`):** The void. All UI emerges from this deep graphite.
- **Primary (`#adc6ff`):** An electric, "chilled" blue for structural importance.
- **Secondary/Success (`#d7ffc5`):** A neon-tinted lime for optimal performance metrics.
- **Tertiary/Accent (`#00dce5` / `#00a1a7`):** Cyan and purple gradients used sparingly to highlight "active" machine states or AI-driven insights.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. 
*   Use `surface-container-low` for large regions.
*   Use `surface-container-high` for interactive modules.
*   The transition from `#111318` to `#1e2024` is your separator—not a line.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of glass. 
1.  **Level 0 (Base):** `surface` (`#111318`) - The main application canvas.
2.  **Level 1 (Sections):** `surface-container-low` - Large grouping areas.
3.  **Level 2 (Cards):** `surface-container-highest` - Individual machine or mold monitors.
4.  **Level 3 (Pop-overs):** `surface-bright` - Floating menus or tooltips.

### The "Glass & Gradient" Rule
For "Hero" modules or active mold cycles, apply **Glassmorphism**:
*   **Fill:** `surface-container-high` at 60% opacity.
*   **Blur:** `backdrop-filter: blur(20px)`.
*   **Edge:** A "Ghost Border" using `outline-variant` at 15% opacity to catch the "light."

---

## 3. Typography: Technical Authority

We pair **Space Grotesk** (Display/Headlines) with **Inter** (Data/Labels). Space Grotesk provides a geometric, "engineered" feel, while Inter ensures maximum legibility in high-density Arabic and English data tables.

*   **Display (Space Grotesk):** Large, airy, and aggressive. Use for factory output totals and critical KPIs.
*   **Body & Labels (Inter):** Tight tracking for data-heavy tables. In RTL (Arabic) contexts, ensure line heights are increased by 10% to account for script ascenders/descenders.
*   **Intentional Hierarchy:** Use `label-sm` (`#8b90a0`) for metadata. The contrast between `display-lg` in `primary` and `label-sm` in `outline` creates an editorial depth that guides the eye instantly to what matters.

---

## 4. Elevation & Depth: Tonal Layering

We convey hierarchy through light and density, never through drop shadows.

*   **The Layering Principle:** To "lift" a card, do not add a shadow. Instead, move it from `surface-container-low` to `surface-container-high`.
*   **Ambient Shadows:** If a floating element (like a modal) requires a shadow, use a large 40px blur at 6% opacity using the `primary` color shifted toward black. It should feel like an atmospheric glow, not a shadow.
*   **LED Status Dots:** For real-time monitoring, use 6px circular pulses.
    *   **Success:** `secondary` with a 4px outer glow of the same color.
    *   **Error:** `error` with a flickering animation to draw immediate ocular attention.

---

## 5. Components

### Buttons: The "Tactile Toggle"
*   **Primary:** A gradient from `primary` to `primary-container`. No border. High-contrast `on-primary` text.
*   **Tertiary:** Transparent background with `primary` text. Upon hover, a `surface-container-highest` background appears.

### Input Fields: "HUD Style"
*   Forbid standard boxes. Use a bottom-only "Ghost Border" (`outline-variant` at 20%). 
*   When focused, the border transitions to a `primary` glow, and the background shifts to `surface-container-highest`.

### Cards & Lists: The "Zero-Divider" Mandate
*   **Forbid divider lines.** Separate list items using 4px or 8px of vertical gap (`spacing-sm`).
*   In high-density tables, use alternating row tints: `surface-container-lowest` and `surface-container-low`.

### Specialized Industrial Components
*   **The Mold Lifecycle Gauge:** A semi-circular progress bar using `tertiary` gradients.
*   **The Data Sparkline:** 1px width lines in `secondary` (Success) or `error` (Danger) embedded directly into list items to show 24h trends without taking up vertical space.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace High Density:** It is okay to have 20+ data points on screen if they are organized via Tonal Layering.
*   **Respect RTL:** When switching to Arabic, mirror the entire layout, but keep technical "ID Codes" (e.g., MOLD-X99) in LTR for global factory standards.
*   **Use Neon Sparingly:** Neon colors are for *status*, not for decoration. If everything is neon, nothing is important.

### Don’t:
*   **Don't use pure white (#FFFFFF):** It causes eye strain in dark industrial environments. Use `on-surface` (`#e2e2e8`) for primary text.
*   **Don't use standard "Windows" corners:** Stick to the `md` (0.375rem) or `lg` (0.5rem) roundedness scale. Avoid `full` rounding except for status pills.
*   **Don't use 100% opaque borders:** They shatter the glass illusion. Always use "Ghost Borders" at <20% opacity.