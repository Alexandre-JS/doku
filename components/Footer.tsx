import { MessageCircle, Mail, ShieldCheck, FileText, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-doku-blue py-16 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-tra.png" alt="DOKU" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="text-sm text-white/70 leading-relaxed">
              A plataforma líder em Moçambique para geração de documentos oficiais de forma rápida, segura e legal.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Documentos</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li><Link href="/templates" className="hover:text-white transition-colors">Todos os Modelos</Link></li>
              <li><Link href="/templates?category=Estado" className="hover:text-white transition-colors">Concursos Públicos</Link></li>
              <li><Link href="/templates?category=Legal" className="hover:text-white transition-colors">Documentos Legais</Link></li>
              <li><Link href="/templates?category=Emprego" className="hover:text-white transition-colors">Recursos Humanos</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Suporte</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li>
                <a 
                  href="https://wa.me/258840000000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-doku-green font-semibold hover:text-doku-green/80 transition-colors"
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
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Aceitamos os principais métodos de pagamento móvel em Moçambique para sua total conveniência.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <img src="/m-pesa.png" alt="M-Pesa" className="h-10 w-auto object-contain brightness-0 invert opacity-80" />
              <img src="/e-mola.png" alt="e-Mola" className="h-10 w-auto object-contain brightness-0 invert opacity-80" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-white/40">
              <ShieldCheck size={14} className="text-doku-green" />
              <span>Processamento encriptado e seguro</span>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-white/80">
            © {new Date().getFullYear()} DOKU. Todos os direitos reservados.{" "}
            <Link href="/termos" className="text-white hover:text-doku-green underline-offset-4 hover:underline">Termos de Uso</Link> |{" "}
            <Link href="/privacidade" className="text-white hover:text-doku-green underline-offset-4 hover:underline">Política de Privacidade</Link>
          </p>
          <p className="text-[10px] text-white/70 max-w-md md:text-right leading-relaxed">
            <span className="font-bold text-white">Nota:</span> O DOKU gera modelos baseados em normas vigentes, mas não substitui a consulta de um advogado para casos jurídicos complexos.
          </p>
        </div>
      </div>
    </footer>
  );
}
