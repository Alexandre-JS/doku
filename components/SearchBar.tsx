"use client";

import { Search, Loader2 } from "lucide-react";
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

  const inputClasses = variant === "hero" 
    ? "w-full border-none bg-transparent px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0"
    : "w-full border-none bg-transparent px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="w-full">
        <div className={`relative flex items-center rounded-full bg-white shadow-lg ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-slate-400 transition-all ${variant === "nav" ? "p-1 bg-slate-50" : "p-2"}`}>
          <div className={`flex items-center text-slate-400 ${variant === "nav" ? "pl-3" : "pl-4"}`}>
            {loading ? <Loader2 size={variant === "nav" ? 18 : 20} className="animate-spin" /> : <Search size={variant === "nav" ? 18 : 20} />}
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
          <button 
            type="submit" 
            className={`rounded-full bg-slate-900 font-semibold text-white transition-all hover:bg-slate-800 active:scale-95 flex items-center justify-center ${variant === "nav" ? "px-4 py-1.5 text-xs" : "px-8 py-3 text-sm min-h-[48px]"}`}
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
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
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
