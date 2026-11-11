---
name: framer-motion
description: Expert guidelines, animation patterns, and best practices for building performant animations, micro-interactions, gestures, and layout transitions using Framer Motion (Motion v12+) in React and Next.js.
---

# Framer Motion (Motion) Skill Guide

Guidelines for implementing fluid, 60fps animations and micro-interactions in React applications using Motion (formerly Framer Motion).

---

## 1. Package Imports & Standards (v12+)

* **Modern standard (Motion v12+)**:
  ```tsx
  import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "motion/react";
  ```
* **Legacy codebase fallback**: Only use `import { ... } from "framer-motion"` if working within an existing pre-v12 project that has not yet migrated.

---

## 2. Performance Rules (60fps Animation)

* **GPU-Accelerated Properties Only**: Always animate composite properties:
  - `transform`: `x`, `y`, `scale`, `scaleX`, `scaleY`, `rotate`, `rotateX`, `rotateY`, `skew`
  - `opacity`
* **Anti-Pattern (Avoid Layout Thrashing)**: NEVER directly animate geometry or layout properties:
  - ❌ Avoid animating `width`, `height`, `top`, `left`, `margin`, `padding`, `border-width`.
  - ✅ Instead, use `scale`, `x`, `y`, or the `layout` prop for smooth FLIP layout transitions.
* **`willChange` Optimization**: For complex or continuous transitions, add hardware acceleration hints:
  ```tsx
  <motion.div style={{ willChange: "transform, opacity" }} animate={{ x: 100, opacity: 1 }} />
  ```
* **Accessibility**: Always respect `prefers-reduced-motion`:
  ```tsx
  import { useReducedMotion } from "motion/react";
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 };
  ```

---

## 3. Core Patterns

### A. Basic Motion Element & Transitions
```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -16 }}
  transition={{ type: "spring", stiffness: 260, damping: 20 }}
>
  Content
</motion.div>
```

### B. Orchestrated Sequences with Variants
Variants decouple animation logic from JSX and orchestrate parent-child cascades:
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export function List({ items }: { items: string[] }) {
  return (
    <motion.ul variants={containerVariants} initial="hidden" animate="visible">
      {items.map((item, index) => (
        <motion.li key={index} variants={itemVariants}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### C. Micro-Interactions & Gestures
```tsx
<motion.button
  whileHover={{ scale: 1.04 }}
  whileTap={{ scale: 0.96 }}
  whileFocus={{ ring: 2 }}
  transition={{ type: "spring", stiffness: 400, damping: 15 }}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm"
>
  Submit
</motion.button>
```

### D. Exit Animations with AnimatePresence
Always ensure direct children of `AnimatePresence` have unique `key` props:
```tsx
<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      key="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50"
    >
      <motion.div
        key="modal-content"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white p-6 rounded-xl shadow-xl max-w-md mx-auto mt-24"
      >
        Modal Content
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### E. Layout Animations & Shared Element Transitions (`layoutId`)
Perfect for active tabs, selected state pills, and expanding cards:
```tsx
function TabBar({ tabs, activeTab, onSelect }: { tabs: string[]; activeTab: string; onSelect: (t: string) => void }) {
  return (
    <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className="relative px-3 py-1.5 text-sm font-medium transition-colors"
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        );
      })}
    </div>
  );
}
```

### F. Scroll-Driven Animations
```tsx
// 1. In-View Trigger
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.5, ease: "easeOut" }}
/>

// 2. Parallax / Scroll Progress
const { scrollYProgress } = useScroll();
const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
const yOffset = useTransform(scrollYProgress, [0, 1], [0, -150]);

<motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left" />
```
