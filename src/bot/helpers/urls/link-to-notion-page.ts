export function buildLinkToNotionPage(pageId: string) {
  return `https://www.notion.so/${pageId.replace(/-/g, '')}`
}
