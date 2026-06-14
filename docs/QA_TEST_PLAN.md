# QA 測試計劃與壓力測試導入

更新日期: 2026-06-13

## 1. 目的與邊界

本計劃用於新機種委外加工對齊系統的日常 QA gate、Release 前檢查與本地壓力測試。目標是讓 Excel 匯入/匯出、表單填寫、簽核、localStorage 復原與雲端同步風險可以被重複檢查，而不是只靠人工試用。

本導入版本只使用本地或測試資料:

- 可測: Excel 範本往返、localStorage 包裝、競爭條件模擬、建置、瀏覽器手動流程、Supabase 測試 workspace。
- 不可測: 對正式 Supabase production 資料做大量寫入、刪除或壓測。
- 不變更: 資料模型、Supabase schema/RLS、Netlify production deploy 流程、正式使用者資料。

若未來需要對正式雲端或正式站台做壓測，必須另外走 High-Risk Path，補上資料清理、回滾、權限、go/no-go 與風險 ledger。

## 2. QA Gate 指令

日常開發建議使用:

```bash
npm run qa:gate
```

可分層執行:

```bash
npm run build
npm run qa:storage
npm run qa:concurrency
npm run qa:stress
npm run qa:offline
```

指令目的:

| 指令 | 覆蓋範圍 | 通過標準 |
| :--- | :--- | :--- |
| `qa:storage` | localStorage JSON 讀寫、損毀復原、容量不足處理 | 0 failed |
| `qa:concurrency` | 連續點擊防護、快速分頁切換、巢狀資料更新 | 0 failed |
| `qa:stress` | Excel 解析/匯出往返、長字串、特殊字元、批次匯出、記憶體壓力 | 0 failed |
| `qa:offline` | 三個離線 QA 腳本依序執行 | 全部 0 failed |
| `qa:gate` | 生產建置 + 離線 QA | build 成功且全部 QA 0 failed |

目前基線:

- `qa:storage`: 12 passed, 0 failed
- `qa:concurrency`: 9 passed, 0 failed
- `qa:stress`: 30 passed, 0 failed
- Excel 200 次往返基準: 平均解析需小於 50ms, 平均匯出需小於 100ms

## 3. 測試範圍

### 3.1 靜態與建置

- `npm run build` 必須通過。
- 若修改 lint 覆蓋範圍內的檔案，至少執行 touched-file ESLint；repo-wide lint 若因既有債務失敗，需在交付中說明非本次導入造成。
- 不將測試輸出、暫存 log、截圖或壓測資料自動提交，除非它們是明確要求的驗證證據。

### 3.2 離線資料測試

- Excel 範本存在且可被 `xlsx` 讀取。
- `parseRequirementExcel` 可解析 `basicInfo`、`processControl`、`trialReport`。
- `exportRequirementExcel` 可產生非空 ArrayBuffer，且再解析後核心欄位保留。
- 長文字、特殊字元、多語系、全空資料、6 點測溫點、所有加工項目全勾選時不崩潰。
- `setDeep` 與 `updateFieldWithOwner` 不直接修改原物件，且可正確維護 `_owners`。

### 3.3 localStorage 與復原

- 有效 JSON 可讀回。
- 損毀 JSON 回傳 fallback 並移除損毀資料。
- `setJSON` 容量不足時回傳 `false`，不可拋出未處理例外。
- `removeKey` 可清除資料。
- 不同角色或 admin 測試 namespace 不得交叉污染正式資料。

### 3.4 競爭條件與壓力

- 連續匯出點擊只觸發一次匯出流程。
- 快速分頁切換不造成 state 損毀。
- 巢狀欄位快速更新以最後一次值為準。
- Excel 解析/匯出 200 次壓力測試需維持通過。
- 50 筆大型資料批次建立與匯出不可失敗。

### 3.5 手動瀏覽器流程

Release 前至少人工跑一次下列流程:

1. 登入 RD、ENG、QA、Admin 測試帳號或測試 session。
2. 開啟機種管理中心，確認預設範本可載入。
3. 建立新機種，確認重複名稱防呆。
4. 匯入 Excel，確認解析成功並進入 dashboard。
5. 填寫基本資料、製程前置、製程管制、試產報告、文件確認。
6. 切換分頁與重新整理頁面，確認資料還原。
7. RD -> ENG -> QA 簽核，確認簽章與日期保留。
8. QA 最終簽核後，確認可選「離開系統」或「回到機種管理中心」。
9. 匯出 Excel，重新匯入確認核心欄位保留。
10. 開啟列印報表，檢查 A4 分頁、長文字、測溫點與簽核欄未溢出。
11. 在桌面與窄版 viewport 檢查側欄、按鈕、badge、錯誤橫幅與主要/次要 action 色彩層級。

### 3.6 Supabase 測試工作區

雲端同步驗證只允許使用測試帳號或測試 workspace:

- Admin 測試資料使用 `admin_test` workspace。
- 正式資料只做讀取/展示驗證，不做大量寫入或刪除。
- 測試建立的機種名稱需包含 `QA_TEST_YYYYMMDD_` 前綴，方便人工清理。
- 測試後需刪除測試機種，或在交付中明確列出未清理項目。

驗證項目:

- 登入 session 還原。
- `pullProjects` 可拉取測試 workspace。
- 新增機種後可同步到測試 workspace。
- 另一個測試 session 變更同一機種時，前端顯示遠端更新提示，而不是靜默覆蓋。
- 離線或 Supabase 設定缺失時，系統退回 localStorage 並顯示可理解的錯誤橫幅。

## 4. Release 前判定

可交付:

- `npm run qa:gate` 通過。
- 手動瀏覽器流程無 blocking issue。
- 若有雲端相關修改，測試 workspace 驗證通過且測試資料已清理。
- 已記錄任何 `not verified` 項目的原因、剩餘風險與下一個驗證命令。

不可交付:

- `qa:stress` 有 failed。
- Excel 往返後核心欄位遺失。
- localStorage 損毀資料造成整頁 crash。
- 簽核後無法匯出或回到機種管理中心。
- 測試腳本會寫入正式 Supabase 資料。

`not verified` 記錄格式:

```text
Verification: not verified
Reason verification was not run:
Remaining risk:
Next verification command/check:
```

## 5. 後續擴充

- 加入 Playwright E2E 前，先固定測試帳號、測試 fixture 與不污染正式資料的清理規則。
- 若壓測要包含 Supabase 寫入，新增獨立的測試 project/workspace 與清理腳本，並禁止預設指令打到 production。
- 若列印版面常回歸，新增 browser screenshot 或 PDF 視覺比對 gate。
