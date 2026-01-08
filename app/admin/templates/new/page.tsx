"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Save, FileCode, CheckCircle2, AlertCircle, ArrowLeft, Settings2, Layout, Layers, Building2, Tag } from "lucide-react";
import Link from "next/link";
import { createBrowserSupabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Category, Company } from "@/src/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dados do DB
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  // Estados do Modelo
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
      const [cats, comps] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("companies").select("*").order("name")
      ]);

      if (cats.data) setCategories(cats.data);
      if (comps.data) setCompanies(comps.data);
      
      if (cats.data && cats.data.length > 0) {
        setTemplate(prev => ({ ...prev, category_id: cats.data[0].id }));
      }
    }
    fetchData();
  }, [supabase]);

  // Estado do Form Schema (JSON dinâmico)
  const [fields, setFields] = useState<AdminFormField[]>([
    { id: "full_name", label: "Nome Completo", type: "text", required: true, placeholder: "Ex: João Silva" },
  ]);

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

  // Funções de Gerenciamento de Campos
  const addField = () => {
    setFields([
      ...fields,
      { id: `campo_${fields.length + 1}`, label: "Novo Campo", type: "text", required: true }
    ]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<AdminFormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  // Validação de Placeholders vs Schema
  const placeholdersNotFound = useMemo(() => {
    const matches = template.content_html.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) || [];
    const extractedKeys = matches.map(m => m.replace(/\{\{\s*|\s*\}\}/g, ""));
    const schemaKeys = fields.map(f => f.id);
    
    return Array.from(new Set(extractedKeys.filter(key => 
      !schemaKeys.includes(key) && 
      !['date', 'current_date', 'full_name'].includes(key) // Ignorar campos globais conhecidos
    )));
  }, [template.content_html, fields]);

  // Salvar no Supabase
  const handleSave = async () => {
    if (!template.title || !template.slug || !template.content_html) {
      setError("Preencha título, slug e conteúdo antes de salvar.");
      return;
    }

    if (placeholdersNotFound.length > 0) {
      setError(`Os seguintes placeholders não possuem campos no formulário: ${placeholdersNotFound.join(", ")}`);
      return;
    }

    setLoading(true);
    setError(null);

    // Formatar form_schema para o padrão do projeto (Wrapped em seções)
    const formattedSchema = [
      {
        section: "Dados do Documento",
        fields: fields.map(f => ({
          ...f,
          options: f.type === 'select' ? f.options?.split(",").map(o => o.trim()) : undefined,
          source: 'user_input'
        }))
      }
    ];

    try {
      // 1. Inserir o modelo
      const { data: newTemplate, error: dbError } = await supabase
        .from("document_templates")
        .insert({
          title: template.title,
          slug: template.slug,
          category_id: template.category_id,
          description: template.description,
          price: template.price,
          popular: template.popular,
          content_html: template.content_html,
          form_schema: formattedSchema,
          is_active: true
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 2. Lincar empresas se houver
      if (selectedCompanies.length > 0 && newTemplate) {
        const relations = selectedCompanies.map(companyId => ({
          template_id: newTemplate.id,
          company_id: companyId
        }));
        
        const { error: relError } = await supabase
          .from("template_companies")
          .insert(relations);
          
        if (relError) console.error("Erro ao vincular empresas:", relError);
      }

      setSuccess(true);
      setTimeout(() => router.push("/templates"), 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar o modelo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
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
              <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">Admin / Novo Modelo</h1>
            </div>
            
            <Link 
              href="/admin/settings" 
              className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
            >
              <Settings2 size={14} />
              GERIR CATEGORIAS/EMPRESAS
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {error && (
              <div className="hidden md:flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse">
                <AlertCircle size={14} />
                <span>Erro na Validação</span>
              </div>
            )}
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Salvando..." : "Publicar Modelo"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          
          {/* Lado Esquerdo: Configuração */}
          <div className="lg:col-span-4 space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Layout size={20} />
                </div>
                <h3 className="font-bold text-slate-900">Configurações Base</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Título do Documento</label>
                  <input 
                    type="text" 
                    value={template.title}
                    onChange={handleTitleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: Requerimento de Emprego"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Slug (URL)</label>
                  <input 
                    type="text" 
                    value={template.slug}
                    onChange={(e) => setTemplate({ ...template, slug: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-500 focus:outline-none"
                    placeholder="requerimento-de-emprego"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Descrição Curta</label>
                  <textarea 
                    value={template.description}
                    onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Breve resumo para o card..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Categoria</label>
                    <select 
                       value={template.category_id}
                       onChange={(e) => setTemplate({ ...template, category_id: e.target.value })}
                       className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium focus:outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Preço (MT)</label>
                    <input 
                      type="number" 
                      value={template.price}
                      onChange={(e) => setTemplate({ ...template, price: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Seção de Empresas */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <Building2 size={12} />
                    Empresas Relacionadas
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto no-scrollbar p-1">
                    {companies.map(company => (
                      <label 
                        key={company.id} 
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedCompanies.includes(company.id) 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-7 w-7 border border-slate-200">
                            <AvatarImage src={company.logo_url} alt={company.name} />
                            <AvatarFallback className="text-[10px] font-bold bg-slate-100">
                              {company.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold">{company.name}</span>
                        </div>
                        <input 
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedCompanies.includes(company.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCompanies([...selectedCompanies, company.id]);
                            } else {
                              setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
                            }
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Modelo Popular?</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tight">Destaque na Home</p>
                  </div>
                  <button 
                    onClick={() => setTemplate({ ...template, popular: !template.popular })}
                    className={`h-6 w-11 rounded-full p-1 transition-colors ${template.popular ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${template.popular ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Gerador de Formulário */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <Layers size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900">Formulário (JSON)</h3>
                </div>
                <button 
                  onClick={addField}
                  className="p-2 rounded-full bg-slate-900 text-white hover:scale-110 transition-transform"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {fields.map((field, index) => (
                  <div key={index} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3 relative group">
                    <button 
                      onClick={() => removeField(index)}
                      className="absolute top-2 right-2 p-1.5 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">ID (Mapeado no texto)</label>
                        <input 
                          type="text" 
                          value={field.id}
                          onChange={(e) => updateField(index, { id: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Tipo de Campo</label>
                        <select 
                          value={field.type}
                          onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                        >
                          <option value="text">Texto Curto</option>
                          <option value="textarea">Texto Longo</option>
                          <option value="date">Data</option>
                          <option value="select">Seleção</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Label (O que o usuário vê)</label>
                      <input 
                        type="text" 
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium"
                      />
                    </div>

                    {field.type === 'select' && (
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Opções (Separadas por vírgula)</label>
                        <input 
                          type="text" 
                          value={field.options}
                          onChange={(e) => updateField(index, { options: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                          placeholder="Opção 1, Opção 2, Opção 3"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lado Direito: Editor de Conteúdo */}
          <div className="lg:col-span-8 flex flex-col h-full">
            <div className="flex-1 rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm flex flex-col min-h-[700px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <FileCode size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900">Conteúdo do Documento (HTML/Text)</h3>
                </div>
                {placeholdersNotFound.length > 0 ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider">
                    <AlertCircle size={14} />
                    Placeholders Faltantes: {placeholdersNotFound.length}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 size={14} />
                    Placeholders Mapeados
                  </div>
                )}
              </div>

              <div className="relative flex-1">
                <textarea 
                  value={template.content_html}
                  onChange={(e) => setTemplate({ ...template, content_html: e.target.value })}
                  className="w-full h-full min-h-[500px] p-6 rounded-2xl bg-slate-50 border border-slate-100 font-mono text-sm leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="Olá Sr. {{full_name}},\n\nPelo presente venho solicitar {{subject}}..."
                />
                
                <div className="absolute top-4 right-4 text-[9px] font-bold text-slate-300 uppercase select-none">
                  Use {"{{placeholder}}"} para campos dinâmicos
                </div>
              </div>

              {placeholdersNotFound.length > 0 && (
                <div className="mt-8 p-4 rounded-2xl bg-red-50 border border-red-100">
                  <p className="text-xs font-bold text-red-900 mb-2">Atenção! Placeholders sem campos correspondentes:</p>
                  <div className="flex flex-wrap gap-2">
                    {placeholdersNotFound.map(key => (
                      <span key={key} className="px-2 py-1 rounded bg-white border border-red-200 text-red-600 font-mono text-[10px]">
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Overlay de Sucesso */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="rounded-[3rem] bg-white p-12 text-center shadow-2xl max-w-sm"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Publicado!</h2>
              <p className="mt-2 text-slate-500 font-medium">O novo modelo já está disponível para os usuários.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
