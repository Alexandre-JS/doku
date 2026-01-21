"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "../../src/lib/supabase";
import { 
  CheckCircle2, 
  Check,
  User, 
  FileText, 
  CreditCard, 
  Download, 
  ExternalLink, 
  Calendar, 
  Clock, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Search,
  FileQuestion
} from "lucide-react";
import LogoLoading from "../../components/LogoLoading";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from "date-fns";
import { pt } from "date-fns/locale";

type ProfileForm = {
  full_name: string;
  father_name: string;
  mother_name: string;
  bi_number: string;
  bi_date_issue: string;
  bi_local_issue: string;
  nuit: string;
  birth_date: string;
  province: string;
  district: string;
  neighborhood: string;
  address_details: string;
  phone_number: string;
};

type UserDocument = {
  id: string;
  title: string;
  file_path: string;
  created_at: string;
  expires_at: string;
  order_id: string;
};

type Order = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  mpesa_ref: string;
  metadata: any;
};

const emptyForm: ProfileForm = {
  full_name: "",
  father_name: "",
  mother_name: "",
  bi_number: "",
  bi_date_issue: "",
  bi_local_issue: "",
  nuit: "",
  birth_date: "",
  province: "",
  district: "",
  neighborhood: "",
  address_details: "",
  phone_number: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"personal" | "documents" | "payments">("personal");
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  // States for new sections
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const supabase = createBrowserSupabase();

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();

    if (!auth?.user) {
      router.replace("/auth/login?redirectTo=/profile");
      return;
    }

    setUserId(auth.user.id);

    // Load Profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        father_name: profile.father_name || "",
        mother_name: profile.mother_name || "",
        bi_number: profile.bi_number || "",
        bi_date_issue: profile.bi_date_issue || "",
        bi_local_issue: profile.bi_local_issue || "",
        nuit: profile.nuit || "",
        birth_date: profile.birth_date || "",
        province: profile.province || "",
        district: profile.district || "",
        neighborhood: profile.neighborhood || "",
        address_details: profile.address_details || "",
        phone_number: profile.phone_number || "",
      });
    }

    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load Documents when tab changes
  useEffect(() => {
    if (activeTab === "documents" && userId) {
      const fetchDocs = async () => {
        setLoadingDocs(true);
        const { data, error } = await supabase
          .from("user_documents")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        
        if (!error) setDocuments(data || []);
        setLoadingDocs(false);
      };
      fetchDocs();
    }
  }, [activeTab, userId, supabase]);

  // Load Orders when tab changes
  useEffect(() => {
    if (activeTab === "payments" && userId) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        
        if (!error) setOrders(data || []);
        setLoadingOrders(false);
      };
      fetchOrders();
    }
  }, [activeTab, userId, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      ...form,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setError("Não foi possível salvar seu perfil.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDownload = async (filePath: string, title: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60); // 60 seconds validity
      
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      alert("Erro ao gerar link de download.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <LogoLoading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-blue-100 selection:text-blue-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Minha Conta
            </h1>
            <p className="text-slate-500 font-medium">
              Olá, <span className="text-slate-900 font-bold">{form.full_name.split(' ')[0] || 'Utilizador'}</span>. Gerencie seus dados e arquivos.
            </p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 ring-1 ring-slate-200/5">
             <TabButton 
                active={activeTab === "personal"} 
                onClick={() => setActiveTab("personal")}
                icon={<User size={18} />}
                label="Dados Pessoais"
             />
             <TabButton 
                active={activeTab === "documents"} 
                onClick={() => setActiveTab("documents")}
                icon={<FileText size={18} />}
                label="Meus Documentos"
             />
             <TabButton 
                active={activeTab === "payments"} 
                onClick={() => setActiveTab("payments")}
                icon={<CreditCard size={18} />}
                label="Pagamentos"
             />
          </div>
        </header>

        {/* Security Banner (Universal) */}
        <div className="mb-8 rounded-3xl bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          <div className="flex flex-col md:flex-row items-center gap-5 relative z-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-400 ring-1 ring-white/20 shadow-inner">
              <ShieldCheck size={32} />
            </div>
            <div className="text-center md:text-left">
              <p className="text-lg font-bold tracking-tight">Arquivamento Seguro Ativado</p>
              <p className="mt-1 text-sm text-slate-400 font-medium leading-relaxed">
                Os seus documentos são guardados por <span className="text-white font-bold">30 dias</span> após a compra. Após este período, eles são eliminados permanentemente para garantir a sua privacidade total.
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === "personal" && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSave} className="space-y-6">
                 {/* Identity Section */}
                 <ProfileSection title="Identidade" icon={<User size={20} className="text-blue-600" />}>
                   <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      <Field label="Nome completo" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Como no BI" />
                      <Field label="Nome do pai" name="father_name" value={form.father_name} onChange={handleChange} />
                      <Field label="Nome da mãe" name="mother_name" value={form.mother_name} onChange={handleChange} />
                      <Field label="Data de nascimento" name="birth_date" type="date" value={form.birth_date} onChange={handleChange} />
                      <Field label="Telefone" name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="+258" />
                   </div>
                 </ProfileSection>

                 {/* Docs Section */}
                 <ProfileSection title="Identificação Oficial" icon={<FileText size={20} className="text-blue-600" />}>
                   <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      <Field label="Número do BI" name="bi_number" value={form.bi_number} onChange={handleChange} />
                      <Field label="NUIT" name="nuit" value={form.nuit} onChange={handleChange} maxLength={9} />
                      <Field label="Data de emissão do BI" name="bi_date_issue" type="date" value={form.bi_date_issue} onChange={handleChange} />
                      <Field label="Local de emissão do BI" name="bi_local_issue" value={form.bi_local_issue} onChange={handleChange} />
                   </div>
                 </ProfileSection>

                 {/* Address Section */}
                 <ProfileSection title="Localização e Morada" icon={<Clock size={20} className="text-blue-600" />}>
                   <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      <Field label="Província" name="province" value={form.province} onChange={handleChange} />
                      <Field label="Distrito" name="district" value={form.district} onChange={handleChange} />
                      <Field label="Bairro" name="neighborhood" value={form.neighborhood} onChange={handleChange} />
                      <div className="md:col-span-2 lg:col-span-3">
                        <Field label="Endereço detalhado" name="address_details" value={form.address_details} onChange={handleChange} placeholder="Rua, Casa nº, Referências..." />
                      </div>
                   </div>
                 </ProfileSection>

                 <div className="flex justify-end pt-4 pb-10">
                    <button
                      type="submit"
                      disabled={saving}
                      className="group flex items-center justify-center gap-3 rounded-full bg-blue-600 px-10 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      {saving ? <LogoLoading size="sm" /> : "Atualizar Perfil"}
                      {!saving && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                 </div>
              </form>
            </motion.div>
          )}

          {activeTab === "documents" && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {loadingDocs ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                   {[1, 2, 3].map(i => <Skeleton key={i} />)}
                 </div>
              ) : documents.length === 0 ? (
                <EmptyState 
                  title="Nenhum arquivo arquivado" 
                  description="Os documentos que você comprar aparecerão aqui para download por 30 dias."
                  actionLabel="Explorar Modelos"
                  onAction={() => router.push('/templates')}
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                   {documents.map(doc => (
                     <DocumentCard 
                        key={doc.id} 
                        doc={doc} 
                        onDownload={() => handleDownload(doc.file_path, doc.title)} 
                     />
                   ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "payments" && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {loadingOrders ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 w-full animate-pulse bg-slate-200 rounded-2xl" />)}
                </div>
              ) : orders.length === 0 ? (
                <EmptyState 
                  title="Sem histórico de pagamentos" 
                  description="Suas transações via M-Pesa e e-Mola serão listadas aqui."
                  actionLabel="Comprar Minuta"
                  onAction={() => router.push('/templates')}
                />
              ) : (
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-20">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                         <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</th>
                         <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Referência</th>
                         <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</th>
                         <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                             <span className="text-sm font-bold text-slate-900">{format(new Date(order.created_at), 'dd MMM, yyyy', { locale: pt })}</span>
                          </td>
                          <td className="px-6 py-4 uppercase font-mono text-xs text-slate-500">{order.mpesa_ref}</td>
                          <td className="px-6 py-4 font-black text-slate-900">{order.amount} MT</td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                               order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                             }`}>
                               {order.status === 'COMPLETED' ? 'Sucesso' : 'Pendente'}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-2xl ring-1 ring-white/10"
          >
            <CheckCircle2 className="text-emerald-400" size={18} />
            Perfil atualizado com sucesso!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Components ---

function TabButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
        active ? "text-blue-600 bg-blue-50/50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {active && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-2 right-2 h-[2px] bg-blue-600 rounded-full" />}
    </button>
  );
}

function ProfileSection({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">{icon}</div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, type = "text", maxLength }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-2xl border border-slate-200 bg-[#F9FAFB] px-4 py-3.5 text-sm font-bold text-slate-900 transition-all focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function DocumentCard({ doc, onDownload }: { doc: UserDocument, onDownload: () => void }) {
  const expiryDate = new Date(doc.expires_at);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isExpiringSoon = daysRemaining <= 5;
  
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm flex flex-col group hover:shadow-xl hover:border-slate-300 transition-all duration-300 relative overflow-hidden">
      {/* Background Gradient Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-100/50 transition-colors" />
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <DocumentThumbnail title={doc.title} />
        
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ring-1 ${
          isExpiringSoon 
            ? "bg-red-50 text-red-600 ring-red-100 shadow-red-100" 
            : "bg-emerald-50 text-emerald-600 ring-emerald-100 shadow-emerald-100"
        }`}>
          {daysRemaining === 0 ? "Expirado" : `Expira em ${daysRemaining} dias`}
        </div>
      </div>
      
      <div className="space-y-1 mb-6 relative z-10">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-tight">
          {doc.title}
        </h3>
        <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Calendar size={12} className="text-slate-300" />
          {format(new Date(doc.created_at), 'dd MMM, yyyy', { locale: pt })}
        </p>
      </div>
      
      <div className="mt-auto flex gap-2 relative z-10">
         <button 
           onClick={onDownload}
           className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
         >
           <Download size={14} />
           Download PDF
         </button>
         <button className="p-3.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100">
           <ExternalLink size={16} />
         </button>
      </div>
    </div>
  );
}

function DocumentThumbnail({ title }: { title: string }) {
  return (
    <div className="h-20 w-16 bg-white border-2 border-slate-100 rounded-lg shadow-sm relative overflow-hidden flex flex-col p-1.5 group-hover:border-blue-100 transition-colors">
      {/* Top Bar Decoration */}
      <div className="h-1 w-full bg-slate-50 rounded-full mb-2 group-hover:bg-blue-50" />
      
      {/* Visual Dummy Lines */}
      <div className="space-y-1.5 flex-1">
        <div className="h-0.5 w-[80%] bg-slate-50 rounded-full" />
        <div className="h-0.5 w-full bg-slate-50 rounded-full" />
        <div className="h-0.5 w-[60%] bg-slate-50 rounded-full" />
        <div className="h-0.5 w-[90%] bg-slate-50 rounded-full" />
        <div className="h-0.5 w-[40%] bg-slate-50 rounded-full" />
      </div>

      {/* Center Icon Mockup */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
        <FileText size={24} className="text-slate-400 group-hover:text-blue-500" />
      </div>

      {/* Signature/Stamp Mockup */}
      <div className="flex justify-end mt-1">
        <div className="h-3 w-3 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Check size={6} className="text-blue-500" />
        </div>
      </div>
      
      {/* Fold Detail Effect */}
      <div className="absolute top-0 right-0 w-4 h-4 bg-slate-50/50 transform rotate-45 translate-x-3 -translate-y-3 border-l border-b border-slate-100" />
    </div>
  );
}

function EmptyState({ title, description, actionLabel, onAction }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-300">
      <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
        <FileQuestion size={40} />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">{description}</p>
      <button 
        onClick={onAction}
        className="mt-8 px-8 py-3.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex flex-col animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-14 w-14 bg-slate-100 rounded-2xl" />
        <div className="h-6 w-24 bg-slate-50 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-slate-100 rounded-full" />
      <div className="h-3 w-1/2 bg-slate-50 rounded-full mt-2" />
      <div className="h-10 w-full bg-slate-50 rounded-xl mt-6" />
    </div>
  );
}
