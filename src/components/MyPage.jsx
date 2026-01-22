import { useState, useEffect } from 'react';
import { UserCircle, CheckCircle, AlertCircle, Edit, Shield, LogOut } from './Icons';
import WalletModal from './WalletModal';
import ProfileEdit from './ProfileEdit';

export default function MyPage({ onLogout, userState, onUpdateUserState }) {
  const [showWallet, setShowWallet] = useState(false);
  const [submittedVC, setSubmittedVC] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // ダミーデータ（初期値はuserStateから復元）
  const [userData, setUserData] = useState({
    memberId: 'M123456789',
    name: '山田 太郎',
    email: 'yamada.taro@example.com',
    address: '〒150-0001 東京都渋谷区神宮前1-2-3',
    birthDate: '1990年5月15日',
    password: '************',
    isVerified: userState?.isVerified || false,
    linkedDID: userState?.linkedDID || null
  });

  const handleSubmitVC = (vc) => {
    setSubmittedVC(vc);
    setShowWallet(false);
    // 本人確認ステータスを更新し、DIDを紐付け（モック）
    setTimeout(() => {
      const newUserData = { 
        ...userData, 
        isVerified: true,
        linkedDID: vc.did
      };
      setUserData(newUserData);
      // 親コンポーネントに状態を保存
      onUpdateUserState({
        isVerified: true,
        linkedDID: vc.did
      });
    }, 1000);
  };

  const handleProfileSave = (formData, method, did = null) => {
    if (method === 'manual') {
      // 手動編集の場合、本人確認ステータスを未確認に戻す
      const newUserData = {
        ...userData,
        ...formData,
        isVerified: false,
        linkedDID: null
      };
      setUserData(newUserData);
      onUpdateUserState({
        isVerified: false,
        linkedDID: null
      });
    } else if (method === 'vc') {
      // VCから更新の場合、本人確認を維持またはDIDを更新
      const newUserData = {
        ...userData,
        ...formData,
        isVerified: true,
        linkedDID: did || userData.linkedDID
      };
      setUserData(newUserData);
      onUpdateUserState({
        isVerified: true,
        linkedDID: did || userData.linkedDID
      });
    }
    setIsEditing(false);
  };

  // 編集画面を表示中は編集画面を返す
  if (isEditing) {
    return (
      <ProfileEdit
        userData={userData}
        onSave={handleProfileSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">マイページ</h1>
            <p className="text-gray-600 mt-2">アカウント情報の確認と管理</p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>ログアウト</span>
          </button>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* プロフィールセクション */}
          <div className="p-8">
            <div className="flex items-start space-x-6">
              {/* アイコン */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                  <UserCircle />
                </div>
              </div>

              {/* 基本情報 */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {userData.name}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* 会員ID */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">会員ID</p>
                    <p className="text-gray-900 font-medium">{userData.memberId}</p>
                  </div>

                  {/* パスワード */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">パスワード</p>
                    <p className="text-gray-900 font-medium">{userData.password}</p>
                  </div>

                  {/* メールアドレス */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">メールアドレス</p>
                    <p className="text-gray-700">{userData.email}</p>
                  </div>

                  {/* 生年月日 */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">生年月日</p>
                    <p className="text-gray-700">{userData.birthDate}</p>
                  </div>
                </div>

                {/* 住所 */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">住所</p>
                  <p className="text-gray-700">{userData.address}</p>
                </div>

                {/* 紐付けDID */}
                {userData.linkedDID && (
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-700 font-medium mb-2">紐付けされた共通ID（DID）</p>
                    <p className="text-purple-900 font-mono text-sm break-all">{userData.linkedDID}</p>
                    <p className="text-xs text-purple-600 mt-2">
                      このDIDは会員ID {userData.memberId} に紐付けられています
                    </p>
                  </div>
                )}

                {/* 本人確認ステータス */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">本人確認ステータス</p>
                  {userData.isVerified ? (
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="text-green-600" />
                      <span className="text-green-700 font-medium">確認済み</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="text-yellow-600" />
                      <span className="text-yellow-700 font-medium">未確認</span>
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Edit className="w-5 h-5" />
                    <span>プロフィール変更</span>
                  </button>
                  
                  {!userData.isVerified && (
                    <button 
                      onClick={() => setShowWallet(true)}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Shield className="w-5 h-5" />
                      <span>本人確認を開始</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* フッター情報 */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              最終ログイン: 2026年1月22日 13:30
            </p>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>ヒント:</strong> 本人確認を完了すると、より多くのサービス機能をご利用いただけます。
          </p>
        </div>

        {/* VC提出成功メッセージ */}
        {submittedVC && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-800 font-medium">
                  身分証VCの提出が完了しました
                </p>
                <p className="text-sm text-green-700 mt-1">
                  提出された証明書: {submittedVC.type}（発行者: {submittedVC.issuer}）
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ウォレットモーダル */}
      {showWallet && (
        <WalletModal 
          onClose={() => setShowWallet(false)}
          onSubmitVC={handleSubmitVC}
        />
      )}
    </div>
  );
}
