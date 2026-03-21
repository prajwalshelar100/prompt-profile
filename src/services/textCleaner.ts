export const cleanText = (text: string): string => {
  if (!text) return '';
  
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ');
  
  // Remove non-printable characters
  cleaned = cleaned.replace(/[^\x20-\x7E\n]/g, '');
  
  // Remove common OCR noise patterns (e.g. random vertical bars)
  cleaned = cleaned.replace(/\|/g, '');
  
  // Trim and return
  return cleaned.trim();
};

export const normalizeData = (data: any): any => {
  if (typeof data === 'string') return cleanText(data);
  if (Array.isArray(data)) return data.map(normalizeData).filter(Boolean);
  if (typeof data === 'object' && data !== null) {
    const result: any = {};
    for (const key in data) {
      result[key] = normalizeData(data[key]);
    }
    return result;
  }
  return data;
};
