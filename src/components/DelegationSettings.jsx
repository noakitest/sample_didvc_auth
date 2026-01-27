import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Users, QrCode, FileText, Trash, CheckCircle } from './Icons';

/**
 * 代理人設定画面
 * 委任状VCを発行してQRコードで表示
 */
export default function DelegationSettings({ userData, userState, onBack }) {
  const [delegateDID, setDelegateDID] = useState('');
  const [scope, setScope] = useState(['view']); // 'view', 'edit'
  const [expiryDate, setExpiryDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [generatedVC, setGeneratedVC] = useState(null);
  const [issuedDelegations, setIssuedDelegations] = useState([]);

  // 初期有効期限を1ヶ月後に設定
  useEffect(() => {
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    setExpiryDate(oneMonthLater.toISOString().split('T')[0]);

    // 保存済みの委任状を読み込む
    const saved = localStorage.getItem('issued_delegations');
    if (saved) {
      setIssuedDelegations(JSON.parse(saved));
    }
  }, []);

  // 最大有効期限（3ヶ月後）
  const maxExpiryDate = (() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0];
  })();

  // 最小有効期限（今日）
  const minExpiryDate = new Date().toISOString().split('T')[0];

  // 委任状VCを生成
  const handleGenerateVC = () => {
    if (!delegateDID.trim()) {
      alert('代理人のDIDを入力してください');
      return;
    }

    if (!userState?.linkedDID) {
      alert('本人確認が完了していません。先に本人確認を完了してください。');
      return;
    }

    const delegationVC = {
      id: `delegation-${Date.now()}`,
      type: '委任状',
      issuer: {
        did: userState.linkedDID,
        name: userData.name
      },
      delegate: {
        did: delegateDID.trim()
      },
      scope: scope,
      purpose: purpose.trim() || undefined,
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: expiryDate
    };

    setGeneratedVC(delegationVC);

    // 発行履歴に追加
    const newIssuedDelegations = [...issuedDelegations, delegationVC];
    setIssuedDelegations(newIssuedDelegations);
    localStorage.setItem('issued_delegations', JSON.stringify(newIssuedDelegations));
  };

  // 委任状を取り消し
  const handleRevoke = (vcId) => {
    const newIssuedDelegations = issuedDelegations.filter(d => d.id !== vcId);
    setIssuedDelegations(newIssuedDelegations);
    localStorage.setItem('issued_delegations', JSON.stringify(newIssuedDelegations));
  };

  // スコープの切り替え
  const toggleScope = (scopeValue) => {
    if (scopeValue === 'view') {
      // 閲覧は必須
      return;
    }
    if (scope.includes(scopeValue)) {
      setScope(scope.filter(s => s !== scopeValue));
    } else {
      setScope([...scope, scopeValue]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>マイページに戻る</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">代理人設定</h1>
              <p className="text-gray-600">委任状VCを発行して代理人を設定します</p>
            </div>
          </div>
        </div>

        {/* 本人確認未完了の警告 */}
        {!userState?.isVerified && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-yellow-800 font-medium">
              委任状を発行するには、先に本人確認を完了してください。
            </p>
          </div>
        )}

        {/* 委任状発行フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">新しい委任状を発行</h2>

          {/* 代理人DID */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              代理人のDID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={delegateDID}
              onChange={(e) => setDelegateDID(e.target.value)}
              placeholder="did:example:..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-mono text-sm"
              disabled={!userState?.isVerified}
            />
            <p className="mt-1 text-xs text-gray-500">
              代理人のウォレットに表示されているDIDを入力してください
            </p>
          </div>

          {/* 委任範囲 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              委任する権限
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer bg-purple-50 border-purple-300">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-4 h-4"
                />
                <span className="text-sm text-purple-700">閲覧</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer ${
                scope.includes('edit') ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-300 hover:border-purple-300'
              }`}>
                <input
                  type="checkbox"
                  checked={scope.includes('edit')}
                  onChange={() => toggleScope('edit')}
                  disabled={!userState?.isVerified}
                  className="w-4 h-4"
                />
                <span className={`text-sm ${scope.includes('edit') ? 'text-purple-700' : 'text-gray-700'}`}>
                  編集も許可
                </span>
              </label>
            </div>
          </div>

          {/* 有効期限 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              有効期限 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={minExpiryDate}
              max={maxExpiryDate}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              disabled={!userState?.isVerified}
            />
            <p className="mt-1 text-xs text-gray-500">
              最大3ヶ月まで設定できます
            </p>
          </div>

          {/* 委任目的 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              委任目的（任意）
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="例: 入院中の手続き代行"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              disabled={!userState?.isVerified}
            />
          </div>

          {/* 発行ボタン */}
          <button
            onClick={handleGenerateVC}
            disabled={!userState?.isVerified || !delegateDID.trim()}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              userState?.isVerified && delegateDID.trim()
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>委任状QRコードを生成</span>
          </button>
        </div>

        {/* 生成されたQRコード */}
        {generatedVC && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full mb-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">委任状が発行されました</span>
              </div>

              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-purple-300 mb-4">
                <QRCodeSVG
                  value={JSON.stringify(generatedVC)}
                  size={200}
                  level="M"
                />
              </div>

              <p className="text-gray-600 mb-4">
                代理人にこのQRコードを見せて、スキャンしてもらってください
              </p>

              <div className="bg-gray-50 rounded-lg p-4 text-left text-sm">
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">代理人DID:</span>{' '}
                  <code className="text-xs break-all">{generatedVC.delegate.did}</code>
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">権限:</span> {generatedVC.scope.join(', ')}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">有効期限:</span> {generatedVC.expiryDate}
                </p>
              </div>

              <button
                onClick={() => setGeneratedVC(null)}
                className="mt-4 px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        {/* 発行済み委任状一覧 */}
        {issuedDelegations.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">発行済み委任状</h2>
            <div className="space-y-3">
              {issuedDelegations.map((delegation) => {
                const isExpired = delegation.expiryDate < new Date().toISOString().split('T')[0];
                return (
                  <div
                    key={delegation.id}
                    className={`border rounded-lg p-4 ${
                      isExpired ? 'bg-gray-50 border-gray-200' : 'bg-purple-50 border-purple-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <FileText className={`w-5 h-5 mt-0.5 ${isExpired ? 'text-gray-400' : 'text-purple-600'}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${isExpired ? 'text-gray-500' : 'text-gray-900'}`}>
                              委任状
                            </span>
                            {isExpired ? (
                              <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                                期限切れ
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                有効
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            代理人: <code className="text-xs">{delegation.delegate.did.substring(0, 30)}...</code>
                          </p>
                          <p className="text-sm text-gray-500">
                            権限: {delegation.scope.join(', ')} / 期限: {delegation.expiryDate}
                          </p>
                        </div>
                      </div>
                      {!isExpired && (
                        <button
                          onClick={() => handleRevoke(delegation.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="取り消し"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
