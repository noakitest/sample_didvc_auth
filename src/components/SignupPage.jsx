import { useState, useEffect } from 'react';
import { ArrowLeft, UserCircle, Shield } from './Icons';
import { redirectToWallet, getVCFromUrl, clearVCParams } from '../utils/walletRedirect';

export default function SignupPage({ onSignupComplete, onBackToLogin }) {
  const [inputMethod, setInputMethod] = useState('manual'); // 'manual' or 'vc'
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    address: '',
    birthDate: '',
  });
  const [isProcessingVC, setIsProcessingVC] = useState(false);
  const [error, setError] = useState('');
  const [vcData, setVcData] = useState(null);

  // URLパラメータからVCデータを取得
  useEffect(() => {
    const vcResult = getVCFromUrl();
    if (vcResult) {
      if (vcResult.cancelled) {
        // キャンセルされた場合
        clearVCParams();
        setIsProcessingVC(false);
      } else if (vcResult.vc) {
        // VC情報を自動入力
        setIsProcessingVC(true);
        clearVCParams();

        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            name: vcResult.vc.holderName,
            address: vcResult.vc.address,
            birthDate: vcResult.vc.birthDate,
          }));
          setVcData(vcResult.vc);
          setIsProcessingVC(false);
        }, 2000);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleVCButtonClick = () => {
    setIsProcessingVC(true);
    // ウォレットサービスにリダイレクト
    redirectToWallet('signup');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!formData.loginId || !formData.password || !formData.name || !formData.email) {
      setError('必須項目を入力してください');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    // サインアップ完了（VCデータも渡す）
    onSignupComplete({
      ...formData,
      vcData: vcData,
      isVerified: inputMethod === 'vc' && vcData !== null
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* 戻るボタン */}
        <button
          onClick={onBackToLogin}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>ログイン画面に戻る</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <UserCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">新規会員登録</h1>
            <p className="text-gray-600 mt-2">アカウント情報を入力してください</p>
          </div>

          {/* 入力方法切り替え */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setInputMethod('manual')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                inputMethod === 'manual'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              手動入力
            </button>
            <button
              onClick={() => setInputMethod('vc')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                inputMethod === 'vc'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              VCから入力
            </button>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* アカウント情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">アカウント情報</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ログインID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="loginId"
                  value={formData.loginId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="例: user123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="6文字以上"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード（確認） <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="もう一度入力"
                />
              </div>
            </div>

            {/* 個人情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">個人情報</h3>

              {inputMethod === 'vc' && !vcData && (
                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 mb-3">
                    VCから個人情報を自動入力します。ウォレットからVCを提出してください。
                  </p>
                  <button
                    type="button"
                    onClick={handleVCButtonClick}
                    className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    <Shield className="w-5 h-5" />
                    <span>VCを提出して自動入力</span>
                  </button>
                </div>
              )}

              {inputMethod === 'vc' && vcData && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-800 font-medium">
                        VCから情報を取得しました
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        提出された証明書: {vcData.type}（発行者: {vcData.issuer}）
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={inputMethod === 'vc' && vcData}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    inputMethod === 'vc' && vcData ? 'bg-gray-50' : ''
                  }`}
                  placeholder="例: 山田 太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="例: example@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住所
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={inputMethod === 'vc' && vcData}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    inputMethod === 'vc' && vcData ? 'bg-gray-50' : ''
                  }`}
                  placeholder="例: 東京都渋谷区神宮前1-2-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生年月日
                </label>
                <input
                  type="text"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  disabled={inputMethod === 'vc' && vcData}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    inputMethod === 'vc' && vcData ? 'bg-gray-50' : ''
                  }`}
                  placeholder="例: 1990年5月15日"
                />
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* 登録ボタン */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
            >
              登録する
            </button>
          </form>
        </div>
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
