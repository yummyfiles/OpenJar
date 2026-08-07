"use client";

import { motion } from "framer-motion";
import type { ComponentProps } from "react";

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
};

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
