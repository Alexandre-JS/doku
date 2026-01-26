"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2,
  Settings2, 
  Building2, 
  Tag, 
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  LayoutGrid
} from "lucide-react";
import { createBrowserSupabase } from "@/src/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Company } from "@/src/types";
import { DashboardHeader, AdminPageContainer } from "@/components/admin/DashboardComponents";

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
    icon: "", 
    logo_url: "", 
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
    <AdminPageContainer>
      <DashboardHeader 
        title="Configurações" 
        description="Gerencie as categorias de documentos e empresas parceiras do sistema."
      >
        <button 
          onClick={() => {
            setEditingId(null);
            setNewItem({ name: "", slug: "", icon: "", logo_url: "" });
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#143361] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-[#1a3f75] active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nova {activeTab === "categories" ? "Categoria" : "Empresa"}</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </DashboardHeader>

      {/* Tab Switcher */}
      <div className="mb-8 flex gap-2 p-1 bg-zinc-100 rounded-2xl w-fit border border-zinc-200">
        <button 
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "categories" ? "bg-white text-[#143361] shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <Tag size={14} />
          Categorias
        </button>
        <button 
          onClick={() => setActiveTab("companies")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "companies" ? "bg-white text-[#143361] shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <Building2 size={14} />
          Empresas
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-zinc-200 shadow-sm"
          >
            <Loader2 className="animate-spin text-zinc-300" size={40} />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">A carregar dados...</p>
          </motion.div>
        ) : (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activeTab === "categories" ? (
              categories.map((cat) => (
                <div key={cat.id} className="group relative rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <Tag size={24} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#143361] truncate">{cat.name}</h3>
                      <p className="text-[10px] font-mono text-zinc-400 font-bold uppercase">/{cat.slug}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openEdit(cat)}
                      className="p-2 text-zinc-400 hover:text-[#143361] hover:bg-zinc-50 rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id, "categories")}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              companies.map((comp) => (
                <div key={comp.id} className="group relative rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden">
                      {comp.logo_url ? (
                        <img src={comp.logo_url} alt={comp.name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 size={24} className="text-zinc-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#143361] truncate">{comp.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-tight text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">Verificada</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openEdit(comp)}
                      className="p-2 text-zinc-400 hover:text-[#143361] hover:bg-zinc-50 rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(comp.id, "companies")}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nova Cadastro */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#143361]/40 backdrop-blur-sm p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-2xl border border-zinc-100"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#143361] text-white">
                    {activeTab === "categories" ? <Tag size={20} /> : <Building2 size={20} />}
                  </div>
                  <h2 className="text-xl font-black text-[#143361] uppercase tracking-tight">
                    {editingId ? "Editar" : "Nova"} {activeTab === "categories" ? "Categoria" : "Empresa"}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Nome</label>
                  <input 
                    required
                    type="text" 
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3.5 text-sm font-bold focus:border-[#143361] transition-all outline-none mt-1 shadow-sm"
                    placeholder={activeTab === "categories" ? "Ex: Jurídico" : "Ex: BIM Bank"}
                  />
                </div>

                {activeTab === "categories" ? (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Slug (URL)</label>
                    <input 
                      type="text" 
                      value={newItem.slug}
                      onChange={(e) => setNewItem({ ...newItem, slug: e.target.value })}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3.5 text-sm font-mono focus:border-[#143361] transition-all outline-none mt-1 shadow-sm font-bold"
                      placeholder="juridico"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">URL do Logo</label>
                    <div className="relative">
                      <input 
                        required
                        type="url" 
                        value={newItem.logo_url}
                        onChange={(e) => setNewItem({ ...newItem, logo_url: e.target.value })}
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3.5 pl-12 text-sm font-bold focus:border-[#143361] transition-all outline-none mt-1 shadow-sm"
                        placeholder="https://exemplo.com/logo.png"
                      />
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

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
                    {isSubmitting ? "A guardar..." : "Salvar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminPageContainer>
  );
}

