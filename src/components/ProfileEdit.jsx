import { useState } from 'react';
import { ArrowLeft, Send, Shield } from './Icons';
import WalletModal from './WalletModal';

export default function ProfileEdit({ userData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    address: userData.address,
    birthDate: userData.birthDate,
  });
  const [showWallet, setShowWallet] = useState(false);
  const [updateMethod, setUpdateMethod] = useState(null); // 'manual' or 'vc'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleManualSave = () => {
    setUpdateMethod('manual');
    onSave(formData, 'manual');
  };

  const handleVCUpdate = (vc) => {
    setShowWallet(false);
    setUpdateMethod('vc');
    
    // VCから情報を抽出して更新
    const updatedData = {
      name: vc.holderName,
      email: formData.email, // メールはVCに含まれないのでそのまま
      address: vc.address,
      birthDate: vc.birthDate,
    };
    
    onSave(updatedData, 'vc', vc.did);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={onCancel}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>マイページに戻る</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">プロフィール編集</h1>
          <p className="text-gray-600 mt-2">手動編集またはVCから情報を更新できます</p>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6">
            {/* 氏名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                氏名
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* 住所 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                住所
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* 生年月日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                生年月日
              </label>
              <input
                type="text"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="例: 1990年5月15日"
              />
            </div>
          </form>

          {/* 注意事項 */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>注意:</strong> 手動で編集して保存すると、本人確認ステータスが未確認に戻ります。
              VCから更新すると本人確認が維持されます。
            </p>
          </div>

          {/* アクションボタン */}
          <div className="mt-8 space-y-3">
            {/* 手動保存 */}
            <button
              onClick={handleManualSave}
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Send className="w-5 h-5" />
              <span>手動で保存（本人確認は未確認に戻る）</span>
            </button>

            {/* VCから更新 */}
            <button
              onClick={() => setShowWallet(true)}
              type="button"
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <Shield className="w-5 h-5" />
              <span>VCから更新（本人確認を維持）</span>
            </button>

            {/* キャンセル */}
            <button
              onClick={onCancel}
              type="button"
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>

      {/* ウォレットモーダル */}
      {showWallet && (
        <WalletModal 
          onClose={() => setShowWallet(false)}
          onSubmitVC={handleVCUpdate}
        />
      )}
    </div>
  );
}
