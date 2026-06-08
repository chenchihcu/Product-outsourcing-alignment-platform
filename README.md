# 新機種委外加工對齊系統

雙向資訊同步與製程防呆管制平台

## 專案簡介

本系統用於管理新機種（新產品）委外加工製造需求一覽表，提供雙向資訊同步與製程防呆管制功能。支援多角色權限管理、Excel 匯入/匯出（保留原始格式）、簽署流程、無伺服器瀏覽器端儲存，以及跨裝置響應式排版。

## 核心功能

- **多角色驗證系統**：支援 RD（研發）、ENG（工程）、QA（品保）、Admin（系統管理員）四種角色，各自擁有不同的編輯權限與簽署責任
- **Excel 匯入/匯出**：基於 SheetJS 函式庫，完整保留原始 Excel 格式（合併儲存格、樣式、背景色等）
- **簽署流程**：RD → PE → QA 三階簽核，支援圖片簽章上傳與嵌入式簽名欄位
- **無伺服器儲存**：所有資料儲存於瀏覽器 localStorage，無需後端伺服器
- **製程防呆管制**：欄位編輯鎖定（`_owners` 機制），防止不同角色互相覆蓋
- **製程項目管理**：SMT 鋼板/載具/治具、DIP、試產報告、6 點測溫記錄、PCBA/FPCA 包材管理
- **列印報表**：支援 A4 格式 PDF 列印，含分頁控制
- **跨裝置響應式**：支援桌上型電腦與行動裝置

## 技術棧

| 類別 | 技術 |
|:---|:---|
| 前端框架 | React 19 |
| 建置工具 | Vite 8 |
| Excel 處理 | SheetJS (xlsx) |
| 程式語言 | JavaScript (JSX) |
| 樣式 | CSS（自訂變數 + 響應式） |
| 程式碼檢查 | ESLint 10 |
| CI/CD | GitHub Actions → GitHub Pages |

## 目錄結構

```
├── public/                 靜態資源（Excel 範本、favicon）
├── src/
│   ├── assets/             靜態資產
│   ├── components/         React 元件
│   │   ├── BasicInfo.jsx        基本資料
│   │   ├── FormSections.jsx     表單區段
│   │   ├── LoginModal.jsx       登入視窗
│   │   ├── PrintReport.jsx      列印報表
│   │   ├── Settings.jsx         設定頁面
│   │   ├── SignOff.jsx          簽核區塊
│   │   ├── Uploader.jsx         Excel 上傳
│   │   ├── ProjectList.jsx      專案清單
│   │   └── ...                  對應 CSS 樣式表
│   ├── utils/
│   │   ├── excelParser.js       Excel 解析
│   │   └── excelExporter.js     Excel 匯出
│   ├── App.jsx                  主應用元件
│   ├── main.jsx                 進入點
│   └── index.css                全域樣式
├── docs/                    風險記錄與參考檔案
├── scripts/                 測試腳本
├── .github/workflows/       CI/CD 設定
├── index.html
├── package.json
└── vite.config.js
```

## 快速開始

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽建置結果
npm run preview

# 執行程式碼檢查
npm run lint
```

## 部署

本專案透過 GitHub Actions 自動部署到 GitHub Pages：

1. 推送至 `main` 分支即自動觸發部署
2. 部署工作流程定義於 `.github/workflows/deploy.yml`
3. 使用 `peaceiris/actions-gh-pages` 動作將 `./dist` 目錄部署至 GitHub Pages
4. 儲存庫：<https://github.com/chenchihcu/Product-outsourcing-alignment-platform>

## 角色權限說明

| 角色 | 帳號 | 單位 | 權限說明 |
|:---|:---|:---|:---|
| RD | rd | 研發單位 | 表單填寫與編輯 |
| ENG | eng | 工程單位 | 表單編輯與簽核 |
| QA | qa | 審核單位（品保處） | 最終審核與簽核 |
| Admin | admin | 管理處 | 系統設定與帳號管理 |

## 授權

本專案為私有專案，僅供授權人員使用。
