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
  Type as TypeIcon
} from "lucide-react";
import Link from "next/link";
import { createBrowserSupabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Company } from "@/src/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Interface para Variáveis Globais com Agrupamento
interface GlobalVariable {
  id: string;
  name: string;
  description: string;
  category: 'Dados do Perfil' | 'Dados da Minuta' | 'Outros';
  icon?: any;
}

const STATIC_VARIABLES: GlobalVariable[] = [
  { id: 'nome_completo', name: 'Nome Completo', description: 'Nome do perfil', category: 'Dados do Perfil', icon: User },
  { id: 'bi_numero', name: 'Nº de B.I / Passaporte', description: 'Documento', category: 'Dados do Perfil', icon: CreditCard },
  { id: 'nuit', name: 'Nº de NUIT', description: 'Número fiscal', category: 'Dados do Perfil', icon: Hash },
  { id: 'endereco', name: 'Morada / Domicílio', description: 'Endereço', category: 'Dados do Perfil', icon: MapPin },
  { id: 'nacionalidade', name: 'Nacionalidade', description: 'País', category: 'Dados do Perfil', icon: Flag },
  { id: 'estado_civil', name: 'Estado Civil', description: 'Estado civil', category: 'Dados do Perfil', icon: Heart },
  { id: 'data_actual', name: 'Data Extenso', description: 'Data do dia', category: 'Dados da Minuta', icon: Calendar },
];

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data from DB
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>(STATIC_VARIABLES);
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

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      const [cats, comps, vars] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("companies").select("*").order("name"),
        supabase.from("global_variables").select("*").order("name")
      ]);

      if (cats.data) setCategories(cats.data);
      if (comps.data) setCompanies(comps.data);
      if (vars.data && vars.data.length > 0) {
        // Merge DB variables with statics, avoiding duplicates
        const dbVars: GlobalVariable[] = vars.data.map((v: any) => ({
          id: v.key_name, // Usamos o slug (ex: full_name) como ID para as tags {{}}
          name: v.display_label,
          description: "",
          category: (v.category === 'profile' ? 'Dados do Perfil' : 'Outros') as GlobalVariable['category'],
          icon: STATIC_VARIABLES.find(s => s.id === v.key_name)?.icon || TypeIcon
        }));
        
        const merged = [...STATIC_VARIABLES];
        dbVars.forEach((dv) => {
          if (!merged.find(m => m.id === dv.id)) {
            merged.push(dv);
          }
        });
        setGlobalVariables(merged);
      }

      if (cats.data && cats.data.length > 0) {
        setTemplate(prev => ({ ...prev, category_id: cats.data[0].id }));
      }
    }
    fetchData();
  }, [supabase]);

  // AUTO SCAN: Gera o form_schema baseado no conteúdo do editor
  const generatedSchema = useMemo(() => {
    const matches = template.content_html.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) || [];
    const keys = Array.from(new Set(matches.map(m => m.replace(/\{\{\s*|\s*\}\}/g, ""))));
    
    const fields = keys.map(key => {
      const globalVar = globalVariables.find(v => v.id === key);
      return {
        id: key,
        label: globalVar ? globalVar.name : key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        type: key.includes("data") ? "date" : key.includes("descricao") ? "textarea" : "text",
        required: true,
        source: globalVar?.category === 'Dados do Perfil' ? 'profile' : 'user_input'
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
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = template.content_html;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const varTag = `{{${id}}}`;

    const newContent = before + varTag + after;
    setTemplate({ ...template, content_html: newContent });

    // Reset cursor after insert (deferred)
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + varTag.length, start + varTag.length);
      }
    }, 10);
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
      setTimeout(() => router.push("/templates"), 2000);
    } catch (err: any) {
      console.error("Erro detalhado no salvamento:", err);
      setError(err.message || "Erro ao salvar a minuta.");
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
          
          {/* Lado Esquerdo: Configurações do Modelo */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Layout size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm italic">Ficha Técnica</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Título</label>
                  <input 
                    type="text" 
                    value={template.title}
                    onChange={handleTitleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
                    placeholder="Ex: Minuta de Emprego"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Preço (MT)</label>
                  <input 
                    type="number" 
                    value={template.price}
                    onChange={(e) => setTemplate({ ...template, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Categoria</label>
                  <select 
                     value={template.category_id}
                     onChange={(e) => setTemplate({ ...template, category_id: e.target.value })}
                     className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Multi-select de Empresas */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <Building2 size={12} />
                    Parceiros Relacionados
                  </label>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar p-1">
                    {companies.map(company => (
                      <label 
                        key={company.id} 
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                          selectedCompanies.includes(company.id) 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border border-slate-200">
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

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-amber-500" />
                    <p className="font-bold text-slate-900 text-xs uppercase tracking-tighter">Destaque</p>
                  </div>
                  <button 
                    onClick={() => setTemplate({ ...template, popular: !template.popular })}
                    className={`h-5 w-9 rounded-full p-1 transition-colors ${template.popular ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`h-3 w-3 rounded-full bg-white transition-transform ${template.popular ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview do Esquema Gerado */}
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={16} className="text-blue-400" />
                <h4 className="text-xs font-black uppercase tracking-widest">Auto Schema</h4>
              </div>
              <div className="space-y-3">
                {generatedSchema[0].fields.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">Escreva {"{{variavel}}"} no texto...</p>
                ) : (
                  generatedSchema[0].fields.map(f => (
                    <div key={f.id} className="flex items-center justify-between py-1.5 border-b border-white/5">
                      <span className="text-[10px] font-mono text-blue-300">{"{{"}{f.id}{"}}"}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{f.source === 'profile' ? 'Prefill' : 'Manual'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Lado Direito: Editor + Dicionário de Variáveis */}
          <div className="lg:col-span-9 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[700px]">
            
            {/* Editor de Texto (Left Column of 9) */}
            <div className="lg:col-span-9 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <FileCode size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900">Corpo da Minuta</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
                  <Info size={14} />
                  Use {"{{id_da_variavel}}"} para campos dinâmicos
                </div>
              </div>

              <div className="relative flex-1">
                <textarea 
                  ref={textareaRef}
                  value={template.content_html}
                  onChange={(e) => setTemplate({ ...template, content_html: e.target.value })}
                  className="w-full h-full min-h-[500px] p-8 rounded-2xl bg-white border border-slate-100 font-serif text-lg leading-relaxed text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-100 no-scrollbar"
                  placeholder="Ex: Eu, {{nome_completo}}, titular do BI nº {{bi_numero}}..."
                />
              </div>
            </div>

            {/* Dicionário de Variáveis (Right Column of 9) */}
            <div className="lg:col-span-3 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 rounded-lg bg-blue-500 text-white">
                  <Wand2 size={16} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-tight text-slate-900">Dicionário</h4>
              </div>

              <div className="space-y-6 overflow-y-auto pr-2 no-scrollbar">
                {['Dados do Perfil', 'Dados da Minuta', 'Outros'].map(group => {
                  const items = globalVariables.filter(v => v.category === group);
                  if (items.length === 0) return null;

                  return (
                    <div key={group}>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">{group}</p>
                      <div className="space-y-2">
                        {items.map(v => (
                          <button 
                            key={v.id}
                            onClick={() => insertVariable(v.id)}
                            className="w-full group flex items-start gap-3 p-3 rounded-2xl border border-slate-50 bg-slate-50/30 text-left hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                          >
                            <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-100 text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm">
                              {v.icon ? <v.icon size={12} /> : <TypeIcon size={12} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-700 leading-tight mb-0.5">{v.name}</p>
                              <code className="text-[9px] font-mono font-medium text-blue-400 opacity-70">
                                {"{{"}{v.id}{"}}"}
                              </code>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100">
                 <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-800 flex items-center gap-2 mb-1">
                      <Info size={12} />
                      Dica Senior
                    </p>
                    <p className="text-[9px] text-amber-900/60 leading-relaxed font-medium">
                      O formulário é gerado automaticamente enquanto você escreve. Basta clicar em uma variável acima para inseri-la.
                    </p>
                 </div>
              </div>
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="rounded-[3rem] bg-white p-10 text-center shadow-2xl max-w-sm w-full"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Minuta Publicada!</h2>
              <p className="mt-2 text-sm text-slate-500 font-medium">Os dados foram sincronizados e o formulário gerado com sucesso.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right duration-500">
          <div className="flex items-center gap-3 rounded-2xl bg-red-600 p-4 text-white shadow-xl shadow-red-200">
            <AlertCircle size={20} />
            <div className="pr-4">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Falha ao Salvar</p>
              <p className="text-xs font-bold">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-lg">
              <Plus size={16} className="rotate-45" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
