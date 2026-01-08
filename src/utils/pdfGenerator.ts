import jsPDF from 'jspdf';

interface UserData {
  [key: string]: string;
}

// Função para substituir placeholders no texto e limpar HTML
const parseTemplate = (template: string, userData: UserData): string => {
  let parsed = template;
  for (const key in userData) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    parsed = parsed.replace(regex, userData[key] || "");
  }
  // Limpa placeholders não preenchidos
  parsed = parsed.replace(/\{\{[^}]+\}\}/g, "");
  
  // Decodifica entidades HTML comuns
  parsed = parsed.replace(/&nbsp;/g, ' ')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'");

  return parsed;
};

// Helper para obter segmentos de texto com estilo
interface TextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
}

const getSegments = (html: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  let currentBold = false;
  let currentItalic = false;

  // Split por tags mantendo-as no array
  const parts = html.split(/(<[^>]+>)/g);

  parts.forEach(part => {
    if (part.startsWith('<')) {
      const tag = part.toLowerCase();
      if (tag.includes('strong') || tag.includes('b>')) {
        currentBold = !tag.startsWith('</');
      } else if (tag.includes('em') || tag.includes('i>')) {
        currentItalic = !tag.startsWith('</');
      }
    } else {
      if (part) segments.push({ text: part, bold: currentBold, italic: currentItalic });
    }
  });

  return segments;
};

// Renderiza uma linha de peças com estilos mistos
const renderLine = (doc: jsPDF, pieces: {text: string, style: string}[], x: number, y: number, width: number, align: string) => {
  let currentX = x;
  
  // Calcular largura total para alinhamento (exceto justify que faremos como left)
  let totalWidth = 0;
  pieces.forEach(p => {
    doc.setFont('Times-Roman', p.style);
    totalWidth += doc.getTextWidth(p.text);
  });

  if (align === 'center') currentX += (width - totalWidth) / 2;
  else if (align === 'right') currentX += (width - totalWidth);

  pieces.forEach(p => {
    doc.setFont('Times-Roman', p.style);
    doc.text(p.text, currentX, y);
    currentX += doc.getTextWidth(p.text);
  });
};

// Helper para renderizar blocos de conteúdo HTML no PDF
const renderContent = (doc: jsPDF, html: string, x: number, y: number, width: number): number => {
  const blocks = html.split(/<\/p>|<br\s*\/?>/i);
  let currentY = y;
  const lineHeight = 7;

  blocks.forEach(block => {
    // Limpeza e verificação de conteúdo
    const plainText = block.replace(/<[^>]*>/g, '').trim();
    if (!plainText) {
      if (block.includes('<p')) currentY += 5;
      return;
    }

    // Detectar alinhamento
    let align: 'left' | 'center' | 'right' | 'justify' = 'justify';
    if (block.includes('ql-align-center')) align = 'center';
    else if (block.includes('ql-align-right')) align = 'right';
    else if (block.includes('ql-align-left')) align = 'left';

    const segments = getSegments(block);
    
    // Otimização: Se o bloco for todo de um estilo só, usar renderização nativa (suporta justify melhor)
    const uniqueStyles = new Set(segments.map(s => `${s.bold}-${s.italic}`));
    
    if (uniqueStyles.size === 1) {
      const seg = segments[0];
      const style = (seg.bold && seg.italic) ? 'bolditalic' : seg.bold ? 'bold' : seg.italic ? 'italic' : 'normal';
      doc.setFont('Times-Roman', style);
      
      const text = segments.map(s => s.text).join('').trim();
      const lines = doc.splitTextToSize(text, width);
      
      if (align === 'center' || align === 'right') {
        lines.forEach((line: string) => {
          const textWidth = doc.getTextWidth(line);
          const lineX = align === 'center' ? x + (width - textWidth) / 2 : x + width - textWidth;
          doc.text(line, lineX, currentY);
          currentY += lineHeight;
        });
      } else {
        doc.text(text, x, currentY, { align, maxWidth: width, lineHeightFactor: 1.5 });
        currentY += (lines.length * lineHeight);
      }
    } else {
      // Estilos mistos: Renderização manual palavra por palavra
      let currentLine: {text: string, style: string}[] = [];
      let currentLineWidth = 0;

      segments.forEach(seg => {
        const style = (seg.bold && seg.italic) ? 'bolditalic' : seg.bold ? 'bold' : seg.italic ? 'italic' : 'normal';
        const words = seg.text.split(/(\s+)/);
        
        words.forEach(word => {
          if (!word) return;
          doc.setFont('Times-Roman', style);
          const wordWidth = doc.getTextWidth(word);

          if (currentLineWidth + wordWidth > width && word.trim()) {
            renderLine(doc, currentLine, x, currentY, width, align === 'justify' ? 'left' : align);
            currentY += lineHeight;
            currentLine = [];
            currentLineWidth = 0;
            if (!word.trim()) return; // Ignorar espaços no início da linha
          }

          currentLine.push({ text: word, style });
          currentLineWidth += wordWidth;
        });
      });

      if (currentLine.length > 0) {
        renderLine(doc, currentLine, x, currentY, width, align === 'justify' ? 'left' : align);
        currentY += lineHeight;
      }
    }
    
    currentY += 2; // Espaçamento entre parágrafos
  });

  return currentY;
};

