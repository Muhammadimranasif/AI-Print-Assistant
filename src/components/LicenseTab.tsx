import React, { useState } from 'react';
import { LicenseInfo } from '../types';
import { generateLicenseKey, generateMachineId } from '../utils';
import { ShieldCheck, Cpu, Key, UserCheck, Calendar, Lock, Unlock, AlertCircle, RefreshCw, KeyRound, Globe, FileSignature } from 'lucide-react';

interface LicenseTabProps {
  license: LicenseInfo;
  onUpdateLicense: (updated: LicenseInfo) => void;
  onLogMessage: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function LicenseTab({ license, onUpdateLicense, onLogMessage }: LicenseTabProps) {
  const [localLicense, setLocalLicense] = useState<LicenseInfo>({ ...license });
  const [adminMode, setAdminMode] = useState<boolean>(false);
  const [genCustId, setGenCustId] = useState<string>('AIPA-ROSHAN-001');
  const [genShopName, setGenShopName] = useState<string>('Roshan Digital Print Studio');
  const [genOwnerName, setGenOwnerName] = useState<string>('Muhammad Roshan');
  const [genPhone, setGenPhone] = useState<string>('0300-0000000');
  const [genLocation, setGenLocation] = useState<string>('Dubai, UAE');
  const [genMode, setGenMode] = useState<string>('paid_monthly');
  const [genExpiry, setGenExpiry] = useState<string>('2026-12-31');
  const [genSignature, setGenSignature] = useState<string>('5sq2mEJrBoEPfetJ16YOyYgDkSbuWVaMU3UAic+xXHJpP7mlLnJrwxqdwEw4cpV815xWM4soVyrfJZsdpv84Dg==');

  const triggerUpdate = (updated: LicenseInfo) => {
    onUpdateLicense(updated);
    setLocalLicense(updated);
  };

  const handleToggleLicense = (val: boolean) => {
    const updated = {
      ...localLicense,
      licenseEnabled: val,
      license: {
        ...localLicense.license,
        status: val ? 'active' : ('development' as any)
      }
    };
    triggerUpdate(updated);
    onLogMessage(`Licensing enforcement toggled to: ${val ? 'ENFORCED (ON)' : 'BYPASSED (OFF)'}`, 'warning');
  };

  const handleExpiryChange = (date: string) => {
    const today = new Date();
    const expDate = new Date(date);
    let statusVal: any = 'active';

    if (expDate < today) {
      statusVal = 'expired';
    }

    const updated = {
      ...localLicense,
      license: {
        ...localLicense.license,
        licenseExpiryDate: date,
        status: statusVal
      }
    };
    triggerUpdate(updated);
    onLogMessage(`License expiry date altered: ${date}. Status evaluated: ${statusVal.toUpperCase()}`, 'info');
  };

  const handleRegenMachineId = () => {
    const newId = generateMachineId();
    const updated = {
      ...localLicense,
      license: {
        ...localLicense.license,
        machineId: newId
      }
    };
    triggerUpdate(updated);
    onLogMessage(`Regenerated machine unique fingerprint: ${newId}`, 'info');
  };

  const generateAndApplyDeveloperLicense = () => {
    const generatedKey = generateLicenseKey(genCustId);
    
    // Simulate ED25519 hash bytes
    const randomBytes = Array.from({length: 64}, () => Math.floor(Math.random() * 256));
    const randomSig = btoa(String.fromCharCode.apply(null, randomBytes as any)).substring(0, 88);

    setGenSignature(randomSig);

    const today = new Date();
    const exp = new Date(genExpiry);
    let statusVal: any = 'active';
    if (exp < today) {
      statusVal = 'expired';
    }

    const updated: LicenseInfo = {
      licenseEnabled: true,
      mode: genMode,
      customer: {
        customerId: genCustId,
        shopName: genShopName,
        ownerName: genOwnerName,
        phone: genPhone,
        whatsapp: genPhone,
        location: genLocation
      },
      license: {
        licenseKey: generatedKey,
        status: statusVal,
        trialDays: genMode.includes('trial') ? 7 : 0,
        licenseStartDate: new Date().toISOString().split('T')[0],
        licenseExpiryDate: genExpiry,
        graceDays: 3,
        blockAfterGrace: true,
        machineId: localLicense.license.machineId
      },
      renewal: {
        renewalMethod: 'manual',
        cloudCheckEnabled: false,
        cloudLicenseUrl: ''
      }
    };

    triggerUpdate(updated);
    onLogMessage(`Success! Self-signed customer license credentials generated and injected: ${generatedKey}`, 'success');
  };

  const isExpired = localLicense.license.status === 'expired' && localLicense.licenseEnabled;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Current License Details & Settings */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Licensing Credentials Checker</h2>
                <p className="text-[11px] text-slate-400">Verifies local client activation keys</p>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-semibold text-slate-500">License Locking</span>
              <button
                type="button"
                onClick={() => handleToggleLicense(!localLicense.licenseEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  localLicense.licenseEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    localLicense.licenseEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Banner notification */}
          {isExpired ? (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start space-x-3 mb-5">
              <Lock className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-800">EXPIRY DETECTED: LICENSE EXPIRED</h4>
                <p className="text-[10.5px] text-rose-600 leading-relaxed mt-0.5">
                  The manual trial period limit is complete. AI_Print_Assistant prints have been locked. Please generate 
                  a new monthly key through the dev panel to activate.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-start space-x-3 mb-5">
              <Unlock className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-800">
                  LICENSE MODE: {localLicense.licenseEnabled ? 'ENFORCED (ACTIVE)' : 'DEVELOPMENT UNLOCKED'}
                </h4>
                <p className="text-[10.5px] text-emerald-600 leading-relaxed mt-0.5">
                  Enforcement bounds: {localLicense.licenseEnabled ? 'Customer limits enabled' : 'System bypass enabled. No blocking actions will perform.'}.
                </p>
              </div>
            </div>
          )}

          {/* Current Info fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Active Customer ID</span>
              <span className="text-xs font-semibold text-slate-700 block">{localLicense.customer.customerId || 'NONE'}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Registered Workshop</span>
              <span className="text-xs font-semibold text-slate-700 block truncate">{localLicense.customer.shopName || 'Bypassed Development'}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Enforcement Key signature</span>
              <span className="text-xs font-mono text-slate-600 block bg-slate-100/60 px-1.5 py-0.5 rounded border border-slate-200 truncate">
                {localLicense.license.licenseKey}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Hardware Signature ID</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-600 truncate mr-1">{localLicense.license.machineId}</span>
                <button
                  type="button"
                  onClick={handleRegenMachineId}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Mock generate machine ID changes"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
            {/* Status light */}
            <div className="p-3.5 border border-slate-150 rounded-xl text-left flex items-center space-x-3 bg-white">
              <div className={`p-1.5 rounded-lg shrink-0 ${isExpired ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-medium text-slate-400 font-mono block">Key evaluation</span>
                <span className={`text-[11px] font-bold uppercase ${isExpired ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {isExpired ? 'EXPIRED' : localLicense.license.status}
                </span>
              </div>
            </div>

            {/* Expire Date controller */}
            <div className="p-3.5 border border-slate-150 rounded-xl text-left flex items-center space-x-3 bg-white">
              <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-medium text-slate-400 font-mono block">Expiry Date</span>
                <input
                  type="date"
                  value={localLicense.license.licenseExpiryDate}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  className="text-[11px] font-semibold text-slate-700 bg-transparent border-0 ring-0 focus:ring-0 outline-none p-0 w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Mode status */}
            <div className="p-3.5 border border-slate-150 rounded-xl text-left flex items-center space-x-3 bg-white">
              <div className="p-1.5 bg-sky-50 text-sky-500 rounded-lg shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-medium text-slate-400 font-mono block">Daemon Mode</span>
                <span className="text-[11px] font-bold text-slate-700 uppercase">{localLicense.mode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Developer Admin License Generator */}
      <div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4 justify-between">
              <div className="flex items-center space-x-1.5">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-semibold text-slate-750">license_admin_tool.py Drawer</h3>
              </div>
              <span className="bg-slate-100 border text-[9px] font-bold font-mono text-slate-500 px-1.5 py-0.2 rounded leading-relaxed select-none">
                DEV_ONLY
              </span>
            </div>

            <div className="space-y-3">
              {/* Cust id */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={genCustId}
                  onChange={(e) => setGenCustId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-slate-700 outline-none transition-all font-mono"
                  placeholder="e.g. API-TARIQ-001"
                />
              </div>

              {/* Shop Name */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={genShopName}
                  onChange={(e) => setGenShopName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-slate-700 outline-none transition-all"
                />
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={genOwnerName}
                  onChange={(e) => setGenOwnerName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-slate-700 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* phone */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={genPhone}
                    onChange={(e) => setGenPhone(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-slate-700 outline-none transition-all font-mono"
                  />
                </div>
                {/* location */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={genLocation}
                    onChange={(e) => setGenLocation(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-slate-700 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Mode key */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    License Type
                  </label>
                  <select
                    value={genMode}
                    onChange={(e) => setGenMode(e.target.value)}
                    className="w-full text-[11px] bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-2 text-slate-700 outline-none transition-all"
                  >
                    <option value="paid_monthly">Paid Monthly</option>
                    <option value="trial_3">Trial 3-Days</option>
                    <option value="trial_7">Trial 7-Days</option>
                    <option value="demo">Demo Mode</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Target Expiry Date
                  </label>
                  <input
                    type="date"
                    value={genExpiry}
                    onChange={(e) => setGenExpiry(e.target.value)}
                    className="w-full text-[10px] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-755 outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col space-y-3">
            <div className="space-y-1 text-left">
              <span className="text-[9px] font-bold text-slate-400 block font-mono">ED25519 HEX SIGNATURE PREVIEW:</span>
              <p className="text-[8px] font-mono select-all bg-slate-100 border border-slate-150 p-1.5 rounded text-slate-500 uppercase tracking-tighter truncate leading-loose">
                {genSignature}
              </p>
            </div>

            <button
              onClick={generateAndApplyDeveloperLicense}
              type="button"
              className="w-full bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 font-semibold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
            >
              <FileSignature className="w-4 h-4 text-emerald-400 select-none" />
              <span>Sign & Apply License Key</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
