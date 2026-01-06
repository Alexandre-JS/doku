import jsPDF from 'jspdf';

interface UserData {
  [key: string]: string;
}

// Função para substituir placeholders no texto
const parseTemplate = (template: string, userData: UserData): string => {
  let parsed = template;
  for (const key in userData) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    parsed = parsed.replace(regex, userData[key] || "");
  }
  // Limpa placeholders não preenchidos
  parsed = parsed.replace(/\{\{[^}]+\}\}/g, "");
  return parsed;
};

export type LayoutType = 'OFFICIAL' | 'DECLARATION' | 'LETTER';

export const generatePDF = (userData: UserData, template: string, title: string, layoutType?: LayoutType, shouldDownload: boolean = true) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Detecta se o template já inclui placeholders para cabeçalho/rodapé
  const templateHasHeader = typeof template === 'string' && /\{\{\s*(target_authority|destinatary_role|institution_name|target_location|address|subject)\s*\}\}/i.test(template);
  const templateHasFooter = typeof template === 'string' && /\{\{\s*(current_city|current_date|target_location)\s*\}\}/i.test(template);
  
  // Verifica se o template já começa com um cabeçalho formal (texto estático)
  const hasStaticHeader = typeof template === 'string' && /^\s*(EXMO|EXCELENTÍSSIMO|ILUSTRÍSSIMO)/i.test(template.trim());

  // Inferir o layout se não for passado explicitamente
  const effectiveLayout = layoutType || (
    title?.toLowerCase().includes('requerimento') ? 'OFFICIAL' :
    (title?.toLowerCase().includes('declaração') || title?.toLowerCase().includes('compromisso') || title?.toLowerCase().includes('contrato')) ? 'DECLARATION' :
    (title?.toLowerCase().includes('carta') || title?.toLowerCase().includes('manifestação')) ? 'LETTER' :
    'OFFICIAL'
  );

  const isDeclaration = effectiveLayout === 'DECLARATION';

  // Define a fonte padrão
  doc.setFont('Times-Roman', 'normal');
  doc.setFontSize(12);

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = {
    top: 30,
    left: 30,
    right: 20,
    bottom: 20,
  };
  const usableWidth = pageWidth - margin.left - margin.right;
  let y = margin.top;

  // 1. Cabeçalho (Apenas se não estiver no template)
  if (!isDeclaration && !templateHasHeader && !hasStaticHeader) {
    const destinatary = `${userData.target_authority || userData.destinatary_role || ''}`.toUpperCase();
    const institution = (userData.institution_name || '').toUpperCase();
    const location = userData.address || userData.target_location || '';

    if (destinatary) {
      doc.setFont('Times-Roman', 'bold');
      doc.text(destinatary, margin.left, y);
      y += 7;
    }
    
    if (institution) {
      doc.setFont('Times-Roman', 'bold');
      doc.text(institution, margin.left, y);
      y += 14; // 2 linhas de separação
    }

    // 2. Assunto
    const subject = `${userData.subject || title || ''}`.toUpperCase();
    if (subject) {
      doc.setFont('Times-Roman', 'bold');
      doc.text(subject, margin.left, y);
      // Sublinhado para o assunto
      const subjectWidth = doc.getTextWidth(subject);
      doc.line(margin.left, y + 1, margin.left + subjectWidth, y + 1);
      y += 14; // 2 linhas de separação
    }

    // 3. Localização (Direita)
    if (location) {
      doc.setFont('Times-Roman', 'normal');
      doc.text(location, pageWidth - margin.right, y, { align: 'right' });
      // Sublinhado para a localização
      const locWidth = doc.getTextWidth(location);
      doc.line(pageWidth - margin.right - locWidth, y + 1, pageWidth - margin.right, y + 1);
      y += 15;
    }
  } else if (isDeclaration) {
    // Para declarações, começamos um pouco mais abaixo se não houver cabeçalho
    y = margin.top + 10;
  }

  // 3. Corpo do Texto
  doc.setFont('Times-Roman', 'normal');
  const bodyText = parseTemplate(template, userData);
  
  // Renderiza o corpo do texto com justificação
  doc.text(bodyText, margin.left, y, {
    align: 'justify',
    maxWidth: usableWidth,
    lineHeightFactor: 1.5
  });
  
  // Estima a nova posição Y
  const estimatedLines = doc.splitTextToSize(bodyText, usableWidth).length;
  y += (estimatedLines * 7) + 15;

  // Verifica se precisa de nova página
  if (y > pageHeight - margin.bottom - 60) {
    doc.addPage();
    y = margin.top;
  }

  // 4. Fecho (Apenas se não estiver no template)
  if (!isDeclaration && !templateHasFooter) {
    doc.setFont('Times-Roman', 'normal');
    const closing = "Pede deferimento.";
    const closingWidth = doc.getTextWidth(closing);
    const closingX = (pageWidth - closingWidth) / 2;
    doc.text(closing, closingX, y);
    y += 15;
  }

  // 5. Local e Data (Apenas se não estiver no template)
  if (!templateHasFooter) {
    doc.setFont('Times-Roman', 'normal');
    const city = userData.current_city || userData.target_location || '';
    const date = userData.current_date || new Date().toLocaleDateString('pt-PT');
    const dateStr = city ? `${city}, aos ${date}.` : `Aos ${date}.`;
    const dateWidth = doc.getTextWidth(dateStr);
    const dateX = (pageWidth - dateWidth) / 2;
    doc.text(dateStr, dateX, y);
    y += 20;
  }

  // 6. Assinatura (Sempre adicionamos a linha de assinatura no final, a menos que o template seja muito específico)
  doc.setFont('Times-Roman', 'bold');
  const fullName = (userData.full_name || '').toUpperCase();
  const nameWidth = doc.getTextWidth(fullName);
  const nameX = (pageWidth - nameWidth) / 2;
  doc.text(fullName, nameX, y);
  y += 5;

  const signatureLineX = (pageWidth - 70) / 2;
  doc.line(signatureLineX, y, signatureLineX + 70, y);
  y += 5;

  doc.setFontSize(10);
  doc.setFont('Times-Roman', 'normal');
  const signatureLabel = isDeclaration ? '(Assinatura do Declarante)' : '(Assinatura do Requerente)';
  const labelWidth = doc.getTextWidth(signatureLabel);
  const labelX = (pageWidth - labelWidth) / 2;
  doc.text(signatureLabel, labelX, y);

  // 7. Download / Return
  if (shouldDownload) {
    const formattedDate = new Date().toLocaleDateString('pt-PT').replace(/\//g, '-');
    const fileName = `DOKU_${title.replace(/\s+/g, '_')}_${formattedDate}.pdf`;
    doc.save(fileName);
  }

  return doc;
};
