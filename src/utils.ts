import { SystemConfig, PricingConfig, LicenseInfo, TerminalLog, PrintedHistoryOrder } from './types';

export const DEFAULT_CONFIG: SystemConfig = {
  printerName: "HP6290D4.lan (HP OfficeJet Pro 9010 series)",
  sumatraPath: "C:\\Users\\Roshan\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe",
  libreofficePath: "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
  defaultPaperSize: "A4",
  duplexPreferred: true,
  currency: "AED"
};

export const DEFAULT_PRICING: PricingConfig = {
  currency: "AED",
  bw_single: 0.50,
  bw_duplex: 0.45,
  color_single: 2.00,
  color_duplex: 1.75,
  passport_per_sheet: 10.00,
  passport_per_photo: 2.00,
  passport_min_charge: 5.00
};

export const DEFAULT_LICENSE: LicenseInfo = {
  licenseEnabled: false,
  mode: "development",
  customer: {
    customerId: "AIPA-DEV-001",
    shopName: "",
    ownerName: "",
    phone: "",
    whatsapp: "",
    location: ""
  },
  license: {
    licenseKey: "AIPA-DEV-UNLOCKED-9999",
    status: "development",
    trialDays: 7,
    licenseStartDate: "2026-06-01",
    licenseExpiryDate: "2026-07-01",
    graceDays: 3,
    blockAfterGrace: false,
    machineId: "A182B9A95E226EC2B6EE92CC"
  },
  renewal: {
    renewalMethod: "manual",
    cloudCheckEnabled: false,
    cloudLicenseUrl: ""
  }
};

export function generateMachineId() {
  const chars = '0123456789ABCDEF';
  let id = '';
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function generateLicenseKey(customerId: string) {
  const cleanId = customerId.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const randPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const sum = Array.from(cleanId).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 99;
  return `AIPA-${cleanId}-${randPart}-${sum}`;
}

export function estimatePages(fileName: string): number {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const docTypes = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'odt', 'odp', 'ods'];
  if (docTypes.includes(ext)) {
    return Math.max(1, (fileName.length % 8) + 1);
  }
  return 1;
}

export function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const INITIAL_LOGS: TerminalLog[] = [
  { id: 'l1', timestamp: '06:38:08', type: 'info', message: 'AI_Print_Assistant Core Launcher started. Ready for daemon...' },
  { id: 'l2', timestamp: '06:38:09', type: 'info', message: 'Loading configuration from config.json...' },
  { id: 'l3', timestamp: '06:38:09', type: 'success', message: 'Default printer loaded: HP6290D4.lan' },
  { id: 'l4', timestamp: '06:38:10', type: 'info', message: 'Verifying external dependencies...' },
  { id: 'l5', timestamp: '06:38:10', type: 'success', message: 'SumatraPDF located at path.' },
  { id: 'l6', timestamp: '06:38:11', type: 'success', message: 'LibreOffice command binding set: SOFFICE.' },
  { id: 'l7', timestamp: '06:38:11', type: 'info', message: 'License evaluation complete. Mode: DEVELOPMENT.' },
  { id: 'l8', timestamp: '06:38:12', type: 'success', message: 'Auto-print directory watcher initialized.' },
  { id: 'l9', timestamp: '06:38:12', type: 'info', message: 'Watching folder PRINT_BW_SINGLE...' },
  { id: 'l10', timestamp: '06:38:12', type: 'info', message: 'Watching folder PRINT_BW_DUPLEX...' },
  { id: 'l11', timestamp: '06:38:12', type: 'info', message: 'Watching folder ID_CARDS...' }
];

export const SAMPLE_HISTORY: PrintedHistoryOrder[] = [
  {
    id: "tx-45192",
    fileName: "Muhammad Imran CV.pdf",
    folder: "PRINT_BW_DUPLEX",
    pages: 2,
    cost: 0.90,
    timestamp: "2026-06-11 05:43:10",
    status: "SUCCESS",
    details: "Printed 2 pages duplex grayscale via SumatraPDF successfully.",
    fileType: "pdf",
    model: "HP OfficeJet Pro 9010 series",
    mood: "Eco-Duplex",
    duplex: "Yes",
    expectedSheets: 1,
    estimatedAD: "0.90 AED",
    messages: "Routed to active HP JetDirect printer port 9100. Delivered sheet."
  },
  {
    id: "tx-45191",
    fileName: "cnic front & cnic back.jpg",
    folder: "ID_CARDS",
    pages: 1,
    cost: 4.00,
    timestamp: "2026-06-11 04:12:05",
    status: "SUCCESS",
    details: "Composed front/back layouts on single A4 sheet. Output PDF generated.",
    fileType: "jpg",
    model: "Canon iR2520 Copier Unit",
    mood: "ID Card Cardstock",
    duplex: "No",
    expectedSheets: 1,
    estimatedAD: "4.00 AED",
    messages: "Merged dual card layouts on a single 300gsm sheet in color."
  },
  {
    id: "tx-45190",
    fileName: "Blender_Claude.docx",
    folder: "PRINT_COLOR_SINGLE",
    pages: 3,
    cost: 6.00,
    timestamp: "2026-06-11 02:40:55",
    status: "SUCCESS",
    details: "Converted docx to PDF via LibreOffice. Printed 3 pages colored successfully.",
    fileType: "docx",
    model: "HP OfficeJet Pro 9010 series",
    mood: "Presentation Quality",
    duplex: "No",
    expectedSheets: 3,
    estimatedAD: "6.00 AED",
    messages: "Converted to PDF headless, spooled 600 DPI to HP JetDirect receiver."
  },
  {
    id: "tx-45189",
    fileName: "advertising print.png",
    folder: "PRINT_COLOR_SINGLE",
    pages: 1,
    cost: 2.00,
    timestamp: "2026-06-10 18:22:15",
    status: "ERROR",
    details: "Printer paper jam on tray 2. File buffered inside ERROR_FILES.",
    fileType: "png",
    model: "Epson EcoTank L3150",
    mood: "Flyer Edge-to-Edge",
    duplex: "No",
    expectedSheets: 1,
    estimatedAD: "2.00 AED",
    messages: "Hardware error reported by spool subcode. Copy stored key in ./ERROR_FILES."
  }
];
