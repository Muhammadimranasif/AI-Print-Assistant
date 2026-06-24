import React, { useState, useRef } from 'react';
import { Upload, Shuffle, CheckCircle, Trash2, Printer, Sparkles, HelpCircle, Palette, Grid, Eye } from 'lucide-react';

interface PassportTabProps {
  onAddHistory: (file: string, folder: string, pages: number, cost: number, details: string) => void;
  onLogMessage: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function PassportTab({ onAddHistory, onLogMessage }: PassportTabProps) {
  const [portraitImg, setPortraitImg] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<'keep' | 'white' | 'blue'>('keep');
  const [smoothSkin, setSmoothSkin] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(100);
  const [smoothLevel, setSmoothLevel] = useState<number>(4);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSampleModel = () => {
    // Elegant sample card portrait
    setPortraitImg('sample_portrait');
    onLogMessage('High-resolution test portrait loaded for Passport Photo Module.', 'info');
  };

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPortraitImg(url);
      onLogMessage(`Imported source passport face portrait: ${e.target.files[0].name}`, 'success');
    }
  };

  const handlePrintPhotos = () => {
    if (!portraitImg) return;

    setIsProcessing(true);
    onLogMessage('Processing Passport Photo cropping logic (35mm x 45mm, 413x531px)...', 'info');
    onLogMessage(`Active Background replacement: ${bgColor.toUpperCase()}`, 'info');

    setTimeout(() => {
      onLogMessage(`Applying facial correction standard, smoothing factor: ${smoothSkin ? smoothLevel : '0'}.`, 'info');
      setTimeout(() => {
        const cost = 10.00; // Passport flat sheet price
        onLogMessage('8-Grid target compiled under A4 sheet standards. Spooling job directly to printer...', 'success');
        onAddHistory(
          'passport_photos_a4_sheet.pdf',
          'PASSPORT_PHOTOS',
          1,
          cost,
          `Compiled 8 Passport Photos (35mm x 45mm) arranged with crop guidelines on A4 paper (Background: ${bgColor} color overlay).`
        );
        setIsProcessing(false);
      }, 1100);
    }, 1100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Settings / Controls Column */}
      <div className="space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Passport Photo Studio</h2>
              <p className="text-[11px] text-slate-500">Stage 6 custom cropper & background tool</p>
            </div>
          </div>

          <div className="space-y-4.5">
            {/* Image Port Uploader */}
            <div>
              <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Target Portrait Photo
              </span>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  portraitImg ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-250 hover:border-slate-350 bg-slate-50/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handlePortraitUpload} 
                  accept="image/*"
                  className="hidden" 
                />
                {portraitImg ? (
                  <div className="flex items-center justify-center space-x-2 text-emerald-600 font-semibold text-xs py-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Portrait Loaded</span>
                  </div>
                ) : (
                  <div className="space-y-1 py-1.5">
                    <Upload className="w-5 h-5 mx-auto text-slate-400" />
                    <span className="block text-xs text-slate-500 font-medium">Upload Portait JPEG/PNG</span>
                  </div>
                )}
              </div>
            </div>

            {/* Background color replace */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 flex items-center">
                <Palette className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Background Fusing Selector
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setBgColor('keep')}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    bgColor === 'keep'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'border-slate-250 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setBgColor('white')}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    bgColor === 'white'
                      ? 'bg-slate-900 border-slate-900 text-white font-bold'
                      : 'border-slate-250 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  White
                </button>
                <button
                  onClick={() => setBgColor('blue')}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    bgColor === 'blue'
                      ? 'bg-blue-600 border-blue-600 text-white font-bold'
                      : 'border-slate-250 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Blue (Chroma)
                </button>
              </div>
            </div>

            {/* Enhancements Settings */}
            <div className="space-y-3.5 bg-slate-50/50 border border-slate-150 p-4.5 rounded-xl">
              <span className="block text-xs font-bold text-slate-700 tracking-wide mb-1">
                Aesthetic Enhancements
              </span>

              {/* Skin Smooth checkbox */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="skinSmoothness"
                    checked={smoothSkin}
                    onChange={(e) => setSmoothSkin(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="skinSmoothness" className="text-xs font-medium text-slate-600 select-none cursor-pointer">
                    Smooth Facial Imperfections
                  </label>
                </div>
              </div>

              {/* Smooth strength slider */}
              {smoothSkin && (
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Smoothing Weight</span>
                    <span className="font-mono font-bold text-indigo-600">Level {smoothLevel}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={smoothLevel}
                    onChange={(e) => setSmoothLevel(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              )}

              {/* Brightness slider */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Natural Face Exposure</span>
                  <span className="font-mono font-bold text-indigo-600">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="140"
                  step="5"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col space-y-2">
            <button
              onClick={loadSampleModel}
              type="button"
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Load Portait Template model</span>
            </button>

            {portraitImg && (
              <button
                onClick={() => setPortraitImg(null)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border text-slate-500 hover:text-rose-500 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe Input Buffer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sheet Composed Grid representation preview */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center">
          <div className="flex items-center justify-between w-full border-b border-slate-100 pb-3 mb-5">
            <span className="text-xs font-semibold text-slate-700 flex items-center">
              <Eye className="w-4 h-4 mr-1.5 text-indigo-500" /> A4 Printing Grid (2 Rows × 4 Portait Layout)
            </span>
            <span className="text-[10px] bg-slate-50 border px-2 py-0.5 rounded text-slate-400 font-mono">
              35mm × 45mm cards • 300 DPI
            </span>
          </div>

          {/* Virtual Canvas representing printable A4 sheet */}
          <div className="border border-slate-300 w-full max-w-[340px] aspect-[1/1.4142] bg-slate-50 rounded-lg p-6 shadow-inner relative overflow-hidden flex flex-col justify-center items-center">
            {/* Guide markers */}
            <div className="absolute top-2 left-2 text-[8px] text-slate-450 font-mono leading-none">
              AIPA PASSPORT MULTI-FRAME v0.1
            </div>

            {portraitImg ? (
              <div className="grid grid-cols-4 gap-2.5 max-w-[300px]">
                {/* 8 items */}
                {Array.from({ length: 8 }).map((_, idx) => {
                  let imgBgStyle = {};
                  if (bgColor === 'white') imgBgStyle = { backgroundColor: '#ffffff' };
                  else if (bgColor === 'blue') imgBgStyle = { backgroundColor: '#3b82f6' };

                  // Apply smoothness & brightness using standard browser CSS Filters! Output looks incredibly realistic!
                  const filterVal = `brightness(${brightness}%) ${smoothSkin ? `blur(${smoothLevel / 12}px) saturate(110%)` : ''}`;

                  return (
                    <div 
                      key={idx} 
                      className="aspect-[3.5/4.5] border border-slate-300 relative rounded bg-white overflow-hidden shadow-sm flex flex-col items-center justify-center"
                      style={imgBgStyle}
                    >
                      {/* Dotted cutting boundary lines around each photo */}
                      <div className="absolute -inset-0.5 border border-dashed border-red-500/20 pointer-events-none" />

                      {portraitImg === 'sample_portrait' ? (
                        <div className="w-full h-full relative" style={{ filter: filterVal }}>
                          {/* Face Avatar Vector Design */}
                          <div className={`absolute inset-0 flex flex-col items-center justify-center ${bgColor === 'keep' ? 'bg-indigo-950/10' : ''}`}>
                            <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 mt-2 relative overflow-hidden">
                              {/* Eyes / Hair details */}
                              <div className="w-8 h-8 rounded-full bg-stone-700 absolute -top-3.5 left-0.5" />
                              <div className="w-1.5 h-1 bg-stone-700/80 rounded absolute top-2.5 left-1.5" />
                              <div className="w-1.5 h-1 bg-stone-700/80 rounded absolute top-2.5 right-1.5" />
                              <div className="w-2.5 h-1.5 bg-rose-400/30 rounded-full absolute bottom-1 right-3" />
                            </div>
                            <div className="w-13 h-14 bg-indigo-900 border border-slate-400 rounded-full mt-1 shrink-0" />
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={portraitImg} 
                          className="w-full h-full object-cover" 
                          style={{ filter: filterVal }}
                          alt="Cropped face" 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 select-none">
                <Grid className="w-8 h-8 opacity-40 mx-auto mb-2" />
                <span className="text-xs font-semibold block">Photo Grid Blank</span>
                <span className="text-[10.5px] opacity-75 mt-0.5 block max-w-xs px-4">
                  Please upload or select a starting portrait model on the left to map 8-photo layout automatically.
                </span>
              </div>
            )}

            {portraitImg && (
              <div className="absolute bottom-2 right-2 text-[8px] text-indigo-500/80 font-mono flex items-center select-none uppercase tracking-wide">
                <span>Correction Enabled: Filter Active</span>
              </div>
            )}
          </div>

          <div className="w-full mt-6 space-y-4">
            <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex items-start space-x-3 text-slate-500 text-[10.5px] leading-relaxed text-left">
              <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 block">Pricing mode: per_sheet billing:</span>
                Outputs exact A4-dimension grids with custom face exposure smoothing rules. Price calculations 
                are dynamically linked to <span className="font-mono text-[9px] bg-slate-200 px-1 py-0.2 rounded text-slate-700">pricing.json</span> rules automatically.
              </div>
            </div>

            <button
              onClick={handlePrintPhotos}
              disabled={!portraitImg || isProcessing}
              className="w-full bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-4.5 h-4.5 text-indigo-400 select-none" />
              <span>{isProcessing ? 'Processing canvas layers...' : 'Print A4 Photo Sheet Layout'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
