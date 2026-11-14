/*
 * 柏捷工地 網頁推播（使用者 2026-11-14「如果是蘋果的手機跟平板呢」→ A）：
 * iPhone／iPad 從主畫面圖示打開的網頁、電腦的瀏覽器，按「🔔 開啟通知」以後，收件服務有新消息就從這裡跳通知。
 * 用免費的 Firebase 雲端訊息（專案 bojie-push，沒有帳單帳戶）。通知內容由收件服務寫好（照角色），這裡只負責顯示、點了打開網頁。
 * 這個檔不攔任何網頁請求（沒有 fetch 事件），不會影響網頁更新。
 */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCe1TsA_qTuLobsLr4XMZ0hM5rLi8_pTos',
  authDomain: 'bojie-push.firebaseapp.com',
  projectId: 'bojie-push',
  storageBucket: 'bojie-push.firebasestorage.app',
  messagingSenderId: '977736584791',
  appId: '1:977736584791:web:1c0c7086beeb3ca0d65d12'
});
// 有 notification 的訊息 Firebase 會自己顯示（網頁在背景、關著的時候）
firebase.messaging();

// 點通知：已經開著就切過去，沒開就打開柏捷工地
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = new URL('./', self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (ws) {
    for (var i = 0; i < ws.length; i++) { if (ws[i].url.indexOf(url) === 0 && 'focus' in ws[i]) return ws[i].focus(); }
    return clients.openWindow ? clients.openWindow(url) : null;
  }));
});
