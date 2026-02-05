import { useState } from 'react';
import { getWalletUrl, setWalletUrl, getWalletType, setWalletType } from '../utils/walletRedirect';

const WALLET_PRESETS = [
  { label: 'ウォレットA', url: 'http://localhost:3001', type: 'browser' },
  { label: 'ウォレットB', url: 'http://localhost:3002', type: 'browser' },
  { label: 'モバイルウォレット', url: '', type: 'mobile' },
];

/**
 * 接続先ウォレット切替コンポーネント
 * ブラウザウォレットとモバイルウォレットを切り替えられる
 */
export default function WalletSelector() {
  const [currentUrl, setCurrentUrl] = useState(getWalletUrl);
  const [currentType, setCurrentType] = useState(getWalletType);
  const [open, setOpen] = useState(false);
  const [mobileUrl, setMobileUrl] = useState(() => {
    return getWalletType() === 'mobile' ? getWalletUrl() : '';
  });

  const findActivePreset = () => {
    if (currentType === 'mobile') {
      return WALLET_PRESETS.find(p => p.type === 'mobile');
    }
    return WALLET_PRESETS.find(p => p.type === 'browser' && p.url === currentUrl);
  };

  const currentPreset = findActivePreset();

  const handleSelect = (preset) => {
    if (preset.type === 'mobile') {
      setCurrentType('mobile');
      setWalletType('mobile');
      if (mobileUrl.trim()) {
        setWalletUrl(mobileUrl.trim());
        setCurrentUrl(mobileUrl.trim());
      }
    } else {
      setWalletUrl(preset.url);
      setCurrentUrl(preset.url);
      setWalletType('browser');
      setCurrentType('browser');
      setOpen(false);
    }
  };

  const handleMobileUrlSave = () => {
    if (mobileUrl.trim()) {
      setWalletUrl(mobileUrl.trim());
      setCurrentUrl(mobileUrl.trim());
      setOpen(false);
    }
  };

  const getDisplayLabel = () => {
    if (currentPreset) return currentPreset.label;
    return 'カスタムURL';
  };

  const getDisplaySub = () => {
    if (currentType === 'mobile') return 'Mobile';
    try { return ':' + new URL(currentUrl).port; } catch { return ''; }
  };

  return (
    <div className="fixed top-3 right-3 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            currentPreset ? 'bg-green-500' : 'bg-yellow-500'
          }`}
        />
        {currentType === 'mobile' ? (
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
        <span className="text-gray-700 font-medium">
          {getDisplayLabel()}
        </span>
        <span className="text-gray-400 text-xs">{getDisplaySub()}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-500 font-medium">接続先ウォレット</p>
          </div>

          {WALLET_PRESETS.map((preset) => {
            const isActive = preset.type === currentType &&
              (preset.type === 'mobile' || preset.url === currentUrl);
            return (
              <button
                key={preset.label}
                onClick={() => handleSelect(preset)}
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  {preset.type === 'mobile' ? (
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className={`text-sm ${isActive ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                    {preset.label}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {preset.type === 'mobile' ? 'Deep Link' : preset.url.replace('http://', '')}
                </span>
              </button>
            );
          })}

          {/* モバイルウォレットURL入力 */}
          {currentType === 'mobile' && (
            <div className="px-3 py-3 border-t border-gray-200 bg-gray-50">
              <label className="block text-xs text-gray-500 mb-1">ウォレットURL</label>
              <input
                type="text"
                value={mobileUrl}
                onChange={(e) => setMobileUrl(e.target.value)}
                placeholder="exp://192.168.1.5:8081/--"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs font-mono bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleMobileUrlSave}
                disabled={!mobileUrl.trim()}
                className="mt-2 w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                保存
              </button>
              <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                Expo Go: exp://IP:PORT/--
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
