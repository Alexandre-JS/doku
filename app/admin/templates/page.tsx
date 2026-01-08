"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Settings2, 
  ChevronRight,
  MoreHorizontal,
  FileText,
  AlertCircle,
  Calendar,
  DollarSign,
  Filter,
  CheckCircle2,
  X
} from "lucide-react";
import Link from "next/link";
import { createBrowserSupabase } from "@/src/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Toast, { ToastContainer } from "@/components/Toast";
import { useSearchParams, useRouter } from "next/navigation";

interface TemplateListing {
  id: string;
  title: string;
  slug: string;
  price: string;
  created_at: string;
  category: string;
  category_id: string;
}

export default function AdminTemplatesPage() {
  const supabase = createBrowserSupabase();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [templates, setTemplates] = useState<TemplateListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast State
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Check for success query params
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'created') {
      addToast("Minuta criada com sucesso!", "success");
      // Clean URL
      router.replace('/admin/templates');
    } else if (success === 'updated') {
      addToast("Minuta atualizada com sucesso!", "success");
      // Clean URL
      router.replace('/admin/templates');
    }
  }, [searchParams, router]);

  // Fetch Templates
  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("templates")
      .select(`
        id, 
        title, 
        slug, 
        price, 
        created_at, 
        category,
        category_id
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTemplates(data as TemplateListing[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== deleteId));
      setDeleteId(null);
      addToast("Minuta apagada com sucesso!", "success");
    } catch (err: any) {
      console.error("Erro ao apagar:", err);
      addToast("Erro ao apagar a minuta. " + err.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] pb-20">
      {/* Header Admin */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 transition-colors hover:bg-zinc-100 rounded-lg text-zinc-500">
              <ArrowLeft size={18} />
            </Link>
            <div className="h-4 w-px bg-zinc-200 mx-1" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-[#143361] uppercase">Gestão</span>
              <span className="text-zinc-300">/</span>
              <h1 className="text-sm font-bold text-[#143361]">Lista de Minutas</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Link 
              href="/admin/settings" 
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#143361] hover:bg-blue-50 transition-all"
            >
              <Settings2 size={16} />
              Configurações
            </Link>
            <Link 
              href="/admin/templates/new"
              className="flex items-center gap-2 rounded-lg bg-[#00A86B] px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-100 transition-all hover:bg-emerald-600 active:scale-[0.98]"
            >
              <Plus size={16} />
              Criar Nova Minuta
            </Link>
          </div>
        </div>
      </header>
      <div className="h-14 w-full" />

      <main className="mx-auto max-w-7xl px-6 pt-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#143361] tracking-tight">Biblioteca de Minutas</h2>
            <p className="text-sm text-zinc-500 font-medium font-inter">Gerencie todas as minutas disponíveis no sistema.</p>
          </div>

          {/* Barra de Busca */}
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por título ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#143361] focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Listagem Estilo Shadcn UI */}
        <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Título da Minuta</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Categoria</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Preço</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Criada em</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-zinc-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-zinc-100 rounded-full w-full" /></td>
                    </tr>
                  ))
                ) : filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 mb-4">
                        <FileText size={24} />
                      </div>
                      <p className="text-sm font-bold text-zinc-500">Nenhuma minuta encontrada.</p>
                      <p className="text-xs text-zinc-400 mt-1">Experimente mudar o termo de pesquisa.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((template) => (
                    <tr key={template.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 text-[#143361]">
                            <FileText size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#143361] group-hover:underline cursor-pointer">{template.title}</p>
                            <p className="text-[10px] font-mono text-zinc-400">{template.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 border border-zinc-200">
                          {template.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-[#143361]">{template.price}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Calendar size={12} />
                          <span className="text-xs font-medium">
                            {new Date(template.created_at).toLocaleDateString('pt-PT', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/admin/templates/${template.id}`}
                            className="p-2 rounded-lg text-zinc-400 hover:text-[#143361] hover:bg-white transition-all shadow-sm border border-transparent hover:border-zinc-200"
                            title="Editar Minuta"
                          >
                            <Edit3 size={16} />
                          </Link>
                          <button 
                            onClick={() => setDeleteId(template.id)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-white transition-all shadow-sm border border-transparent hover:border-red-100"
                            title="Apagar Minuta"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de Confirmação de Apagar */}
      <AnimatePresence>
        {deleteId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#143361]/40 backdrop-blur-sm px-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="rounded-[2rem] bg-white p-8 text-center shadow-2xl max-w-sm w-full border border-zinc-100"
            >
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-lg font-black text-[#143361] uppercase tracking-tight">Tem a certeza?</h3>
              <p className="mt-2 text-sm text-zinc-500 font-medium">Esta acção é irreversível. A minuta será removida permanentemente do sistema.</p>
              
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 rounded-xl px-4 py-3 text-xs font-bold text-zinc-500 hover:bg-zinc-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-red-100 transition-all hover:bg-red-600 disabled:opacity-50"
                >
                  {isDeleting ? "A apagar..." : "Sim, Apagar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
