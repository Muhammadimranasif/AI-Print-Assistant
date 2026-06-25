import React, { useState, useRef } from 'react';
import { PrintFile, PricingConfig, PrintedHistoryOrder } from '../types';
import { Folder, Upload, Play, Printer, CheckCircle, FileText, X, ChevronRight, RefreshCw, AlertCircle, Trash2, ShieldCheck, Ticket, Eye, FileDown, Settings2, AlertTriangle } from 'lucide-react';

interface PrintPreviewCanvasProps {
  file: PrintFile;
  pageNumber: number;
  zoom: number;
  margin: 'none' | 'normal' | 'wide';
}

function PrintPreviewCanvas({ file, pageNumber, zoom, margin }: PrintPreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions setup
    const baseWidth = 400;
    const baseHeight = 560;

    const startX = 20;
    const startY = 20;
    const pageW = baseWidth - 40;
    const pageH = baseHeight - 40;

    let marginPx = 20; // normal
    if (margin === 'none') marginPx = 2; // thin boundary
    else if (margin === 'wide') marginPx = 35;

    const printX = startX + marginPx;
    const printY = startY + marginPx;
    const printW = pageW - (marginPx * 2);
    const printH = pageH - (marginPx * 2);

    const drawBaseTemplate = () => {
      // Clear and scale sizes
      canvas.width = baseWidth * zoom;
      canvas.height = baseHeight * zoom;
      ctx.scale(zoom, zoom);

      // Draw background (outer gray workspace)
      ctx.fillStyle = '#f1f5f9'; // slate-100
      ctx.fillRect(0, 0, baseWidth, baseHeight);

      // Draw blank white paper sheet with shadow
      ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(startX, startY, pageW, pageH);
      ctx.shadowColor = 'transparent'; // Reset shadow for next drawings
    };

    const drawOverlays = () => {
      // Draw margin dotted border (printable area guideline)
      ctx.strokeStyle = '#cbd5e1'; // slate-300
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(printX, printY, printW, printH);
      ctx.setLineDash([]); // Reset dash

      // Draw Corner Printer Registration Marks (reticles)
      const drawRegistrationMark = (cx: number, cy: number) => {
        ctx.strokeStyle = '#94a3b8'; // slate-400
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy);
        ctx.lineTo(cx + 10, cy);
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx, cy + 10);
        ctx.stroke();
      };

      drawRegistrationMark(startX + 8, startY + 8);
      drawRegistrationMark(startX + pageW - 8, startY + 8);
      drawRegistrationMark(startX + 8, startY + pageH - 8);
      drawRegistrationMark(startX + pageW - 8, startY + pageH - 8);

      // Draw CMYK Color bars at bottom right
      const colors = ['#22d3ee', '#ec4899', '#eab308', '#0f172a']; // Cyan, Magenta, Yellow, Slate Dark
      colors.forEach((color, idx) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(startX + pageW - 60 + (idx * 12), startY + pageH - 12, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw header / watermark info
      ctx.fillStyle = '#64748b'; // slate-500
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`PAGE ${pageNumber} OF ${file.pages}`, startX + pageW - 80, startY + 12);
      
      // Draw Folder watermark
      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.font = '7px sans-serif';
      ctx.fillText(`TARGET: ${file.targetFolder}`, startX + 12, startY + 12);
    };

    const drawFallbackMock = () => {
      // Let's draw realistic content dependent on file.type
      const isColor = file.targetFolder.includes('COLOR');
      const accentColor = isColor ? '#4f46e5' : '#475569'; // Indigo or Slate dark
      const secondaryColor = isColor ? '#06b6d4' : '#94a3b8'; // Cyan or Slate light
      const isDoc = file.type === 'docx' || file.type === 'doc';
      
      // Header title for mock document
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.font = 'bold 11px sans-serif';
      const cleanFileName = file.name.substring(0, 30);
      ctx.fillText(cleanFileName, printX + 10, printY + 25);

      // Draw subtle separation line
      ctx.strokeStyle = '#cbd5e1'; // slate-300
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(printX + 10, printY + 32);
      ctx.lineTo(printX + printW - 10, printY + 32);
      ctx.stroke();

      if (isDoc || file.type === 'pdf' || file.type === 'txt') {
        // Draw standard document contents: lines of text & elements
        ctx.fillStyle = '#334155'; // slate-700
        ctx.font = '7px sans-serif';

        // Text blocks
        let lineY = printY + 50;

        // Draw a simulated paragraph
        const blockLines = [
          'ROSHAN COPIERS & DIGITAL OFFICE SYSTEM SERVICES',
          'Official printed report generated on demand. Spooled via SumatraPDF',
          'headless daemon. Fast conversion is powered by LibreOffice engine.',
          'This copy represents the final print output preview. Please review',
          'margins, pagination, layout, and colors before confirming.'
        ];

        blockLines.forEach((line) => {
          ctx.fillText(line, printX + 10, lineY);
          lineY += 12;
        });

        lineY += 10;

        // Draw standard tabular structure (Very realistic data print!)
        ctx.fillStyle = '#f8fafc'; // slate-50
        ctx.fillRect(printX + 10, lineY, printW - 20, 14);
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(printX + 10, lineY, printW - 20, 14);

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText('Order ID', printX + 15, lineY + 9);
        ctx.fillText('Description', printX + 60, lineY + 9);
        ctx.fillText('Qty', printX + 160, lineY + 9);
        ctx.fillText('Price (AED)', printX + 195, lineY + 9);

        lineY += 14;

        // Table rows
        const rows = [
          ['#XN-10922', 'A4 High-yield Duplex Print', '3', '1.35'],
          ['#XN-10923', 'Color Graphic Sheet Import', '1', '2.00'],
          ['#XN-10924', 'Express Sumatra Print Bypass', '4', '0.00']
        ];

        rows.forEach((row, rIdx) => {
          ctx.fillStyle = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
          ctx.fillRect(printX + 10, lineY, printW - 20, 13);
          ctx.strokeStyle = '#f1f5f9';
          ctx.strokeRect(printX + 10, lineY, printW - 20, 13);

          ctx.fillStyle = '#64748b';
          ctx.font = '6px monospace';
          ctx.fillText(row[0], printX + 15, lineY + 9);
          ctx.font = '6px sans-serif';
          ctx.fillText(row[1], printX + 60, lineY + 9);
          ctx.fillText(row[2], printX + 165, lineY + 9);
          ctx.fillText(row[3], printX + 210, lineY + 9);
          lineY += 13;
        });

        lineY += 15;

        // Draw a beautiful dynamic vector drawing: simulated financial chart!
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('Visual Analytics Overview', printX + 10, lineY);
        lineY += 8;

        // Draw a line chart background
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(printX + 10, lineY, printW - 20, 60);
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(printX + 10, lineY, printW - 20, 60);

        // Grid lines
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 0.5;
        for (let g = 1; g < 4; g++) {
          ctx.beginPath();
          ctx.moveTo(printX + 10, lineY + g * 15);
          ctx.lineTo(printX + printW - 10, lineY + g * 15);
          ctx.stroke();
        }

        // Draw actual chart lines
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(printX + 20, lineY + 45);
        ctx.bezierCurveTo(printX + 60, lineY + 20, printX + 110, lineY + 50, printX + 150, lineY + 10);
        ctx.lineTo(printX + printW - 20, lineY + 35);
        ctx.stroke();

        // If color, shade under the curve
        if (isColor) {
          ctx.fillStyle = secondaryColor + '22'; // 22 is transparency
          ctx.lineTo(printX + printW - 20, lineY + 60);
          ctx.lineTo(printX + 20, lineY + 60);
          ctx.closePath();
          ctx.fill();
        }

        // Dots on points
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(printX + 150, lineY + 10, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw secondary data series bar chart
        ctx.fillStyle = secondaryColor;
        const barY = lineY + 60;
        const barW = 8;
        const barSpace = 12;
        const hData = [20, 35, 12, 45, 30, 25, 40, 15, 33];
        hData.forEach((val, bIdx) => {
          ctx.fillRect(printX + 24 + bIdx * barSpace, barY - val, barW, val);
        });

        lineY += 75;

        // Confidential Footer text
        ctx.fillStyle = '#94a3b8';
        ctx.font = '6px sans-serif';
        ctx.fillText('This document or layout is digitally signed. Unauthorized replication is prohibited.', printX + 10, lineY);
        
      } else {
        // IMAGE FILE PREVIEW (PNG / JPEG) DEFAULT SCENIC TEMPLATE
        ctx.fillStyle = '#334155'; // slate-700
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('Digital Asset Representation (Photo Format)', printX + 10, printY + 45);

        // Draw big image preview placeholder bounds with scenic drawing!
        const imgX = printX + 10;
        const imgY = printY + 55;
        const imgW = printW - 20;
        const imgH = printH - 95;

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(imgX, imgY, imgW, imgH);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(imgX, imgY, imgW, imgH);

        // Draw a radiant sun
        ctx.fillStyle = isColor ? '#f59e0b' : '#64748b'; // Yellow or grey
        ctx.beginPath();
        ctx.arc(imgX + imgW / 2, imgY + 50, 24, 0, Math.PI * 2);
        ctx.fill();

        // Draw standard landscape mountains
        ctx.fillStyle = isColor ? '#4f46e5' : '#475569';
        ctx.beginPath();
        ctx.moveTo(imgX, imgY + imgH);
        ctx.lineTo(imgX + 60, imgY + imgH - 50);
        ctx.lineTo(imgX + 120, imgY + imgH);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = isColor ? '#3b82f6' : '#334155';
        ctx.beginPath();
        ctx.moveTo(imgX + 80, imgY + imgH);
        ctx.lineTo(imgX + imgW / 2 + 30, imgY + imgH - 75);
        ctx.lineTo(imgX + imgW - 20, imgY + imgH);
        ctx.closePath();
        ctx.fill();

        // Draw a beautiful sailboat or tree
        ctx.fillStyle = isColor ? '#10b981' : '#1e293b';
        ctx.beginPath();
        ctx.moveTo(imgX + imgW - 60, imgY + imgH);
        ctx.lineTo(imgX + imgW - 40, imgY + imgH - 40);
        ctx.lineTo(imgX + imgW - 20, imgY + imgH);
        ctx.closePath();
        ctx.fill();

        // Draw ocean water ripples
        ctx.strokeStyle = isColor ? '#06b6d4' : '#94a3b8';
        ctx.lineWidth = 1.5;
        for (let r = 0; r < 4; r++) {
          ctx.beginPath();
          ctx.arc(imgX + 40 + r * 50, imgY + imgH - 12, 10, Math.PI, 0);
          ctx.stroke();
        }

        // Draw image metadata table
        const metaY = imgY + imgH + 12;
        ctx.fillStyle = '#64748b';
        ctx.font = '7px sans-serif';
        ctx.fillText(`Dimensions: Original Image Asset • Scale Fitted to Page`, printX + 10, metaY);
        ctx.fillText(`Resolution Target: Fast High DPI Halftone Rasterization`, printX + 10, metaY + 11);
        ctx.fillText(`Paper Feed Profile: Letter/A4 ${file.targetFolder}`, printX + 10, metaY + 22);
      }

      drawOverlays();
    };

    // Prepare Base Paper Workspace
    drawBaseTemplate();

    const ext = file.type.toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext) || !!file.fileUrl?.startsWith('data:image/');
    const isPdf = ext === 'pdf';

    if (isImage && file.fileUrl) {
      // Draw actual original image
      const img = new Image();
      img.src = file.fileUrl;
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        let drawW = printW;
        let drawH = printH;
        let drawX = printX;
        let drawY = printY;

        if (ratio > printW / printH) {
          drawW = printW;
          drawH = printW / ratio;
          drawY = printY + (printH - drawH) / 2;
        } else {
          drawH = printH;
          drawW = printH * ratio;
          drawX = printX + (printW - drawW) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        drawOverlays();
      };
      img.onerror = () => {
        drawFallbackMock();
      };
      return;
    }

    if (isPdf && file.fileUrl) {
      // Draw actual PDF page using dynamically loaded PDF.js
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
          const loadingTask = pdfjsLib.getDocument(file.fileUrl!);
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(Math.min(pageNumber, pdf.numPages));

          // Draw onto an offscreen canvas first to avoid blinking
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          if (!tempCtx) {
            drawFallbackMock();
            return;
          }

          const unscaledViewport = page.getViewport({ scale: 1 });
          const scale = Math.min(printW / unscaledViewport.width, printH / unscaledViewport.height);
          const viewport = page.getViewport({ scale: scale * zoom });

          tempCanvas.width = viewport.width;
          tempCanvas.height = viewport.height;

          await page.render({
            canvasContext: tempCtx,
            viewport: viewport
          }).promise;

          const drawX = printX + (printW - viewport.width / zoom) / 2;
          const drawY = printY + (printH - viewport.height / zoom) / 2;

          ctx.drawImage(tempCanvas, drawX, drawY, viewport.width / zoom, viewport.height / zoom);
          drawOverlays();
        } catch (err) {
          console.error("PDF page render error inside Canvas: ", err);
          drawFallbackMock();
        }
      }).catch(err => {
        console.error("Failed loading PDF.js script dynamically: ", err);
        drawFallbackMock();
      });
      return;
    }

    // Default Fallback Mock drawing if not found or unsupported format
    drawFallbackMock();

  }, [file, pageNumber, zoom, margin]);

  return (
    <canvas
      ref={canvasRef}
      id={`canvas-preview-${file.id}`}
      className="border border-slate-200/80 rounded-xl shadow-md max-w-full block mx-auto bg-stone-50"
    />
  );
}

