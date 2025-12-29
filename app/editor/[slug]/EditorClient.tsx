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
            <span className="text-sm font-bold tracking-tight">DOKU EDITOR</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{template.title}</span>
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          
          {/* Lado Esquerdo: Formulário */}
          <section className="space-y-8">
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Preencha os dados</h2>
                <p className="text-slate-500">As informações abaixo serão inseridas automaticamente no documento.</p>
              </div>
              
              <DynamicForm 
                schema={template.form_schema} 
                initialData={profileData} 
                onChange={setFormData}
                onNext={handleConfirm}
              />
            </div>
          </section>

          {/* Lado Direito: Preview em tempo real */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Pré-visualização em tempo real</p>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600 uppercase">Auto-save</span>
              </div>
              
              <div className="scale-[0.6] origin-top transform shadow-2xl rounded-lg overflow-hidden border border-slate-200">
                <DocumentPreview 
                  userData={formData}
                  template={template.content_html}
                  price={template.price.toString()}
                  onBack={() => {}} 
                  onConfirm={handleConfirm}
                  hideControls={true}
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
