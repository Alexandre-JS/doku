"use client";

import { useState, useEffect } from "react";
import { CircleCheckBig, Download, MessageCircle, Mail, FileText, ArrowRight, Printer, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  const [docTitle, setDocTitle] = useState("Documento");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const savedTitle = localStorage.getItem("doku_current_doc_title");
    const savedId = localStorage.getItem("doku_current_template_id");
    const savedData = localStorage.getItem("doku_form_data");
    
    if (savedTitle) setDocTitle(savedTitle);
    if (savedId) setTemplateId(savedId);
    
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setFormData(data);
        if (data.full_name) {
          setUserName(data.full_name);
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      }
    }
  }, []);

  const handleDownload = async () => {
    if (!templateId || !formData) {
      alert("Dados do documento não encontrados. Por favor, tente gerar novamente.");
      return;
    }

    setIsDownloading(true);
    try {
      // Nota: Na página de sucesso, assumimos que o pagamento já foi validado 
      // ou que o documento é grátis. No entanto, a API /api/generate-pdf 
      // ainda vai pedir paymentReference se for pago. 
      // Por agora, usamos isto para documentos grátis ou fluxos que já tenham a ref.
      
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          userData: formData,
          title: docTitle
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar PDF no servidor');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DOKU_${docTitle.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      alert("Erro ao baixar o documento. Por favor, tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  const fileName = `${docTitle.replace(/\s+/g, '_')}_${userName.split(' ')[0] || 'Doku'}.pdf`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center">
        {/* Success Animation */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CircleCheckBig size={64} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Documento Pronto!</h1>
        <p className="mt-3 text-lg text-slate-600">
          {userName ? `Parabéns, ${userName.split(' ')[0]}!` : "Parabéns!"} Seu documento foi gerado com sucesso.
        </p>

        {/* Document Preview Card */}
        <div className="mt-10 w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText size={24} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-slate-900">{fileName}</h3>
              <p className="text-sm text-slate-500">PDF • Oficial • Pronto para imprimir</p>
            </div>
          </div>
        </div>

        {/* Main Action */}
        <button 
          onClick={handleDownload}
          className="mt-8 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98]"
        >
          <Download size={24} />
          Baixar PDF Agora
        </button>

        {/* Printing Tips */}
        <div className="mt-8 w-full rounded-2xl bg-blue-50 p-6 text-left ring-1 ring-blue-100">
          <div className="flex items-center gap-3 text-blue-900 font-bold mb-2">
            <Printer size={18} />
            Dica de Mestre
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            Para um resultado profissional, imprima em papel A4 de 80g ou superior. Certifique-se de que a escala de impressão está em 100% (Tamanho Real).
          </p>
        </div>

        {/* Secondary Actions */}
        <div className="mt-10 w-full space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Outras Opções</p>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 font-bold text-white transition-all hover:bg-emerald-600 active:scale-95">
              <MessageCircle size={20} />
              WhatsApp
            </button>
            <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-200 font-bold text-slate-700 transition-all hover:bg-slate-300 active:scale-95">
              <Mail size={20} />
              Enviar por Email
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-16 border-t border-slate-200 pt-8">
          <p className="text-sm text-slate-600">
            Teve algum problema com o download?{" "}
            <a href="https://wa.me/258847563555" target="_blank" className="font-bold text-emerald-600 hover:underline">
              Fale com o suporte agora
            </a>
          </p>
        </div>

        {/* Back to Home */}
        <Link href="/" className="mt-12 flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-900">
          Voltar ao Início
          <ArrowRight size={16} />
        </Link>
      </main>
    </div>
  );
}
  