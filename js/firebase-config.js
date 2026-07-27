// LeanCloud 配置 - 请将下面的配置替换为你自己的 LeanCloud 应用配置
// 如何获取：访问 https://console.leancloud.cn/ → 创建应用 → 应用设置 → 获取 AppID 和 AppKey

const leancloudConfig = {
  appId: "YOUR_APP_ID",
  appKey: "YOUR_APP_KEY",
  serverURL: "https://YOUR_APP_ID.api.lncldglobal.com"
};

// 检查是否已配置 LeanCloud
let leancloudAvailable = false;

try {
  if (leancloudConfig.appId !== "YOUR_APP_ID" && typeof AV !== 'undefined') {
    AV.init(leancloudConfig);
    leancloudAvailable = true;
    console.log('LeanCloud 初始化成功');
  } else {
    console.log('LeanCloud 未配置，将使用单机模式');
  }
} catch (e) {
  console.log('LeanCloud 初始化失败:', e);
  leancloudAvailable = false;
}
