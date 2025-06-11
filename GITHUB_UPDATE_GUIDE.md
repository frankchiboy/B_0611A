# GitHub 更新指南

由於 WebContainer 環境的限制，無法直接使用 Git 命令進行版本控制操作。以下是幾種更新 GitHub 的方法：

## 方法一：手動下載並推送（推薦）

1. **下載專案檔案**
   - 在 Bolt.new 右上角點擊「下載」按鈕
   - 將會下載包含所有檔案的 ZIP 壓縮檔

2. **本地 Git 操作**
   ```bash
   # 解壓縮下載的檔案到本地專案目錄
   cd your-local-project-directory
   
   # 添加變更
   git add .
   
   # 提交變更
   git commit -m "新增 WorkflowConverter 功能 - 專案排程工具
   
   - 新增 WorkflowConverter 頁面，支援任務排程轉換
   - 集成到導航系統中
   - 支援 Finish-to-Start 依賴關係計算
   - 可匯出為 Bolt Workflow JSON 格式
   - 修復循環依賴檢測問題"
   
   # 推送到 GitHub
   git push origin main
   ```

## 方法二：使用 GitHub Web 介面

1. 在 GitHub 倉庫中點擊「Upload files」
2. 拖拽或選擇修改過的檔案
3. 撰寫提交訊息
4. 點擊「Commit changes」

## 方法三：使用 GitHub CLI（如果已安裝）

```bash
gh repo sync owner/repository-name
```

## 本次更新的主要變更

### 新增檔案
- `src/pages/WorkflowConverter.tsx` - 專案排程轉換工具

### 修改檔案
- `src/App.tsx` - 新增 WorkflowConverter 路由
- `src/components/navigation/Header.tsx` - 新增頁面標題
- `src/components/navigation/Sidebar.tsx` - 新增導航項目
- `src/context/ProjectContext.tsx` - 修復函數依賴問題

### 功能特色
✅ 視覺化任務排程管理  
✅ 自動計算 Finish-to-Start 依賴關係  
✅ 循環依賴檢測與處理  
✅ 實時時程預覽  
✅ Bolt Workflow JSON 格式匯出  
✅ 響應式設計，支援手機和桌面  

## 建議的提交訊息

```
feat: 新增專案排程工具 (WorkflowConverter)

- 實現任務依賴關係管理
- 支援 Finish-to-Start 排程計算  
- 自動檢測並處理循環依賴
- 可匯出為 Bolt.new Workflow JSON 格式
- 集成至主導航系統
- 修復 ProjectContext 中的函數依賴問題

功能涵蓋：
- 任務新增、刪除、依賴設定
- 實時時程計算與預覽
- JSON 格式匯出功能
- 專業級 UI/UX 設計
```

## 注意事項

⚠️ **確保在推送前**：
- 檢查所有檔案都已正確更新
- 測試新功能是否正常運作
- 確認沒有語法錯誤
- 更新 README.md（如需要）

📋 **推薦工作流程**：
1. 本地測試所有功能
2. 撰寫詳細的提交訊息  
3. 推送到 feature branch
4. 創建 Pull Request
5. Code Review 後合併到 main branch