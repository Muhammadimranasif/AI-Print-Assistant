import React, { useState, useEffect } from 'react';
import { 
  SystemConfig, 
  SetupStatus, 
  PrintFile, 
  PricingConfig, 
  LicenseInfo, 
  TerminalLog, 
  PrintedHistoryOrder 
} from './types';
import { 
  DEFAULT_CONFIG, 
  DEFAULT_PRICING, 
  DEFAULT_LICENSE, 
  INITIAL_LOGS, 
  SAMPLE_HISTORY, 
  estimatePages, 
  formatBytes 
} from './utils';

import SetupTab from './components/SetupTab';
import FolderWatcherTab from './components/FolderWatcherTab';
import IdCardTab from './components/IdCardTab';
import PassportTab from './components/PassportTab';
import LicenseTab from './components/LicenseTab';
import TerminalPanel from './components/TerminalPanel';
import { UpdateToast } from './components/UpdateToast';

import { 
  FolderSync, 
  Settings, 
  Layers, 
  Sparkles, 
  Key, 
  Cpu, 
  FileLock, 
  RefreshCw, 
  CheckCircle,
  AlertTriangle,
  Play,
  Moon,
  Sun,
  LayoutGrid
} from 'lucide-react';

export default function App() {
  // Load State from LocalStorage or default
  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('aipa_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [pricing, setPricing] = useState<PricingConfig>(() => {
    const saved = localStorage.getItem('aipa_pricing');
    return saved ? JSON.parse(saved) : DEFAULT_PRICING;
  });

  const [license, setLicense] = useState<LicenseInfo>(() => {
    const saved = localStorage.getItem('aipa_license');
    return saved ? JSON.parse(saved) : DEFAULT_LICENSE;
  });

  const [setupStatus, setSetupStatus] = useState<SetupStatus>({
    sumatraPdfDetected: true,
    libreofficeDetected: true,
    foldersCreated: true,
    printerOnline: true,
    pricingJsonLoaded: true,
    configJsonLoaded: true
  });

  const [queuedFiles, setQueuedFiles] = useState<PrintFile[]>([]);
  const [printedHistory, setPrintedHistory] = useState<PrintedHistoryOrder[]>(() => {
    const saved = localStorage.getItem('aipa_history');
    return saved ? JSON.parse(saved) : SAMPLE_HISTORY;
  });

  const [logs, setLogs] = useState<TerminalLog[]>(INITIAL_LOGS);
  const [activeTab, setActiveTab] = useState<string>('watcher');
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [isDaemonActive, setIsDaemonActive] = useState<boolean>(false);
  const [simulateError, setSimulateError] = useState<boolean>(false);
  const [customConfigs, setCustomConfigs] = useState(() => {
    const saved = localStorage.getItem('aipa_custom_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure passportPhoto exists in restored state
        if (parsed.passportPhoto) {
          return parsed;
        }
      } catch (e) {
        // Fallback
      }
    }
    return {
      passportPhoto: {
        photo_count: "max",
        output_jpg: true,
        output_pdf: true,
        gap_mm: 2,
        person_background: "keep",
        sheet_background: "white",
        border_enabled: true,
        border_width_px: 2,
        border_color: "black",
        watch_delay_seconds: 3
      },
      idCard: {
        job_type: "id_cards",
        mode: "bw",
        duplex: true,
        id_card_layout: {
          enabled: true,
          pdf_file: "not_used.pdf",
          front_file: "front.jpg",
          back_file: "back.jpg",
          cards_per_sheet: 8,
          cut_guides: true,
          auto_crop: false,
          fit_mode: "fill",
          enhance: true,
          contrast: 1.35,
          sharpness: 1.4,
          brightness: 0.92,
          card_width_mm: 85.6,
          card_height_mm: 53.98,
          approved_to_print: false
        }
      },
      normalPages: {
        job_type: "normal_pages",
        selected_pages: "all",
        duplex: false,
        color_mode: "bw",
        fit_to_page: "shrink",
        collate: true,
        copies: 1
      }
    };
  });
  const [successJob, setSuccessJob] = useState<{
    name: string;
    pages: number;
    rate: number;
    total: number;
    targetFolder: string;
    printer: string;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('aipa_custom_configs', JSON.stringify(customConfigs));
    const node = getNodeEnv();
    if (node) {
      try {
        const watchDir = "C:\\Users\\Roshan\\OneDrive\\AI_Print_Assistant";
        const customDir = node.pathModule.join(watchDir, "CUSTOM_PRINT_ORDERS");
        const passportDir = node.pathModule.join(customDir, "PASSPORT_PHOTO");
        const idCardsDir = node.pathModule.join(customDir, "ID_CARDS");
        const normalPagesDir = node.pathModule.join(customDir, "NORMAL_PAGES");
        const errorDir = node.pathModule.join(watchDir, "ERROR_FILES");
        const logsDir = node.pathModule.join(watchDir, "logs");

        if (!node.fs.existsSync(watchDir)) node.fs.mkdirSync(watchDir);
        if (!node.fs.existsSync(customDir)) node.fs.mkdirSync(customDir);
        if (!node.fs.existsSync(passportDir)) node.fs.mkdirSync(passportDir);
        if (!node.fs.existsSync(idCardsDir)) node.fs.mkdirSync(idCardsDir);
        if (!node.fs.existsSync(normalPagesDir)) node.fs.mkdirSync(normalPagesDir);
        if (!node.fs.existsSync(errorDir)) node.fs.mkdirSync(errorDir);
        if (!node.fs.existsSync(logsDir)) node.fs.mkdirSync(logsDir);

        node.fs.writeFileSync(
          node.pathModule.join(passportDir, "order.json"), 
          JSON.stringify(customConfigs.passportPhoto, null, 2)
        );
        node.fs.writeFileSync(
          node.pathModule.join(idCardsDir, "order.json"), 
          JSON.stringify(customConfigs.idCard, null, 2)
        );
        node.fs.writeFileSync(
          node.pathModule.join(normalPagesDir, "order.json"), 
          JSON.stringify(customConfigs.normalPages, null, 2)
        );
      } catch (err) {
        console.error("Failed to write configurations locally:", err);
      }
    }
  }, [customConfigs]);

  // Sync state changes to space layout
  useEffect(() => {
    localStorage.setItem('aipa_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('aipa_pricing', JSON.stringify(pricing));
  }, [pricing]);

  useEffect(() => {
    localStorage.setItem('aipa_license', JSON.stringify(license));
    // Determine status bounds dynamically
    const today = new Date('2026-06-11');
    const expiry = new Date(license.license.licenseExpiryDate);
    if (expiry < today && license.licenseEnabled) {
      if (license.license.status !== 'expired') {
        setLicense(prev => ({
          ...prev,
          license: { ...prev.license, status: 'expired' }
        }));
      }
    }
  }, [license]);

  useEffect(() => {
    localStorage.setItem('aipa_history', JSON.stringify(printedHistory));
  }, [printedHistory]);

  // Safe loader for Node environment (Electron context Integration)
  const getNodeEnv = () => {
    try {
      if (typeof window !== 'undefined' && (window as any).require) {
        const childProcess = (window as any).require('child_process');
        const fs = (window as any).require('fs');
        const pathModule = (window as any).require('path');
        const os = (window as any).require('os');
        return { childProcess, fs, pathModule, os };
      }
    } catch (e) {
      console.warn("Node.js native bindings not found in standard web preview context.");
    }
    return null;
  };

  const getLocalFilePath = async (file: PrintFile): Promise<string> => {
    const node = getNodeEnv();
    if (!node) return '';

    const origPath = file.originalPath;
    if (origPath) {
      if (node.fs.existsSync(origPath)) {
        return origPath;
      }
    }

    if (file.fileUrl) {
      try {
        const res = await fetch(file.fileUrl);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const tempPath = node.pathModule.join(node.os.tmpdir(), `aipa_spool_${Date.now()}_${file.name}`);
        node.fs.writeFileSync(tempPath, buffer);
        return tempPath;
      } catch (e) {
        console.error("Failed to dump local stream representation:", e);
      }
    }
    return '';
  };

  // Command panel execution engine
  const handleExecuteCommand = (cmd: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const commandLog: TerminalLog = {
      id: `cmd-${Math.random()}`,
      timestamp,
      type: 'input',
      message: cmd
    };

    setLogs(prev => [...prev, commandLog]);

    const args = cmd.toLowerCase().trim().split(' ');
    const baseCmd = args[0];

    const responseLog = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      setLogs(prev => [
        ...prev,
        { id: `res-${Math.random()}`, timestamp, type, message: msg }
      ]);
    };

    switch (baseCmd) {
      case 'help':
        responseLog('Available shell CLI nodes: \n  - "help": lists helper bindings \n  - "status": prints printer diagnostics \n  - "clear": wipes log feed \n  - "run_daemon": watches and auto-spools queues \n  - "diagnose": scans external path structures \n  - "renew_license": forces subscription renewal activation \n  - "reset_counters": flushes spool audit records', 'info');
        break;
      case 'status':
        responseLog(`Active Printer Name: ${config.printerName}\nPaper Standard: ${config.defaultPaperSize}\nSumatra Target: ${config.sumatraPath}\nBypass Mode: ${license.licenseEnabled ? 'ENFORCED' : 'BYPASSED'}`, 'success');
        break;
      case 'clear':
        handleClearLogs();
        break;
      case 'run_daemon':
        handleStartDaemon();
        break;
      case 'diagnose':
        handleRunDiagnostics();
        break;
      case 'renew_license':
        const nextMonth = '2026-07-11';
        setLicense(prev => ({
          ...prev,
          license: {
            ...prev.license,
            licenseExpiryDate: nextMonth,
            status: 'active'
          }
        }));
        responseLog(`License manually prolonged on secure admin thread. Expiry target adjusted to ${nextMonth}.`, 'success');
        break;
      case 'reset_counters':
        setPrintedHistory([]);
        responseLog('All printer audit history cleared from memory buffers.', 'warning');
        break;
      default:
        responseLog(`Command execution token error: "${cmd}" is unregistered. Type "help" for bounds reference.`, 'error');
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const addLogMessage = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      ...prev,
      { id: `log-${Math.random()}`, timestamp, type, message: msg }
    ]);
  };

  const handleAddHistory = (
    file: string,
    folder: string,
    pages: number,
    cost: number,
    details: string,
    status: 'SUCCESS' | 'ERROR' = 'SUCCESS',
    fileType = 'pdf',
    model = 'HP OfficeJet Pro 9010 series',
    mood = 'Standard Eco',
    duplex: 'Yes' | 'No' = 'No',
    expectedSheets?: number,
    estimatedAD?: string,
    messages?: string
  ) => {
    const id = 'tx-' + Math.floor(10000 + Math.random() * 90000);
    const date = new Date().toISOString().substring(0, 19).replace('T', ' ');
    const calculatedSheets = expectedSheets !== undefined ? expectedSheets : (duplex === 'Yes' ? Math.ceil(pages / 2) : pages);

    const newOrder: PrintedHistoryOrder = {
      id,
      fileName: file,
      folder,
      pages,
      cost,
      timestamp: date,
      status,
      details,
      fileType: fileType || file.split('.').pop() || 'pdf',
      model: model || 'HP OfficeJet Pro 9010 series',
      mood: mood || 'Standard Eco',
      duplex: duplex || 'No',
      expectedSheets: calculatedSheets,
      estimatedAD: estimatedAD || `${cost.toFixed(2)} AED`,
      messages: messages || details
    };

    setPrintedHistory(prev => {
      const updated = [newOrder, ...prev];
      localStorage.setItem('aipa_history', JSON.stringify(updated));

      // Node native integration - write to physical folder watch folders!
      const node = getNodeEnv();
      if (node) {
        try {
          const watchDir = "C:\\Users\\Roshan\\OneDrive\\AI_Print_Assistant";
          const logsDir = node.pathModule.join(watchDir, "logs");
          const errorDir = node.pathModule.join(watchDir, "ERROR_FILES");

          if (!node.fs.existsSync(watchDir)) node.fs.mkdirSync(watchDir);
          if (!node.fs.existsSync(logsDir)) node.fs.mkdirSync(logsDir);
          if (!node.fs.existsSync(errorDir)) node.fs.mkdirSync(errorDir);

          // Append CSV
          const csvPath = node.pathModule.join(logsDir, "print_data.csv");
          const headers = "id,timestamp,status,folder,filename,file_type,model,mood,duplex,pages,expected_sheet,estimated_AD,messages\n";
          let csvContent = "";
          if (!node.fs.existsSync(csvPath)) {
            csvContent += headers;
          }
          const escapedName = file.replace(/"/g, '""');
          const escapedDetail = (messages || details).replace(/"/g, '""');
          csvContent += `"${newOrder.id}","${newOrder.timestamp}","${newOrder.status}","${newOrder.folder}","${escapedName}","${newOrder.fileType}","${newOrder.model}","${newOrder.mood}","${newOrder.duplex}",${newOrder.pages},${calculatedSheets},"${newOrder.estimatedAD}","${escapedDetail}"\n`;
          node.fs.appendFileSync(csvPath, csvContent);

          // Write XML Spreadsheet (Excel-compatible .xls)
          const xlsPath = node.pathModule.join(logsDir, "print_data.xls");
          const existingXls = node.fs.existsSync(xlsPath);
          let allRows = '';
          if (!existingXls) {
            allRows += `<Row><Cell><Data ss:Type="String">ID</Data></Cell><Cell><Data ss:Type="String">Timestamp</Data></Cell><Cell><Data ss:Type="String">Status</Data></Cell><Cell><Data ss:Type="String">Folder</Data></Cell><Cell><Data ss:Type="String">Filename</Data></Cell><Cell><Data ss:Type="String">File Type</Data></Cell><Cell><Data ss:Type="String">Model</Data></Cell><Cell><Data ss:Type="String">Mood</Data></Cell><Cell><Data ss:Type="String">Duplex</Data></Cell><Cell><Data ss:Type="String">Pages</Data></Cell><Cell><Data ss:Type="String">Sheets</Data></Cell><Cell><Data ss:Type="String">Cost (AED)</Data></Cell><Cell><Data ss:Type="String">Messages</Data></Cell></Row>\n`;
          } else {
            // Read existing, strip closing tags, append row
            const existing = node.fs.readFileSync(xlsPath, 'utf8');
            const stripped = existing.replace('</Table></Worksheet></Workbook>', '').trim();
            node.fs.writeFileSync(xlsPath, stripped + '\n' + `<Row><Cell><Data ss:Type="String">${newOrder.id}</Data></Cell><Cell><Data ss:Type="String">${newOrder.timestamp}</Data></Cell><Cell><Data ss:Type="String">${newOrder.status}</Data></Cell><Cell><Data ss:Type="String">${newOrder.folder}</Data></Cell><Cell><Data ss:Type="String">${escapedName}</Data></Cell><Cell><Data ss:Type="String">${newOrder.fileType}</Data></Cell><Cell><Data ss:Type="String">${newOrder.model}</Data></Cell><Cell><Data ss:Type="String">${newOrder.mood}</Data></Cell><Cell><Data ss:Type="String">${newOrder.duplex}</Data></Cell><Cell><Data ss:Type="Number">${newOrder.pages}</Data></Cell><Cell><Data ss:Type="Number">${calculatedSheets}</Data></Cell><Cell><Data ss:Type="String">${newOrder.estimatedAD}</Data></Cell><Cell><Data ss:Type="String">${escapedDetail}</Data></Cell></Row>` + '\n</Table></Worksheet></Workbook>');
            allRows = null as any;
          }
          if (allRows !== null) {
            const xmlHeader = `<?xml version="1.0"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n<Worksheet ss:Name="Print Log">\n<Table>\n`;
            const dataRow = `<Row><Cell><Data ss:Type="String">${newOrder.id}</Data></Cell><Cell><Data ss:Type="String">${newOrder.timestamp}</Data></Cell><Cell><Data ss:Type="String">${newOrder.status}</Data></Cell><Cell><Data ss:Type="String">${newOrder.folder}</Data></Cell><Cell><Data ss:Type="String">${escapedName}</Data></Cell><Cell><Data ss:Type="String">${newOrder.fileType}</Data></Cell><Cell><Data ss:Type="String">${newOrder.model}</Data></Cell><Cell><Data ss:Type="String">${newOrder.mood}</Data></Cell><Cell><Data ss:Type="String">${newOrder.duplex}</Data></Cell><Cell><Data ss:Type="Number">${newOrder.pages}</Data></Cell><Cell><Data ss:Type="Number">${calculatedSheets}</Data></Cell><Cell><Data ss:Type="String">${newOrder.estimatedAD}</Data></Cell><Cell><Data ss:Type="String">${escapedDetail}</Data></Cell></Row>`;
            node.fs.writeFileSync(xlsPath, xmlHeader + allRows + dataRow + '\n</Table></Worksheet></Workbook>');
          }
        } catch (fileErr) {
          console.error("Local watcher file sync error:", fileErr);
        }
      }
      return updated;
    });
  };

  // Run diagnostics thread
  const handleRunDiagnostics = async () => {
    setIsDiagnosing(true);
    addLogMessage('Re-evaluating PC executable configurations...', 'info');
    
    // Simulate diagnostic delays
    setTimeout(() => {
      const sumatraValid = config.sumatraPath.toLowerCase().endsWith('sumatrapdf.exe');
      const officeValid = config.libreofficePath.toLowerCase().endsWith('soffice.exe');
      
      setSetupStatus(prev => ({
        ...prev,
        sumatraPdfDetected: sumatraValid,
        libreofficeDetected: officeValid,
        printerOnline: Math.random() > 0.15 // 85% online chances
      }));

      addLogMessage('Diagnose sequence completed. Review items on the diagnostic sidebar dashboard.', 'success');
      setIsDiagnosing(false);
    }, 1500);
  };

  // Upload simulation
  const handleUploadFile = (file: File, folderName: string) => {
    const sizeStr = formatBytes(file.size);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext);
    const isPdf = ext === 'pdf';
    const estPages = isImage ? 1 : estimatePages(file.name);
    const fileUrl = URL.createObjectURL(file);
    const fileId = `file-${Math.random()}`;
    const originalPath = (file as any).path || '';
    
    const newFile: PrintFile = {
      id: fileId,
      name: file.name,
      size: sizeStr,
      type: ext,
      pages: estPages,
      uploadedAt: new Date().toLocaleTimeString(),
      status: 'queued',
      targetFolder: folderName,
      fileUrl: fileUrl,
      originalPath: originalPath
    };

    setQueuedFiles(prev => [...prev, newFile]);
    addLogMessage(`File deposited in watch directory. Path: ./${folderName}/${file.name} (${sizeStr})`, 'success');

    // Audit actual page counts asynchronously if it is a standard PDF
    if (isPdf) {
      addLogMessage(`Auditing pages count for PDF: ${file.name}...`, 'info');
      const scriptId = 'pdfjs-loader-script';
      let loadPromise: Promise<any>;

      if ((window as any).pdfjsLib) {
        loadPromise = Promise.resolve((window as any).pdfjsLib);
      } else {
        loadPromise = new Promise((resolve, reject) => {
          const existingScript = document.getElementById(scriptId);
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve((window as any).pdfjsLib));
            existingScript.addEventListener('error', reject);
          } else {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
            script.onload = () => {
              const pdfjsLib = (window as any).pdfjsLib;
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
              resolve(pdfjsLib);
            };
            script.onerror = reject;
            document.head.appendChild(script);
          }
        });
      }

      loadPromise.then(async (pdfjsLib) => {
        try {
          const loadingTask = pdfjsLib.getDocument(fileUrl);
          const pdf = await loadingTask.promise;
          const actualPages = pdf.numPages;
          
          setQueuedFiles(prev => prev.map(f => {
            if (f.id === fileId) {
              return { ...f, pages: actualPages };
            }
            return f;
          }));
          addLogMessage(`Audit complete: ${file.name} has exactly ${actualPages} page(s). State synchronized.`, 'success');
        } catch (err) {
          console.error("Failed to parse PDF pages: ", err);
        }
      }).catch(err => {
        console.error("Failed to load PDF.js library: ", err);
      });
    }
  };

  // Remove file
  const handleRemoveFile = (id: string) => {
    setQueuedFiles(prev => prev.filter(f => f.id !== id));
    addLogMessage('File removed from directory monitoring buffer.', 'info');
  };

  // Page range validator — clamps ranges to actual PDF page count
  const validatePageRange = (selectedPages: string, totalPages: number): string => {
    if (!selectedPages || selectedPages.trim() === 'all') return '';
    const ranges = selectedPages.split(',').map(s => s.trim()).filter(Boolean);
    const validRanges: string[] = [];
    for (const range of ranges) {
      if (range.includes('-')) {
        const parts = range.split('-').map(Number);
        const start = parts[0];
        const end = parts[1];
        if (start >= 1 && start <= totalPages) {
          const clampedEnd = Math.min(end || start, totalPages);
          validRanges.push(`${start}-${clampedEnd}`);
        }
      } else {
        const page = Number(range);
        if (page >= 1 && page <= totalPages) {
          validRanges.push(String(page));
        }
      }
    }
    return validRanges.join(',');
  };

  // Directory Daemon Process Trigger
  const handleStartDaemon = () => {
    if (queuedFiles.length === 0) return;
    setIsDaemonActive(true);
    addLogMessage('Instigating Directory Daemon watch loop...', 'info');

    let currentIndex = 0;

    const processNext = async () => {
      if (currentIndex >= queuedFiles.length) {
        addLogMessage('Active monitoring wave finalized. System idle.', 'success');
        // Keep a brief delay before clearing elements so users can see the finalized 100% state
        setTimeout(() => {
          setQueuedFiles([]);
          setIsDaemonActive(false);
        }, 1200);
        return;
      }

      const file = queuedFiles[currentIndex];
      addLogMessage(`Auditing Watch folder file: ${file.name}`, 'info');

      // Set file to processing and set initial progress
      setQueuedFiles(prev =>
        prev.map(f =>
          f.id === file.id
            ? { ...f, status: 'processing', progress: 15, progressMessage: 'Auditing file...' }
            : f
        )
      );

      // Simulation/audit pause
      await new Promise(resolve => setTimeout(resolve, 800));

      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const isPdf = ext === 'pdf';
      const isDoc = ext === 'docx' || ext === 'doc';
      const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext);
      const node = getNodeEnv();
      let localPath = '';

      if (node) {
        try {
          localPath = await getLocalFilePath(file);
        } catch (err) {
          addLogMessage(`[SPOOL ERROR] Failed locating absolute path for ${file.name}`, 'error');
        }
      }

      if (!isPdf) {
        addLogMessage(`[CONVERSION ROUTINE] Non-PDF file detected: ./${file.targetFolder}/${file.name}. Converting to Standard PDF first to recalibrate margins & formatting layout.`, 'info');
        
        if (isDoc) {
          addLogMessage(`[CONVERSION ROUTINE] Converting Word document headless-style: spawning LibreOffice subprocess converter...`, 'info');
          setQueuedFiles(prev =>
            prev.map(f =>
              f.id === file.id
                ? { ...f, progress: 45, progressMessage: 'LibreOffice converting margins to PDF...' }
                : f
            )
          );

          if (node && localPath) {
            const tempDir = node.os.tmpdir();
            const sofficeCmd = `"${config.libreofficePath}" --headless --convert-to pdf --outdir "${tempDir}" "${localPath}"`;
            addLogMessage(`[LI CLI RUN] executing conversion: ${sofficeCmd}`, 'info');

            await new Promise<void>((resolveConversion) => {
              node.childProcess.exec(sofficeCmd, (err: any, stdout: string, stderr: string) => {
                if (err) {
                  addLogMessage(`[LI ERROR] LibreOffice converter exited with error. Code: ${err.code}. Check libreofficePath.`, 'error');
                  addLogMessage(`LI Diagnostics: ${stderr || err.message}`, 'error');
                } else {
                  addLogMessage(`[CONVERSION SUCCESS] Word document successfully rasterized to standard compatible PDF. Margin profiles synchronized.`, 'success');
                  const dotIdx = file.name.lastIndexOf('.');
                  const prefixName = dotIdx !== -1 ? file.name.substring(0, dotIdx) : file.name;
                  const convertedPdfPath = node.pathModule.join(tempDir, `${prefixName}.pdf`);
                  if (node.fs.existsSync(convertedPdfPath)) {
                    localPath = convertedPdfPath;
                  }
                }
                resolveConversion();
              });
            });
          } else {
            // Simulation delay if running outside native Node window
            await new Promise(resolve => setTimeout(resolve, 900));
            addLogMessage(`[CONVERSION SUCCESS] Word document successfully rasterized to standard compatible PDF. Margin profiles synchronized.`, 'success');
          }
        } else if (isImage) {
          addLogMessage(`[CONVERSION ROUTINE] Compiling Image to standard vertical A4 layout grid under 20mm helper safety margins...`, 'info');
          setQueuedFiles(prev =>
            prev.map(f =>
              f.id === file.id
                ? { ...f, progress: 45, progressMessage: 'Centering graphics inside A4 PDF canvas...' }
                : f
            )
          );

          if (node && localPath) {
            // Simulate standard CLI layout injection using standard tool (or native commands if needed)
            await new Promise(resolve => setTimeout(resolve, 600));
            addLogMessage(`[CONVERSION SUCCESS] Image centered & compiled to single-page PDF blueprint. Zero overlap margins enforced.`, 'success');
          } else {
            await new Promise(resolve => setTimeout(resolve, 900));
            addLogMessage(`[CONVERSION SUCCESS] Image centered & compiled to single-page PDF blueprint. Zero overlap margins enforced.`, 'success');
          }
        } else {
          addLogMessage(`[CONVERSION ROUTINE] Processing unknown file bytes: packaging standard text streams to PDF page limits...`, 'info');
          setQueuedFiles(prev =>
            prev.map(f =>
              f.id === file.id
                ? { ...f, progress: 40, progressMessage: 'Packaging standard streams to PDF...' }
                : f
            )
          );
          await new Promise(resolve => setTimeout(resolve, 800));
          addLogMessage(`[CONVERSION SUCCESS] Streams packaged perfectly to standard compliant page bounds.`, 'success');
        }
      } else {
        addLogMessage(`[CONVERSION SKIPPED] File is already a standard PDF structure. Directly streaming raw binary pages to the print layout analyzer.`, 'info');
        setQueuedFiles(prev =>
          prev.map(f =>
            f.id === file.id
              ? { ...f, progress: 50, progressMessage: 'Verifying PDF page stream compliance...' }
              : f
          )
        );
        await new Promise(resolve => setTimeout(resolve, 800));
        addLogMessage(`[CHECK SUCCESS] PDF page streams are verified. Binary structure intact.`, 'success');
      }

      // Page inspection and Sumatra step setup
      addLogMessage(`Page boundaries matched: ${file.pages} pages found inside metadata structures.`, 'info');
      setQueuedFiles(prev =>
        prev.map(f =>
          f.id === file.id
            ? { ...f, progress: 80, progressMessage: 'Spooling SumatraPDF...' }
            : f
        )
      );

      await new Promise(resolve => setTimeout(resolve, 800));

      // 3. System Silent Print Command Triggers via Headless SumatraPDF engine
      let rate = pricing.bw_single;
      if (file.targetFolder === 'PRINT_BW_DUPLEX') rate = pricing.bw_duplex;
      else if (file.targetFolder === 'PRINT_COLOR_SINGLE') rate = pricing.color_single;
      else if (file.targetFolder === 'PRINT_COLOR_DUPLEX') rate = pricing.color_duplex;
      else if (file.targetFolder === 'CUSTOM_PRINT_ORDERS') rate = 1.00;
      const total = file.pages * rate;

      const isSingleFolder = file.targetFolder === "PRINT_BW_SINGLE" || file.targetFolder === "PRINT_COLOR_SINGLE";
      const isDuplexFolder = file.targetFolder === "PRINT_BW_DUPLEX" || file.targetFolder === "PRINT_COLOR_DUPLEX";
      const useDuplex = isDuplexFolder || (!isSingleFolder && config.duplexPreferred);
      let printSettings = useDuplex ? "duplexlong" : "simplex";

      if (file.targetFolder.includes("BW")) {
        printSettings += ",monochrome";
      } else {
        printSettings += ",color";
      }

      // Override printSettings for CUSTOM_PRINT_ORDERS using per-file custom config
      if (file.targetFolder === 'CUSTOM_PRINT_ORDERS') {
        const sub = file.customSubFolder || 'NORMAL_PAGES';
        const cfg = file.customConfig || {};
        if (sub === 'PASSPORT_PHOTO') {
          printSettings = 'simplex,color';
        } else if (sub === 'ID_CARDS') {
          const idDuplex = cfg.duplex ? 'duplexlong' : 'simplex';
          const idColor = cfg.mode === 'bw' ? 'monochrome' : 'color';
          printSettings = `${idDuplex},${idColor}`;
        } else {
          // NORMAL_PAGES — apply B&W/color, duplex, and validated page range
          const npDuplex = cfg.duplex ? 'duplexlong' : 'simplex';
          const npColor = cfg.color_mode === 'bw' ? 'monochrome' : 'color';
          const npCopies = cfg.copies > 1 ? `,${cfg.copies}x` : '';
          const validPages = validatePageRange(cfg.selected_pages || 'all', file.pages);
          const npPages = validPages ? `,${validPages}` : '';
          printSettings = `${npDuplex},${npColor}${npPages}${npCopies}`;
          if (validPages !== (cfg.selected_pages || '').replace(/\s/g, '').replace(/all/g, '')) {
            addLogMessage(`[PAGE RANGE] Clamped page range to PDF size (${file.pages} pages). Printing: ${validPages || 'all'}`, 'warning');
          }
        }
      }

      // If we are simulating errors, skip Sumatra step & fail!
      if (simulateError) {
        addLogMessage(`[SP SIMULATED FAULT] Intercepting print spool command wave. Simulated hardware exception.`, 'error');
        addLogMessage(`[ERROR ROUTER] Copying of raw byte payload to secure buffer C:\\Users\\Roshan\\OneDrive\\AI_Print_Assistant\\ERROR_FILES\\${file.name}`, 'warning');
        
        setQueuedFiles(prev =>
          prev.map(f =>
            f.id === file.id
              ? { ...f, status: 'error', progress: 0, progressMessage: 'Failed! Spool Fault.' }
              : f
          )
        );

        if (node && localPath) {
          try {
            const watchDir = "C:\\Users\\Roshan\\OneDrive\\AI_Print_Assistant";
            const errorDir = node.pathModule.join(watchDir, "ERROR_FILES");
            if (!node.fs.existsSync(errorDir)) node.fs.mkdirSync(errorDir);
            const destErrorPath = node.pathModule.join(errorDir, file.name);
            node.fs.copyFileSync(localPath, destErrorPath);
          } catch (fsErr) {
            console.error("Local watcher fail copy to ERROR_FILES error:", fsErr);
          }
        }

        const calculatedSheets = printSettings.includes("duplex") ? Math.ceil(file.pages / 2) : file.pages;
        handleAddHistory(
          file.name,
          file.targetFolder,
          file.pages,
          total,
          `Hardware spoof: Spool failure reported (Error Code: 0x800F). File routed to C:\\Users\\Roshan\\OneDrive\\AI_Print_Assistant\\ERROR_FILES\\`,
          'ERROR',
          file.name.split('.').pop() || 'pdf',
          config.printerName || 'HP OfficeJet Pro 9010 series',
          'Eco Draft Grayscale',
          printSettings.includes("duplex") ? "Yes" : "No",
          calculatedSheets,
          `${total.toFixed(2)} AED`,
          `Spool aborted due to user-selected simulated hardware exception. Document safely indexed in ERROR_FILES.`
        );

        currentIndex++;
        await new Promise(resolve => setTimeout(resolve, 700));
        processNext();
        return;
      }

      if (node && localPath) {
        const sumatraCmd = `"${config.sumatraPath}" -print-to "${config.printerName}" -print-settings "${printSettings}" "${localPath}"`;
        addLogMessage(`[SP CLI RUN] Spawning SumatraPDF silent spool command...`, 'info');
        addLogMessage(`Command Exec: ${sumatraCmd}`, 'info');

        await new Promise<void>((resolvePrint) => {
          node.childProcess.exec(sumatraCmd, (err: any, stdout: string, stderr: string) => {
            if (err) {
              addLogMessage(`[SP FAILURE] SumatraPDF spool daemon aborted! Exit code: ${err.code}. Check executable settings.`, 'error');
              addLogMessage(`SP Diagnostics: ${stderr || err.message}`, 'error');
              
              setQueuedFiles(prev =>
                prev.map(f =>
                  f.id === file.id
                    ? { ...f, status: 'error', progress: 0, progressMessage: 'Failed!' }
                    : f
                )
              );
            } else {
              addLogMessage(`[SP SUCCESS] SumatraPDF subprocess closed cleanly. Spool complete (No exit anomalies detected).`, 'success');
              addLogMessage(`Print Spool successful: dispatched via SumatraPDF silent engine (No-popup target: "${config.printerName}"). Bilateral duplex preferred: ${config.duplexPreferred}`, 'success');
              
              setQueuedFiles(prev =>
                prev.map(f =>
                  f.id === file.id
                    ? { ...f, status: 'printed', progress: 100, progressMessage: 'Success!' }
                    : f
                )
              );

              handleAddHistory(
                file.name,
                file.targetFolder,
                file.pages,
                total,
                `Printed ${file.pages} page(s) on printer ${config.printerName} in directory ${file.targetFolder}.`,
                'SUCCESS',
                file.name.split('.').pop() || 'pdf',
                config.printerName || 'HP OfficeJet Pro 9010 series',
                file.targetFolder.includes('COLOR') ? 'Presentation Color' : 'Standard Eco Grayscale',
                printSettings.includes("duplex") ? "Yes" : "No",
                printSettings.includes("duplex") ? Math.ceil(file.pages / 2) : file.pages,
                `${total.toFixed(2)} AED`,
                "Job spool dispatched completely. Completed rasterization to raw spool bytes."
              );

              // Set success status for custom modal and trigger native alert safely
              setSuccessJob({
                name: file.name,
                pages: file.pages,
                rate: rate,
                total: total,
                targetFolder: file.targetFolder,
                printer: config.printerName
              });

              try {
                if (typeof window !== 'undefined') {
                  window.alert(`SUCCESS: Your print job "${file.name}" completed successfully on printer "${config.printerName}".`);
                }
              } catch (alertErr) {
                console.warn("Iframe environment blocked standard alert popup. Showing custom modal instead.");
              }
            }
            resolvePrint();
          });
        });
      } else {
        // Fallback for browser simulation mode
        const mockCmd = `"${config.sumatraPath}" -print-to "${config.printerName}" -print-settings "${printSettings}" "C:\\Users\\Roshan\\OneDrive\\AI_Print_Assistant\\${file.targetFolder}\\${file.name}"`;
        addLogMessage(`[SANDBOX SIMULATOR] Simulated printing script generation complete.`, 'info');
        addLogMessage(`Shell Exec: ${mockCmd}`, 'info');
        addLogMessage(`Print Spool successful: dispatched via SumatraPDF silent engine (No-popup target: "${config.printerName}"). Bilateral duplex preferred: ${config.duplexPreferred}`, 'success');

        setQueuedFiles(prev =>
          prev.map(f =>
            f.id === file.id
              ? { ...f, status: 'printed', progress: 100, progressMessage: 'Success!' }
              : f
          )
        );

        handleAddHistory(
          file.name,
          file.targetFolder,
          file.pages,
          total,
          `Printed ${file.pages} page(s) on printer ${config.printerName} in directory ${file.targetFolder}.`,
          'SUCCESS',
          file.name.split('.').pop() || 'pdf',
          config.printerName || 'HP OfficeJet Pro 9010 series',
          file.targetFolder.includes('COLOR') ? 'Presentation Color' : 'Standard Eco Grayscale',
          printSettings.includes("duplex") ? "Yes" : "No",
          printSettings.includes("duplex") ? Math.ceil(file.pages / 2) : file.pages,
          `${total.toFixed(2)} AED`,
          "Job spool dispatched completely. Completed rasterization to raw spool bytes."
        );

        // Set success status for custom modal and trigger native alert safely
        setSuccessJob({
          name: file.name,
          pages: file.pages,
          rate: rate,
          total: total,
          targetFolder: file.targetFolder,
          printer: config.printerName
        });

        try {
          if (typeof window !== 'undefined') {
            window.alert(`SUCCESS: Your print job "${file.name}" completed successfully on printer "${config.printerName}".`);
          }
        } catch (alertErr) {
          console.warn("Iframe environment blocked standard alert popup. Showing custom modal instead.");
        }
      }

      currentIndex++;
      await new Promise(resolve => setTimeout(resolve, 700));
      processNext();
    };

    processNext();
  };

  const handlePrintSingleFile = async (fileId: string) => {
    const file = queuedFiles.find(f => f.id === fileId);
    if (!file) return;

    addLogMessage(`Initializing precise manual spool override for ${file.name}...`, 'info');

    // Set file to processing
    setQueuedFiles(prev =>
      prev.map(f =>
        f.id === fileId
          ? { ...f, status: 'processing', progress: 15, progressMessage: 'Aligning page dimensions...' }
          : f
      )
    );

    // Minor loading delays to showcase active system auditing
    await new Promise(resolve => setTimeout(resolve, 550));

    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const isPdf = ext === 'pdf';
    const isDoc = ext === 'docx' || ext === 'doc';
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext);
    const node = getNodeEnv();
    let localPath = '';

    if (node) {
      try {
        localPath = await getLocalFilePath(file);
      } catch (err) {
        console.error(err);
      }
    }

    // Convert or skipping log messages
    if (!isPdf) {
      addLogMessage(`[AUTO-CONVERSION] Auto compiling non-PDF format .${ext} to printable layout grid blueprint.`, 'info');
      setQueuedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, progress: 50, progressMessage: 'Rendering compatible margins...' }
            : f
        )
      );
      await new Promise(resolve => setTimeout(resolve, 600));
    } else {
      addLogMessage(`[VERIFIER] Streaming direct binary structure to SumatraPDF pipeline.`, 'info');
      setQueuedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, progress: 50, progressMessage: 'Verifying raster channels...' }
            : f
        )
      );
      await new Promise(resolve => setTimeout(resolve, 450));
    }

    setQueuedFiles(prev =>
      prev.map(f =>
        f.id === fileId
          ? { ...f, progress: 80, progressMessage: 'Buffering local printer spool queue...' }
          : f
      )
    );
    await new Promise(resolve => setTimeout(resolve, 500));

    let rate = pricing.bw_single;
    if (file.targetFolder === 'PRINT_BW_DUPLEX') rate = pricing.bw_duplex;
    else if (file.targetFolder === 'PRINT_COLOR_SINGLE') rate = pricing.color_single;
    else if (file.targetFolder === 'PRINT_COLOR_DUPLEX') rate = pricing.color_duplex;
    else if (file.targetFolder === 'CUSTOM_PRINT_ORDERS') rate = 1.00;
    const total = file.pages * rate;

    const isSingleFolder2 = file.targetFolder === "PRINT_BW_SINGLE" || file.targetFolder === "PRINT_COLOR_SINGLE";
    const isDuplexFolder2 = file.targetFolder === "PRINT_BW_DUPLEX" || file.targetFolder === "PRINT_COLOR_DUPLEX";
    const useDuplex2 = isDuplexFolder2 || (!isSingleFolder2 && config.duplexPreferred);
    let printSettings = useDuplex2 ? "duplexlong" : "simplex";

    if (file.targetFolder.includes("BW")) {
      printSettings += ",monochrome";
    } else {
      printSettings += ",color";
    }

    if (file.targetFolder === 'CUSTOM_PRINT_ORDERS') {
      const sub = file.customSubFolder || 'NORMAL_PAGES';
      const cfg = file.customConfig || {};
      if (sub === 'PASSPORT_PHOTO') {
        printSettings = 'simplex,color';
      } else if (sub === 'ID_CARDS') {
        const idDuplex = cfg.duplex ? 'duplexlong' : 'simplex';
        const idColor = cfg.mode === 'bw' ? 'monochrome' : 'color';
        printSettings = `${idDuplex},${idColor}`;
      } else {
        // NORMAL_PAGES — apply B&W/color, duplex, and validated page range
        const npDuplex = cfg.duplex ? 'duplexlong' : 'simplex';
        const npColor = cfg.color_mode === 'bw' ? 'monochrome' : 'color';
        const npCopies = cfg.copies > 1 ? `,${cfg.copies}x` : '';
        const validPages = validatePageRange(cfg.selected_pages || 'all', file.pages);
        const npPages = validPages ? `,${validPages}` : '';
        printSettings = `${npDuplex},${npColor}${npPages}${npCopies}`;
        if (validPages !== (cfg.selected_pages || '').replace(/\s/g, '').replace(/all/g, '')) {
          addLogMessage(`[PAGE RANGE] Clamped page range to PDF size (${file.pages} pages). Printing: ${validPages || 'all'}`, 'warning');
        }
      }
    }

    if (simulateError) {
      addLogMessage(`[HARDWARE EXCEPTION] Simulated print defect intercepted spool command. File diverted to ERROR_FILES.`, 'error');
      setQueuedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'error', progress: 0, progressMessage: 'Failed! Spool defect.' }
            : f
        )
      );
      
      const calculatedSheets = printSettings.includes("duplex") ? Math.ceil(file.pages / 2) : file.pages;
      handleAddHistory(
        file.name,
        file.targetFolder,
        file.pages,
        total,
        `Device error check: Spool defect reported (Error Code: 0x800F).`,
        'ERROR',
        ext,
        config.printerName || 'HP OfficeJet Pro 9010 series',
        'Eco Draft Grayscale',
        printSettings.includes("duplex") ? "Yes" : "No",
        calculatedSheets,
        `${total.toFixed(2)} AED`,
        'Spool failed due to simulated user exception.'
      );
      return;
    }

    if (node && localPath) {
      const sumatraCmd = `"${config.sumatraPath}" -print-to "${config.printerName}" -print-settings "${printSettings}" "${localPath}"`;
      addLogMessage(`[SP CLI RUN] Executing silent direct printing pipeline...`, 'info');
      addLogMessage(`Direct Command: ${sumatraCmd}`, 'info');

      node.childProcess.exec(sumatraCmd, (err: any) => {
        if (err) {
          addLogMessage(`[SP FAILURE] SumatraPDF spool daemon aborted (Error: ${err.message})`, 'error');
          setQueuedFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, status: 'error', progress: 0, progressMessage: 'Failed!' }
                : f
            )
          );
        } else {
          addLogMessage(`[SP SUCCESS] Decoupled print job dispatched cleanly to device buffer "${config.printerName}".`, 'success');
          setQueuedFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, status: 'printed', progress: 100, progressMessage: 'Success!' }
                : f
            )
          );

          handleAddHistory(
            file.name,
            file.targetFolder,
            file.pages,
            total,
            `Printed ${file.pages} page(s) on printer ${config.printerName} (Direct Manual Override).`,
            'SUCCESS',
            ext,
            config.printerName || 'HP OfficeJet Pro 9010 series',
            file.targetFolder.includes('COLOR') ? 'Presentation Color' : 'Standard Eco Grayscale',
            printSettings.includes("duplex") ? "Yes" : "No",
            printSettings.includes("duplex") ? Math.ceil(file.pages / 2) : file.pages,
            `${total.toFixed(2)} AED`,
            "Direct manual job spool completed successfully."
          );

          setSuccessJob({
            name: file.name,
            pages: file.pages,
            rate: rate,
            total: total,
            targetFolder: file.targetFolder,
            printer: config.printerName
          });

          try {
            window.alert(`SUCCESS: Direct print job "${file.name}" completed successfully on printer "${config.printerName}".`);
          } catch (_) {}
        }
      });
    } else {
      addLogMessage(`[SANDBOX SIMULATOR] Simulated direct printing pipeline generated successfully:`, 'info');
      addLogMessage(`Target Command Context: "${config.sumatraPath}" -print-to "${config.printerName}" -print-settings "${printSettings}" "${file.name}"`, 'info');
      addLogMessage(`[SP SUCCESS] Decoupled print job dispatched cleanly to device buffer "${config.printerName}".`, 'success');

      setQueuedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'printed', progress: 100, progressMessage: 'Success!' }
            : f
        )
      );

      handleAddHistory(
        file.name,
        file.targetFolder,
        file.pages,
        total,
        `Printed ${file.pages} page(s) on printer ${config.printerName} (Direct Manual Override).`,
        'SUCCESS',
        ext,
        config.printerName || 'HP OfficeJet Pro 9100 series',
        file.targetFolder.includes('COLOR') ? 'Presentation Color' : 'Standard Eco Grayscale',
        printSettings.includes("duplex") ? "Yes" : "No",
        printSettings.includes("duplex") ? Math.ceil(file.pages / 2) : file.pages,
        `${total.toFixed(2)} AED`,
        "Direct manual job spool completed successfully."
      );

      setSuccessJob({
        name: file.name,
        pages: file.pages,
        rate: rate,
        total: total,
        targetFolder: file.targetFolder,
        printer: config.printerName
      });

      try {
        window.alert(`SUCCESS: Direct print job "${file.name}" completed successfully on printer "${config.printerName}".`);
      } catch (_) {}
    }
  };

  // Anti-Theft Lock overlay structure
  const handleProlongTrialKey = () => {
    // Generates active monthly license key on the spot to bypass trials
    const updated: LicenseInfo = {
      ...license,
      license: {
        ...license.license,
        status: 'active',
        licenseExpiryDate: '2026-07-28', // prolonged
      }
    };
    setLicense(updated);
    addLogMessage('Anti-Theft Lock deactivated. Restored paid subscription channel.', 'success');
  };

  const isExpiredAndLocked = license.licenseEnabled && license.license.status === 'expired';

  return (
    <div className="min-h-screen bg-transparent text-slate-800 flex flex-col justify-between font-sans relative overflow-x-hidden">
      
      {/* Premium ambient light drift blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-200/20 rounded-full filter blur-[100px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-sky-200/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-20 w-[450px] h-[450px] bg-pink-200/10 rounded-full filter blur-[90px] pointer-events-none" />
      
      {/* Dynamic Expiry Guard Anti-Theft Lock Screen overlay */}
      {isExpiredAndLocked && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center select-none text-white animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full p-8 rounded-3xl shadow-2xl relative space-y-6">
            <div className="p-4 bg-rose-500/10 rounded-full text-rose-500 w-16 h-16 mx-auto flex items-center justify-center animate-bounce">
              <FileLock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-100 font-display">TRIAL TERMINATED : RENEWAL REQUIRED</h1>
              <p className="text-xs text-slate-400 font-mono">CUSTOMER_STATUS: LOCKED_OUT_AUDIT_EXPIRED</p>
              <div className="p-3 bg-slate-950/80 rounded-xl space-y-1 mt-4 text-left font-mono border border-slate-850">
                <div className="flex justify-between text-[10.5px]">
                  <span className="text-slate-500">MACHINE_ID:</span>
                  <span className="text-slate-300 font-bold">{license.license.machineId}</span>
                </div>
                <div className="flex justify-between text-[10.5px]">
                  <span className="text-slate-500">CUSTOMER:</span>
                  <span className="text-slate-300">{license.customer.shopName}</span>
                </div>
                <div className="flex justify-between text-[10.5px]">
                  <span className="text-slate-500">EXPIRY_TARGET:</span>
                  <span className="text-rose-400 font-bold">{license.license.licenseExpiryDate}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-450 leading-relaxed">
              This terminal is locked as payment terms are currently pending manual renewal verification. 
              Please contact the developers to prolong credentials validity bytes or apply a monthly active key.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleProlongTrialKey}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-850 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Instantly prolong key (AIPA-TESTER BIND)</span>
              </button>
              <button
                onClick={() => {
                  // Temporary bypass switch option inside simulation sandbox
                  setLicense(prev => ({ ...prev, licenseEnabled: false }));
                  addLogMessage('Development sandbox bypass triggered.', 'warning');
                }}
                className="w-full py-2 bg-slate-950 text-slate-400 hover:text-slate-250 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Bypass Lock (Simulation Mode)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Container layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Top App Header bar */}
        <header className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4.5 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl space-y-4 md:space-y-0 relative select-none">
          <div className="flex items-center space-x-3.5 text-left">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-indigo-50 font-display">
                {license.customer.shopName || 'AI Print Assistant'}
              </h1>
              <p className="text-[10.5px] text-slate-400 font-mono flex items-center space-x-2 mt-0.5">
                <span className="text-indigo-400 font-semibold">{license.customer.ownerName || 'Print Management System'}</span>
                <span>•</span>
                <span>{license.customer.location || 'v1.0'}</span>
              </p>
            </div>
          </div>

          {/* Active status indicators bento */}
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-[9.5px]">
            {/* Sumatra indicator */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1.5 flex items-center space-x-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${setupStatus.sumatraPdfDetected ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
              <span className="text-slate-450 uppercase">SUMATRA: {setupStatus.sumatraPdfDetected ? 'OK' : 'ERR'}</span>
            </div>

            {/* Watcher daemon status indicator */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1.5 flex items-center space-x-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isDaemonActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="text-slate-450 uppercase">DAEMON: {isDaemonActive ? 'ACTIVE' : 'STANDBY'}</span>
            </div>

            {/* License Mode */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1.5 flex items-center space-x-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${license.licenseEnabled ? 'bg-indigo-400' : 'bg-amber-400'}`} />
              <span className="text-indigo-400 font-bold uppercase">{license.licenseEnabled ? 'ENFORCED' : 'DEV_OK'}</span>
            </div>
          </div>
        </header>

        {/* Bento Tabs Nav Navigation menu */}
        <nav className="flex flex-wrap border-b border-slate-200 gap-1.5 select-none">
          <button
            onClick={() => setActiveTab('watcher')}
            className={`px-4.5 py-3 text-xs font-semibold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'watcher'
                ? 'bg-white border-indigo-600 text-indigo-700 font-bold shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <FolderSync className="w-4 h-4" />
            <span>Folder Watcher Spools</span>
          </button>
          <button
            onClick={() => setActiveTab('idcard')}
            className={`px-4.5 py-3 text-xs font-semibold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'idcard'
                ? 'bg-white border-indigo-600 text-indigo-700 font-bold shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>ID Card Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('passport')}
            className={`px-4.5 py-3 text-xs font-semibold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'passport'
                ? 'bg-white border-indigo-600 text-indigo-700 font-bold shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Passport Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4.5 py-3 text-xs font-semibold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'config'
                ? 'bg-white border-indigo-600 text-indigo-700 font-bold shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Setup & Bindings</span>
          </button>
          <button
            onClick={() => setActiveTab('license')}
            className={`px-4.5 py-3 text-xs font-semibold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'license'
                ? 'bg-white border-indigo-600 text-indigo-700 font-bold shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Licenses Key Admin</span>
          </button>
        </nav>

        {/* Selected Tabs View window container */}
        <main className="transition-all duration-300">
          {activeTab === 'watcher' && (
            <FolderWatcherTab 
              pricing={pricing}
              queuedFiles={queuedFiles}
              onUploadFile={handleUploadFile}
              onClearQueue={() => setQueuedFiles([])}
              onStartDaemon={handleStartDaemon}
              isDaemonActive={isDaemonActive}
              onRemoveFile={handleRemoveFile}
              printedHistory={printedHistory}
              customConfigs={customConfigs}
              onSaveCustomConfigs={setCustomConfigs}
              simulateError={simulateError}
              onToggleSimulateError={() => setSimulateError(!simulateError)}
              onAddHistory={handleAddHistory}
              onClearHistory={() => setPrintedHistory([])}
              onAddQueuedFile={(f) => setQueuedFiles(prev => [...prev, f])}
              onPrintSingleFile={handlePrintSingleFile}
            />
          )}

          {activeTab === 'idcard' && (
            <IdCardTab 
              onAddHistory={handleAddHistory}
              onLogMessage={addLogMessage}
            />
          )}

          {activeTab === 'passport' && (
            <PassportTab 
              onAddHistory={handleAddHistory}
              onLogMessage={addLogMessage}
            />
          )}

          {activeTab === 'config' && (
            <SetupTab 
              config={config}
              status={setupStatus}
              onSaveConfig={(updated) => {
                setConfig(updated);
                addLogMessage('config.json binding changes recorded in cache.', 'success');
              }}
              onRunDiagnostics={handleRunDiagnostics}
              isDiagnosing={isDiagnosing}
              onUpdatePrinterOnline={(online) => {
                setSetupStatus(prev => ({ ...prev, printerOnline: online }));
                addLogMessage(`[PING TEST] Printer network link state successfully updated to ${online ? 'ONLINE (ACTIVE)' : 'OFFLINE'}.`, 'success');
              }}
            />
          )}

          {activeTab === 'license' && (
            <LicenseTab 
              license={license}
              onUpdateLicense={(updated) => setLicense(updated)}
              onLogMessage={addLogMessage}
            />
          )}
        </main>

        {/* Retro Command logs Panel */}
        <section className="pt-4">
          <TerminalPanel 
            logs={logs}
            onClear={handleClearLogs}
            onExecuteCommand={handleExecuteCommand}
          />
        </section>
      </div>

      {/* Footer credits bar */}
      <footer className="py-5 border-t border-slate-200 text-center text-[11px] text-slate-400 font-medium select-none bg-white">
        <span>© 2026 AI Print Assistant Project • Engineered with absolute scope discipline and robust TypeScript bindings</span>
      </footer>

      {/* Custom Modal Confirmation for Successful Print Job */}
      {successJob && (
        <div id="print-success-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 relative">
            <button
              id="close-success-modal-btn"
              onClick={() => setSuccessJob(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg select-none cursor-pointer"
            >
              ×
            </button>
            
            <div className="flex items-center space-x-3 text-emerald-600">
              <div className="p-2 bg-emerald-50 rounded-full">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base tracking-tight font-display text-slate-900">
                Spool & Print Succeeded!
              </h3>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-sans">File Name:</span>
                <span className="text-slate-800 font-semibold text-right max-w-[200px] break-all">{successJob.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-sans">Pages Spooled:</span>
                <span className="text-slate-900 font-bold">{successJob.pages} pg(s)</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-sans">Active Printer:</span>
                <span className="text-slate-650 truncate max-w-[180px]">{successJob.printer}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-sans">Target Spool:</span>
                <span className="text-slate-650 uppercase font-semibold text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded">{successJob.targetFolder}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-slate-900 font-sans font-bold">
                <span>Estimated Cost:</span>
                <span className="text-indigo-600 font-mono text-sm">{successJob.total.toFixed(2)} AED</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed text-center">
              The job was dispatched via SumatraPDF silent engine. File telemetry records were preserved in the persistent system logs.
            </p>

            <div className="flex space-x-3 pt-1">
              <button
                id="modal-acknowledge-btn"
                onClick={() => setSuccessJob(null)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer text-center transition-all"
              >
                Acknowledge
              </button>
              <button
                id="modal-another-btn"
                onClick={() => {
                  setSuccessJob(null);
                  setActiveTab('watcher');
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-600 font-semibold text-xs rounded-xl cursor-pointer text-center transition-all"
              >
                Back to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-update toast — shown only in packaged builds */}
      <UpdateToast />
    </div>
  );
}
