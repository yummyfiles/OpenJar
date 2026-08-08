"use client";

import { motion, type Variants } from "framer-motion";
import type { ComponentProps } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: EASE }
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE }
  }
};

export function Stagger(props: ComponentProps<typeof motion.div>) {
  return <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} {...props} />;
}

export function StaggerItem(props: ComponentProps<typeof motion.div>) {
  return <motion.div variants={staggerItem} {...props} />;
}

export function FadeUp(props: ComponentProps<typeof motion.div>) {
  return <motion.div {...fadeUp} {...props} />;
}

export function FadeIn(props: ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      {...props}
    />
  );
}

export { motion };
