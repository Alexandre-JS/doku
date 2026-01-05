"use client";

import { Search, Loader2, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createBrowserSupabase } from "../src/lib/supabase";

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
        .from("document_templates")
        .select("title, slug")
        .eq("is_active", true);

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
    ? "relative flex items-center rounded-full bg-slate-800/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-doku-green transition-all p-2.5"
    : `relative flex items-center rounded-full bg-white shadow-lg ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-doku-blue/30 transition-all ${variant === "nav" ? "p-1 bg-doku-bg" : "p-2"}`;

  const inputClasses = variant === "hero" 
    ? "w-full border-none bg-transparent px-5 py-4 text-lg text-white placeholder-slate-400 focus:outline-none focus:ring-0"
    : "w-full border-none bg-transparent px-3 py-1.5 text-sm text-doku-blue placeholder-slate-400 focus:outline-none focus:ring-0";

  const buttonClasses = variant === "hero"
    ? "rounded-full bg-doku-green font-black text-white transition-all hover:bg-doku-green/90 hover:shadow-[0_0_20px_rgba(0,168,107,0.4)] active:scale-95 flex items-center justify-center px-10 py-4 text-lg min-h-[64px]"
    : `rounded-full bg-doku-blue font-semibold text-white transition-all hover:bg-doku-blue/90 active:scale-95 flex items-center justify-center ${variant === "nav" ? "px-4 py-1.5 text-xs" : "px-8 py-3 text-sm min-h-[48px]"}`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="w-full">
        <div className={containerClasses}>
          <div className={`flex items-center ${variant === "hero" ? "text-doku-green pl-4" : "text-slate-400 " + (variant === "nav" ? "pl-3" : "pl-4")}`}>
            {loading ? <Loader2 size={variant === "nav" ? 18 : 24} className="animate-spin" /> : <Search size={variant === "nav" ? 18 : 24} />}
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
