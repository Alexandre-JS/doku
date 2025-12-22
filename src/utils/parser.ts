/**
 * Substitui placeholders no formato {{chave}} pelo valor correspondente no objeto de dados.
 * 
 * @param template - O texto do documento com as tags (ex: "Olá {{nome}}")
 * @param data - Objeto contendo os dados do usuário (ex: { nome: "Alexandre" })
 * @returns O documento processado com os valores reais
 */
export const parseDocument = (template: string, data: any) => {
  let finalDoc = template;
  
  // Encontra todas as ocorrências de {{chave}}
  Object.keys(data).forEach((key) => {
    const value = data[key] || `[${key.toUpperCase()}]`;
    // Substitui no texto. Usamos um regex global para trocar todas as vezes que aparecer
    const regex = new RegExp(`{{${key}}}`, 'g');
    finalDoc = finalDoc.replace(regex, value);
  });
  
  return finalDoc;
};
