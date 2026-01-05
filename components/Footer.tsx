import { MessageCircle, Mail, ShieldCheck, FileText, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-white/5 bg-[#0a1a35] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-tra.png" alt="DOKU" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              A plataforma líder em Moçambique para geração de documentos oficiais de forma rápida, segura e legal.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 ring-1 ring-white/10">
              <span className="text-lg">🇲🇿</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Orgulhosamente feito em Moçambique</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Documentos</h4>
            <ul className="mt-6 space-y-3 text-sm text-white/50">
              <li><Link href="/templates" className="hover:text-doku-green transition-colors">Todos os Modelos</Link></li>
              <li><Link href="/templates?category=Estado" className="hover:text-doku-green transition-colors">Concursos Públicos</Link></li>
              <li><Link href="/templates?category=Legal" className="hover:text-doku-green transition-colors">Documentos Legais</Link></li>
              <li><Link href="/templates?category=Emprego" className="hover:text-doku-green transition-colors">Recursos Humanos</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Suporte</h4>
            <ul className="mt-6 space-y-4 text-sm text-white/50">
              <li>
                <a 
                  href="https://wa.me/258840000000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-doku-green font-bold hover:scale-105 transition-transform"
                >
                  <MessageCircle size={18} />
                  WhatsApp Suporte
                </a>
              </li>
              <li>
                <a href="mailto:suporte@doku.co.mz" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail size={18} />
                  suporte@doku.co.mz
                </a>
              </li>
              <li>
                <Link href="/faq" className="flex items-center gap-2 hover:text-white transition-colors">
                  <HelpCircle size={18} />
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Section */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Pagamento Seguro</h4>
            <p className="mt-6 text-xs font-medium text-white/40 uppercase tracking-tight">
              Pagamento Seguro e Instantâneo
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div className="group relative">
                <img src="/m-pesa.png" alt="M-Pesa" className="h-8 w-auto object-contain grayscale brightness-200 transition-all group-hover:grayscale-0 group-hover:brightness-100" />
              </div>
              <div className="group relative">
                <img src="/e-mola.png" alt="e-Mola" className="h-8 w-auto object-contain grayscale brightness-200 transition-all group-hover:grayscale-0 group-hover:brightness-100" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] text-white/30">
              <ShieldCheck size={14} className="text-doku-green" />
              <span>Processamento encriptado SSL</span>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} DOKU. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-xs text-white/40">
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
