export interface SystemConfig {
  printerName: string;
  sumatraPath: string;
  libreofficePath: string;
  defaultPaperSize: string;
  duplexPreferred: boolean;
  currency: string;
}

export interface SetupStatus {
  sumatraPdfDetected: boolean;
  libreofficeDetected: boolean;
  foldersCreated: boolean;
  printerOnline: boolean;
  pricingJsonLoaded: boolean;
  configJsonLoaded: boolean;
}

export interface PrintFile {
  id: string;
  name: string;
  size: string;
  type: string;
  pages: number;
  uploadedAt: string;
  status: 'queued' | 'processing' | 'printed' | 'error';
  targetFolder: string;
  cost?: number;
  fileUrl?: string; // Standard preview link if image or PDF
  progress?: number;
  progressMessage?: string;
  originalPath?: string; // Physical absolute file path on local host (Electron)
  // passport properties
  passportConfig?: PassportConfig;
  // ID card properties
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  idCardLayout?: 'A4_Standard' | 'A4_Vertical';
  // custom orders
  customSubFolder?: string;
  customConfig?: Record<string, any>;
}

export interface PassportConfig {
  bgColor: 'keep' | 'white' | 'blue';
  photoCount: number;
  portraitUrl: string;
  smoothSkin: boolean;
  brightness: number;
}

export interface PricingConfig {
  currency: string;
  bw_single: number;
  bw_duplex: number;
  color_single: number;
  color_duplex: number;
  passport_per_sheet: number;
  passport_per_photo: number;
  passport_min_charge: number;
}

export interface LicenseInfo {
  licenseEnabled: boolean;
  mode: string;
  customer: {
    customerId: string;
    shopName: string;
    ownerName: string;
    phone: string;
    whatsapp: string;
    location: string;
  };
  license: {
    licenseKey: string;
    status: 'development' | 'trial' | 'active' | 'grace' | 'expired' | 'blocked';
    trialDays: number;
    licenseStartDate: string;
    licenseExpiryDate: string;
    graceDays: number;
    blockAfterGrace: boolean;
    machineId: string;
  };
  renewal: {
    renewalMethod: string;
    cloudCheckEnabled: boolean;
    cloudLicenseUrl: string;
  };
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'input';
  message: string;
}

export interface PrintedHistoryOrder {
  id: string;
  fileName: string;
  folder: string;
  pages: number;
  cost: number;
  timestamp: string;
  status: 'SUCCESS' | 'ERROR';
  details: string;
  fileType?: string;
  model?: string;
  mood?: string;
  duplex?: 'Yes' | 'No';
  expectedSheets?: number;
  estimatedAD?: string;
  messages?: string;
}
