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
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Company } from "@/src/types";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Import dinâmico do editor para evitar erros de SSR
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
  },
  { 
    ssr: false,
    loading: () => <div className="h-[500px] w-full animate-pulse bg-slate-50 rounded-2xl border border-slate-100" />
  }
);

interface GlobalVariable {
  key_name: string;
  display_label: string;
  category: string;
  description?: string;
}

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

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const supabase = createBrowserSupabase();
  const quillRef = useRef<any>(null);
  
  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>("profile");
  const [showAutoSchema, setShowAutoSchema] = useState(false);

  // Configuração do Editor
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

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [cats, comps, vars] = await Promise.all([
          supabase.from("categories").select("*").order("name"),
          supabase.from("companies").select("*").order("name"),
          supabase.from("global_variables").select("*").order("display_label")
        ]);

        if (cats.data) setCategories(cats.data);
        if (comps.data) setCompanies(comps.data);
        if (vars.data) setGlobalVariables(vars.data);

        // Fetch current template
        const { data: existingTemplate, error: tError } = await supabase
          .from("templates")
          .select("*")
          .eq("id", templateId)
          .single();

        if (tError) throw tError;

        if (existingTemplate) {
          setTemplate({
            title: existingTemplate.title || "",
            slug: existingTemplate.slug || "",
            category_id: existingTemplate.category_id || "",
            description: existingTemplate.description || "",
            price: existingTemplate.price ? parseInt(existingTemplate.price.toString().replace(/\D/g, "")) : 0,
            popular: existingTemplate.popular || false,
            content_html: existingTemplate.content || "",
          });

          // Fetch related companies
          const { data: relData } = await supabase
            .from("template_companies")
            .select("company_id")
            .eq("template_id", templateId);
          
          if (relData) {
            setSelectedCompanies(relData.map(r => r.company_id));
          }
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados:", err);
        setError("Não foi possível carregar os dados deste modelo.");
      } finally {
        setLoading(false);
      }
    }
    
    if (templateId) {
      fetchData();
    }
  }, [supabase, templateId]);

  // AUTO SCAN
  const generatedSchema = useMemo(() => {
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

  const handleSave = async () => {
    if (!template.title || !template.slug || !template.content_html) {
      setError("Preencha o título e o conteúdo da minuta.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const selectedCategory = categories.find(c => c.id === template.category_id);
      
      const { error: dbError } = await supabase
        .from("templates")
        .update({
          title: template.title,
          slug: template.slug,
          category: selectedCategory?.name || "Geral",
          category_id: template.category_id,
          content: template.content_html, 
          price: `${template.price} MT`,  
          popular: template.popular,
          form_schema: generatedSchema
        })
        .eq("id", templateId);

      if (dbError) throw dbError;

      // Update companies: simple approach - delete old and insert new
      const { error: delError } = await supabase
        .from("template_companies")
        .delete()
        .eq("template_id", templateId);
      
      if (delError) throw delError;

      if (selectedCompanies.length > 0) {
        const relations = selectedCompanies.map(compId => ({
          template_id: templateId,
          company_id: compId
        }));
        
        const { error: relError } = await supabase
          .from("template_companies")
          .insert(relations);
          
        if (relError) throw relError;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/templates?success=updated"), 2000);
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      setError(err.message || "Erro ao atualizar a minuta.");
    } finally {
      setSaving(false);
    }
  };

  const filteredVariables = useMemo(() => {
    return globalVariables.filter(v => 
      v.display_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.key_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [globalVariables, searchTerm]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#143361] border-t-transparent" />
          <p className="text-sm font-bold text-[#143361]">Carregando modelo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] pb-10">
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
                Editar: {template.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-bold mr-4 animate-pulse">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-[#00A86B] text-xs font-bold mr-4">
                <CheckCircle2 size={14} />
                Atualizado com sucesso!
              </div>
            )}
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#143361] px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-900 disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "A guardar..." : "Guardar Alterações"}
            </button>
          </div>
        </div>
      </header>
      <div className="h-14 w-full" />

      <main className="mx-auto max-w-[1600px] px-6 pt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 h-[calc(100vh-100px)]">
          
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

          <div className="lg:col-span-7 flex flex-col h-full bg-zinc-200/50 rounded-3xl border border-zinc-200 overflow-hidden relative">
            <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-blue-50 text-[#143361] border border-blue-100">
                  <FileCode size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#143361]">Editor de Minuta</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">Edite o conteúdo estrutural do documento</p>
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

          <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden h-full">
            <div className="p-5 border-b border-zinc-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-[#143361] text-white">
                  <Wand2 size={16} />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#143361]">Dicionário de Dados</h4>
              </div>

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

                if (groupItems.length === 0) return null;

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
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
