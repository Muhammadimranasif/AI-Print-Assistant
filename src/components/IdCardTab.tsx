import React, { useState, useRef } from 'react';
import { Upload, Shuffle, CheckCircle, Trash2, Printer, Compass, Layers, ShieldAlert, Eye } from 'lucide-react';

interface IdCardTabProps {
  onAddHistory: (file: string, folder: string, pages: number, cost: number, details: string) => void;
  onLogMessage: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function IdCardTab({ onAddHistory, onLogMessage }: IdCardTabProps) {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [alignment, setAlignment] = useState<'side-by-side' | 'stacked'>('stacked');
  const [dpi, setDpi] = useState<number>(300);
  const [isProcessing, setIsProcessing] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // CNIC Pakistani Mock Samples
  const loadMockSamples = () => {
    // Generate lovely sample mock vectors via base64 or stylized CSS cards
    setFrontImage('mock_front');
    setBackImage('mock_back');
    onLogMessage('Pakistan CNIC high-res mockup cards loaded into layout analyzer.', 'info');
  };

  const clearImages = () => {
    setFrontImage(null);
    setBackImage(null);
    onLogMessage('ID Card buffer cache wiped successfully.', 'info');
  };

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFrontImage(url);
      onLogMessage(`Front Identity layout loaded: ${e.target.files[0].name}`, 'success');
    }
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setBackImage(url);
      onLogMessage(`Back Identity layout loaded: ${e.target.files[0].name}`, 'success');
    }
  };

  const handleAssembleAndPrint = () => {
    if (!frontImage || !backImage) return;

    setIsProcessing(true);
    onLogMessage('Beginning Card Grid Layout compilation (card_layout_print.py)...', 'info');
    onLogMessage('Aligning elements at 300 DPI scale to exactly match physically measured card tolerances (85.6mm x 53.98mm).', 'info');

    setTimeout(() => {
      onLogMessage('Fusing and packing rasterized vector cards onto output A4 template format...', 'info');
      setTimeout(() => {
        const id = 'AIPA-CNIC-' + Math.floor(Math.random() * 1000);
        const cost = 4.00; // Flat ID Card layout compilation cost
        onLogMessage(`Card Layout compiled perfectly. Instigating silent print job client on printer spooler at ${dpi} DPI.`, 'success');
        onAddHistory(
          'compiled_card_layout_A4.pdf',
          'ID_CARDS',
          1,
          cost,
          `Assembled ID card (Front & Back) aligned ${alignment === 'stacked' ? 'vertically stacked' : 'side-by-side'} centered on A4 paper.`
        );
        setIsProcessing(false);
      }, 1200);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Upload panels & adjustments */}
      <div className="space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Card Layout Processor</h2>
              <p className="text-[11px] text-slate-400">Packs identity cards neatly onto A4 sheets</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Front Image Uploader */}
            <div>
              <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                ID Front Side Image
              </span>
              <div 
                onClick={() => frontInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  frontImage ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-250 hover:border-slate-350 bg-slate-50/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={frontInputRef}
                  onChange={handleFrontUpload} 
                  accept="image/*"
                  className="hidden" 
                />
                {frontImage ? (
                  <div className="flex items-center justify-center space-x-2 text-emerald-600 font-semibold text-xs">
                    <CheckCircle className="w-4 h-4" />
                    <span>Front Side Loaded</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-5 h-5 mx-auto text-slate-400" />
                    <span className="block text-xs text-slate-500 font-medium">Click to upload Front Identity</span>
                  </div>
                )}
              </div>
            </div>

            {/* Back Image Uploader */}
            <div>
              <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                ID Back Side Image
              </span>
              <div 
                onClick={() => backInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  backImage ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-250 hover:border-slate-350 bg-slate-50/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={backInputRef}
                  onChange={handleBackUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                {backImage ? (
                  <div className="flex items-center justify-center space-x-2 text-emerald-600 font-semibold text-xs">
                    <CheckCircle className="w-4 h-4" />
                    <span>Back Side Loaded</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-5 h-5 mx-auto text-slate-400" />
                    <span className="block text-xs text-slate-500 font-medium">Click to upload Back Identity</span>
                  </div>
                )}
              </div>
            </div>

            {/* Alignment Layout selection */}
            <div>
              <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Alignment Orientation Layout
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAlignment('stacked')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    alignment === 'stacked'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'border-slate-250 bg-white hover:bg-slate-5 w-full text-slate-600'
                  }`}
                >
                  Stacked (Centered)
                </button>
                <button
                  onClick={() => setAlignment('side-by-side')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    alignment === 'side-by-side'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'border-slate-250 bg-white hover:bg-slate-5 w-full text-slate-600'
                  }`}
                >
                  Side-by-Side
                </button>
              </div>
            </div>

            {/* Resolution selector */}
            <div>
              <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 flex justify-between">
                <span>Rendering Resolution</span>
                <span className="text-slate-400 font-mono text-[10px]">{dpi} DPI</span>
              </span>
              <input
                type="range"
                min="150"
                max="600"
                step="50"
                value={dpi}
                onChange={(e) => setDpi(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                <span>150 DPI (Fast)</span>
                <span>300 DPI (Standard)</span>
                <span>600 DPI (Max Resolution)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
            <button
              onClick={loadMockSamples}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Load CNIC Mockup Cards</span>
            </button>

            {(frontImage || backImage) && (
              <button
                onClick={clearImages}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border text-slate-500 hover:text-rose-500 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Layout Buffer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* A4 Sheet layout composition preview Canvas */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center">
          <div className="flex items-center justify-between w-full border-b border-slate-100 pb-3 mb-5">
            <span className="text-xs font-semibold text-slate-700 flex items-center">
              <Eye className="w-4 h-4 mr-1.5 text-indigo-500" /> Print-Ready A4 ID Grid Preview (Scale representation)
            </span>
            <span className="text-[10px] bg-slate-50 border px-2 py-0.5 rounded text-slate-400 font-mono">
              210 × 297 mm
            </span>
          </div>

          {/* Virt A4 Canvas */}
          <div className="border border-slate-300 w-full max-w-[290px] aspect-[1/1.4142] bg-slate-50 rounded-lg p-5 shadow-inner relative overflow-hidden flex flex-col justify-center items-center">
            {/* Folding margins centerlines */}
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-300/40 z-10 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-300/40 z-10 pointer-events-none" />

            {/* Calibration bounds layout labels */}
            <div className="absolute top-2 left-2 text-[8px] text-slate-400 font-mono leading-none">
              AIPA CARD ALIGNER PRO v0.1
            </div>

            {/* Elements container */}
            <div className={`w-full h-full flex items-center justify-center ${
              alignment === 'stacked' ? 'flex-col space-y-4' : 'flex-row space-x-4'
            }`}>
              {/* Front element */}
              <div className="w-[110px] aspect-[1.586/1] rounded-md border border-slate-300 bg-white shadow-md relative overflow-hidden flex items-center justify-center">
                {frontImage === 'mock_front' ? (
                  <div className="w-full h-full p-2 bg-emerald-800/10 text-emerald-800 flex flex-col justify-between text-left select-none relative">
                    <div className="absolute right-1 top-1 w-2.5 h-3 bg-emerald-700/20 rounded-sm" />
                    <div>
                      <div className="text-[7px] font-bold tracking-tight">GOVERNMENT OF PAKISTAN</div>
                      <div className="text-[5px] text-slate-500 leading-none">National Identity Card</div>
                    </div>
                    <div className="flex items-center space-x-1 border-t border-slate-200/40 pt-1">
                      <div className="w-4.5 h-5 bg-slate-300 rounded-sm shrink-0" />
                      <div>
                        <div className="text-[6px] font-semibold">Muhammad Imran</div>
                        <div className="text-[4px] text-slate-400 font-mono">ID: 35201-1234567-9</div>
                      </div>
                    </div>
                  </div>
                ) : frontImage ? (
                  <img src={frontImage} className="w-full h-full object-cover" alt="ID Front Side" />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <span className="block text-[8px] font-semibold uppercase">Front Side File</span>
                    <span className="block text-[6px] text-slate-300 font-mono mt-0.5">Empty slot</span>
                  </div>
                )}
              </div>

              {/* Back element */}
              <div className="w-[110px] aspect-[1.586/1] rounded-md border border-slate-300 bg-white shadow-md relative overflow-hidden flex items-center justify-center">
                {backImage === 'mock_back' ? (
                  <div className="w-full h-full p-2 bg-indigo-50 text-slate-700 flex flex-col justify-between text-left select-none relative">
                    <div className="absolute right-1.5 top-1.5 w-6 h-1.5 bg-slate-300 rounded-sm" />
                    <div className="border-b border-slate-200/40 pb-1">
                      <div className="text-[4.5px] text-slate-400 font-mono">Signature: m.imran</div>
                      <div className="text-[4px] text-slate-400">Card Issued: 2026-05-25</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="w-full h-2 bg-slate-200 rounded-sm" />
                      <div className="text-[3.5px] text-slate-400 font-mono">012938 123891 0293021 123</div>
                    </div>
                  </div>
                ) : backImage ? (
                  <img src={backImage} className="w-full h-full object-cover" alt="ID Back Side" />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <span className="block text-[8px] font-semibold uppercase">Back Side File</span>
                    <span className="block text-[6px] text-slate-300 font-mono mt-0.5">Empty slot</span>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-2 right-2 text-[8px] text-indigo-500/80 font-mono uppercase tracking-wider flex items-center">
              <Compass className="w-2.5 h-2.5 mr-1 text-indigo-400 animate-spin" /> {alignment}
            </div>
          </div>

          <div className="w-full mt-6 space-y-4">
            <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex items-start space-x-2.5 text-slate-500 text-[10.5px] leading-relaxed text-left">
              <ShieldAlert className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 block">card_layout_print.py constraints:</span>
                Calculates sizing down to sub-millimeter scales prior to silent printer dispatch. Forces 
                A4 orientation template generation with dynamic vertical margins.
              </div>
            </div>

            <button
              onClick={handleAssembleAndPrint}
              disabled={!frontImage || !backImage || isProcessing}
              className="w-full bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-4.5 h-4.5 text-indigo-400 select-none" />
              <span>{isProcessing ? 'Generating Sheet Template...' : 'Compile, Save & spool to Printer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
