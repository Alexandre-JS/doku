"use client";

import { motion } from "framer-motion";

interface LogoLoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LogoLoading({ size = "md", className = "" }: LogoLoadingProps) {
  const sizes = {
    sm: "h-8 w-auto",
    md: "h-12 w-auto",
    lg: "h-20 w-auto",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        {/* Outer pulse effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-doku-green/20 blur-xl"
        />
        
        {/* Logo with "drawing" or "breathing" effect */}
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.95, 1, 0.95],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img 
            src="/logo-tra.png" 
            alt="DOKU Loading" 
            className={`${sizes[size]} object-contain`}
          />
        </motion.div>
      </div>
      
      {/* Animated progress line */}
      <div className="h-1 w-24 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="h-full w-1/2 bg-gradient-to-r from-transparent via-doku-green to-transparent"
        />
      </div>
    </div>
  );
}
