# Website Frontend Design System Guide

## Overview
This guide standardizes the frontend design system for the HiQSense website, ensuring a consistent, modern, and accessible user experience across all public-facing pages.

---

## 🎨 Color System

### Background Colors
- **Hero & Banner**: `Dark Background`
- **Main Section Background**: `Primary Background`
- **Section Alternates**: `Secondary Background`
- **Card Background**: `Secondary Background`
- **Footer Background**: `Dark Background`
- **Overlay Background**: `Semi-transparent Black`
- **Disabled Background**: `Gray Light`

### Text Colors
- **Headline Text**: `Primary Text`
- **Body Text**: `Secondary Text`
- **Muted Text**: `Muted Text`
- **CTA Text**: `Primary Background`
- **Link Hover**: `Primary`
- **Error Text**: `Error Dark`
- **Success Text**: `Success Dark`

### Placeholder Text
Always use muted color for all placeholder content:
```css
::placeholder {
  color: Muted Text;
}
```

### Border Colors
- **Default Border**: `Gray Light`
- **Focus Border**: `Primary`
- **Error Border**: `Error`
- **Success Border**: `Success`

---

## 🧩 Component Standards

### Headings
- Use `Primary Text`
- Apply `font-bold` and `tracking-tight`

### Paragraphs
- Use `Secondary Text`
- Maintain `leading-relaxed` and `max-w-prose`

### Call-To-Actions (Buttons)
- **Primary**: `Primary` background, `Primary Background` text
- **Secondary**: `Ghost` with `Primary Text`
- **Disabled**: `Gray Light` background, `Muted Text`

### Cards
- **Default**: `Secondary Background`, `Gray Light` border
- **Hover**: subtle `shadow-md`, transition on hover
- **Rounded**: `rounded-lg` or `rounded-xl`

### Forms
- **Input/Select Fields**: `Gray Light` border, `Primary Text`
- **Labels**: `Primary Text`
- **Help Text**: `Secondary Text`
- **Placeholders**: `Muted Text`

### Modals
- Background: `Primary Background`
- Overlay: `rgba(0,0,0,0.5)`
- Header: `Primary Text`
- Body: `Secondary Text`

### Icons
- Use inline with text
- Match current context color: `inherit`

### Tables (if used)
- **Header Row**: `Secondary Background`, `Primary Text`
- **Rows**: alternate with `Primary` and `Secondary Background`
- **Hover Row**: subtle background lift

---

## 🗂️ Tab Navigation

### Hero/Feature Tabs
| **State**      | **Text**        | **Underline**         | **Background**        |
|----------------|------------------|------------------------|------------------------|
| Active         | `Primary`        | `2px`, `Primary`       | `Transparent`         |
| Inactive       | `Secondary Text` | `Transparent`          | `Transparent`         |
| Hover          | `Primary Text`   | `None`                 | `Transparent`         |

- Padding: `py-3 px-4`
- Font Weight: `Medium`
- Border Radius: `none` unless required by layout

---

## ✨ Hero Sections

- Use `Dark Background`
- Headline: `Primary Background` text
- CTA: `Primary` button or white-on-dark if inverted
- Illustration: SVG, animation, or image should contrast background

---

## 📋 Forms & CTAs

- Label: `Primary Text`
- Input: `Primary Text`, `Muted Placeholder`
- Button: `Primary` with `Primary Background` text
- Spacing: vertical `space-y-4`

---

## 🔁 Usage Rules

### Text Hierarchy
1. Headline — `Primary`
2. Paragraph — `Secondary`
3. Meta/Muted — `Muted`

### Background Hierarchy
- Dark → Hero / Banner / Footer
- Primary → Most cards / forms / modal
- Secondary → Section alternates

### States
- Disabled → `Gray Light` background
- Hover → subtle background / color shift
- Focus → border shift to `Primary`

---

## ✅ Implementation Checklist

- [ ] Uses only tokens for colors
- [ ] Consistent spacing and typography
- [ ] Responsive states handled
- [ ] Buttons and links follow hierarchy
- [ ] Cards and modals styled correctly
- [ ] Tab navigation matches context
- [ ] Hero sections contrast with text
- [ ] No hardcoded colors
---

## 🧭 Navigation

### Header
- Background: `Primary Background` or `Transparent` over hero
- Logo: consistent size and alignment
- Link Text: `Primary Text`, hover `Primary`
- Mobile Menu: collapsible with same color system

### Footer
- Background: `Dark Background`
- Text: `Muted` for labels, `Primary Background` for links
- Section Titles: `Primary Text`
- Icons: `Muted Text`

---

## 🖼️ Media Blocks

### Image with Text
- Heading: `Primary Text`
- Paragraph: `Secondary Text`
- CTA: follows button styling
- Background: section based on layout (dark/light alternate)

### Video Section
- Background: optional overlay
- Play Icon: `Primary` or `Primary Background` depending on context
- Caption: `Muted Text`

---

## 🎥 Testimonials / Reviews

- Background: `Secondary Background`
- Text: `Primary` for names, `Secondary` for messages
- Quote Icon: `Muted` or `Primary`
- Cards: `Secondary Background`, border `Gray Light`, `rounded-lg`

---

## 💡 Feature Sections

### Icons with Text
- Icon: `Primary`
- Title: `Primary Text`
- Description: `Secondary Text`
- Background: `Transparent` or `Secondary Background`

### Numbered Steps
- Circle/Badge: `Primary`, text `Primary Background`
- Title: `Primary Text`
- Description: `Secondary Text`

---

## 📊 Stats / Metrics

- Numbers: `Primary`
- Labels: `Secondary Text`
- Divider lines: `Gray Light`

---

## 🧾 Pricing Tables

- Card Background: `Secondary Background`
- Header: `Primary`
- Features: `Secondary Text`
- CTA: `Primary` background button
- Popular Badge: `Success Background`, `Success Dark` text

---

## 📱 Contact / Newsletter Forms

- Input Fields: `Primary Text`, `Muted Placeholder`, `Gray Light` border
- Submit Button: `Primary`
- Section Background: `Secondary Background` or `Dark` if footer-aligned
