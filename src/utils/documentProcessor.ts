
import type jsPDF from 'jspdf';

export interface UserData {
  [key: string]: any;
}

export interface TextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
}

// Função para substituir placeholders no texto e limpar HTML
export const parseTemplate = (template: string, userData: UserData): string => {
  let parsed = template;

  // 1. Processar Loops {{#key}} ... {{/key}}
  const loopRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  parsed = parsed.replace(loopRegex, (match, key, content) => {
    const list = userData[key];
    if (Array.isArray(list)) {
      return list.map(item => {
        let itemContent = content;
        for (const k in item) {
          const r = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g');
          itemContent = itemContent.replace(r, item[k] || "");
        }
        return itemContent;
      }).join("");
    }
    return "";
  });

  // 2. Processar variáveis simples
  for (const key in userData) {
    const value = userData[key];
    if (typeof value === 'string' || typeof value === 'number') {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      parsed = parsed.replace(regex, String(value || ""));
    }
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

export const getSegments = (html: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  let currentBold = false;
  let currentItalic = false;

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

export const renderLine = (doc: jsPDF, pieces: {text: string, style: string}[], x: number, y: number, width: number, align: string) => {
  let currentX = x;
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

export const renderContent = (doc: jsPDF, html: string, x: number, y: number, width: number): number => {
  const blocks = html.split(/<\/p>|<br\s*\/?>/i);
  let currentY = y;
  const lineHeight = 7;

  blocks.forEach(block => {
    const plainText = block.replace(/<[^>]*>/g, '').trim();
    if (!plainText) {
      if (block.includes('<p')) currentY += 5;
      return;
    }

    let align: 'left' | 'center' | 'right' | 'justify' = 'justify';
    if (block.includes('ql-align-center')) align = 'center';
    else if (block.includes('ql-align-right')) align = 'right';
    else if (block.includes('ql-align-left')) align = 'left';

    const segments = getSegments(block);
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
        // @ts-ignore - align justify is supported by jspdf but types might missing it depending on version
        doc.text(text, x, currentY, { align, maxWidth: width, lineHeightFactor: 1.5 });
        currentY += (lines.length * lineHeight);
      }
    } else {
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
            if (!word.trim()) return; 
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
    currentY += 2;
  });

  return currentY;
};
