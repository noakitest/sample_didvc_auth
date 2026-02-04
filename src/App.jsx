import { useState } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import MyPage from './components/MyPage';
import DelegationSettings from './components/DelegationSettings';
import WalletSelector from './components/WalletSelector';

// 旧フォーマット（単一ユーザー）からの自動マイグレーション
(() => {
  const oldProfile = localStorage.getItem('userProfile');
  if (oldProfile && !localStorage.getItem('userProfiles')) {
    try {
      const profile = JSON.parse(oldProfile);
      const oldState = localStorage.getItem('userState');
      const state = oldState ? JSON.parse(oldState) : null;
      const profiles = { [profile.email]: { ...profile, userState: state } };
      localStorage.setItem('userProfiles', JSON.stringify(profiles));
      if (localStorage.getItem('isLoggedIn') === 'true') {
        localStorage.setItem('currentUserEmail', profile.email);
      }
    } catch { /* ignore */ }
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userState');
  }
})();

function App() {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('currentView') || 'login';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    return localStorage.getItem('currentUserEmail') || null;
  });
  const [userState, setUserState] = useState(() => {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) return null;
    try {
      const profiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
      return profiles[email]?.userState || null;
    } catch { return null; }
  });
  const [vcLoginInfo, setVcLoginInfo] = useState(null);
  const [delegationLoginInfo, setDelegationLoginInfo] = useState(null);

  // ユーザープロフィール群の読み書きヘルパー
  const getUserProfiles = () => {
    try {
      return JSON.parse(localStorage.getItem('userProfiles') || '{}');
    } catch { return {}; }
  };

  const saveUserProfiles = (profiles) => {
    localStorage.setItem('userProfiles', JSON.stringify(profiles));
  };

  // 通常ログイン（email はログイン元で特定されたユーザーのメール）
  const handleLogin = (vcInfo = null, email = null) => {
    const loginEmail = email || 'demo@example.com';

    // プロフィールが存在しない場合はデフォルトを作成（デモ用フォールバック）
    const profiles = getUserProfiles();
    if (!profiles[loginEmail]) {
      profiles[loginEmail] = {
        memberId: 'M123456789',
        name: '山田 太郎',
        email: loginEmail,
        address: '〒150-0001 東京都渋谷区神宮前1-2-3',
        birthDate: '1990年5月15日',
        password: 'password',
        userState: null,
      };
      saveUserProfiles(profiles);
    }

    const profile = profiles[loginEmail];
    setUserState(profile.userState || null);
    setCurrentUserEmail(loginEmail);
    localStorage.setItem('currentUserEmail', loginEmail);

    setIsLoggedIn(true);
    setCurrentView('mypage');
    setVcLoginInfo(vcInfo);
    setDelegationLoginInfo(null);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentView', 'mypage');
  };

  // 代理ログイン
  const handleDelegationLogin = (delegationVC, email = null) => {
    if (email) {
      const profiles = getUserProfiles();
      const profile = profiles[email];
      setUserState(profile?.userState || null);
      setCurrentUserEmail(email);
      localStorage.setItem('currentUserEmail', email);
    }

    setIsLoggedIn(true);
    setCurrentView('mypage');
    setVcLoginInfo(null);
    setDelegationLoginInfo(delegationVC);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentView', 'mypage');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('login');
    setVcLoginInfo(null);
    setDelegationLoginInfo(null);
    setCurrentUserEmail(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserEmail');
    localStorage.setItem('currentView', 'login');
  };

  const handleUpdateUserState = (newState) => {
    setUserState(newState);
    if (currentUserEmail) {
      const profiles = getUserProfiles();
      if (profiles[currentUserEmail]) {
        profiles[currentUserEmail].userState = newState;
        saveUserProfiles(profiles);
      }
    }
  };

  const handleSignupComplete = (signupData) => {
    const email = signupData.loginId;
    const profiles = getUserProfiles();

    const newProfile = {
      memberId: `M${Date.now().toString().slice(-9)}`,
      name: signupData.name,
      email: email,
      address: signupData.address,
      birthDate: signupData.birthDate,
      password: signupData.password,
      userState: null,
    };

    // VCから登録した場合は本人確認済み
    if (signupData.isVerified && signupData.vcData) {
      newProfile.userState = {
        isVerified: true,
        linkedDID: signupData.vcData.did,
      };
    }

    profiles[email] = newProfile;
    saveUserProfiles(profiles);

    setUserState(newProfile.userState);
    setCurrentUserEmail(email);
    localStorage.setItem('currentUserEmail', email);

    // 登録完了後、自動ログイン
    setIsLoggedIn(true);
    setCurrentView('mypage');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentView', 'mypage');
  };

  // プロフィール変更を永続化するコールバック
  const handleUpdateUserData = (updatedProfile) => {
    if (!currentUserEmail) return;
    const profiles = getUserProfiles();
    const current = profiles[currentUserEmail] || {};
    const merged = { ...current, ...updatedProfile };
    // password がマスク値の場合は上書きしない
    if (updatedProfile.password === '************') {
      merged.password = current.password;
    }
    profiles[currentUserEmail] = merged;
    saveUserProfiles(profiles);
  };

  // ユーザーデータ（MyPage と DelegationSettings で共有）
  const userData = (() => {
    const profiles = getUserProfiles();
    const profile = currentUserEmail ? profiles[currentUserEmail] : null;

    if (!profile) {
      return {
        memberId: 'M123456789',
        name: '山田 太郎',
        email: 'demo@example.com',
        address: '〒150-0001 東京都渋谷区神宮前1-2-3',
        birthDate: '1990年5月15日',
        password: '************',
        isVerified: userState?.isVerified || false,
        linkedDID: userState?.linkedDID || null,
      };
    }

    return {
      memberId: profile.memberId,
      name: profile.name,
      email: profile.email,
      address: profile.address,
      birthDate: profile.birthDate,
      password: '************',
      isVerified: userState?.isVerified || false,
      linkedDID: userState?.linkedDID || null,
    };
  })();

  return (
    <>
      <WalletSelector />
      {currentView === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onDelegationLogin={handleDelegationLogin}
          onNavigateToSignup={() => {
            setCurrentView('signup');
            localStorage.setItem('currentView', 'signup');
          }}
        />
      )}

      {currentView === 'signup' && (
        <SignupPage
          onSignupComplete={handleSignupComplete}
          onBackToLogin={() => {
            setCurrentView('login');
            localStorage.setItem('currentView', 'login');
          }}
        />
      )}

      {currentView === 'mypage' && isLoggedIn && (
        <MyPage
          onLogout={handleLogout}
          initialUserData={userData}
          userState={userState}
          onUpdateUserState={handleUpdateUserState}
          onUpdateUserData={handleUpdateUserData}
          vcLoginInfo={vcLoginInfo}
          delegationLoginInfo={delegationLoginInfo}
          onNavigateToDelegation={() => {
            setCurrentView('delegation');
            localStorage.setItem('currentView', 'delegation');
          }}
        />
      )}

      {currentView === 'delegation' && isLoggedIn && !delegationLoginInfo && (
        <DelegationSettings
          userData={userData}
          userState={userState}
          onBack={() => {
            setCurrentView('mypage');
            localStorage.setItem('currentView', 'mypage');
          }}
        />
      )}
    </>
  );
}

export default App;
