
import jsPDF from 'jspdf';
import { 
  UserData, 
  parseTemplate, 
  renderContent 
} from './documentProcessor';

export type LayoutType = 'OFFICIAL' | 'DECLARATION' | 'LETTER';

export const generatePDFServer = async (userData: UserData, template: string, title: string, layoutType?: LayoutType) => {
  // jsPDF constructor works in Node.js
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const parsedHTML = parseTemplate(template, userData);
  const plainText = parsedHTML.replace(/<[^>]*>/g, '').trim();
  const upperPlainText = plainText.toUpperCase();

  const hasAnyPlaceholders = /\{\{.*\}\}/.test(template);
  
  const hasFormalHeader = /EXMO|EXCELENTÍSSIMO|ILUSTRÍSSIMO|DIRECTOR|SENHOR/i.test(plainText.substring(0, 500)) ||
                          /\{\{\s*(target_authority|destinatary_role|institution_name|subject)\s*\}\}/i.test(template) ||
                          (title && upperPlainText.substring(0, 300).includes(title.toUpperCase()));
  
  const hasFormalFooter = /pede\s*deferimento/i.test(plainText) ||
                          /assinatura/i.test(plainText) ||
                          /\{\{\s*(current_city|current_date)\s*\}\}/i.test(template) ||
                          (userData.full_name && upperPlainText.substring(upperPlainText.length - 300).includes(userData.full_name.toUpperCase()));

  const shouldAddAutoHeader = hasAnyPlaceholders && !hasFormalHeader;
  const shouldAddAutoFooter = hasAnyPlaceholders && !hasFormalFooter;
  
  const effectiveLayout = layoutType || (
    title?.toLowerCase().includes('requerimento') ? 'OFFICIAL' :
    (title?.toLowerCase().includes('declaração') || title?.toLowerCase().includes('compromisso') || title?.toLowerCase().includes('contrato')) ? 'DECLARATION' :
    (title?.toLowerCase().includes('carta') || title?.toLowerCase().includes('manifestação')) ? 'LETTER' :
    'OFFICIAL'
  );

  const isDeclaration = effectiveLayout === 'DECLARATION';

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

  // 1. Cabeçalho Automático
  if (!isDeclaration && shouldAddAutoHeader) {
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
  } else if (isDeclaration && shouldAddAutoHeader) {
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

  // 4. Fecho Automático
  if (!isDeclaration && shouldAddAutoFooter) {
    if (y > pageHeight - margin.bottom - 40) { doc.addPage(); y = margin.top; }
    y += 10;
    doc.setFont('Times-Roman', 'normal');
    const closing = "Pede deferimento.";
    const closingWidth = doc.getTextWidth(closing);
    doc.text(closing, (pageWidth - closingWidth) / 2, y);
    y += 15;
  }

  // 5. Local e Data Automáticos
  if (shouldAddAutoFooter) {
    if (y > pageHeight - margin.bottom - 30) { doc.addPage(); y = margin.top; }
    doc.setFont('Times-Roman', 'normal');
    const city = userData.current_city || userData.target_location || '';
    const date = userData.current_date || new Date().toLocaleDateString('pt-PT');
    const dateStr = city ? `${city}, aos ${date}.` : `Aos ${date}.`;
    const dateWidth = doc.getTextWidth(dateStr);
    doc.text(dateStr, (pageWidth - dateWidth) / 2, y);
    y += 20;
  }

  // 6. Assinatura Automática
  if (shouldAddAutoFooter) {
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

  // Em vez de salvar, retornamos o buffer
  return doc.output('arraybuffer');
};
