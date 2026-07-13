---
name: DNSChat Signal Path
description: A calm native messenger that makes its DNS transport legible.
colors:
  signal-blue: "#007AFF"
  signal-blue-dark: "#0A84FF"
  canvas-light: "#F2F2F7"
  canvas-dark: "#000000"
  surface-light: "#FFFFFF"
  surface-dark: "#1C1C1E"
  success-light: "#34C759"
  warning-light: "#FF9500"
  error-light: "#FF3B30"
rounded:
  control: 14
  surface: 12
  capsule: 999
spacing:
  xs: 4
  sm: 8
  md: 16
  lg: 20
  xl: 28
---

# Design System: DNSChat Signal Path

## 1. Overview

**Creative North Star: "The Signal Path"**

DNSChat is a restrained native utility whose signature is a clear route from device to resolver to TXT response. Familiar chat behavior keeps the primary task effortless; transport state appears only where it improves trust or recovery.

Routine content is flat and spatially grouped. Glass, chroma, and motion are reserved for the composer, active transport, sheets, and state changes. The system rejects cyberpunk styling, excessive cards, gratuitous glass, and decorative bounce.

**Key Characteristics:**

- Native hierarchy and controls
- One blue transport accent
- Explicit observable-DNS disclosure
- Flat routine lists with hairline separation
- State-driven motion and haptics

## 2. Colors

System neutrals carry content; chroma communicates transport and state.

### Primary

- **Signal Blue** (`#007AFF`, dark `#0A84FF`): primary actions, active DNS path, user bubbles, and focus.

### Neutral

- **Grouped Canvas** (`#F2F2F7`, dark `#000000`): screen background.
- **Local Surface** (`#FFFFFF`, dark `#1C1C1E`): list and control surfaces.
- **Primary Label** (`#000000`, dark `#FFFFFF`): titles and body copy.
- **Secondary Label** (`#6D6D70`, dark `#AEAEB2`): metadata and supporting copy.

### Named Rules

**The One Signal Rule.** Blue represents the active path or primary action; it is not decoration.

**The State Is More Than Color Rule.** Success, fallback, and failure always include text or shape as well as green, amber, or red.

## 3. Typography

**Display Font:** system sans-serif
**Body Font:** system sans-serif
**Label/Mono Font:** platform monospace for redacted protocol details only

**Character:** Familiar native typography makes technical content readable without turning the product into a terminal.

### Hierarchy

- **Display** (700, platform large title): one screen-level statement.
- **Headline** (600, 17): rows and compact section anchors.
- **Title** (600, 22): hero and state-panel titles.
- **Body** (400, 17): conversation and primary explanatory copy.
- **Label** (500, 12-13): transport state, latency, and metadata.

### Named Rules

**The Plain Language Rule.** Prefer factual transport language over promotional language such as “magic” or “revolutionary.”

## 4. Elevation

The system is flat by default. Spatial grouping, solid surfaces, and hairline separators create structure. Use subtle elevation only for transient sheets, the active composer, and content that must float above scrolling material.

### Named Rules

**The Transient Depth Rule.** If a surface is not moving, focused, or modal, it usually does not need a shadow.

## 5. Components

### Buttons

- **Shape:** rounded control (14 points), minimum 44 points high.
- **Primary:** Signal Blue fill, semibold label in the highest-contrast label color for the fill (dark label on bright blue: white on `#007AFF` falls below WCAG AA at body sizes), 48-point preferred height.
- **Press / Focus:** 0.96 scale on iOS when motion is allowed; opacity or native ripple otherwise.
- **Secondary:** plain label or flat tonal surface; no decorative capsule.

### Cards / Containers

- **Corner Style:** 12 points only for bounded state panels or transient surfaces.
- **Background:** platform surface tokens.
- **Shadow Strategy:** none for routine rows.
- **Border:** hairline separator where adjacency needs definition.
- **Internal Padding:** 16-20 points.

### Inputs / Fields

- **Style:** native multiline composer with a stable minimum height and clear send affordance.
- **Focus:** native focus behavior; never obscure the field or submit control behind the keyboard.
- **Error / Disabled:** text plus semantic state, never color alone.

### Navigation

Use platform tab and stack patterns. On larger screens, the intended extension is a conversation rail plus active detail; settings and reading surfaces remain capped to a comfortable measure.

### Signal Path

A three-stage device-resolver-TXT indicator is the product signature. Use text and shape with color. Animate segment changes in 180-240ms; resolve instantly under Reduce Motion. Never include prompt or response data in status chrome.

### Motion and Haptics

Use motion for causal transitions: send accepted, resolver fallback, response success, destructive confirmation, and sheet presentation. Keep timings between 150-300ms. Emit at most one haptic for a confirmed state transition and none for ordinary navigation rows.
