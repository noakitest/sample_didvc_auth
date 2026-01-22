import { useState } from 'react';
import { Lock } from './Icons';
import WalletModal from './WalletModal';

export default function LoginPage({ onLogin, userState }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'vc'
  const [showWallet, setShowWallet] = useState(false);

  // 本人確認が完了しているかチェック
  const isVerified = userState?.isVerified || false;
  const linkedDID = userState?.linkedDID || null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // デモ用の簡易認証（ID: demo, パスワード: password）
    if (loginId === 'demo' && password === 'password') {
      onLogin();
    } else {
      setError('会員IDまたはパスワードが正しくありません');
    }
  };

  const handleVCLogin = (vc) => {
    // VCによる認証（モック）
    // DIDが登録済みのものと一致するか確認
    if (vc && vc.did && linkedDID && vc.did === linkedDID) {
      setShowWallet(false);
      onLogin();
    } else {
      setShowWallet(false);
      setError('VCのDIDが登録されていないか、一致しません');
    }
  };

  const handleVCAuthClick = () => {
    if (!isVerified) {
      setError('VC認証を利用するには、先にID/パスワードでログインして本人確認を完了してください');
      return;
    }
    setError('');
    setShowWallet(true);
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

      {/* ウォレットモーダル */}
      {showWallet && (
        <WalletModal 
          onClose={() => setShowWallet(false)}
          onSubmitVC={handleVCLogin}
        />
      )}
    </div>
  );
}
