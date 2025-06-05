const { useState, useEffect } = React;

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

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [streak, setStreak] = useState(0);
  const [lastLogin, setLastLogin] = useState(null);
  const [lang, setLang] = useState(navigator.language.startsWith('tr') ? 'tr' : 'en');
  const [error, setError] = useState('');
  const [gameResult, setGameResult] = useState('');
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState('');
  const [marketItems] = useState([
    { id: 1, name: lang === 'tr' ? 'Ücretsiz Kahve (Sponsor: Kahve Dükkanı)' : 'Free Coffee (Sponsor: Coffee Shop)', price: 50 },
    { id: 2, name: lang === 'tr' ? 'Marka Tişört (Sponsor: Moda Mağazası)' : 'Brand T-Shirt (Sponsor: Fashion Store)', price: 150 },
    { id: 3, name: lang === 'tr' ? '%20 İndirim Kodu (Sponsor: Online Mağaza)' : '20% Discount Code (Sponsor: Online Store)', price: 100 },
  ]);

  const spreadsheetId = 'YOUR_SPREADSHEET_ID';
  const apiKey = 'YOUR_API_KEY';

  useEffect(() => {
    if (user) {
      fetchUserData(user.username);
      checkDailyReward();
    }
  }, [user]);

  async function fetchUserData(username) {
    setError('');
    const range = 'Sheet1!A:F';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('API isteği başarısız: ' + response.status);
      const data = await response.json();
      const userData = data.values?.find(row => row[0] === username);
      if (userData) {
        setPoints(parseInt(userData[1]) || 0);
        setPurchasedItems(userData[2] ? JSON.parse(userData[2]) : []);
        setStreak(parseInt(userData[3]) || 0);
        setLastLogin(userData[4] || null);
      } else {
        setPoints(0);
        setPurchasedItems([]);
        setStreak(0);
        setLastLogin(null);
      }
    } catch (error) {
      setError(translations[lang].errorRequired);
      console.error('Veri çekme hatası:', error);
    }
  }

  async function saveUserData(username, points, purchasedItems, streak, lastLogin) {
    setError('');
    const range = 'Sheet1!A:F';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&key=${apiKey}`;
    const data = {
      values: [[username, points, JSON.stringify(purchasedItems), streak, lastLogin, new Date().toISOString()]],
    };
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Veri kaydedilemedi: ' + response.status);
    } catch (error) {
      setError(translations[lang].errorRequired);
      console.error('Veri kaydetme hatası:', error);
    }
  }

  async function checkDailyReward() {
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
      await saveUserData(user.username, points + reward, purchasedItems, newStreak, today);
      alert(translations[lang].dailyReward.replace('{points}', reward));
    }
  }

  async function redeemCode(code) {
    setError('');
    const range = 'Codes!A:C';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Kod kontrolü başarısız: ' + response.status);
      const data = await response.json();
      const codeData = data.values?.find(row => row[0] === code && row[2] === 'valid');
      if (codeData) {
        const pointsToAdd = parseInt(codeData[1]);
        setPoints(points + pointsToAdd);
        await saveUserData(user.username, points + pointsToAdd, purchasedItems, streak, lastLogin);
        await invalidateCode(code);
        setError(translations[lang].successCode.replace('{points}', pointsToAdd));
      } else {
        setError(translations[lang].errorCode);
      }
    } catch (error) {
      setError(translations[lang].errorCode);
      console.error('Kod kontrol hatası:', error);
    }
  }

  async function invalidateCode(code) {
    const range = 'Codes!A:C';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Kod geçersizleştirme başarısız: ' + response.status);
      const data = await response.json();
      const index = data.values.findIndex(row => row[0] === code);
      if (index !== -1) {
        const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Codes!C${index + 1}?valueInputOption=RAW&key=${apiKey}`;
        await fetch(updateUrl, {
          method: 'PUT',
          body: JSON.stringify({ values: [['invalid']] }),
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.error('Kod geçersizleştirme hatası:', error);
    }
  }

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
