if (typeof React === 'undefined') {
  console.error('React yüklenmedi! Lütfen HTML dosyasındaki script sırasını kontrol edin.');
  throw new Error('React yüklenmedi!');
}

const { useState, useEffect } = React;

// Çeviriler
const translations = {
  tr: {
    welcome: "Kyrosil Points'e Hoş Geldiniz",
    login: "Giriş Yap",
    register: "Kayıt Ol",
    username: "Kullanıcı Adı",
    password: "Şifre",
    logout: "Çıkış",
    points: "Puan",
    games: "Oyunlar",
    market: "Market",
    spinWheel: "Çarkı Çevir",
    dailyReward: "Günlük Ödül: {points} Kyrosil Puan",
    giftCode: "Hediye Kodu Gir",
    submitCode: "Kodu Gönder",
    rps: "Taş-Kağıt-Makas",
    dice: "Zar Atma",
    guess: "Sayı Tahmini",
    play: "Oyna",
    betAmount: "Bahis Miktarı",
    guessNumber: "1-10 arası bir sayı gir",
    errorRequired: "Kullanıcı adı ve şifre gerekli!",
    errorPoints: "Yetersiz Kyrosil Puan!",
    errorGuess: "1-10 arası bir sayı gir!",
    errorCode: "Geçersiz veya kullanılmış kod!",
    successCode: "{points} Kyrosil Puan kazandın!",
  },
  en: {
    welcome: "Welcome to Kyrosil Points",
    login: "Login",
    register: "Register",
    username: "Username",
    password: "Password",
    logout: "Logout",
    points: "Points",
    games: "Games",
    market: "Market",
    spinWheel: "Spin Wheel",
    dailyReward: "Daily Reward: {points} Kyrosil Points",
    giftCode: "Enter Gift Code",
    submitCode: "Submit Code",
    rps: "Rock-Paper-Scissors",
    dice: "Roll Dice",
    guess: "Number Guess",
    play: "Play",
    betAmount: "Bet Amount",
    guessNumber: "Enter a number between 1-10",
    errorRequired: "Username and password required!",
    errorPoints: "Insufficient Kyrosil Points!",
    errorGuess: "Enter a number between 1-10!",
    errorCode: "Invalid or used code!",
    successCode: "You earned {points} Kyrosil Points!",
  }
};

// Context ve Provider
const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(100); // Varsayılan 100 puan
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [streak, setStreak] = useState(0);
  const [lastLogin, setLastLogin] = useState(null);
  const [lang, setLang] = useState(navigator.language.startsWith('tr') ? 'tr' : 'en');
  const [error, setError] = useState('');
  const [gameResult, setGameResult] = useState('');
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState('');
  const [marketItems] = useState([
    { id: 1, name: lang === 'tr' ? 'Ücretsiz Kahve' : 'Free Coffee', price: 50 },
    { id: 2, name: lang === 'tr' ? 'Marka Tişört' : 'Brand T-Shirt', price: 150 },
    { id: 3, name: lang === 'tr' ? '%20 İndirim' : '20% Discount', price: 100 },
  ]);

  useEffect(() => {
    if (user) {
      checkDailyReward();
    }
  }, [user]);

  const checkDailyReward = () => {
    const today = new Date().toDateString();
    if (!lastLogin || new Date(lastLogin).toDateString() !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastLogin && new Date(lastLogin).toDateString() !== yesterday.toDateString()) {
        setStreak(0);
      }
      const newStreak = streak + 1;
      const reward = newStreak * 10;
      setStreak(newStreak);
      setPoints(points + reward);
      setLastLogin(today);
      alert(translations[lang].dailyReward.replace('{points}', reward));
    }
  };

  const redeemCode = (code) => {
    const validCodes = { KYROSIL50: 50, KYROSIL100: 100 };
    if (validCodes[code]) {
      setPoints(points + validCodes[code]);
      setError(translations[lang].successCode.replace('{points}', validCodes[code]));
    } else {
      setError(translations[lang].errorCode);
    }
  };

  const saveUserData = () => {
    console.log('Veri kaydedildi:', { user, points, purchasedItems, streak, lastLogin });
  };

  return (
    <AppContext.Provider value={{
      user, setUser, points, setPoints, purchasedItems, setPurchasedItems,
      streak, setStreak, lastLogin, setLastLogin, lang, setLang,
      error, setError, gameResult, setGameResult, wheelSpinning, setWheelSpinning,
      wheelResult, setWheelResult, marketItems, saveUserData, redeemCode
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Global export
window.AppProvider = AppProvider;
window.AppContext = AppContext;

// Export kontrolü
if (!window.AppProvider || !window.AppContext) {
  console.error('AppProvider veya AppContext export edilemedi!');
}
