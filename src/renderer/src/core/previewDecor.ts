/**
 * Tasarımcı modu süslemeleri — dönüşüm çıktısına eklenen CSS.
 * Not: iframe ana uygulamanın tema değişkenlerini bilmez; sabit renk kullanılır.
 */
export function decorateForDesigner(html: string): string {
  const css = `
<style id="uni-designer-css">
  [data-xslt-id]:hover { outline: 1px dashed #14b8a6; cursor: pointer; }
  .uni-selected { outline: 2px solid #14b8a6 !important; outline-offset: 1px;
    box-shadow: 0 0 0 3px rgba(20,184,166,.30) !important; }
  .uni-editing { outline: 2px dashed #f59e0b !important; cursor: text !important; }
  @media print {
    .uni-selected, .uni-editing { outline: none !important; box-shadow: none !important; }
  }
</style>`
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${css}\n</head>`)
  if (/<body[^>]*>/i.test(html)) {
    return html.replace(/<body([^>]*)>/i, `<head>${css}</head><body$1>`)
  }
  return `${css}\n${html}`
}
