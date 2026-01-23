// ウォレットサービスのURL
const WALLET_SERVICE_URL = 'http://localhost:3001';

// ウォレットサービスにリダイレクトする
export const redirectToWallet = (requestId) => {
  const callbackUrl = `${window.location.origin}${window.location.pathname}`;
  const walletUrl = `${WALLET_SERVICE_URL}?callback=${encodeURIComponent(callbackUrl)}&requestId=${requestId}`;
  window.location.href = walletUrl;
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
