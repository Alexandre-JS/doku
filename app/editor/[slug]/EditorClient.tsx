'use client';

import { useState } from 'react';
import DynamicForm from '@/components/DynamicForm';
import DocumentPreview from '@/components/DocumentPreview';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EditorClientProps {
  template: any;
  profileData: any;
}

export default function EditorClient({ template, profileData }: EditorClientProps) {
  const [formData, setFormData] = useState(profileData);
  const router = useRouter();

  const handleConfirm = () => {
    // Salvar dados no localStorage antes de ir para o checkout
    localStorage.setItem("doku_form_data", JSON.stringify(formData));
    localStorage.setItem("doku_current_template_content", template.content);
    localStorage.setItem("doku_current_doc_title", template.title);
    localStorage.setItem("doku_current_price", template.price?.toString() || "0");
    
    // Lógica para salvar ou ir para checkout
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/templates" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Voltar aos modelos</span>
          </Link>
          <div className="flex flex-col items-center">
            <Link href="/">
              <img src="/logo-tra.png" alt="DOKU" className="h-8 w-auto" />
            </Link>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{template.title}</span>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          
          {/* Lado Esquerdo: Formulário (col-span-8) */}
          <section className="lg:col-span-8 space-y-8">
            <div className="relative">
              <div className="mb-8 px-4">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Preencha os dados</h2>
                <p className="text-slate-500 mt-2">As informações abaixo serão inseridas automaticamente no documento.</p>
              </div>
              
              <DynamicForm 
                schema={template.form_schema} 
                initialData={profileData} 
                onChange={setFormData}
                onNext={handleConfirm}
              />
            </div>
          </section>

          {/* Lado Direito: Preview em tempo real (col-span-4 e sticky) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="h-[calc(100vh-140px)] shadow-sm rounded-2xl overflow-hidden border border-slate-200 bg-white flex flex-col">
              <DocumentPreview 
                userData={formData}
                template={template.content}
                price={String(template?.price || "0")}
                title={template.title}
                onBack={() => {}} 
                onConfirm={handleConfirm}
                isReadOnly={true}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