export type LayoutType = 'OFFICIAL' | 'DECLARATION' | 'LETTER';

export const generatePDF = (userData: UserData, template: string, title: string, layoutType?: LayoutType, shouldDownload: boolean = true) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const parsedHTML = parseTemplate(template, userData);
  const plainText = parsedHTML.replace(/<[^>]*>/g, '');

  // Detecta se o template já inclui placeholders ou texto fixo para cabeçalho/rodapé
  const hasFormalHeader = /\{\{\s*(target_authority|destinatary_role|institution_name|target_location|address|subject)\s*\}\}/i.test(template) || 
                          /EXMO|EXCELENTÍSSIMO|ILUSTRÍSSIMO|SENHOR|DIRECTOR/i.test(plainText.substring(0, 200).toUpperCase());
  
  const hasFormalFooter = /\{\{\s*(current_city|current_date|target_location)\s*\}\}/i.test(template) ||
                          /Pede\s*Deferimento|ASSINATURA|DECLARANTE|REQUERENTE/i.test(plainText.substring(plainText.length - 300).toUpperCase());
  
  // Inferir o layout
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

  // 1. Cabeçalho Automático (Apenas se não foi detectado no template)
  if (!isDeclaration && !hasFormalHeader) {
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
      y += 14; 
    }

    const subject = `${userData.subject || title || ''}`.toUpperCase();
    if (subject) {
      doc.setFont('Times-Roman', 'bold');
      doc.text(subject, margin.left, y);
      const subjectWidth = doc.getTextWidth(subject);
      doc.line(margin.left, y + 1, margin.left + subjectWidth, y + 1);
      y += 14;
    }

    if (location) {
      doc.setFont('Times-Roman', 'normal');
      doc.text(location, pageWidth - margin.right, y, { align: 'right' });
      const locWidth = doc.getTextWidth(location);
      doc.line(pageWidth - margin.right - locWidth, y + 1, pageWidth - margin.right, y + 1);
      y += 15;
    }
  } else if (isDeclaration && !hasFormalHeader) {
    // Título de declaração se não houver no template
    doc.setFont('Times-Roman', 'bold');
    doc.setFontSize(14);
    const tit = title.toUpperCase();
    const titWidth = doc.getTextWidth(tit);
    doc.text(tit, (pageWidth - titWidth) / 2, y);
    doc.line((pageWidth - titWidth) / 2, y + 1, (pageWidth + titWidth) / 2, y + 1);
    y += 20;
    doc.setFontSize(12);
  }

  // 3. Corpo do Texto (HTML Renderizado)
  y = renderContent(doc, parsedHTML, margin.left, y, usableWidth);

  // 4. Fecho Automático (Apenas se não foi detectado no template)
  if (!isDeclaration && !hasFormalFooter) {
    if (y > pageHeight - margin.bottom - 40) { doc.addPage(); y = margin.top; }
    y += 10;
    doc.setFont('Times-Roman', 'normal');
    const closing = "Pede deferimento.";
    const closingWidth = doc.getTextWidth(closing);
    doc.text(closing, (pageWidth - closingWidth) / 2, y);
    y += 15;
  }

  // 5. Local e Data Automáticos (Apenas se não foi detectado no template)
  if (!hasFormalFooter) {
    if (y > pageHeight - margin.bottom - 30) { doc.addPage(); y = margin.top; }
    doc.setFont('Times-Roman', 'normal');
    const city = userData.current_city || userData.target_location || '';
    const date = userData.current_date || new Date().toLocaleDateString('pt-PT');
    const dateStr = city ? `${city}, aos ${date}.` : `Aos ${date}.`;
    const dateWidth = doc.getTextWidth(dateStr);
    doc.text(dateStr, (pageWidth - dateWidth) / 2, y);
    y += 20;
  }

  // 6. Assinatura Automática (Apenas se não houver footer formal)
  if (!hasFormalFooter) {
    if (y > pageHeight - margin.bottom - 20) { doc.addPage(); y = margin.top; }
    doc.setFont('Times-Roman', 'bold');
    const fullName = (userData.full_name || '').toUpperCase();
    const nameWidth = doc.getTextWidth(fullName);
    doc.text(fullName, (pageWidth - nameWidth) / 2, y);
    y += 5;

    const signatureLineX = (pageWidth - 70) / 2;
    doc.line(signatureLineX, y, signatureLineX + 70, y);
    y += 5;

    doc.setFontSize(10);
    doc.setFont('Times-Roman', 'normal');
    const signatureLabel = isDeclaration ? '(Assinatura do Declarante)' : '(Assinatura do Requerente)';
    const labelWidth = doc.getTextWidth(signatureLabel);
    doc.text(signatureLabel, (pageWidth - labelWidth) / 2, y);
  }

  // 7. Download
  if (shouldDownload) {
    const formattedDate = new Date().toLocaleDateString('pt-PT').replace(/\//g, '-');
    const fileName = `DOKU_${title.replace(/\s+/g, '_')}_${formattedDate}.pdf`;
    doc.save(fileName);
  }

  return doc;
};
