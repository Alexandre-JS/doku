"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createBrowserSupabase } from "../src/lib/supabase";
import { motion } from "framer-motion";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  variant?: "nav" | "hero";
}

interface Suggestion {
  title: string;
  slug: string;
}

const normalizeText = (text: string) => 
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function SearchBar({ 
  placeholder = "O que você precisa hoje?", 
  className = "",
  variant = "nav"
}: SearchBarProps) {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [query, setQuery] = useState(urlSearch);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      const supabase = createBrowserSupabase();
      
      // Buscamos todos os títulos ativos para filtrar localmente com normalização
      const { data, error } = await supabase
        .from("templates")
        .select("title, slug");

      if (!error && data) {
        const normalizedQuery = normalizeText(query);
        const filtered = data.filter(item => 
          normalizeText(item.title).includes(normalizedQuery)
        ).slice(0, 5);
        setSuggestions(filtered);
      }
      setLoading(false);
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/templates?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (slug: string, title: string) => {
    setQuery(title);
    setShowSuggestions(false);
    router.push(`/form?template=${slug}`);
  };

  const containerClasses = variant === "hero"
    ? "relative flex items-center rounded-full bg-slate-800/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-doku-green transition-all p-1.5 sm:p-2.5"
    : `relative flex items-center rounded-full bg-slate-100/80 ring-1 ring-slate-200/50 focus-within:bg-white focus-within:ring-doku-blue/30 focus-within:shadow-md transition-all ${variant === "nav" ? "p-1" : "p-2"}`;

  const inputClasses = variant === "hero" 
    ? "w-full border-none bg-transparent px-3 py-3 text-base text-white placeholder-slate-400 focus:outline-none focus:ring-0 sm:px-5 sm:py-4 sm:text-lg"
    : `w-full border-none bg-transparent px-3 py-1 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-0 ${variant === "nav" ? "py-1" : "py-2"}`;

  const buttonClasses = variant === "hero"
    ? "rounded-full bg-doku-green font-black text-white transition-all hover:bg-doku-green/90 hover:shadow-[0_0_20px_rgba(0,168,107,0.4)] active:scale-95 flex items-center justify-center px-5 py-3 text-base min-h-[48px] sm:min-h-[64px] sm:px-10 sm:py-4 sm:text-lg"
    : `rounded-full bg-doku-blue font-semibold text-white transition-all hover:bg-doku-blue/90 active:scale-95 flex items-center justify-center ${variant === "nav" ? "hidden" : "px-8 py-3 text-sm min-h-[48px]"}`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="w-full">
        <div className={containerClasses}>
          <div className={`flex items-center ${variant === "hero" ? "text-doku-green pl-3 sm:pl-4" : "text-slate-400 " + (variant === "nav" ? "pl-2" : "pl-4")}`}>
            {loading ? (
              <motion.img 
                src="/logo-tra.png" 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className={variant === "nav" ? "h-3 w-3 sm:h-4 sm:w-4" : "h-5 w-5 sm:h-6 sm:w-6"} 
              />
            ) : (
              <Search size={variant === "nav" ? 14 : (variant === "hero" ? 20 : 24)} className="sm:size-[24px]" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className={inputClasses}
          />
          {variant === "hero" && (
            <button type="button" className="mr-2 p-2 text-slate-400 hover:text-white transition-colors">
              <SlidersHorizontal size={20} />
            </button>
          )}
          <button 
            type="submit" 
            className={buttonClasses}
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Dropdown de Sugestões */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(item.slug, item.title)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-doku-blue/80 transition-colors hover:bg-doku-bg hover:text-doku-blue"
              >
                <Search size={14} className="text-slate-400" />
                <span className="font-medium">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
