"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, // Adicionado
  Settings2, 
  ArrowLeft, 
  Layout, 
  Building2, 
  Tag, 
  Upload, 
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { createBrowserSupabase } from "@/src/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Company } from "@/src/types";

type Tab = "categories" | "companies";

export default function AdminSettingsPage() {
  const supabase = createBrowserSupabase();
  const [activeTab, setActiveTab] = useState<Tab>("categories");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // Form states
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Item states
  const [newItem, setNewItem] = useState({
    name: "",
    slug: "",
    icon: "", // for categories
    logo_url: "", // for companies
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [cats, comps] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("companies").select("*").order("name")
    ]);

    if (cats.data) setCategories(cats.data);
    if (comps.data) setCompanies(comps.data);
    setLoading(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (activeTab === "categories") {
        if (editingId) {
          const { error: err } = await supabase.from("categories").update({
            name: newItem.name,
            slug: newItem.slug || newItem.name.toLowerCase().replace(/\s+/g, "-"),
            icon: newItem.icon
          }).eq("id", editingId);
          if (err) throw err;
          setSuccess("Categoria atualizada com sucesso!");
        } else {
          const { error: err } = await supabase.from("categories").insert({
            name: newItem.name,
            slug: newItem.slug || newItem.name.toLowerCase().replace(/\s+/g, "-"),
            icon: newItem.icon
          });
          if (err) throw err;
          setSuccess("Categoria criada com sucesso!");
        }
      } else {
        if (editingId) {
          const { error: err } = await supabase.from("companies").update({
            name: newItem.name,
            logo_url: newItem.logo_url
          }).eq("id", editingId);
          if (err) throw err;
          setSuccess("Empresa atualizada com sucesso!");
        } else {
          const { error: err } = await supabase.from("companies").insert({
            name: newItem.name,
            logo_url: newItem.logo_url
          });
          if (err) throw err;
          setSuccess("Empresa criada com sucesso!");
        }
      }

      setNewItem({ name: "", slug: "", icon: "", logo_url: "" });
      setEditingId(null);
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name,
      slug: item.slug || "",
      icon: item.icon || "",
      logo_url: item.logo_url || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, table: string) => {
    if (!confirm("Tem certeza que deseja eliminar este registo?")) return;

    try {
      const { error: err } = await supabase.from(table).delete().eq("id", id);
      if (err) throw err;
      fetchData();
    } catch (err: any) {
      alert("Erro ao eliminar: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Admin */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/templates" className="text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <Settings2 size={18} />
              </div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">Admin / Definições</h1>
            </div>
          </div>
          
          <button 
            onClick={() => {
              setEditingId(null);
              setNewItem({ name: "", slug: "", icon: "", logo_url: "" });
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800"
          >
            <Plus size={18} />
            Nova {activeTab === "categories" ? "Categoria" : "Empresa"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Success/Error Alerts */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6">
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700">
                <CheckCircle2 size={20} />
                <span className="text-sm font-bold">{success}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Switcher */}
        <div className="mb-8 flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "categories" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Tag size={16} />
            Categorias
          </button>
          <button 
            onClick={() => setActiveTab("companies")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "companies" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Building2 size={16} />
            Empresas
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-200">
            <Loader2 className="animate-spin text-slate-300" size={40} />
            <p className="mt-4 text-sm font-medium text-slate-400 uppercase tracking-widest">Carregando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {activeTab === "categories" ? (
                categories.map((cat) => (
                  <motion.div 
                    layout
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Tag size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{cat.name}</h3>
                        <p className="text-xs font-mono text-slate-400">/{cat.slug}</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => openEdit(cat)}
                        className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id, "categories")}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                companies.map((comp) => (
                  <motion.div 
                    layout
                    key={comp.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                        {comp.logo_url ? (
                          <img src={comp.logo_url} alt={comp.name} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 size={20} className="text-slate-300" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{comp.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-tight text-slate-400">Empresa Verificada</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => openEdit(comp)}
                        className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(comp.id, "companies")}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Modal Nova Cadastro */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 text-white">
                    {activeTab === "categories" ? <Tag size={20} /> : <Building2 size={20} />}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingId ? "Editar" : "Nova"} {activeTab === "categories" ? "Categoria" : "Empresa"}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nome</label>
                  <input 
                    required
                    type="text" 
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-bold focus:border-slate-900 focus:outline-none"
                    placeholder={activeTab === "categories" ? "Ex: Jurídico" : "Ex: BIM Bank"}
                  />
                </div>

                {activeTab === "categories" ? (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Slug (URL)</label>
                    <input 
                      type="text" 
                      value={newItem.slug}
                      onChange={(e) => setNewItem({ ...newItem, slug: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-mono text-sm"
                      placeholder="juridico"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">URL do Logo</label>
                    <div className="relative">
                      <input 
                        required
                        type="url" 
                        value={newItem.logo_url}
                        onChange={(e) => setNewItem({ ...newItem, logo_url: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-12 font-medium focus:border-slate-900 focus:outline-none"
                        placeholder="https://exemplo.com/logo.png"
                      />
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmitting ? (editingId ? "Salvando..." : "Criando...") : `${editingId ? "Guardar" : "Criar"} ${activeTab === "categories" ? "Categoria" : "Empresa"}`}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
