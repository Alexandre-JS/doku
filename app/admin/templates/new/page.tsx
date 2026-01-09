"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Save, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Settings2, 
  Layout, 
  Layers, 
  Building2, 
  Tag, 
  Wand2, 
  Info,
  User,
  CreditCard,
  Hash,
  MapPin,
  Flag,
  Heart,
  Calendar,
  Search,
  ChevronDown,
  Monitor,
  Eye,
  Type as TypeIcon
} from "lucide-react";
import Link from "next/link";
import { createBrowserSupabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Company } from "@/src/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Import dinâmico do editor para evitar erros de SSR
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    // Wrapper para permitir o uso de refs com next/dynamic
    return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
  },
  { 
    ssr: false,
    loading: () => <div className="h-[500px] w-full animate-pulse bg-slate-50 rounded-2xl border border-slate-100" />
  }
);

// 1. Nova Interface alinhada ao Banco de Dados
interface GlobalVariable {
  key_name: string;
  display_label: string;
  category: string;
  description?: string;
}

// 2. Mapeador de Ícones para manter a UI elegante
const getVariableIcon = (key: string) => {
  const icons: any = {
    full_name: User,
    bi_number: CreditCard,
    nuit: Hash,
    address: MapPin,
    gender: User,
    marital_status: Heart,
    current_date: Calendar,
  };
  return icons[key] || TypeIcon;
};

type FieldType = 'text' | 'textarea' | 'date' | 'select';

interface AdminFormField {
  id: string;
  label: string;
  type: FieldType;
  options?: string; // String separada por vírgula para edição, convertida em array no final
  required: boolean;
  placeholder?: string;
}

