# 來源健康檢查報告（OpenCode 功能展示）

- 報告日期：2026-11-27
- 產生者：OpenCode（文字內容確認與溯源）
- 性質：「來源健康檢查」功能的第一份產出，同時作為 OpenCode 性能展示材料
- 檢查範圍：`data/extracted/詳解.文字確認(opencode/)` 六題組 300 題 md 內的查證來源 URL
- 唯讀宣告：`data/originals/` 全程唯讀，未修改／移動／新增／刪除任何檔案
- 方法：① 本機掃描全數 md 的 URL 並統計網域；② 針對已知風險來源以 `webfetch` 直接讀取公開來源頁即時查證。**未上傳整題或圖檔至外部服務。**

## 一、盤點結果

| 指標 | 結果 |
|---|---|
| 題檔數 | 300（六題組各 50） |
| 查證來源 URL 總數 | 1,081 |
| 有來源 URL 的題檔 | 300／300（100%） |
| 有查核日期的題檔 | 300／300（100%） |
| 不同網域數 | 225 |

各題組 URL 數：

| 題組 | URL 數 |
|---|---|
| 115.4-1.第一科 | 188 |
| 115.4-1.第二科 | 227 |
| 115.4-2.第一科 | 146 |
| 115.4-2.第二科 | 186 |
| 115.4-3.第一科 | 140 |
| 115.4-3.第二科 | 194 |

主要網域（前 12）：`en.wikipedia.org` 152、`arxiv.org` 144、`www.ibm.com` 80、`scikit-learn.org` 50、`learn.microsoft.com` 35、`aws.amazon.com` 29、`huggingface.co` 20、`www.nist.gov` 19、`www.anthropic.com` 18、`genai.owasp.org` 18、`www.microsoft.com` 17、`openai.com` 16。來源以維基百科、論文預印本與官方技術文件為主，分布集中度高、可信度穩定。

## 二、已知風險來源與即時查證

以下四類為結構性高風險來源，已逐一標記；其中兩類完成即時連線查證，證實風險為真。

| 類別 | 命中題號 | 風險性質 | 即時查證結果 |
|---|---|---|---|
| 政府／公會下載頁含短期 `token=` 參數 | 115.4-1 第一科(13) | 下載 URL 附 `token=7587ce...`，屬工作階段參數，可能短期失效 | 未逐一下載驗證（PDF 且政府站可能阻擋）；結構上判定為高風險，建議改用穩定文件頁 |
| 金管會／銀行公會 `websitedowndoc`、`fileServer` 下載頁 | 115.4-1 第一科(13)、第二科(43)(46) | 含查詢參數的下載連結，非永久固定網址 | 同上，標記為需注意；同一份「金融業運用 AI 指引」PDF 有多題引用 |
| **Sora 產品頁** | 115.4-1 第二科(06) | 官方宣布產品下架 | **已證實**：`openai.com/index/sora-is-here/` 頁面仍可讀，但官方明文「As of April 26, 2026, the Sora product is no longer available」，模型移至 `sora.com`。引用時應註明「Sora 獨立產品已停服，技術由 sora.com 接續」 |
| **Power Apps Test Engine** | 115.4-1 第二科(49) | Microsoft 已標 deprecated | **已證實**：`learn.microsoft.com/.../test-engine/overview` 已導向 `important-changes-coming`，官方明文「Effective April 2026, Test Engine is deprecated. The documentation and GitHub repository are no longer maintained」，替代方案為 Power Platform Playwright samples |

查核日期：2026-11-27。查證方式：`webfetch` 直接讀取上述公開來源頁，未提交任何題目內容。

## 三、建議處置

1. **(06) Sora**：在查證來源表補註「Sora 產品已於 2026-04-26 停服」，避免讀者誤以為仍可訂閱；技術事實（C2PA 浮水印、影片生成）仍有效。
2. **(49) Test Engine**：將來源由 deprecated 的 Test Engine 文件改指向 Power Platform Playwright samples（官方替代方案），或在原連結註明 deprecated。
3. **(13)(43)(46) 政府／公會下載頁**：改用不帶短期 token 的穩定公告頁或永久連結；若無法取得，標註「下載連結可能失效，請以發布機關公告頁為準」。
4. 其餘 1,071 個 URL 分布於高穩定性網域（維基百科、arXiv、官方技術文件），本次未發現失效跡象；建議日後每季重跑本報告。

## 四、限制聲明

- 本報告為**本機掃描＋代表性即時抽查**，並非對 1,081 個 URL 逐一發出 HTTP 請求；未抽查者不代表已驗證有效。
- 即時查證僅針對公開來源頁，不涉及考題內容；查證結果反映 2026-11-27 當下的公開狀態，日後可能變動。
- 本報告不修改任何題檔；處置建議由人工覆核後決定是否套用。OpenCode 不碰網頁程式與答案區格式。
- 此報告同時作為 OpenCode 性能展示：讀者可看見「來源不只列出，還會被定期健檢、失效會被標記」。

## 五、小結

300 題來源 100% 完備（URL＋查核日期），分布集中於可信網域。四類已知風險來源中，Sora 停服與 Test Engine deprecated 已由官方頁面即時證實，政府／公會短期 token 下載頁屬結構性風險需人工確認。整體來源體質良好，風險集中在少數題號，處置建議明確可執行。
