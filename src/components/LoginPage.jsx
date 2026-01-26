import { useState, useEffect } from 'react';
import { Lock } from './Icons';
import { redirectToWallet, getVCFromUrl, clearVCParams } from '../utils/walletRedirect';

export default function LoginPage({ onLogin, userState, onNavigateToSignup }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'vc'
  const [isProcessingVC, setIsProcessingVC] = useState(false);

  // 本人確認が完了しているかチェック
  const isVerified = userState?.isVerified || false;
  const linkedDID = userState?.linkedDID || null;

  // URLパラメータからVCデータを取得
  useEffect(() => {
    const vcResult = getVCFromUrl();
    if (vcResult) {
      if (vcResult.cancelled) {
        // キャンセルされた場合
        clearVCParams();
        setError('ウォレット認証がキャンセルされました');
        setIsProcessingVC(false);
      } else if (vcResult.vc) {
        // VC認証処理
        setIsProcessingVC(true);
        clearVCParams();

        // デバッグログ
        console.log('=== VC認証デバッグ ===');
        console.log('VCのDID:', vcResult.vc.did);
        console.log('登録済みDID:', linkedDID);
        console.log('userState:', userState);
        console.log('一致判定:', vcResult.vc.did === linkedDID);

        // VCのDIDチェック
        if (vcResult.vc.did && linkedDID && vcResult.vc.did === linkedDID) {
          setTimeout(() => {
            onLogin(vcResult.vc);
          }, 2000);
        } else {
          setIsProcessingVC(false);
          setError(`VCのDIDが登録されていないか、一致しません（VC: ${vcResult.vc.did}, 登録: ${linkedDID || 'なし'}）`);
        }
      }
    }
  }, [linkedDID, onLogin, userState]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // デモ用の簡易認証（ID: demo, パスワード: password）
    if (loginId === 'demo' && password === 'password') {
      onLogin();
    } else {
      setError('会員IDまたはパスワードが正しくありません');
    }
  };

  const handleVCAuthClick = () => {
    if (!isVerified) {
      setError('VC認証を利用するには、先にID/パスワードでログインして本人確認を完了してください');
      return;
    }
    setError('');
    setIsProcessingVC(true);
    // ウォレットサービスにリダイレクト
    redirectToWallet('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
          <p className="text-gray-600 mt-2">認証方法を選択してください</p>
        </div>

        {/* ログイン方法タブ */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setLoginMethod('password')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              loginMethod === 'password'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ID/パスワード
          </button>
          <button
            onClick={() => setLoginMethod('vc')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              loginMethod === 'vc'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            VC認証
          </button>
        </div>

        {/* パスワードログインフォーム */}
        {loginMethod === 'password' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会員ID
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="会員IDを入力"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="パスワードを入力"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              ログイン
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                デモ用: ID「demo」/ パスワード「password」
              </p>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                アカウントをお持ちでない方は
              </p>
              <button
                type="button"
                onClick={onNavigateToSignup}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                新規会員登録はこちら
              </button>
            </div>
          </form>
        )}

        {/* VC認証 */}
        {loginMethod === 'vc' && (
          <div className="space-y-6">
            {isVerified ? (
              <>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Verifiable Credential認証</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    デジタルウォレットから身分証VCを提出してログインします
                  </p>
                  <button
                    onClick={handleVCAuthClick}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm"
                  >
                    ウォレットを開く
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    DIDによる分散型認証を利用します
                  </p>
                </div>
              </>
            ) : (
              <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">本人確認が必要です</h3>
                <p className="text-sm text-gray-700 mb-4">
                  VC認証を利用するには、まずID/パスワードでログインして本人確認を完了してください。
                </p>
                <button
                  onClick={() => setLoginMethod('password')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  ID/パスワードログインに戻る →
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VC処理中のローディングオーバーレイ */}
      {isProcessingVC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">VCを検証中...</h3>
            <p className="text-sm text-gray-600">
              身分証明書の内容を確認しています
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
