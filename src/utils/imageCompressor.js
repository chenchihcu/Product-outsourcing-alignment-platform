/**
 * 電子簽章圖片壓縮與大小調整工具
 * 用於限制圖片最大尺寸 (例如 200x80)，以將 Base64 長度控制在 5KB 以下，
 * 確保其能被 LocalStorage 和 Excel 隱藏欄位 (32,767字元限制) 安全地儲存。
 */
export function compressImage(base64Str, maxWidth = 200, maxHeight = 80) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // 計算等比例縮放
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // 輸出為 PNG 格式以保留透明度
      const compressedBase64 = canvas.toDataURL('image/png');
      resolve(compressedBase64);
    };
    img.onerror = () => {
      // 發生錯誤時返回原始 Base64
      resolve(base64Str);
    };
  });
}
