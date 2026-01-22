import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import MyPage from './components/MyPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userState, setUserState] = useState(null);

  // 初回ロード時にlocalStorageから状態を復元
  useEffect(() => {
    const savedState = localStorage.getItem('userState');
    if (savedState) {
      setUserState(JSON.parse(savedState));
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleUpdateUserState = (newState) => {
    setUserState(newState);
    localStorage.setItem('userState', JSON.stringify(newState));
  };

  return (
    <>
      {isLoggedIn ? (
        <MyPage 
          onLogout={handleLogout}
          userState={userState}
          onUpdateUserState={handleUpdateUserState}
        />
      ) : (
        <LoginPage 
          onLogin={handleLogin}
          userState={userState}
        />
      )}
    </>
  );
}

export default App;
