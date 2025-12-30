"use client";

import { useState, useEffect } from "react";

interface TypingTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  as?: "h1" | "p" | "span" | "div";
  cursorColor?: string;
  startDelay?: number;
}

export default function TypingText({
  text,
  className = "",
  speed = 50,
  as: Tag = "p",
  cursorColor = "bg-blue-600",
  startDelay = 0,
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(startDelay === 0);

  useEffect(() => {
    if (startDelay > 0) {
      const timer = setTimeout(() => setStarted(true), startDelay);
      return () => clearTimeout(timer);
    }
  }, [startDelay]);

  useEffect(() => {
    if (started && index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed, started]);

  return (
    <Tag className={`${className} min-h-[1.2em]`}>
      {displayedText}
      {index < text.length && (
        <span className={`inline-block w-[3px] h-[0.8em] ml-1 ${cursorColor} align-middle animate-cursor`} />
      )}
    </Tag>
  );
}
