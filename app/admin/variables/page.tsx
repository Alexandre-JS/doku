"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Database, 
  Settings2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Tag,
  Hash,
  Type
} from "lucide-react";
import { createBrowserSupabase } from "@/src/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface GlobalVariable {
  id: string;
  key_name: string;
  display_label: string;
  category: string;
  description: string;
}

export default function AdminVariablesPage() {
  const supabase = createBrowserSupabase();
  const [variables, setVariables] = useState<GlobalVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newItem, setNewItem] = useState({
    key_name: "",
    display_label: "",
    category: "custom",
    description: ""
  });

  const fetchVariables = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("global_variables")
      .select("*")
      .order("display_label");
    
    if (data) setVariables(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVariables();
  }, []);

  const filteredVariables = useMemo(() => {
    return variables.filter(v => 
      v.display_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.key_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [variables, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from("global_variables")
        .insert(newItem);

      if (dbError) throw dbError;

      setSuccess("Variável adicionada com sucesso!");
      setShowModal(false);
      setNewItem({ key_name: "", display_label: "", category: "custom", description: "" });
      fetchVariables();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja apagar esta variável?")) return;

    try {
      const { error } = await supabase
        .from("global_variables")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      setVariables(prev => prev.filter(v => v.id !== id));
      setSuccess("Variável removida!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#143361] tracking-tight">Dicionário de Variáveis</h2>
          <p className="text-sm text-zinc-500 font-medium font-inter">Gerencie os placeholders globais usados nos modelos.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#143361] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 transition-all"
        >
          <Plus size={18} />
          Nova Variável
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
             <input 
               type="text" 
               placeholder="Pesquisar por nome ou label..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white border border-zinc-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#143361] transition-all"
             />
          </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Display Label</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Key Name (Tag)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Categoria</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-6"><div className="h-4 bg-zinc-100 rounded-full w-full" /></td>
                  </tr>
                ))
              ) : filteredVariables.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#143361]">{v.display_label}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">{v.description || "Sem descrição"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono font-bold text-doku-green bg-emerald-50 px-2 py-1 rounded">
                      {"{{"}{v.key_name}{"}}"}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      v.category === 'profile' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                    }`}>
                      {v.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(v.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* Modal Nova Variável */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#143361]/40 backdrop-blur-sm p-6">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl border border-zinc-100"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-[#143361] uppercase tracking-tight">Nova Variável Global</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Nome de Exibição (Label)</label>
                  <input 
                    required
                    type="text" 
                    value={newItem.display_label}
                    onChange={(e) => setNewItem({ ...newItem, display_label: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-[#143361] transition-all outline-none"
                    placeholder="Ex: Nome Completo do Pai"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Tag (Key Name)</label>
                  <input 
                    required
                    type="text" 
                    value={newItem.key_name}
                    onChange={(e) => setNewItem({ ...newItem, key_name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm font-mono font-bold focus:border-[#143361] transition-all outline-none"
                    placeholder="Ex: pai_nome_completo"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Categoria</label>
                  <select 
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-[#143361] transition-all outline-none"
                  >
                    <option value="profile">Perfil do Utilizador (Prefill)</option>
                    <option value="custom">Input Manual (User Input)</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-8 py-4 text-sm font-bold text-zinc-500 hover:bg-zinc-100 rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 px-8 py-4 text-sm font-bold text-white bg-[#143361] rounded-2xl shadow-lg shadow-blue-100 hover:bg-[#0d2241] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? "A guardar..." : "Salvar Variável"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