export default function NewTemplatePage() {
  const router = useRouter();
  const supabase = createBrowserSupabase();
  const quillRef = useRef<any>(null);
  
  // States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>("profile");
  const [showAutoSchema, setShowAutoSchema] = useState(false);

  // Configuração do Editor - Usando useMemo para evitar re-renders e erros de tipo no align
  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'align': [] as any[] }],
      ['clean']
    ],
  }), []);

  const formats = [
    'bold', 'italic', 'underline', 'align'
  ];
  
  // Data from DB
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  // Filtragem do Dicionário
  const filteredVariables = useMemo(() => {
    return globalVariables.filter(v => 
      v.display_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.key_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [globalVariables, searchTerm]);

  // Template State
  const [template, setTemplate] = useState({
    title: "",
    slug: "",
    category_id: "",
    description: "",
    price: 0,
    popular: false,
    content_html: "",
  });

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      const [cats, comps, vars] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("companies").select("*").order("name"),
        supabase.from("global_variables").select("*").order("display_label")
      ]);

      if (cats.data) setCategories(cats.data);
      if (comps.data) setCompanies(comps.data);
      if (vars.data) {
        setGlobalVariables(vars.data); // Pure DB state
      }

      if (cats.data && cats.data.length > 0) {
        setTemplate(prev => ({ ...prev, category_id: cats.data[0].id }));
      }
    }
    fetchData();
  }, [supabase]);

  // AUTO SCAN: Gera o form_schema baseado no conteúdo do editor
  const generatedSchema = useMemo(() => {
    // Extrair {{variaveis}} filtrando tags HTML que o Quill pode inserir no meio do texto
    const plainText = template.content_html.replace(/<[^>]*>/g, "");
    const matches = plainText.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) || [];
    const keys = Array.from(new Set(matches.map(m => m.replace(/\{\{\s*|\s*\}\}/g, ""))));
    
    const fields = keys.map(key => {
      const globalVar = globalVariables.find(v => v.key_name === key);
      return {
        id: key,
        label: globalVar ? globalVar.display_label : key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        type: key.includes("data") ? "date" : key.includes("descricao") ? "textarea" : "text",
        required: true,
        source: globalVar?.category === 'profile' ? 'profile' : 'user_input'
      };
    });

    return [{
      section: "Dados do Documento",
      fields: fields
    }];
  }, [template.content_html, globalVariables]);

  // Gerar slug automaticamente
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
    
    setTemplate({ ...template, title, slug });
  };

  const insertVariable = (id: string) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const range = quill.getSelection(true);
    const varTag = `{{${id}}}`;
    
    quill.insertText(range.index, varTag);
    quill.setSelection(range.index + varTag.length);
  };

  // Salvar no Supabase (Transaction-like)
  const handleSave = async () => {
    if (!template.title || !template.slug || !template.content_html) {
      setError("Preencha o título e o conteúdo da minuta.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Encontrar o nome da categoria selecionada para preencher a coluna 'category' (que é obrigatória no seu banco)
      const selectedCategory = categories.find(c => c.id === template.category_id);
      
      // 2. Inserir o modelo (Tabela 'templates' - Colunas: slug, title, category, category_id, content, price, popular, form_schema)
      const { data: newTemplate, error: dbError } = await supabase
        .from("templates")
        .insert({
          title: template.title,
          slug: template.slug,
          category: selectedCategory?.name || "Geral", // Coluna string obrigatória
          category_id: template.category_id,           // Foreign Key
          content: template.content_html, 
          price: `${template.price} MT`,  
          popular: template.popular,
          form_schema: generatedSchema
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Vincular empresas (Relacional - Tabela template_companies)
      if (selectedCompanies.length > 0 && newTemplate) {
        const relations = selectedCompanies.map(compId => ({
          template_id: newTemplate.id,
          company_id: compId
        }));
        
        const { error: relError } = await supabase
          .from("template_companies")
          .insert(relations);
          
        if (relError) throw relError;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/templates?success=created"), 2000);
    } catch (err: any) {
      console.error("Erro detalhado no salvamento:", err);
      setError(err.message || "Erro ao salvar a minuta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] pb-10">
      {/* Header Fixo e Moderno */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/templates" className="p-2 transition-colors hover:bg-zinc-100 rounded-lg text-zinc-500">
              <ArrowLeft size={18} />
            </Link>
            <div className="h-4 w-px bg-zinc-200 mx-1" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Document Engine</span>
              <span className="text-zinc-300">/</span>
              <h1 className="text-sm font-bold text-[#143361] truncate max-w-[200px]">
                {template.title || "Novo Modelo"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-[#143361] hover:bg-blue-50 transition-all">
              <Save size={14} />
              Guardar Rascunho
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#00A86B] px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-100 transition-all hover:bg-emerald-600 disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              {loading ? "A publicar..." : "Publicar Modelo"}
            </button>
          </div>
        </div>
      </header>
      <div className="h-14 w-full" />

      <main className="mx-auto max-w-[1600px] px-6 pt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 h-[calc(100vh-100px)]">
          
          {/* 1. PAINEL ESQUERDO: Ficha Técnica (2/12) */}
          <div className="lg:col-span-2 space-y-4 flex flex-col overflow-y-auto no-scrollbar pb-10">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Layout size={14} className="text-zinc-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ficha Técnica</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1 ml-1">Título da Minuta</label>
                  <input 
                    type="text" 
                    value={template.title}
                    onChange={handleTitleChange}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium focus:border-zinc-900 transition-all outline-none"
                    placeholder="Ex: Contrato de Arrendamento"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1 ml-1">Preço (MT)</label>
                    <input 
                      type="number" 
                      value={template.price}
                      onChange={(e) => setTemplate({ ...template, price: Number(e.target.value) })}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-1 ml-1">Categoria</label>
                    <select 
                       value={template.category_id}
                       onChange={(e) => setTemplate({ ...template, category_id: e.target.value })}
                       className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium outline-none cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[9px] font-bold uppercase text-zinc-400 mb-2 ml-1 flex items-center gap-1">
                    <Building2 size={10} />
                    Parceiros Relacionados
                  </label>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto no-scrollbar pr-1">
                    {companies.map(company => (
                      <label 
                        key={company.id} 
                        className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                          selectedCompanies.includes(company.id) 
                            ? 'bg-[#143361] border-[#143361] text-white' 
                            : 'bg-zinc-50 border-zinc-100 text-[#143361] hover:border-zinc-200'
                        }`}
                      >
                        <span className="text-[10px] font-bold truncate pr-2">{company.name}</span>
                        <input 
                          type="checkbox"
                          className="opacity-0 w-0 h-0"
                          checked={selectedCompanies.includes(company.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCompanies([...selectedCompanies, company.id]);
                            } else {
                              setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
                            }
                          }}
                        />
                        {selectedCompanies.includes(company.id) && <CheckCircle2 size={10} />}
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setTemplate({ ...template, popular: !template.popular })}
                  className={`flex w-full items-center justify-between rounded-lg border p-2.5 transition-all ${
                    template.popular ? 'bg-amber-50 border-amber-200' : 'bg-white border-zinc-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Tag size={12} className={template.popular ? "text-amber-500" : "text-zinc-400"} />
                    <span className={`text-[10px] font-bold ${template.popular ? "text-amber-700" : "text-[#143361]"}`}>Destacar na Loja</span>
                  </div>
                  <div className={`h-1.5 w-1.5 rounded-full ${template.popular ? "bg-amber-500 animate-pulse" : "bg-zinc-300"}`} />
                </button>
              </div>
            </div>

            {/* Auto-Schema Resumido no Rodapé do Painel */}
            <div className="mt-auto rounded-2xl bg-[#143361] p-4 text-white shadow-lg">
              <button 
                onClick={() => setShowAutoSchema(!showAutoSchema)}
                className="flex w-full items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-blue-300 group-hover:text-white transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Auto Schema</span>
                </div>
                <ChevronDown size={14} className={`text-blue-400 transition-transform ${showAutoSchema ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {showAutoSchema && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-2 border-t border-white/10 mt-3">
                      {generatedSchema[0].fields.length === 0 ? (
                        <p className="text-[10px] text-zinc-500 italic">Nenhuma variável detectada</p>
                      ) : (
                        generatedSchema[0].fields.map(f => (
                          <div key={f.id} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                            <span className="text-[9px] font-mono text-zinc-400">{"{{"}{f.id}{"}}"}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${f.source === 'profile' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {f.source === 'profile' ? 'Prefill' : 'Input'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 2. ÁREA CENTRAL: Editor A4 (7/12) */}
          <div className="lg:col-span-7 flex flex-col h-full bg-zinc-200/50 rounded-3xl border border-zinc-200 overflow-hidden relative">
            <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-blue-50 text-[#143361] border border-blue-100">
                  <FileCode size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#143361]">Editor de Minuta</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">Os campos serão substituídos por dados reais</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 text-[10px] font-bold text-zinc-500">
                  <Monitor size={10} />
                  <span>Modo Focus</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-zinc-200/30">
              <div className="mx-auto bg-white shadow-2xl min-h-[1000px] w-full max-w-[800px] rounded-sm ring-1 ring-zinc-300">
                <style>{`
                  .ql-container.ql-snow { border: none !important; font-family: 'Times New Roman', serif; }
                  .ql-editor { 
                    min-height: 1000px;
                    font-size: 14pt;
                    line-height: 1.6;
                    color: #1a1a1a;
                    padding: 2.5cm 2cm !important;
                  }
                  .ql-toolbar.ql-snow {
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    border: none !important;
                    border-bottom: 1px solid #e4e4e7 !important;
                    background: #ffffff !important;
                    padding: 8px 24px !important;
                  }
                  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                `}</style>
                <ReactQuill 
                  forwardedRef={quillRef}
                  theme="snow"
                  value={template.content_html}
                  onChange={(content: string) => setTemplate({ ...template, content_html: content })}
                  modules={modules}
                  formats={formats}
                  placeholder="Escreva aqui o conteúdo da sua minuta..."
                  className="h-full"
                />
              </div>
            </div>
          </div>

          {/* 3. PAINEL DIREITO: Dicionário Inteligente (3/12) */}
          <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden h-full">
            <div className="p-5 border-b border-zinc-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-[#143361] text-white">
                  <Wand2 size={16} />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#143361]">Dicionário de Dados</h4>
              </div>

              {/* Barra de Busca */}
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#143361] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Pesquisar variável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-9 py-2.5 text-[11px] font-medium outline-none focus:bg-white focus:border-[#143361] transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
              {[
                { id: 'profile', label: 'Dados de Identificação', icon: User },
                { id: 'custom', label: 'Variáveis da Minuta', icon: Tag },
                { id: 'other', label: 'Componentes Extras', icon: Plus }
              ].map(group => {
                const groupItems = filteredVariables.filter(v => {
                  if (group.id === 'other') return v.category !== 'profile' && v.category !== 'custom';
                  return v.category === group.id;
                });

                if (groupItems.length === 0 && !searchTerm) return null;
                if (groupItems.length === 0 && searchTerm) return null;

                return (
                  <div key={group.id} className="space-y-3">
                    <div 
                      className="flex items-center justify-between cursor-pointer group/header"
                      onClick={() => setActiveGroup(activeGroup === group.id ? null : group.id)}
                    >
                      <div className="flex items-center gap-2">
                        <group.icon size={12} className="text-zinc-400 group-hover/header:text-[#143361] transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover/header:text-[#143361] transition-colors">
                          {group.label}
                        </span>
                      </div>
                      <ChevronDown size={14} className={`text-zinc-300 transition-transform ${activeGroup === group.id ? "rotate-180" : ""}`} />
                    </div>

                    <AnimatePresence initial={false}>
                      {activeGroup === group.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          {groupItems.map(v => {
                            const IconComponent = getVariableIcon(v.key_name);
                            return (
                              <button 
                                key={v.key_name}
                                onClick={() => insertVariable(v.key_name)}
                                title={`Inserir {{${v.key_name}}}`}
                                className="w-full group relative flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 bg-white text-left hover:border-[#143361] hover:shadow-md transition-all duration-200"
                              >
                                <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-400 group-hover:text-[#143361] group-hover:bg-blue-50 transition-all">
                                  <IconComponent size={12} />
                                </div>
                                <div className="min-w-0 pr-6">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-[11px] font-bold text-[#143361] truncate leading-none">
                                      {v.display_label}
                                    </p>
                                    <span className="text-[8px] px-1 py-0.5 rounded-md bg-zinc-100 text-zinc-400 font-bold uppercase tracking-tighter">
                                      {v.key_name.includes('data') ? 'Data' : v.key_name.includes('price') ? 'Valor' : 'Texto'}
                                    </span>
                                  </div>
                                  <p className="text-[9px] font-mono text-zinc-400 group-hover:text-zinc-600 transition-colors">
                                    {"{{"}{v.key_name}{"}}"}
                                  </p>
                                </div>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Plus size={14} className="text-[#00A86B]" />
                                </div>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Estado Vazio de Busca */}
              {searchTerm && filteredVariables.length === 0 && (
                <div className="py-10 text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2">
                    <Search size={18} />
                  </div>
                  <p className="text-[11px] font-bold text-zinc-500">Nenhum campo encontrado</p>
                  <p className="text-[10px] text-zinc-400">Tente outro termo de pesquisa</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-zinc-100 bg-blue-50/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Info size={12} className="text-[#143361] opacity-50" />
                <span className="text-[9px] font-bold text-[#143361] uppercase">Dica do Especialista</span>
              </div>
              <p className="text-[10px] text-[#143361]/60 leading-relaxed font-medium">
                Clique nos botões para injetar campos dinâmicos no local do cursor. O sistema cuidará do preenchimento posterior.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Overlays (Success/Error) */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#143361]/40 backdrop-blur-sm px-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="rounded-[2.5rem] bg-white p-12 text-center shadow-2xl max-w-sm w-full border border-zinc-100"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00A86B] text-white">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-black text-[#143361] uppercase tracking-tight">Publicado com Sucesso</h2>
              <p className="mt-3 text-sm text-[#143361]/60 font-medium px-4">O modelo está disponível para os utilizadores finais na galeria.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right duration-500">
          <div className="flex items-center gap-4 rounded-2xl bg-white border-l-4 border-red-500 p-5 shadow-2xl">
            <div className="p-2 rounded-full bg-red-50 text-red-500">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Falha na Operação</p>
              <p className="text-xs font-bold text-zinc-900">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-4 p-1 hover:bg-zinc-100 rounded-lg text-zinc-400">
              <Plus size={16} className="rotate-45" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
