"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedGridItemProps {
  children: ReactNode;
  index: number;
}

export default function AnimatedGridItem({ children, index }: AnimatedGridItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
    >
      {children}
    </motion.div>
  );
}