function PassportBgCanvas({ imageUrl, bgColor }: { imageUrl: string; bgColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (bgColor === 'keep') return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Sample background color from edge pixels
      const samples = [
        [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
        [Math.floor(w / 2), 0], [0, Math.floor(h / 2)],
        [w - 1, Math.floor(h / 2)], [Math.floor(w / 2), h - 1],
      ];
      let sr = 0, sg = 0, sb = 0;
      samples.forEach(([cx, cy]) => {
        const i = (cy * w + cx) * 4;
        sr += data[i]; sg += data[i + 1]; sb += data[i + 2];
      });
      sr = Math.round(sr / samples.length);
      sg = Math.round(sg / samples.length);
      sb = Math.round(sb / samples.length);

      // Replacement color
      let tr = 255, tg = 255, tb = 255;
      if (bgColor === 'blue')  { tr = 80; tg = 120; tb = 220; }
      if (bgColor === 'black') { tr = 0; tg = 0; tb = 0; }

      const tolerance = 65;
      const visited = new Uint8Array(w * h);
      const stack: number[] = [];
      samples.forEach(([cx, cy]) => stack.push(cy * w + cx));

      while (stack.length > 0) {
        const idx = stack.pop()!;
        if (visited[idx]) continue;
        visited[idx] = 1;
        const pi = idx * 4;
        const dr = data[pi] - sr, dg = data[pi + 1] - sg, db = data[pi + 2] - sb;
        if (Math.sqrt(dr * dr + dg * dg + db * db) > tolerance) continue;
        data[pi] = tr; data[pi + 1] = tg; data[pi + 2] = tb; data[pi + 3] = 255;
        const x = idx % w, y = Math.floor(idx / w);
        if (x > 0) stack.push(idx - 1);
        if (x < w - 1) stack.push(idx + 1);
        if (y > 0) stack.push(idx - w);
        if (y < h - 1) stack.push(idx + w);
      }

      ctx.putImageData(imageData, 0, 0);
    };
    img.src = imageUrl;
  }, [imageUrl, bgColor]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-h-52 object-contain rounded-xl border border-slate-200 shadow-sm"
      style={{ imageRendering: 'auto' }}
    />
  );
}

interface FolderWatcherTabProps {
  pricing: PricingConfig;
  queuedFiles: PrintFile[];
  onUploadFile: (file: File, folderName: string) => void;
  onClearQueue: () => void;
  onStartDaemon: () => void;
  isDaemonActive: boolean;
  onRemoveFile: (id: string) => void;
  printedHistory: PrintedHistoryOrder[];
  customConfigs: {
    passportPhoto?: {
      photo_count: string;
      output_jpg: boolean;
      output_pdf: boolean;
      gap_mm: number;
      person_background: string;
      sheet_background: string;
      border_enabled: boolean;
      border_width_px: number;
      border_color: string;
      watch_delay_seconds: number;
    };
    idCard: {
      jobType?: string;
      idCard?: string;
      mode: string;
      blackAndWhite?: boolean;
      dpi?: number;
      paperSize?: string;
      faceExposureLevel?: string;
      duplex?: boolean;
      id_card_layout?: {
        enabled?: boolean;
        pdf_file?: string;
        front_file?: string;
        back_file?: string;
        cards_per_sheet?: number;
        cut_guides?: boolean;
        auto_crop?: boolean;
        fit_mode?: string;
        enhance?: boolean;
        contrast?: number;
        sharpness?: number;
        brightness?: number;
        card_width_mm?: number;
        card_height_mm?: number;
        approved_to_print?: boolean;
      };
    };
    normalPages: {
      jobType?: string;
      idCard?: string;
      mode?: string;
      blackAndWhite?: boolean;
      color_mode?: 'bw' | 'color';
      dpi?: number;
      paperSize?: string;
      contrastBoost?: boolean;
      selected_pages?: string;
      duplex?: boolean;
      fit_to_page?: string;
      collate?: boolean;
      copies?: number;
    };
  };
  onSaveCustomConfigs: (updated: any) => void;
  simulateError: boolean;
  onToggleSimulateError: () => void;
  onAddHistory: any;
  onClearHistory: () => void;
  onAddQueuedFile: (file: PrintFile) => void;
  onPrintSingleFile: (id: string) => void;
}

