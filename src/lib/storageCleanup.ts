export function cleanupLocalStorage() {
    try {
      const now = Date.now();
      const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 1日
      
      // 前回のクリーンアップ時刻を取得
      const lastCleanup = localStorage.getItem('last_storage_cleanup');
      const lastCleanupTime = lastCleanup ? parseInt(lastCleanup) : 0;
      
      // 前回のクリーンアップから一定期間経過している場合のみ実行
      if (now - lastCleanupTime > CLEANUP_INTERVAL) {
        console.log('localStorageクリーンアップを実行します');
        localStorage.removeItem('player-storage');
        localStorage.removeItem('room-storage');
        localStorage.setItem('last_storage_cleanup', now.toString());
      }
    } catch (error) {
      console.error('クリーンアップエラー:', error);
    }
  }