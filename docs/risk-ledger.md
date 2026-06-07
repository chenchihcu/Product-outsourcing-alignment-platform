# Risk Ledger

此文件記錄新機種委外加工對齊系統專案在開發與使用過程中的潛在風險、防護措施以及後續計畫。

| Scope | Risk | Guardrail | Next action (Owner=self) | Revalidation gate | Rollback | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Excel 格式解析** | 若發包方擅自更改 Excel 欄位位置，導致前端讀取座標偏移或解析出錯。 | 在 `excelParser.js` 與 `excelExporter.js` 中加入儲存格內容校驗。若預期的標題文字（例如「委外加工廠」）與實際單元格內容不符，則拋出警示並拒絕解析。 | 加強邊界檢查邏輯，使解析工具能動態尋找標題關鍵字，而非僅依賴寫死的座標（如 A5, B2）。 | 每次用戶上傳 Excel 檔案時進行校驗。 | 提示用戶下載原始範本重填，或回滾至前一版穩定的 Excel 格式。 | **Active** |
| **Excel 樣式遺失** | 純前端 SheetJS 庫在寫出檔案時可能因版本限制或寫法問題導致原始 Excel 的合併儲存格或背景色遺失。 | 我們採用「複製原始 workbook 對象並局部修改儲存格值」的策略，避開重新建構 Sheet 的步驟。 | 在匯出前確認 Sheets 的 `!merges` 等屬性是否有被正確保留。 | 在每次匯出成功後，於本機以 Excel 實際開啟驗證外觀。 | 若外觀損毀，則提示用戶提供未寫入前之備份檔重新填入。 | **Resolved** |
| **本地暫存遺失** | 由於是 Serverless 前端，若瀏覽器重整，正在填寫的資料可能會消失。 | 可以在 App.jsx 中加入 `localStorage` 快取機制，即時備份當前輸入狀態。 | 在 App.jsx 的 `useEffect` 中，當 `data` 變更時，自動將資料字串化寫入 `localStorage`，重新載入時提示復原。 | 下一次系統重構或版本迭代時整合。 | 手動清除 `localStorage` 快取。 | **Pending** |
