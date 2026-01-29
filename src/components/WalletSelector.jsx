import { useState } from 'react';
import { getWalletUrl, setWalletUrl } from '../utils/walletRedirect';

const WALLET_PRESETS = [
  { label: 'ウォレットA', port: 3001 },
  { label: 'ウォレットB', port: 3002 },
];

/**
 * 接続先ウォレット切替コンポーネント
 * ページ上部に表示し、デモ時に2つのウォレットを切り替えられる
 */
export default function WalletSelector() {
  const [currentUrl, setCurrentUrl] = useState(getWalletUrl);
  const [open, setOpen] = useState(false);

  const currentPort = (() => {
    try { return new URL(currentUrl).port; } catch { return '3001'; }
  })();

  const currentPreset = WALLET_PRESETS.find(p => String(p.port) === currentPort);

  const handleSelect = (preset) => {
    const url = `http://localhost:${preset.port}`;
    setWalletUrl(url);
    setCurrentUrl(url);
    setOpen(false);
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
        <span className="text-gray-700 font-medium">
          {currentPreset?.label || `ポート ${currentPort}`}
        </span>
        <span className="text-gray-400 text-xs">:{currentPort}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-500 font-medium">接続先ウォレット</p>
          </div>
          {WALLET_PRESETS.map((preset) => {
            const isActive = String(preset.port) === currentPort;
            return (
              <button
                key={preset.port}
                onClick={() => handleSelect(preset)}
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className={`text-sm ${isActive ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                    {preset.label}
                  </span>
                </div>
                <span className="text-xs text-gray-400">localhost:{preset.port}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
