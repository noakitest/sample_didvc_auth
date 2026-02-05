// デフォルトのウォレットサービスURL
const DEFAULT_WALLET_URL = 'http://localhost:3001';
const STORAGE_KEY = 'wallet_service_url';
const TYPE_STORAGE_KEY = 'wallet_service_type';

// 現在のウォレットURLを取得
export const getWalletUrl = () => {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_WALLET_URL;
};

// ウォレットURLを設定
export const setWalletUrl = (url) => {
  localStorage.setItem(STORAGE_KEY, url);
};

// ウォレット種別を取得 ('browser' | 'mobile')
export const getWalletType = () => {
  return localStorage.getItem(TYPE_STORAGE_KEY) || 'browser';
};

// ウォレット種別を設定
export const setWalletType = (type) => {
  localStorage.setItem(TYPE_STORAGE_KEY, type);
};

// ウォレットサービスにリダイレクトする
export const redirectToWallet = (requestId) => {
  const callbackUrl = `${window.location.origin}${window.location.pathname}`;
  const walletUrl = getWalletUrl();
  const walletType = getWalletType();

  if (walletType === 'mobile') {
    // モバイルウォレットはディープリンクのパスでルーティング
    // did-auth → auth パス、それ以外 → select パス
    const path = requestId === 'did-auth' ? 'auth' : 'select';
    const separator = walletUrl.endsWith('/') ? '' : '/';
    const mobileUrl = `${walletUrl}${separator}${path}?callback=${encodeURIComponent(callbackUrl)}&requestId=${requestId}`;
    window.location.href = mobileUrl;
  } else {
    // ブラウザウォレット: 既存の動作
    const browserUrl = `${walletUrl}?callback=${encodeURIComponent(callbackUrl)}&requestId=${requestId}`;
    window.location.href = browserUrl;
  }
};

// URLパラメータからVCデータを取得する
export const getVCFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const vcData = params.get('vcData');
  const requestId = params.get('requestId');
  const cancelled = params.get('cancelled');

  if (cancelled === 'true') {
    return { cancelled: true, requestId };
  }

  if (!vcData) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(atob(vcData));
    const vc = JSON.parse(decoded);
    return { vc, requestId };
  } catch (error) {
    console.error('Failed to decode VC data:', error);
    return null;
  }
};

// URLパラメータをクリアする
export const clearVCParams = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('vcData');
  url.searchParams.delete('requestId');
  url.searchParams.delete('cancelled');
  window.history.replaceState({}, '', url.toString());
};
