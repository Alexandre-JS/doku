"use client";

import { CircleCheckBig, Download, MessageCircle, Mail, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center">
        {/* Success Animation */}
        <div className="mb-8 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CircleCheckBig size={64} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Documento Pronto!</h1>
        <p className="mt-3 text-lg text-slate-600">
          Seu documento foi gerado com sucesso e está pronto para download.
        </p>

        {/* Document Preview Card */}
        <div className="mt-10 w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText size={24} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-slate-900">Requerimento_Emprego.pdf</h3>
              <p className="text-sm text-slate-500">PDF • 142 KB</p>
            </div>
          </div>
        </div>

        {/* Main Action */}
        <button className="mt-8 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98]">
          <Download size={24} />
          Baixar PDF
        </button>

        {/* Persistence Message */}
        <p className="mt-6 text-sm text-slate-500">
          Uma cópia também foi enviada para o seu perfil e email.
        </p>

        {/* Secondary Actions */}
        <div className="mt-10 w-full space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Compartilhar</p>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 font-bold text-white transition-all hover:bg-emerald-600 active:scale-95">
              <MessageCircle size={20} />
              WhatsApp
            </button>
            <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-200 font-bold text-slate-700 transition-all hover:bg-slate-300 active:scale-95">
              <Mail size={20} />
              Email
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-16 border-t border-slate-200 pt-8">
          <p className="text-sm text-slate-600">
            Teve algum problema?{" "}
            <a href="#" className="font-bold text-emerald-600 hover:underline">
              Contacte o nosso suporte via WhatsApp
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
