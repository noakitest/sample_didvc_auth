import { useState } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import MyPage from './components/MyPage';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    // 初回ロード時にlocalStorageから復元
    return localStorage.getItem('currentView') || 'login';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // 初回ロード時にlocalStorageから復元
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [userState, setUserState] = useState(() => {
    // 初回ロード時にlocalStorageから復元
    const savedState = localStorage.getItem('userState');
    return savedState ? JSON.parse(savedState) : null;
  });
  const [vcLoginInfo, setVcLoginInfo] = useState(null); // VCログイン時の情報

  const handleLogin = (vcInfo = null) => {
    setIsLoggedIn(true);
    setCurrentView('mypage');
    setVcLoginInfo(vcInfo); // VCでログインした場合はVC情報を保持
    // ログイン状態を保存
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentView', 'mypage');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('login');
    setVcLoginInfo(null);
    // ログイン状態をクリア
    localStorage.removeItem('isLoggedIn');
    localStorage.setItem('currentView', 'login');
  };

  const handleUpdateUserState = (newState) => {
    setUserState(newState);
    localStorage.setItem('userState', JSON.stringify(newState));
  };

  const handleSignupComplete = (signupData) => {
    // サインアップ完了後、会員IDを生成（モック）
    const memberId = 'M' + Math.floor(Math.random() * 1000000000);

    // VCから登録した場合は本人確認済みとして状態を保存
    if (signupData.isVerified && signupData.vcData) {
      const newUserState = {
        isVerified: true,
        linkedDID: signupData.vcData.did
      };
      setUserState(newUserState);
      localStorage.setItem('userState', JSON.stringify(newUserState));
    }

    // 登録完了後、自動ログイン
    setIsLoggedIn(true);
    setCurrentView('mypage');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentView', 'mypage');
  };

  return (
    <>
      {currentView === 'login' && (
        <LoginPage 
          onLogin={handleLogin}
          userState={userState}
          onNavigateToSignup={() => setCurrentView('signup')}
        />
      )}
      
      {currentView === 'signup' && (
        <SignupPage
          onSignupComplete={handleSignupComplete}
          onBackToLogin={() => setCurrentView('login')}
        />
      )}
      
      {currentView === 'mypage' && isLoggedIn && (
        <MyPage 
          onLogout={handleLogout}
          userState={userState}
          onUpdateUserState={handleUpdateUserState}
          vcLoginInfo={vcLoginInfo}
        />
      )}
    </>
  );
}

export default App;
