import mammoth from 'mammoth';
import { extract } from 'react-pdftotext';

// Main parser function
export const parseResume = async (file) => {
  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'pdf') return parsePdf(file);
  if (extension === 'docx') return parseDocx(file);

  throw new Error('Unsupported file type. Please upload PDF or DOCX.');
};

// Parse PDF using react-pdftotext
const parsePdf = async (file) => {
  const text = await extract(file);
  return text;
};

// Parse DOCX using mammoth
const parseDocx = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

// Extract Name, Email, Phone from text
export const extractInfo = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const nameLine = lines.find(line => /^[A-Za-z ]+$/.test(line));
  const name = nameLine || 'Not found';

  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const phoneMatch = text.match(/\b\d{10}\b/);

  return {
    name,
    email: emailMatch ? emailMatch[0] : 'Not found',
    phone: phoneMatch ? phoneMatch[0] : 'Not found',
  };
};