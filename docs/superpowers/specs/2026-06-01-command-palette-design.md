# Command Palette Design Specification - Visual Refresh

This document outlines the design specification for improving the Command Palette user interface, aligning active selection states and scrollbars with the Lume-Glass ecosystem aesthetic.

---

## 1. Objectives

- **Visual Sophistication**: Replace the solid green left border for active options with a high-end floating accent notch and subtle glass card container highlight.
- **Unified Theme Synchronization**: Ensure all highlighted active states and interactive details dynamically update their colors when the user switches accent colors (e.g., Mint, Blue, Pink, Amber).
- **Sleek Custom Scrollbars**: Implement a premium, ultra-narrow scrollbar that fits the dark, glassmorphic palette and animates matching the active theme on hover.

---

## 2. Technical Details

### 2.1 Selected Option Layout (`components/cli/CommandPalette.tsx`)
Currently, the active selection uses a static left border styling:
```tsx
globalIndex === selectedIndex 
  ? "bg-white/[0.03] border-l-[#4AFFB4] text-white shadow-[inset_0_0_12px_rgba(74,255,180,0.02)]" 
  : "border-l-transparent text-white/60 hover:bg-white/[0.01] hover:text-white"
```

We will modify this to support a floating notch on the far left. The active item container style is updated to a relative container with a subtle glass backdrop:
- **Base item class**: Keep as an interactive button with standard padding, margins, and transition curves.
- **Active state background**: `bg-white/[0.03] border border-white/5 text-white shadow-[inset_0_0_12px_rgba(255,255,255,0.01)]`
- **Inactive state background**: `border border-transparent text-white/60 hover:bg-white/[0.01] hover:text-white`
- **Dynamic Floating Notch (Option A)**:
  - Add an absolute-positioned floating capsule on the left side of the button:
    ```tsx
    {globalIndex === selectedIndex && (
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-[3px] h-[16px] rounded-full bg-lume-primary shadow-[0_0_10px_var(--lume-primary)] transition-all duration-300" />
    )}
    ```
  - The notch dynamically uses `bg-lume-primary` and `var(--lume-primary)` glow, syncing instantly with the global theme.
  - Text selection color: Active icons and label highlights will inherit `text-lume-primary` or a clean white transition.

### 2.2 Dynamic Enter Pill State
The `ENTER` key pill on the far right will also be stylized to glow with the dynamic accent:
```tsx
<span className="text-[10px] font-mono text-lume-primary bg-lume-primary/10 border border-lume-primary/20 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(var(--lume-primary-rgb),0.1)]">
  ENTER
</span>
```

### 2.3 Theme-Synchronized Narrow Scrollbar (`app/globals.css`)
We will add a custom utility class `.scrollbar-custom` in `app/globals.css` to govern scrollbar behavior:

```css
/* Custom Thin Scrollbar */
.scrollbar-custom {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
}

.scrollbar-custom::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: var(--lume-primary);
  box-shadow: 0 0 8px var(--lume-primary);
}
```

This `.scrollbar-custom` class will be added to the Command Palette list container in `components/cli/CommandPalette.tsx`:
```tsx
<div className="p-2 overflow-y-auto max-h-[60vh] scrollbar-custom">
```

---

## 3. Review Checklist & Safety Gates

### 3.1 Functionality Checks
1. **Keyboard Scrolling**: Ensure keyboard navigation (`ArrowDown`, `ArrowUp`) works exactly as before. The browser should automatically scroll the selected item into view.
2. **Theme Toggles**: Activating the "Toggle Accent Color" command in the palette should instantly update the colors of both the Selection Notch, the `ENTER` key label, and the scrollbar's hover highlights.
3. **Scrollbar Narrowness**: The scrollbar must be small enough (`4px`) to look refined without overlapping text.

### 3.2 Visual Performance
- Soft notch is perfectly centered vertically with `-translate-y-1/2`.
- Option card handles transition elegantly without layout shifts.
