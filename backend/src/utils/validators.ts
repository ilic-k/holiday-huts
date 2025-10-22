export const PASS_RE =
  /^(?=[A-Za-z])(?=.*[A-Z])(?=(?:.*[a-z]){3,})(?=.*\d)(?=.*[^A-Za-z0-9]).{6,10}$/;


const DINERS_RE = /^((300|301|302|303)\d{12}|(36|38)\d{13})$/;  
const MASTERCARD_RE = /^5[1-5]\d{14}$/;                         
const VISA_RE = /^(4539|4556|4916|4532|4929|4485|4716)\d{12}$/; 

export type CardType = 'diners' | 'mc' | 'visa';

export function detectCardType(raw: string): CardType | null {
  const n = (raw || '').replace(/\s|-/g, '');
  if (DINERS_RE.test(n)) return 'diners';
  if (MASTERCARD_RE.test(n)) return 'mc';
  if (VISA_RE.test(n)) return 'visa';
  return null;
}