export default function FolderWatcherTab({
  pricing,
  queuedFiles,
  onUploadFile,
  onClearQueue,
  onStartDaemon,
  isDaemonActive,
  onRemoveFile,
  printedHistory,
  customConfigs,
  onSaveCustomConfigs,
  simulateError,
  onToggleSimulateError,
  onAddHistory,
  onClearHistory,
  onAddQueuedFile,
  onPrintSingleFile
}: FolderWatcherTabProps) {
  const [activeFolder, setActiveFolder] = useState<string>('PRINT_BW_SINGLE');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PrintedHistoryOrder | null>(null);
  const [previewFile, setPreviewFile] = useState<PrintFile | null>(null);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewZoom, setPreviewZoom] = useState<number>(1.0);
  const [previewMargin, setPreviewMargin] = useState<'none' | 'normal' | 'wide'>('normal');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customNormalFileRef = useRef<HTMLInputElement>(null);
  const customPassportFileRef = useRef<HTMLInputElement>(null);
  const customIdCardFileRef = useRef<HTMLInputElement>(null);
  const [passportPreviewUrl, setPassportPreviewUrl] = useState<string | null>(null);

  // Custom Orders Sub-tab selector state (PASSPORT_PHOTO, ID_CARDS or NORMAL_PAGES subfolders)
  const [customSubFolder, setCustomSubFolder] = useState<'PASSPORT_PHOTO' | 'ID_CARDS' | 'NORMAL_PAGES'>('PASSPORT_PHOTO');

  // Custom configs editing states
  const [passportPhotoConfig, setPassportPhotoConfig] = useState(customConfigs.passportPhoto || {
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
  });
  const [idCardConfig, setIdCardConfig] = useState(customConfigs.idCard || {
    job_type: "id_cards", mode: "bw", duplex: true,
    id_card_layout: { enabled: true, pdf_file: "not_used.pdf", front_file: "front.jpg", back_file: "back.jpg", cards_per_sheet: 8, cut_guides: true, auto_crop: false, fit_mode: "fill", enhance: true, contrast: 1.35, sharpness: 1.4, brightness: 0.92, card_width_mm: 85.6, card_height_mm: 53.98, approved_to_print: false }
  });
  const [normalConfig, setNormalConfig] = useState(customConfigs.normalPages || {
    job_type: "normal_pages", selected_pages: "all", duplex: false, color_mode: "bw", fit_to_page: "shrink", collate: true, copies: 1
  });

  // Keep states synced if prop updates
  React.useEffect(() => {
    if (customConfigs.passportPhoto) {
      setPassportPhotoConfig(customConfigs.passportPhoto);
    }
  }, [customConfigs.passportPhoto]);

  React.useEffect(() => {
    if (customConfigs.idCard) setIdCardConfig(customConfigs.idCard);
  }, [customConfigs.idCard]);

  React.useEffect(() => {
    if (customConfigs.normalPages) setNormalConfig(customConfigs.normalPages);
  }, [customConfigs.normalPages]);

  const folders = [
    { name: 'PRINT_BW_SINGLE', label: 'B&W Single', desc: '0.50 per page', theme: 'border-slate-300 bg-slate-50 text-slate-700' },
    { name: 'PRINT_BW_DUPLEX', label: 'B&W Duplex', desc: '0.45 per page (two-sided)', theme: 'border-slate-800 bg-slate-900 text-white' },
    { name: 'PRINT_COLOR_SINGLE', label: 'Color Single', desc: '2.00 per page', theme: 'border-cyan-300 bg-cyan-50/40 text-cyan-800' },
    { name: 'PRINT_COLOR_DUPLEX', label: 'Color Duplex', desc: '1.75 per page (two-sided)', theme: 'border-blue-700 bg-blue-600 text-white' },
    { name: 'CUSTOM_PRINT_ORDERS', label: 'Custom Orders', desc: 'ID & Normal Configs', theme: 'border-indigo-300 bg-indigo-50/40 text-indigo-900 font-medium' },
    { name: 'logs', label: 'logs/ folder', desc: 'Data logs (CSV/XLSX)', theme: 'border-emerald-300 bg-emerald-50/50 text-emerald-800 font-mono text-[10.5px]' },
    { name: 'ERROR_FILES', label: 'error files/', desc: 'Erroneous spools', theme: 'border-rose-300 bg-rose-50/40 text-rose-800 font-medium' }
  ];

  // Drag and Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        onUploadFile(file as File, activeFolder);
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      Array.from(e.target.files).forEach((file) => {
        onUploadFile(file as File, activeFolder);
      });
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleCustomOrderUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    subFolder: 'NORMAL_PAGES' | 'PASSPORT_PHOTO' | 'ID_CARDS',
    cfg: Record<string, any>
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const f = e.target.files[0];
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg', 'jpeg', 'png', 'bmp', 'webp'].includes(ext);
    const objectUrl = isImage ? URL.createObjectURL(f) : undefined;
    if (subFolder === 'PASSPORT_PHOTO' && objectUrl) {
      setPassportPreviewUrl(objectUrl);
    }
    const newFile: PrintFile = {
      id: 'cust-' + Date.now(),
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
      type: ext,
      pages: isImage ? 1 : 1,
      status: 'queued',
      progress: 0,
      progressMessage: 'Ready — custom order',
      targetFolder: 'CUSTOM_PRINT_ORDERS',
      originalPath: (f as any).path || '',
      fileUrl: objectUrl,
      uploadedAt: new Date().toISOString(),
      customSubFolder: subFolder,
      customConfig: cfg,
    };
    onAddQueuedFile(newFile);
    e.target.value = '';
  };

  const currentFolderFiles = queuedFiles.filter(f => f.targetFolder === activeFolder);
  const filesToDisplay = isDaemonActive ? queuedFiles : currentFolderFiles;
  const displayTotalCost = filesToDisplay.reduce((sum, f) => {
    let rate = pricing.bw_single;
    if (f.targetFolder === 'PRINT_BW_DUPLEX') rate = pricing.bw_duplex;
    else if (f.targetFolder === 'PRINT_COLOR_SINGLE') rate = pricing.color_single;
    else if (f.targetFolder === 'PRINT_COLOR_DUPLEX') rate = pricing.color_duplex;
    else if (f.targetFolder === 'CUSTOM_PRINT_ORDERS') rate = 1.00;
    return sum + (f.pages * rate);
  }, 0);

  return (
    <div className="space-y-6" id="watcher-tab-root">
      {/* Top action grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" id="watcher-action-grid">
        {/* Folder Selectors */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3" id="watcher-folders">
          {folders.map((folder) => {
            const count = queuedFiles.filter(f => f.targetFolder === folder.name).length;
            const isSelected = activeFolder === folder.name;
            return (
              <button
                key={folder.name}
                id={`folder-btn-${folder.name}`}
                type="button"
                onClick={() => setActiveFolder(folder.name)}
                className={`border rounded-xl p-4 transition-all duration-300 text-left relative flex flex-col justify-between shadow-sm cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 scale-[1.01] border-transparent bg-indigo-50/20 text-indigo-900 font-semibold'
                    : 'bg-white border-slate-250 text-slate-800 hover:border-slate-350'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Folder className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {count > 0 && (
                    <span className="bg-indigo-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full select-none animate-bounce">
                      {count}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-semibold tracking-tight">{folder.label}</h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Start Daemon Panel */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between" id="daemon-control-panel">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-700">Watcher Daemon</h3>
              <p className="text-[10px] text-slate-400">Processes file directories</p>
            </div>
            <span className={`w-2 h-2 rounded-full ${isDaemonActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              id="flush-queue-btn"
              onClick={onClearQueue}
              disabled={queuedFiles.length === 0}
              className="px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Flush</span>
            </button>
            <button
              id="run-watcher-btn"
              onClick={onStartDaemon}
              disabled={isDaemonActive || queuedFiles.length === 0}
              className="px-3 py-2 bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isDaemonActive ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
              )}
              <span>Run Watcher</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Drag panel & Queue feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="watcher-main-content">
        {/* Conditional Left side column based on active folder */}
        <div className="lg:col-span-2 space-y-4" id="upload-watcher-col">
          
          {activeFolder === 'logs' ? (
            /* ==================== 1. LOGS DIRECTORY FEED ==================== */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4" id="logs-directory-panel">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 font-mono">
                    <span className="p-1 bg-emerald-100 text-emerald-700 rounded-md">📂</span>
                    <span>C:\Users\Roshan\OneDrive\AI_Print_Assistant\logs\</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Export Excel & CSV transaction logs to sync with bookkeeping tables.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const csvHeaders = "id,timestamp,status,folder,filename,file_type,model,mood,duplex,pages,expected_sheet,estimated_AD,messages\n";
                      const csvContent = printedHistory.map(hist => {
                        const sheets = hist.expectedSheets || (hist.duplex === 'Yes' ? Math.ceil(hist.pages / 2) : hist.pages);
                        const fileType = hist.fileType || hist.fileName.split('.').pop() || 'pdf';
                        const model = hist.model || 'HP OfficeJet Pro 9010 series';
                        const mood = hist.mood || 'Standard Eco';
                        const duplex = hist.duplex || 'No';
                        const messages = (hist.messages || hist.details).replace(/"/g, '""');
                        const name = hist.fileName.replace(/"/g, '""');
                        return `"${hist.id}","${hist.timestamp}","${hist.status}","${hist.folder}","${name}","${fileType}","${model}","${mood}","${duplex}",${hist.pages},${sheets},"${hist.cost.toFixed(2)} AED","${messages}"`;
                      }).join('\n');

                      const blob = new Blob([csvHeaders + csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", "print_data.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-2.5 py-1.5 text-[10px] font-bold bg-white border border-slate-200 hover:border-slate-350 text-slate-700 rounded-lg shadow-sm flex items-center space-x-1 cursor-pointer transition-all"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="H">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#D9E1F2" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Print Audit Logs">
  <Table>
   <Row ss:StyleID="H">
    <Cell><Data ss:Type="String">ID</Data></Cell>
    <Cell><Data ss:Type="String">TIMESTAMP</Data></Cell>
    <Cell><Data ss:Type="String">STATUS</Data></Cell>
    <Cell><Data ss:Type="String">FOLDER</Data></Cell>
    <Cell><Data ss:Type="String">FILENAME</Data></Cell>
    <Cell><Data ss:Type="String">FILE TYPE</Data></Cell>
    <Cell><Data ss:Type="String">PRINTER MODEL</Data></Cell>
    <Cell><Data ss:Type="String">MOOD</Data></Cell>
    <Cell><Data ss:Type="String">DUPLEX</Data></Cell>
    <Cell><Data ss:Type="String">PAGES</Data></Cell>
    <Cell><Data ss:Type="String">EXPECTED SHEET</Data></Cell>
    <Cell><Data ss:Type="String">ESTIMATED AD</Data></Cell>
    <Cell><Data ss:Type="String">MESSAGES</Data></Cell>
   </Row>`;

                      printedHistory.forEach(hist => {
                        const sheets = hist.expectedSheets || (hist.duplex === 'Yes' ? Math.ceil(hist.pages / 2) : hist.pages);
                        const fileType = hist.fileType || hist.fileName.split('.').pop() || 'pdf';
                        const model = hist.model || 'HP OfficeJet Pro';
                        const mood = hist.mood || 'Standard Eco';
                        const duplex = hist.duplex || 'No';
                        const messages = (hist.messages || hist.details).replace(/[<>&'"]/g, c => {
                          switch (c) { case '<': return '&lt;'; case '>': return '&gt;'; case '&': return '&amp;'; case '\'': return '&apos;'; default: return '&quot;'; }
                        });
                        const cleanName = hist.fileName.replace(/[<>&'"]/g, c => {
                          switch (c) { case '<': return '&lt;'; case '>': return '&gt;'; case '&': return '&amp;'; case '\'': return '&apos;'; default: return '&quot;'; }
                        });

                        xml += `
   <Row>
    <Cell><Data ss:Type="String">${hist.id}</Data></Cell>
    <Cell><Data ss:Type="String">${hist.timestamp}</Data></Cell>
    <Cell><Data ss:Type="String">${hist.status}</Data></Cell>
    <Cell><Data ss:Type="String">${hist.folder}</Data></Cell>
    <Cell><Data ss:Type="String">${cleanName}</Data></Cell>
    <Cell><Data ss:Type="String">${fileType}</Data></Cell>
    <Cell><Data ss:Type="String">${model}</Data></Cell>
    <Cell><Data ss:Type="String">${mood}</Data></Cell>
    <Cell><Data ss:Type="String">${duplex}</Data></Cell>
    <Cell><Data ss:Type="Number">${hist.pages}</Data></Cell>
    <Cell><Data ss:Type="Number">${sheets}</Data></Cell>
    <Cell><Data ss:Type="String">${hist.cost.toFixed(2)} AED</Data></Cell>
    <Cell><Data ss:Type="String">${messages}</Data></Cell>
   </Row>`;
                      });

                      xml += `
  </Table>
 </Worksheet>
</Workbook>`;

                      const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", "print_data.xls");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-2.5 py-1.5 text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-750 rounded-lg shadow-sm flex items-center space-x-1 cursor-pointer transition-all"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download XLS</span>
                  </button>
                </div>
              </div>

              {/* SpreadSheetML Live Viewer */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner max-h-[350px] overflow-y-auto">
                <table className="w-full text-[10.5px] border-collapse bg-slate-50/50">
                  <thead className="bg-slate-100 text-slate-500 sticky top-0 border-b border-slate-200 select-none font-mono">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">TIMESTAMP</th>
                      <th className="px-3 py-2 text-left font-semibold">STATUS</th>
                      <th className="px-3 py-2 text-left font-semibold">FOLDER</th>
                      <th className="px-3 py-2 text-left font-semibold">FILENAME</th>
                      <th className="px-3 py-2 text-left font-semibold">TYPE</th>
                      <th className="px-3 py-2 text-center font-semibold">SHT/PAGES</th>
                      <th className="px-3 py-2 text-right font-semibold">COST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {printedHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-sans">
                          No logs recorded yet. Printed jobs will automatically buffer into spreadsheet partitions.
                        </td>
                      </tr>
                    ) : (
                      printedHistory.map((hist) => {
                        const isErr = hist.status === 'ERROR';
                        const fileType = hist.fileType || hist.fileName.split('.').pop() || 'pdf';
                        const sheets = hist.expectedSheets || (hist.duplex === 'Yes' ? Math.ceil(hist.pages / 2) : hist.pages);
                        return (
                          <tr key={hist.id} className="hover:bg-amber-50/20 bg-white cursor-help group transition-colors" onClick={() => setSelectedReceipt(hist)}>
                            <td className="px-3 py-2.5 font-mono text-slate-450 whitespace-nowrap">{new Date(hist.timestamp).toLocaleTimeString()}</td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-block font-sans font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isErr ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>{hist.status}</span>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-slate-500 whitespace-nowrap">{hist.folder}</td>
                            <td className="px-3 py-2.5 text-slate-700 font-semibold truncate max-w-xs">{hist.fileName}</td>
                            <td className="px-3 py-2.5"><span className="uppercase text-[9px] font-bold bg-slate-100 border px-1 py-0.2 rounded text-slate-600">{fileType}</span></td>
                            <td className="px-3 py-2.5 text-center font-mono text-slate-600">{sheets}/{hist.pages}</td>
                            <td className="px-3 py-2.5 text-right font-bold font-mono text-slate-800 whitespace-nowrap">{hist.cost.toFixed(2)} AED</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Logs utilities */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-[9.5px] text-slate-400 font-mono">PATH: C:\Users\Roshan\OneDrive\AI_Print_Assistant\logs\print_data.csv</p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof onAddHistory === 'function') {
                        onAddHistory(
                          `invoice_receipt_${Math.floor(100+Math.random()*900)}.pdf`,
                          'PRINT_BW_DUPLEX',
                          12,
                          5.40,
                          "Simulated manual bookkeeping transaction synced for trial balance audit.",
                          'SUCCESS',
                          'pdf',
                          'HP OfficeJet Pro 9010 series',
                          'Standard Eco Grayscale',
                          'Yes',
                          6,
                          '5.40 AED',
                          'Manual logger bypass injected via UI'
                        );
                        alert("Injected test audit row inside Excel worksheet successfully.");
                      }
                    }}
                    className="px-3 py-1.5 text-[10.5px] font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-lg shadow-xs cursor-pointer"
                  >
                    + Add manual audit transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to flush all records off Excel cache? This action is irreversible.")) {
                        onClearHistory();
                      }
                    }}
                    className="px-3 py-1.5 text-[10.5px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg cursor-pointer"
                  >
                    Clear Memory
                  </button>
                </div>
              </div>
            </div>
          ) : activeFolder === 'ERROR_FILES' ? (
            /* ==================== 2. ERROR_FILES DIRECTORY FEED ==================== */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4" id="errors-directory-panel">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 font-mono">
                    <span className="p-1 bg-red-100 text-red-700 rounded-md">📂</span>
                    <span>C:\Users\Roshan\OneDrive\AI_Print_Assistant\ERROR_FILES\</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Erroneous spool files are quarantined here. You can respool or retry them directly.</p>
                </div>
                
                {/* Error Simulator Toggle */}
                <button
                  type="button"
                  onClick={onToggleSimulateError}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                    simulateError 
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm animate-pulse'
                      : 'bg-white text-slate-600 hover:text-slate-800 border-slate-250'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-450" />
                  <span>{simulateError ? 'Fault Simulation Active (ERROR ON)' : 'Errors Simulated Off (NORMAL)'}</span>
                </button>
              </div>

              {/* Erroneous files queue list */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {printedHistory.filter(h => h.status === 'ERROR').length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-stone-50/50 rounded-xl border border-dashed">
                    <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-700 block">No Error partitions found</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">To test error routing, toggle the "Fault Simulation" switch above, add some files in watch queue, and click "Run Watcher"!</span>
                  </div>
                ) : (
                  printedHistory.filter(h => h.status === 'ERROR').map((hist) => (
                    <div key={hist.id} className="border border-rose-200 bg-rose-50/20 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                      <div className="space-y-1 md:max-w-[70%]">
                        <div className="flex items-center space-x-2">
                          <span className="p-1 bg-rose-100 text-rose-700 text-xs font-bold rounded">ERR</span>
                          <h4 className="text-xs font-bold text-slate-800 truncate">{hist.fileName}</h4>
                        </div>
                        <p className="text-[10.5px] text-rose-500 font-semibold font-mono leading-relaxed bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                          DIAGNOSTIC: {hist.details}
                        </p>
                        <p className="text-[9.5px] text-slate-450 font-mono">
                          Last spooled time: {hist.timestamp} • Watch path: {hist.folder}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Do you wish to respool the faulty print draft "${hist.fileName}" back to "${hist.folder}" active queue?`)) {
                              // Respool file details
                              const respooled: PrintFile = {
                                id: 'mock-err-' + Math.floor(10000 + Math.random() * 90000),
                                name: hist.fileName,
                                size: '1.8 MB',
                                type: hist.fileType || 'pdf',
                                pages: hist.pages,
                                status: 'queued',
                                progress: 0,
                                progressMessage: 'Respooled into watch sequence',
                                targetFolder: hist.folder || 'PRINT_BW_SINGLE',
                                fileUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=600&auto=format&fit=crop',
                                uploadedAt: new Date().toISOString()
                              };
                              onAddQueuedFile(respooled);
                            }
                          }}
                          className="px-2.5 py-1.5 text-[10px] font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 text-white rounded-lg flex items-center space-x-1 shadow-sm cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-white" />
                          <span>Respool Draft & Retry</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : activeFolder === 'CUSTOM_PRINT_ORDERS' ? (
            /* ==================== 3. CUSTOM_PRINT_ORDERS DIRECTORY FEED ==================== */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5" id="custom-directory-panel">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 font-mono">
                    <span className="p-1 bg-indigo-100 text-indigo-700 rounded-md">📂</span>
                    <span>C:\Users\Roshan\OneDrive\AI_Print_Assistant\CUSTOM_PRINT_ORDERS\</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">This directory supports three nested sub-folders containing discrete order.json settings profiles or images.</p>
                </div>
              </div>

              {/* Sub-folder navigations tabs */}
              <div className="grid grid-cols-3 gap-2 border-b border-slate-150 pb-2">
                <button
                  type="button"
                  onClick={() => setCustomSubFolder('PASSPORT_PHOTO')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight cursor-pointer transition-all ${
                    customSubFolder === 'PASSPORT_PHOTO'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📁 PASSPORT_PHOTO/
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSubFolder('ID_CARDS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight cursor-pointer transition-all ${
                    customSubFolder === 'ID_CARDS'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📁 ID_CARDS/
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSubFolder('NORMAL_PAGES')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight cursor-pointer transition-all ${
                    customSubFolder === 'NORMAL_PAGES'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📁 NORMAL_PAGES/
                </button>
              </div>

              {/* Editable Fields for selected sub-folder properties */}
              {customSubFolder === 'PASSPORT_PHOTO' ? (
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Photo Count Mode</label>
                    <select
                      value={passportPhotoConfig.photo_count}
                      onChange={(e) => setPassportPhotoConfig(prev => ({ ...prev, photo_count: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold"
                    >
                      <option value="max">Max possible copies per sheet</option>
                      <option value="4">4 copies</option>
                      <option value="6">6 copies</option>
                      <option value="8">8 copies</option>
                      <option value="12">12 copies</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Gap Between Copies Mirror (mm)</label>
                    <input
                      type="number"
                      value={passportPhotoConfig.gap_mm}
                      onChange={(e) => setPassportPhotoConfig(prev => ({ ...prev, gap_mm: parseFloat(e.target.value) || 2 }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-705 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Remove Background (AI Crop)</label>
                    <select
                      value={passportPhotoConfig.person_background}
                      onChange={(e) => setPassportPhotoConfig(prev => ({ ...prev, person_background: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                    >
                      <option value="keep">Keep original background</option>
                      <option value="blue">Replace with Solid Blue background</option>
                      <option value="white">Replace with Solid White background</option>
                      <option value="black">Replace with Solid Black background</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Print Sheet Background</label>
                    <select
                      value={passportPhotoConfig.sheet_background}
                      onChange={(e) => setPassportPhotoConfig(prev => ({ ...prev, sheet_background: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                    >
                      <option value="white">White Paper backer</option>
                      <option value="transparent">Transparent layout grid</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold font-mono">Watch Delay (seconds)</label>
                    <input
                      type="number"
                      value={passportPhotoConfig.watch_delay_seconds}
                      onChange={(e) => setPassportPhotoConfig(prev => ({ ...prev, watch_delay_seconds: parseInt(e.target.value) || 3 }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Passport Frame Border</label>
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        checked={passportPhotoConfig.border_enabled}
                        onChange={(e) => setPassportPhotoConfig(prev => ({ ...prev, border_enabled: e.target.checked }))}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        id="chk-pass-border"
                      />
                      <label htmlFor="chk-pass-border" className="text-slate-600 font-medium">Render passport crop borders</label>
                    </div>
                  </div>
                  {passportPhotoConfig.border_enabled && (
                    <>
                      <div className="space-y-1.5 text-left">
                        <label className="block text-slate-500 font-bold">Border Width (px)</label>
                        <input
                          type="number"
                          value={passportPhotoConfig.border_width_px}
                          onChange={(e) => setPassportPhotoConfig(prev => ({ ...prev, border_width_px: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <label className="block text-slate-500 font-bold">Border Color Palette</label>
                        <input
                          type="text"
                          value={passportPhotoConfig.border_color}
                          onChange={(e) => setPassportPhotoConfig(prev => ({ ...prev, border_color: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Export Layout Targets</label>
                    <div className="flex items-center space-x-4 pt-2">
                      <label className="flex items-center space-x-1.5">
                        <input
                          type="checkbox"
                          checked={passportPhotoConfig.output_jpg}
                          onChange={(e) => setPassportPhotoConfig(prev => ({ ...prev, output_jpg: e.target.checked }))}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        />
                        <span>JPG copies</span>
                      </label>
                      <label className="flex items-center space-x-1.5">
                        <input
                          type="checkbox"
                          checked={passportPhotoConfig.output_pdf}
                          onChange={(e) => setPassportPhotoConfig(prev => ({ ...prev, output_pdf: e.target.checked }))}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        />
                        <span>Printable PDF</span>
                      </label>
                    </div>
                  </div>
                  {/* Upload zone for PASSPORT_PHOTO */}
                  <div className="col-span-full">
                    <label className="relative w-full border-2 border-dashed border-pink-200 rounded-xl py-4 px-4 flex flex-col items-center justify-center gap-1 hover:border-pink-400 hover:bg-pink-50/30 transition-all cursor-pointer bg-white overflow-hidden">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleCustomOrderUpload(e, 'PASSPORT_PHOTO', {
                          job_type: 'passport',
                          photo_count: passportPhotoConfig.photo_count,
                          gap_mm: passportPhotoConfig.gap_mm,
                          person_background: passportPhotoConfig.person_background,
                          sheet_background: passportPhotoConfig.sheet_background,
                          border_enabled: passportPhotoConfig.border_enabled,
                          border_width_px: passportPhotoConfig.border_width_px,
                          output_jpg: passportPhotoConfig.output_jpg,
                          output_pdf: passportPhotoConfig.output_pdf
                        })}
                      />
                      <Upload className="w-5 h-5 text-pink-400 pointer-events-none" />
                      <span className="text-[11px] font-bold text-pink-600 pointer-events-none">Upload Portrait Photo</span>
                      <span className="text-[9px] text-slate-400 pointer-events-none">JPG / PNG — will tile with settings above</span>
                    </label>
                  </div>
                  {/* Live background-removal preview */}
                  {passportPreviewUrl && (
                    <div className="col-span-full space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600">Live Background Preview</span>
                        <button
                          type="button"
                          onClick={() => setPassportPreviewUrl(null)}
                          className="text-[9px] text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          ✕ clear
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-[9px] text-slate-400 text-center font-mono">ORIGINAL</p>
                          <img src={passportPreviewUrl} className="w-full max-h-48 object-contain rounded-xl border border-slate-200 shadow-sm" alt="original" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] text-slate-400 text-center font-mono">
                            {passportPhotoConfig.person_background === 'keep' ? 'NO CHANGE' : `BG → ${passportPhotoConfig.person_background.toUpperCase()}`}
                          </p>
                          <PassportBgCanvas imageUrl={passportPreviewUrl} bgColor={passportPhotoConfig.person_background} />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* order.json preview for PASSPORT_PHOTO */}
                  <div className="col-span-full mt-2 rounded-lg border border-slate-200 bg-white overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                      <span className="text-[10px] font-mono font-bold text-slate-600">📄 PASSPORT_PHOTO / order.json</span>
                      <span className="text-[9px] text-slate-400 font-mono">auto-generated on save</span>
                    </div>
                    <pre className="text-[9.5px] font-mono text-slate-600 px-3 py-2 leading-5 bg-slate-50/40">{JSON.stringify({
                      job_type: "passport",
                      photo_count: passportPhotoConfig.photo_count,
                      gap_mm: passportPhotoConfig.gap_mm,
                      person_background: passportPhotoConfig.person_background,
                      sheet_background: passportPhotoConfig.sheet_background,
                      border_enabled: passportPhotoConfig.border_enabled,
                      border_width_px: passportPhotoConfig.border_width_px,
                      output_jpg: passportPhotoConfig.output_jpg,
                      output_pdf: passportPhotoConfig.output_pdf
                    }, null, 2)}</pre>
                  </div>
                </div>
              ) : customSubFolder === 'ID_CARDS' ? (
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="font-sans space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Spooling Print Mode</label>
                    <select
                      value={idCardConfig.mode}
                      onChange={(e) => setIdCardConfig(prev => ({ ...prev, mode: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-705 font-bold"
                    >
                      <option value="bw">B&W (Grayscale preferred)</option>
                      <option value="color">Full Dynamic Color</option>
                    </select>
                  </div>
                  <div className="font-sans space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">ID Layout Duplex Binding</label>
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        checked={idCardConfig.duplex}
                        onChange={(e) => setIdCardConfig(prev => ({ ...prev, duplex: e.target.checked }))}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        id="chk-id-duplex"
                      />
                      <label htmlFor="chk-id-duplex" className="text-slate-600 font-medium">Bilateral Duplex Layout</label>
                    </div>
                  </div>
                  <div className="font-sans space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Fit Mode Behavior</label>
                    <select
                      value={idCardConfig.id_card_layout?.fit_mode || "fill"}
                      onChange={(e) => setIdCardConfig(prev => ({
                        ...prev,
                        id_card_layout: { ...prev.id_card_layout, fit_mode: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                    >
                      <option value="fill">Fill (Crop excess boundaries)</option>
                      <option value="fit">Fit (Add white gutters)</option>
                    </select>
                  </div>
                  <div className="font-sans space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Cards Per Printed A4 Sheet</label>
                    <input
                      type="number"
                      value={idCardConfig.id_card_layout?.cards_per_sheet || 8}
                      onChange={(e) => setIdCardConfig(prev => ({
                        ...prev,
                        id_card_layout: { ...prev.id_card_layout, cards_per_sheet: parseInt(e.target.value) || 8 }
                      }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                    />
                  </div>
                  <div className="font-sans space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Layout Width x Height dimensions (mm)</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Width"
                        value={idCardConfig.id_card_layout?.card_width_mm || 85.6}
                        onChange={(e) => setIdCardConfig(prev => ({
                          ...prev,
                          id_card_layout: { ...prev.id_card_layout, card_width_mm: parseFloat(e.target.value) || 85.6 }
                        }))}
                        className="w-1/2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-707 font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Height"
                        value={idCardConfig.id_card_layout?.card_height_mm || 53.98}
                        onChange={(e) => setIdCardConfig(prev => ({
                          ...prev,
                          id_card_layout: { ...prev.id_card_layout, card_height_mm: parseFloat(e.target.value) || 53.98 }
                        }))}
                        className="w-1/2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-707 font-mono"
                      />
                    </div>
                  </div>
                  <div className="font-sans space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Image Enhancement (Filters)</label>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center space-x-1.5">
                        <input
                          type="checkbox"
                          checked={idCardConfig.id_card_layout?.enhance || false}
                          onChange={(e) => setIdCardConfig(prev => ({
                            ...prev,
                            id_card_layout: { ...prev.id_card_layout, enhance: e.target.checked }
                          }))}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        />
                        <span className="font-medium text-slate-600">Auto Contrast</span>
                      </label>
                      <label className="flex items-center space-x-1.5">
                        <input
                          type="checkbox"
                          checked={idCardConfig.id_card_layout?.cut_guides || false}
                          onChange={(e) => setIdCardConfig(prev => ({
                            ...prev,
                            id_card_layout: { ...prev.id_card_layout, cut_guides: e.target.checked }
                          }))}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        />
                        <span className="font-medium text-slate-600">Cut Marks</span>
                      </label>
                    </div>
                  </div>
                  {/* Upload zone for ID_CARDS */}
                  <div className="col-span-full">
                    <label className="relative w-full border-2 border-dashed border-amber-200 rounded-xl py-4 px-4 flex flex-col items-center justify-center gap-1 hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer bg-white overflow-hidden">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleCustomOrderUpload(e, 'ID_CARDS', {
                          job_type: 'id_cards',
                          mode: idCardConfig.mode,
                          duplex: idCardConfig.duplex,
                          id_card_layout: idCardConfig.id_card_layout
                        })}
                      />
                      <Upload className="w-5 h-5 text-amber-500 pointer-events-none" />
                      <span className="text-[11px] font-bold text-amber-700 pointer-events-none">Upload ID Card Image / PDF</span>
                      <span className="text-[9px] text-slate-400 pointer-events-none">Will tile {idCardConfig.id_card_layout?.cards_per_sheet || 8} cards per A4 sheet</span>
                    </label>
                  </div>
                  {/* order.json preview for ID_CARDS */}
                  <div className="col-span-full rounded-lg border border-slate-200 bg-white overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                      <span className="text-[10px] font-mono font-bold text-slate-600">📄 ID_CARDS / order.json</span>
                      <span className="text-[9px] text-slate-400 font-mono">auto-generated on save</span>
                    </div>
                    <pre className="text-[9.5px] font-mono text-slate-600 px-3 py-2 leading-5 bg-slate-50/40">{JSON.stringify({
                      job_type: "id_cards",
                      mode: idCardConfig.mode,
                      duplex: idCardConfig.duplex,
                      id_card_layout: {
                        cards_per_sheet: idCardConfig.id_card_layout?.cards_per_sheet,
                        card_width_mm: idCardConfig.id_card_layout?.card_width_mm,
                        card_height_mm: idCardConfig.id_card_layout?.card_height_mm,
                        cut_guides: idCardConfig.id_card_layout?.cut_guides,
                        enhance: idCardConfig.id_card_layout?.enhance,
                        fit_mode: idCardConfig.id_card_layout?.fit_mode
                      }
                    }, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="font-sans space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Normal Page Selected Ranges</label>
                    <input
                      type="text"
                      value={normalConfig.selected_pages}
                      onChange={(e) => setNormalConfig(prev => ({ ...prev, selected_pages: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Example: "1-5, 8" or "all" — pages beyond PDF total are auto-skipped</span>
                  </div>
                  <div className="font-sans space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Duplex bilateral sheets</label>
                    <div className="flex items-center space-x-2 pt-2">
                       <input
                         type="checkbox"
                         checked={normalConfig.duplex}
                         onChange={(e) => setNormalConfig(prev => ({ ...prev, duplex: e.target.checked }))}
                         className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                         id="chk-norm-dup"
                       />
                       <label htmlFor="chk-norm-dup" className="text-slate-600 font-medium">Two-sided (bilateral stack render)</label>
                    </div>
                  </div>
                  <div className="font-sans space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Print Color Mode</label>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setNormalConfig(prev => ({ ...prev, color_mode: 'bw' }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                          normalConfig.color_mode === 'bw' || !normalConfig.color_mode
                            ? 'bg-slate-800 text-white border-slate-700 shadow-sm'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        ⬛ B&amp;W / Monochrome
                      </button>
                      <button
                        type="button"
                        onClick={() => setNormalConfig(prev => ({ ...prev, color_mode: 'color' }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                          normalConfig.color_mode === 'color'
                            ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-cyan-50'
                        }`}
                      >
                        🌈 Full Color
                      </button>
                    </div>
                  </div>
                  <div className="font-sans space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Print Fit to Page</label>
                    <select
                      value={normalConfig.fit_to_page}
                      onChange={(e) => setNormalConfig(prev => ({ ...prev, fit_to_page: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold"
                    >
                      <option value="shrink">Shrink oversized margins (Standard)</option>
                      <option value="fill">Fill printable area to margins</option>
                      <option value="crop">Crop excess bleed areas</option>
                    </select>
                  </div>
                  <div className="font-sans space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Document Collating</label>
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        checked={normalConfig.collate}
                        onChange={(e) => setNormalConfig(prev => ({ ...prev, collate: e.target.checked }))}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        id="chk-norm-collate"
                      />
                      <label htmlFor="chk-norm-collate" className="text-slate-600 font-medium">Enable collated sets</label>
                    </div>
                  </div>
                  <div className="font-sans space-y-1.5 text-left">
                    <label className="block text-slate-500 font-bold">Copies Count</label>
                    <input
                      type="number"
                      value={normalConfig.copies}
                      onChange={(e) => setNormalConfig(prev => ({ ...prev, copies: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                    />
                  </div>
                  {/* Upload zone for NORMAL_PAGES */}
                  <div className="col-span-full">
                    <label className="relative w-full border-2 border-dashed border-indigo-200 rounded-xl py-4 px-4 flex flex-col items-center justify-center gap-1 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer bg-white overflow-hidden">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleCustomOrderUpload(e, 'NORMAL_PAGES', {
                          job_type: 'normal_pages',
                          selected_pages: normalConfig.selected_pages,
                          duplex: normalConfig.duplex,
                          color_mode: normalConfig.color_mode || 'bw',
                          fit_to_page: normalConfig.fit_to_page,
                          collate: normalConfig.collate,
                          copies: normalConfig.copies
                        })}
                      />
                      <Upload className="w-5 h-5 text-indigo-400 pointer-events-none" />
                      <span className="text-[11px] font-bold text-indigo-600 pointer-events-none">Upload PDF / DOCX to Print</span>
                      <span className="text-[9px] text-slate-400 pointer-events-none">Will print using the settings above</span>
                    </label>
                  </div>
                  {/* order.json preview for NORMAL_PAGES */}
                  <div className="col-span-full rounded-lg border border-slate-200 bg-white overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                      <span className="text-[10px] font-mono font-bold text-slate-600">📄 NORMAL_PAGES / order.json</span>
                      <span className="text-[9px] text-slate-400 font-mono">auto-generated on save</span>
                    </div>
                    <pre className="text-[9.5px] font-mono text-slate-600 px-3 py-2 leading-5 bg-slate-50/40">{JSON.stringify({
                      job_type: "normal_pages",
                      selected_pages: normalConfig.selected_pages,
                      duplex: normalConfig.duplex,
                      color_mode: normalConfig.color_mode || 'bw',
                      fit_to_page: normalConfig.fit_to_page,
                      collate: normalConfig.collate,
                      copies: normalConfig.copies
                    }, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Actions panels for custom JSON configuration state */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="font-mono text-[9px] text-slate-400 text-left space-y-0.5">
                  <p>📁 {customSubFolder}/order.json — saved to watch folder on click</p>
                  <p className="text-slate-350">PATH: ...AI_Print_Assistant\CUSTOM_PRINT_ORDERS\{customSubFolder}\order.json</p>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      let testFileName = `order_${customSubFolder.toLowerCase()}_${Math.floor(1000 + Math.random() * 9000)}.pdf`;
                      let estPages = 1;
                      let costAED = 1.00;
                      let modeStr = 'simplex';

                      if (customSubFolder === 'PASSPORT_PHOTO') {
                        testFileName = `passport_crop_${Math.floor(1000 + Math.random() * 9000)}.jpg`;
                        costAED = 1.50;
                      } else if (customSubFolder === 'NORMAL_PAGES') {
                        estPages = 4;
                        costAED = 4.00;
                        modeStr = normalConfig.duplex ? 'duplex' : 'simplex';
                      } else {
                        modeStr = idCardConfig.duplex ? 'duplex' : 'simplex';
                      }

                      const mockFile: PrintFile = {
                        id: 'mock-cust-' + Math.floor(10000 + Math.random() * 90000),
                        name: testFileName,
                        size: '2.4 MB',
                        type: customSubFolder === 'PASSPORT_PHOTO' ? 'jpg' : 'pdf',
                        pages: estPages,
                        status: 'queued',
                        progress: 0,
                        progressMessage: 'Ready in watch folders',
                        targetFolder: 'CUSTOM_PRINT_ORDERS',
                        originalPath: `C:\\Users\\Roshan\\OneDrive\\AI_Print_Assistant\\CUSTOM_PRINT_ORDERS\\${customSubFolder}\\${testFileName}`,
                        fileUrl: customSubFolder === 'PASSPORT_PHOTO'
                          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop'
                          : 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop',
                        uploadedAt: new Date().toISOString(),
                        customSubFolder: customSubFolder,
                        customConfig: customSubFolder === 'PASSPORT_PHOTO'
                          ? { job_type: 'passport', photo_count: passportPhotoConfig.photo_count, gap_mm: passportPhotoConfig.gap_mm, person_background: passportPhotoConfig.person_background }
                          : customSubFolder === 'ID_CARDS'
                          ? { job_type: 'id_cards', mode: idCardConfig.mode, duplex: idCardConfig.duplex }
                          : { job_type: 'normal_pages', selected_pages: normalConfig.selected_pages, duplex: normalConfig.duplex, color_mode: normalConfig.color_mode || 'bw', copies: normalConfig.copies }
                      };

                      onAddQueuedFile(mockFile);
                      
                      if (typeof onAddHistory === 'function') {
                        onAddHistory(
                          testFileName,
                          `CUSTOM_PRINT_ORDERS/${customSubFolder}`,
                          estPages,
                          costAED,
                          `Custom order test file loaded with dynamic configuration profiles from order.json.`,
                          'SUCCESS',
                          mockFile.type,
                          'HP OfficeJet Pro 9100 series',
                          customSubFolder === 'PASSPORT_PHOTO' ? 'Passport Photo Borderless' : (customSubFolder === 'ID_CARDS' ? 'Photo Precision Grayscale' : 'Standard Document Eco'),
                          customSubFolder === 'PASSPORT_PHOTO' ? 'No' : (modeStr === 'duplex' ? 'Yes' : 'No'),
                          estPages,
                          `${costAED.toFixed(2)} AED`,
                          'Loaded layout constraints from custom order.json profiles.'
                        );
                      }
                    }}
                    className="px-3 py-1.5 text-[10px] font-medium border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 rounded-lg transition-all cursor-pointer bg-white"
                  >
                    Test inject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSaveCustomConfigs({
                        passportPhoto: passportPhotoConfig,
                        idCard: idCardConfig,
                        normalPages: normalConfig
                      });
                      alert("Successfully updated custom print profiles. Real order.json file was written cleanly into local watcher partition.");
                    }}
                    className="px-4 py-2 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-1"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Save order.json preferences</span>
                  </button>
                </div>
              </div>

              {/* Queue status for current sub-folder */}
              {(() => {
                const subFiles = queuedFiles.filter(f => f.targetFolder === 'CUSTOM_PRINT_ORDERS' && f.customSubFolder === customSubFolder);
                if (subFiles.length === 0) return null;
                return (
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <p className="text-[10px] font-bold text-slate-600 font-mono">📋 Queue — {customSubFolder} ({subFiles.length} file{subFiles.length > 1 ? 's' : ''})</p>
                    <div className="space-y-2">
                      {subFiles.map(f => (
                        <div key={f.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${f.status === 'queued' ? 'bg-amber-400' : f.status === 'processing' ? 'bg-blue-400 animate-pulse' : f.status === 'printed' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold text-slate-700 truncate">{f.name}</p>
                              <p className="text-[9px] text-slate-400 font-mono">
                                {f.customConfig?.duplex ? 'duplex' : 'simplex'} ·{' '}
                                {f.customConfig?.mode === 'bw' ? 'B&W' : f.customConfig?.person_background ? `bg:${f.customConfig.person_background}` : 'color'} ·{' '}
                                {f.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {f.status === 'queued' && (
                              <button
                                type="button"
                                onClick={() => onPrintSingleFile(f.id)}
                                className="px-2 py-1 text-[9px] font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                              >
                                Print
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onRemoveFile(f.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* ==================== 4. STANDARD WATCHER UPLOAD & QUEUE BOARD ==================== */
            <>
              {/* Drag & Drop Panel */}
              <div
                id="drag-drop-panel"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-300 text-center relative overflow-hidden flex flex-col justify-center items-center h-48 bg-white/70 ${
                  dragActive ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-250 hover:border-slate-350'
                }`}
              >
                <input
                  ref={fileInputRef}
                  id="file-uploader-input"
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 mb-3 animate-pulse">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-semibold text-slate-800">
                  Drag & Drop files into <span className="text-indigo-600 font-mono text-[11px]">{activeFolder}</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                  Supports docx, pdf, png, jpeg. Converts Word files headless-style via LibreOffice and counts pages.
                </p>
                <button
                  id="select-files-btn"
                  type="button"
                  onClick={handleUploadClick}
                  className="bg-indigo-600 text-white font-semibold text-xs px-4 py-2 mt-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                >
                  Select Files
                </button>
               </div>

              {/* Quick simulation presets */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs" id="quick-simulation-presets-panel">
                <div className="text-left">
                  <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <span>⚡ Quick Test File Generators</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tight">Active Folder</span>
                  </h4>
                  <p className="text-[9.5px] text-slate-500 mt-0.5">Simulate dropping various file types inside <span className="font-mono text-indigo-600 bg-indigo-50/50 px-1 rounded">{activeFolder}</span> watch-folder directory directly.</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const mockFile: PrintFile = {
                        id: 'mock-test-' + Math.floor(10000 + Math.random() * 90000),
                        name: `invoice_receipt_${Math.floor(1000 + Math.random() * 9000)}.pdf`,
                        size: '850 KB',
                        type: 'pdf',
                        pages: 1,
                        status: 'queued',
                        progress: 0,
                        progressMessage: 'Ready in watch folders',
                        targetFolder: activeFolder,
                        originalPath: `C:\\Users\\Roshan\\OneDrive\\AI_Print_Assistant\\${activeFolder}\\invoice_receipt_${Math.floor(1000 + Math.random() * 9000)}.pdf`,
                        fileUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop',
                        uploadedAt: new Date().toLocaleTimeString()
                      };
                      onAddQueuedFile(mockFile);
                    }}
                    className="px-2 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded-lg hover:border-slate-350 text-slate-700 transition-all cursor-pointer shadow-2xs hover:bg-slate-50 flex items-center space-x-1"
                  >
                    <span>📄</span>
                    <span>1-Page PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const mockFile: PrintFile = {
                        id: 'mock-test-' + Math.floor(10000 + Math.random() * 90000),
                        name: `comprehensive_report_${Math.floor(1000 + Math.random() * 9000)}.pdf`,
                        size: '3.1 MB',
                        type: 'pdf',
                        pages: 5,
                        status: 'queued',
                        progress: 0,
                        progressMessage: 'Ready in watch folders',
                        targetFolder: activeFolder,
                        originalPath: `C:\\Users\\Roshan\\OneDrive\\AI_Print_Assistant\\${activeFolder}\\comprehensive_report_${Math.floor(1000 + Math.random() * 9000)}.pdf`,
                        fileUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop',
                        uploadedAt: new Date().toLocaleTimeString()
                      };
                      onAddQueuedFile(mockFile);
                    }}
                    className="px-2 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded-lg hover:border-slate-350 text-slate-700 transition-all cursor-pointer shadow-2xs hover:bg-slate-50 flex items-center space-x-1"
                  >
                    <span>📚</span>
                    <span>5-Page PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const mockFile: PrintFile = {
                        id: 'mock-test-' + Math.floor(10000 + Math.random() * 90000),
                        name: `agreement_draft_${Math.floor(1000 + Math.random() * 9000)}.docx`,
                        size: '1.2 MB',
                        type: 'docx',
                        pages: 3,
                        status: 'queued',
                        progress: 0,
                        progressMessage: 'docx ready in watch folder',
                        targetFolder: activeFolder,
                        originalPath: `C:\\Users\\Roshan\\OneDrive\\AI_Print_Assistant\\${activeFolder}\\agreement_draft_${Math.floor(1000 + Math.random() * 9000)}.docx`,
                        fileUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop',
                        uploadedAt: new Date().toLocaleTimeString()
                      };
                      onAddQueuedFile(mockFile);
                    }}
                    className="px-2 py-1.5 text-[10px] font-bold bg-indigo-50 border border-indigo-150 rounded-lg hover:bg-indigo-100 text-indigo-700 transition-all cursor-pointer shadow-2xs flex items-center space-x-1"
                    title="Triggers headless LibreOffice conversion to standard PDF"
                  >
                    <span>📝</span>
                    <span>3-Page Word</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const mockFile: PrintFile = {
                        id: 'mock-test-' + Math.floor(10000 + Math.random() * 90000),
                        name: `customer_snapshot_${Math.floor(1000 + Math.random() * 9000)}.jpg`,
                        size: '4.7 MB',
                        type: 'jpg',
                        pages: 1,
                        status: 'queued',
                        progress: 0,
                        progressMessage: 'jpg image placed in watch directory',
                        targetFolder: activeFolder,
                        originalPath: `C:\\Users\\Roshan\\OneDrive\\AI_Print_Assistant\\${activeFolder}\\customer_snapshot_${Math.floor(1000 + Math.random() * 9000)}.jpg`,
                        fileUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
                        uploadedAt: new Date().toLocaleTimeString()
                      };
                      onAddQueuedFile(mockFile);
                    }}
                    className="px-2 py-1.5 text-[10px] font-bold bg-cyan-50 border border-cyan-150 rounded-lg hover:bg-cyan-100 text-cyan-800 transition-all cursor-pointer shadow-2xs flex items-center space-x-1"
                    title="Compiles raw graphics to standard vertically-centered layout PDF"
                  >
                    <span>🖼️</span>
                    <span>JPG Image</span>
                  </button>
                </div>
              </div>

              {/* Queued list */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm" id="queue-list-panel">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
                  <span className="text-xs font-semibold text-slate-700 flex items-center" id="queue-title-span">
                    {isDaemonActive ? "Active Decoupled Spooling Queue (All Folders)" : `Directory File Queue for ${activeFolder}`}
                  </span>
                  <span className="text-xs text-slate-500 font-medium bg-slate-50 border px-2.5 py-0.5 rounded-full" id="queue-subtotal-span">
                    Est. Subtotal: {displayTotalCost.toFixed(2)} {pricing.currency}
                  </span>
                </div>

                {filesToDisplay.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50/40 rounded-xl border border-dashed border-slate-200" id="empty-queue-alert">
                    <FileText className="w-6 h-6 mx-auto stroke-[1.5] text-slate-300 mb-1.5" />
                    <span className="text-xs font-medium block">Queue is currently empty</span>
                    <span className="text-[10px] opacity-75 mt-0.5 block">Import files to print!</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1" id="active-files-container">
                    {filesToDisplay.map((file) => {
                      let rate = pricing.bw_single;
                      if (file.targetFolder === 'PRINT_BW_DUPLEX') rate = pricing.bw_duplex;
                      else if (file.targetFolder === 'PRINT_COLOR_SINGLE') rate = pricing.color_single;
                      else if (file.targetFolder === 'PRINT_COLOR_DUPLEX') rate = pricing.color_duplex;
                      else if (file.targetFolder === 'CUSTOM_PRINT_ORDERS') rate = 1.00;
                      const itemCost = file.pages * rate;

                      return (
                        <div key={file.id} id={`file-row-${file.id}`} className="py-2.5 flex items-start justify-between group border-b border-slate-50 last:border-0">
                          <div className="flex items-start space-x-3 max-w-[70%] flex-1 min-w-0">
                            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                              file.status === 'processing'
                                ? 'bg-amber-50 text-amber-500 ring-1 ring-amber-100'
                                : file.status === 'printed'
                                ? 'bg-emerald-50 text-emerald-555 ring-1 ring-emerald-100'
                                : file.status === 'error'
                                ? 'bg-rose-50 text-rose-500 ring-1 ring-rose-100'
                                : 'bg-indigo-50 text-indigo-500'
                            }`}>
                              {file.status === 'processing' ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : file.status === 'printed' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : file.status === 'error' ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </div>
                            <div className="truncate flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-slate-700 truncate">{file.name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span>{file.size}</span>
                                <span>•</span>
                                <span className="font-sans font-bold bg-indigo-50/60 px-1 py-0.2 rounded text-indigo-700">
                                  {file.pages} {file.pages === 1 ? 'page' : 'pages'}
                                </span>
                                {file.status && file.status !== 'queued' && (
                                  <>
                                    <span>•</span>
                                    <span className={`font-sans font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded-full whitespace-nowrap ${
                                      file.status === 'processing'
                                        ? 'bg-amber-100 text-amber-800'
                                        : file.status === 'printed'
                                        ? 'bg-emerald-105 text-emerald-800'
                                        : 'bg-rose-105 text-rose-800'
                                    }`}>
                                      {file.status}
                                    </span>
                                  </>
                                )}
                              </p>

                              {/* Beautiful dynamic progress bar visual cue */}
                              {(file.status === 'processing' || file.status === 'printed' || isDaemonActive) && (
                                <div className="mt-2 w-full max-w-sm animate-fade-in pr-2" id={`progress-wrapper-${file.id}`}>
                                  <div className="flex justify-between items-center text-[9px] text-slate-500 mb-1 font-mono">
                                    <span className={`truncate font-medium max-w-[170px] ${
                                      file.status === 'printed' 
                                        ? 'text-emerald-600' 
                                        : file.status === 'processing' 
                                        ? 'text-indigo-600 animate-pulse' 
                                        : 'text-slate-450'
                                    }`}>
                                      {file.progressMessage || (file.status === 'printed' ? 'Success!' : file.status === 'processing' ? 'Processing...' : 'Queued...')}
                                    </span>
                                    <span className={file.status === 'printed' ? 'text-emerald-700 font-bold' : 'text-slate-600 font-bold'}>
                                      {file.progress || 0}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-105 h-1.5 rounded-full overflow-hidden border border-slate-150 relative">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ease-out ${
                                        file.status === 'printed'
                                          ? 'bg-emerald-500'
                                          : file.status === 'processing'
                                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 animate-pulse'
                                          : 'bg-slate-200'
                                      }`}
                                      style={{ width: `${file.progress || 0}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 shrink-0" id={`item-costs-col-${file.id}`}>
                            <div className="text-right">
                              <span className="text-xs font-bold font-mono text-slate-800 block">
                                {itemCost.toFixed(2)} {pricing.currency}
                              </span>
                              <span className="text-[9px] text-slate-400 bg-slate-50 border px-1 rounded block mt-0.5">
                                {pricing.currency} {rate.toFixed(2)}/page
                              </span>
                            </div>
                            <button
                              id={`preview-file-btn-${file.id}`}
                              type="button"
                              onClick={() => {
                                setPreviewFile(file);
                                setPreviewPage(1);
                                setPreviewZoom(1.0);
                                setPreviewMargin('normal');
                              }}
                              className="text-slate-400 hover:text-indigo-600 p-1 hover:bg-slate-50 rounded transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                              title="View visual print preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              id={`active-direct-print-btn-${file.id}`}
                              type="button"
                              onClick={() => onPrintSingleFile(file.id)}
                              disabled={file.status === 'processing' || file.status === 'printed'}
                              className="text-slate-400 hover:text-emerald-600 disabled:opacity-40 p-1 hover:bg-slate-50 rounded transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                              title="⚡ Print & Spool immediately (Direct Mode)"
                            >
                              <Printer className="w-4 h-4 text-emerald-500 hover:text-emerald-600" />
                            </button>
                            <button
                              id={`remove-file-btn-${file.id}`}
                              type="button"
                              onClick={() => onRemoveFile(file.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 hover:bg-slate-50 rounded transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Transaction History & Receipt Dialog preview trigger */}
        <div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-3 mb-4">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-semibold text-slate-800">Completed Spools ({printedHistory.length})</h3>
              </div>

              {printedHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Ticket className="w-8 h-8 text-slate-300 mx-auto stroke-[1.5] mb-2" />
                  <p className="text-xs font-medium">No system prints recorded yet</p>
                  <p className="text-[10px] opacity-70 mt-1 max-w-[200px] mx-auto">
                    Files cleared from directory daemon are indexed here as billing spools.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[28rem] overflow-y-auto pr-1">
                  {printedHistory.map((hist) => {
                    const isErr = hist.status === 'ERROR';
                    return (
                      <div
                        key={hist.id}
                        onClick={() => setSelectedReceipt(hist)}
                        className={`p-3 border rounded-xl hover:shadow-md cursor-pointer transition-all flex items-start justify-between ${
                          isErr ? 'bg-rose-50/40 border-rose-100' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-left space-y-1 select-none max-w-[70%]">
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                            isErr ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {hist.id}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-700 truncate leading-relaxed">
                            {hist.fileName}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-mono block">
                            {hist.timestamp.split(' ')[1]} • {hist.folder}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold font-mono text-slate-800 block">
                            {hist.cost.toFixed(2)} AED
                          </span>
                          <span className="text-[9px] text-indigo-600 font-semibold block hover:underline">
                            Reciept →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {printedHistory.length > 0 && (
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Calculators integrated</span>
                <span className="text-slate-800 font-bold">
                  Total Rev:{' '}
                  {printedHistory
                    .filter(h => h.status === 'SUCCESS')
                    .reduce((sum, h) => sum + h.cost, 0)
                    .toFixed(2)}{' '}
                  AED
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reciept Dialog Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border rounded-2xl max-w-sm w-full p-6 shadow-2xl relative select-text border-slate-300">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Receipt Frame */}
            <div className="space-y-4 font-mono text-xs text-slate-800 py-2">
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-200">
                <h3 className="font-bold text-sm tracking-wide">ROSHAN FAST PRINT</h3>
                <p className="text-[10px] text-slate-400">Offline Assistant Spool Order Receipt</p>
                <div className="text-[10px] bg-slate-100 rounded inline-block px-2.5 py-0.5 mt-2 font-semibold">
                  TICKET_NO: {selectedReceipt.id}
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">TIMESTAMP:</span>
                  <span>{selectedReceipt.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SPOOL_TYPE:</span>
                  <span>{selectedReceipt.folder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DOC_PAGES:</span>
                  <span>{selectedReceipt.pages} page(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PRINTER:</span>
                  <span className="truncate max-w-[170px]" title="HP OfficeJet Pro 9010">
                    HP OfficeJet Pro
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">STATUS:</span>
                  <span className={selectedReceipt.status === 'SUCCESS' ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="p-2 bg-slate-50/80 rounded-xl leading-normal text-[10.5px] border border-slate-150 text-slate-600 text-left">
                  <span className="font-semibold block mb-0.5">Spool Event Log:</span>
                  {selectedReceipt.details}
                </div>
              </div>

              {/* Total Billing */}
              <div className="border-t border-dashed border-slate-200 pt-4 flex items-center justify-between font-bold text-sm">
                <span>TOTAL PAID:</span>
                <span className="text-indigo-600 font-sans tracking-tight text-right block">
                  {selectedReceipt.cost.toFixed(2)} AED
                </span>
              </div>

              <p className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
                Processed via SumatraPDF bypass binary setup. Thank you!
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-semibold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <Printer className="w-4 h-4 text-indigo-400" />
                <span>Confirm & Dismiss Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Print Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in" id="preview-modal-bg">
          <div className="bg-white border select-none border-slate-300 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col md:flex-row gap-6 max-h-[92vh] overflow-y-auto text-left" id="preview-modal-card">
            
            {/* Close Button */}
            <button
              id="close-preview-btn"
              onClick={() => setPreviewFile(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Canvas Preview stage */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl p-4 min-h-[380px] relative">
              <div className="text-[10px] text-slate-400 font-semibold absolute top-3 left-3 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                <span>CANVAS VECTOR FEED</span>
              </div>

              {/* Centered Canvas Container */}
              <div className="w-full flex-1 flex items-center justify-center overflow-auto my-4 max-h-[440px]">
                <PrintPreviewCanvas
                  file={previewFile}
                  pageNumber={previewPage}
                  zoom={previewZoom}
                  margin={previewMargin}
                />
              </div>

              {/* Page Switcher controls */}
              <div className="flex items-center justify-center space-x-4 mt-2">
                <button
                  id="preview-prev-page-btn"
                  disabled={previewPage <= 1}
                  onClick={() => setPreviewPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  ◀ Previous
                </button>
                <span className="text-xs font-bold font-mono text-slate-600">
                  Page {previewPage} of {previewFile.pages}
                </span>
                <button
                  id="preview-next-page-btn"
                  disabled={previewPage >= previewFile.pages}
                  onClick={() => setPreviewPage(prev => Math.min(previewFile.pages, prev + 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  Next ▶
                </button>
              </div>
            </div>

            {/* Right Column: Details, parameters, actions */}
            <div className="w-full md:w-72 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {previewFile.type.toUpperCase()} File
                  </span>
                  <h3 className="font-bold text-slate-800 text-base mt-2 truncate" title={previewFile.name}>
                    {previewFile.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    ID: {previewFile.id} • Size: {previewFile.size}
                  </p>
                </div>

                {/* Parameters and adjustments */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  {/* Zoom controller */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-semibold">
                      Canvas Preview Zoom
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[0.8, 1.0, 1.25].map((z) => (
                        <button
                          key={z}
                          id={`zoom-btn-${z}`}
                          onClick={() => setPreviewZoom(z)}
                          className={`text-xs font-semibold py-1.5 border rounded-lg transition-all cursor-pointer text-center ${
                            previewZoom === z
                              ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {z * 100}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Margin settings */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-semibold">
                      Print Safe Margin
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['none', 'normal', 'wide'] as const).map((m) => (
                        <button
                          key={m}
                          id={`margin-btn-${m}`}
                          onClick={() => setPreviewMargin(m)}
                          className={`text-xs font-semibold py-1.5 border rounded-lg transition-all cursor-pointer capitalize text-center ${
                            previewMargin === m
                              ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Print Spec Details Card */}
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1.5 text-xs font-medium text-slate-600">
                    <div className="flex justify-between items-center text-[10px] border-b border-slate-200 pb-1.5 mb-1.5 font-bold text-slate-700">
                      <span>DAEMON SENSORS</span>
                      <span className="text-indigo-600 uppercase">READY</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolution:</span>
                      <span className="font-mono text-[11px] font-semibold text-slate-800">600 DPI High</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Raster Profile:</span>
                      <span className="font-mono text-[11px] font-semibold text-slate-800 font-sans">Halftone Vector</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spool Target:</span>
                      <span className="font-mono text-[10px] font-bold bg-indigo-100/60 text-indigo-700 px-1 py-0.1 rounded leading-none truncate max-w-[120px]">
                        {previewFile.targetFolder}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct print action or close */}
              <div className="mt-6 space-y-2">
                <button
                  id="close-preview-dismiss-btn"
                  onClick={() => setPreviewFile(null)}
                  className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-semibold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4 text-indigo-400" />
                  <span>Approved for Spooling</span>
                </button>
                <p className="text-center text-[9px] text-slate-400">
                  Approved layouts will be dispatched during queue execution waves.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
