import { useState, useEffect } from 'react';
import { Lock, Users } from './Icons';
import { redirectToWallet, getVCFromUrl, clearVCParams } from '../utils/walletRedirect';

export default function LoginPage({ onLogin, onDelegationLogin, userState, onNavigateToSignup }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState('password'); // 'password', 'vc', 'delegation'
  const [isProcessingVC, setIsProcessingVC] = useState(false);

  // 登録済みDID（本人確認完了済みユーザーのDID）
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
      } else if (vcResult.vc && vcResult.requestId === 'login') {
        // 通常のVC認証処理
        setIsProcessingVC(true);
        clearVCParams();

        // デバッグログ
        console.log('=== VC認証デバッグ ===');
        console.log('VCのDID:', vcResult.vc.did);
        console.log('登録済みDID:', linkedDID);
        console.log('userState:', userState);
        console.log('一致判定:', vcResult.vc.did === linkedDID);

        // VCのDIDがサービスに登録されているかチェック
        if (vcResult.vc.did && linkedDID && vcResult.vc.did === linkedDID) {
          setTimeout(() => {
            onLogin(vcResult.vc);
          }, 2000);
        } else {
          setIsProcessingVC(false);
          setError('このVCに紐づくアカウントが見つかりません。先にID/パスワードでログインし、本人確認を完了してください。');
        }
      } else if (vcResult.vc && vcResult.requestId === 'delegation-login') {
        // 代理ログイン処理
        setIsProcessingVC(true);
        clearVCParams();

        const delegationVC = vcResult.vc;

        // 委任状VCの検証
        console.log('=== 代理ログイン検証 ===');
        console.log('委任状VC:', delegationVC);
        console.log('登録済みDID:', linkedDID);

        // 委任者のDIDがサービスに登録されているかチェック
        if (delegationVC.issuer?.did && linkedDID && delegationVC.issuer.did === linkedDID) {
          // 失効リストのチェック
          const revokedList = JSON.parse(localStorage.getItem('revoked_delegations') || '[]');
          if (delegationVC.id && revokedList.includes(delegationVC.id)) {
            setIsProcessingVC(false);
            setError('この委任状は取り消されています。委任者に新しい委任状の発行を依頼してください。');
            return;
          }

          // 有効期限チェック
          const today = new Date().toISOString().split('T')[0];
          if (delegationVC.expiryDate < today) {
            setIsProcessingVC(false);
            setError('この委任状は有効期限が切れています');
            return;
          }

          setTimeout(() => {
            onDelegationLogin(delegationVC);
          }, 2000);
        } else {
          setIsProcessingVC(false);
          setError('委任者（本人）がこのサービスで本人確認を完了していません。委任者に本人確認を依頼してください。');
        }
      }
    }
  }, [linkedDID, onLogin, onDelegationLogin, userState]);

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
    setError('');
    setIsProcessingVC(true);
    // ウォレットサービスにリダイレクト
    redirectToWallet('login');
  };

  const handleDelegationLoginClick = () => {
    setError('');
    setIsProcessingVC(true);
    // ウォレットサービスにリダイレクト（代理ログインモード）
    redirectToWallet('delegation-login');
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
            onClick={() => { setLoginMethod('password'); setError(''); }}
            className={`flex-1 py-2 px-2 rounded-md font-medium transition-colors text-sm ${
              loginMethod === 'password'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ID/パスワード
          </button>
          <button
            onClick={() => { setLoginMethod('vc'); setError(''); }}
            className={`flex-1 py-2 px-2 rounded-md font-medium transition-colors text-sm ${
              loginMethod === 'vc'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            VC認証
          </button>
          <button
            onClick={() => { setLoginMethod('delegation'); setError(''); }}
            className={`flex-1 py-2 px-2 rounded-md font-medium transition-colors text-sm ${
              loginMethod === 'delegation'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            代理ログイン
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

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* 代理ログイン */}
        {loginMethod === 'delegation' && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">代理ログイン</h3>
              <p className="text-sm text-gray-600 mb-4">
                委任状VCを使って、本人に代わりログインします
              </p>
              <button
                onClick={handleDelegationLoginClick}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm"
              >
                ウォレットから委任状を提出
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">代理ログインの流れ</h4>
              <ol className="text-xs text-gray-600 space-y-1">
                <li>1. 本人が委任状VCを発行してあなたに渡す</li>
                <li>2. あなたのウォレットで委任状VCを受け取る</li>
                <li>3. 「ウォレットから委任状を提出」をクリック</li>
                <li>4. 委任状VCを選択して提出</li>
              </ol>
            </div>

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
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {loginMethod === 'delegation' ? '委任状を検証中...' : 'VCを検証中...'}
            </h3>
            <p className="text-sm text-gray-600">
              {loginMethod === 'delegation' ? '委任状の内容を確認しています' : '身分証明書の内容を確認しています'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
