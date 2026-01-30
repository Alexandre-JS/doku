import { MessageCircle, Mail, ShieldCheck, FileText, HelpCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-[#0a1a35] py-12 text-white sm:mt-24 sm:py-20 lg:mt-32 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Brand Section */}
          <div className="flex flex-col items-center space-y-6 text-center md:items-start md:text-left">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo-tra.png" 
                alt="DOKU" 
                width={160} 
                height={40} 
                className="h-9 w-auto brightness-0 invert sm:h-10" 
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              A plataforma líder em Moçambique para geração de documentos oficiais de forma rápida, segura e legal.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 ring-1 ring-white/10">
              <span className="text-sm sm:text-lg">🇲🇿</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/80 sm:text-[10px]">Orgulhosamente feito em Moçambique</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Documentos</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/50 sm:mt-6">
              <li><Link href="/templates" className="hover:text-doku-green transition-colors">Todos os Modelos</Link></li>
              <li><Link href="/emprego-candidaturas" className="hover:text-doku-green transition-colors">Emprego & Candidaturas</Link></li>
              <li><Link href="/templates?category=Estado" className="hover:text-doku-green transition-colors">Concursos Públicos</Link></li>
              <li><Link href="/templates?category=Legal" className="hover:text-doku-green transition-colors">Documentos Legais</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Suporte</h4>
            <ul className="mt-4 space-y-4 text-sm text-white/50 sm:mt-6">
              <li>
                <a 
                  href="https://wa.me/258867563555" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-doku-green font-bold hover:scale-105 transition-transform"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 1.053 3.754 1.579 5.86 1.579h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Suporte
                </a>
              </li>
              <li>
                <a href="mailto:info@dokumoz.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail size={18} />
                  info@dokumoz.com
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
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Pagamento Seguro</h4>
            <p className="mt-4 text-xs font-medium uppercase tracking-tight text-white/40 sm:mt-6">
              Pagamento Seguro e Instantâneo
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div className="group relative">
                <Image 
                  src="/m-pesa.png" 
                  alt="M-Pesa" 
                  width={64} 
                  height={32} 
                  className="h-8 w-auto object-contain grayscale brightness-200 transition-all group-hover:grayscale-0 group-hover:brightness-100" 
                />
              </div>
              <div className="group relative">
                <Image 
                  src="/e-mola.png" 
                  alt="e-Mola" 
                  width={64} 
                  height={32} 
                  className="h-8 w-auto object-contain grayscale brightness-200 transition-all group-hover:grayscale-0 group-hover:brightness-100" 
                />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] text-white/30">
              <ShieldCheck size={14} className="text-doku-green" />
              <span>Processamento encriptado SSL</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t border-white/5 pt-8 md:mt-16 md:flex-row md:justify-between lg:mt-20">
          <p className="order-2 text-xs text-white/40 md:order-1">
            © {new Date().getFullYear()} DOKU. Todos os direitos reservados.
          </p>
          <div className="order-1 flex gap-6 text-xs text-white/40 md:order-2">
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
