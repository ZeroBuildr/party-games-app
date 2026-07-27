// Firebase 配置 - 请将下面的配置替换为你自己的 Firebase 项目配置
// 如何获取：访问 https://console.firebase.google.com/ → 创建项目 → 项目设置 → 添加Web应用 → 复制配置

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 检查是否已配置Firebase
let firebaseAvailable = false;

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY" && typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    firebaseAvailable = true;
    console.log('Firebase 初始化成功');
  } else {
    console.log('Firebase 未配置，将使用单机模式');
  }
} catch (e) {
  console.log('Firebase 初始化失败:', e);
  firebaseAvailable = false;
}
