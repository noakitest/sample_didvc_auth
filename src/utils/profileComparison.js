// プロフィール情報の正規化と比較ユーティリティ

/**
 * 日付文字列を正規化（YYYY-MM-DD形式に統一）
 */
export const normalizeDateString = (dateStr) => {
  if (!dateStr) return '';
  
  // 既に YYYY-MM-DD 形式の場合
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // YYYY年MM月DD日 形式
  const japaneseFormat = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (japaneseFormat) {
    const year = japaneseFormat[1];
    const month = japaneseFormat[2].padStart(2, '0');
    const day = japaneseFormat[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // YYYY/MM/DD 形式
  const slashFormat = dateStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (slashFormat) {
    const year = slashFormat[1];
    const month = slashFormat[2].padStart(2, '0');
    const day = slashFormat[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // その他の形式はそのまま返す
  return dateStr;
};

/**
 * 住所文字列を正規化
 */
export const normalizeAddress = (address) => {
  if (!address) return '';
  
  return address
    // 郵便番号を削除（〒123-4567 または 〒1234567 形式）
    .replace(/〒\s*\d{3}-?\d{4}\s*/g, '')
    // 全角数字を半角に
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    // 全角ハイフンを半角に
    .replace(/[－−‐]/g, '-')
    // 連続する空白を1つに
    .replace(/\s+/g, '')
    // 前後の空白を削除
    .trim();
};

/**
 * 2つのプロフィール情報を比較（正規化した上で）
 */
export const compareProfileData = (profile1, profile2) => {
  const differences = {
    name: false,
    birthDate: false,
    address: false,
    details: {}
  };
  
  // 氏名の比較（空白を削除して比較）
  const name1 = profile1.name?.replace(/\s+/g, '');
  const name2 = profile2.name?.replace(/\s+/g, '');
  if (name1 !== name2) {
    differences.name = true;
    differences.details.name = {
      original: profile1.name,
      incoming: profile2.name
    };
  }
  
  // 生年月日の比較（正規化して比較）
  const birthDate1 = normalizeDateString(profile1.birthDate);
  const birthDate2 = normalizeDateString(profile2.birthDate);
  if (birthDate1 !== birthDate2) {
    differences.birthDate = true;
    differences.details.birthDate = {
      original: profile1.birthDate,
      incoming: profile2.birthDate
    };
  }
  
  // 住所の比較（正規化して比較）
  const address1 = normalizeAddress(profile1.address);
  const address2 = normalizeAddress(profile2.address);
  if (address1 !== address2) {
    differences.address = true;
    differences.details.address = {
      original: profile1.address,
      incoming: profile2.address
    };
  }
  
  // 差異があるかどうか
  differences.hasDifference = differences.name || differences.birthDate || differences.address;
  
  return differences;
};
