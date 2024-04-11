import {MessageEntity} from 'grammy/types'
import {Annotations, TextBlock, RichText} from './notion.types'
import {BlockObjectRequest} from '@notionhq/client/build/src/api-endpoints'
import {File} from '../files/entities/file.entity'

const MAX_TITLE_LENGTH = 120 // Custom limitation
const MAX_TEXT_CONTENT_LENGTH = 2000 // Notion API limitation
const MAX_ARRAY_LENGTH = 100 // Notion API limitation

export function truncateTextForTitle(text: string): string {
  const indexOfNewLine = text.indexOf('\n')
  if (indexOfNewLine !== -1) {
    if (indexOfNewLine > MAX_TITLE_LENGTH) {
      return text.slice(0, MAX_TITLE_LENGTH).trim() + '...'
    }
    return text.slice(0, indexOfNewLine).trim()
  }
  if (text.length <= MAX_TITLE_LENGTH) return text.slice(0, MAX_TITLE_LENGTH).trim()
  return text.slice(0, MAX_TITLE_LENGTH).trim() + '...'
}

export function convertMessageToNotionBlocks(
  text: string,
  entities?: MessageEntity[],
): BlockObjectRequest[] {
  if (!entities || !entities.length) {
    const block: TextBlock = {
      object: 'block',
      paragraph: {rich_text: splitLargeRickTexts([{text: {content: text}, annotations: {}}])},
    }
    return splitLargeBlock(block)
  }
  const richTexts = transformTelegramMessageToNotionRichText(text, entities)
  const block: TextBlock = {object: 'block', paragraph: {rich_text: splitLargeRickTexts(richTexts)}}
  return splitLargeBlock(block)
}

export function convertFileToNotionBlock(file: File): BlockObjectRequest {
  if (file.type === 'image') {
    return {
      object: 'block',
      image: {type: 'external', external: {url: file.url}},
    }
  } else if (file.type === 'video') {
    return {
      object: 'block',
      video: {type: 'external', external: {url: file.url}},
    }
  } else if (file.type === 'audio') {
    return {
      object: 'block',
      file: {type: 'external', external: {url: file.url}},
    }
  } else {
    return {
      object: 'block',
      file: {type: 'external', external: {url: file.url}},
    }
  }
}

export function hasInnerContent(messageText: string, entities?: MessageEntity[]): boolean {
  return messageText.includes('\n') || messageText.length > MAX_TITLE_LENGTH || !!entities?.length
}

function splitLargeRickTexts(richTexts: RichText[]): RichText[] {
  const result: RichText[] = []
  for (const richText of richTexts) {
    if (richText.text.link?.url && richText.text.link.url.length > MAX_TEXT_CONTENT_LENGTH) {
      richText.text.link.url = richText.text.link.url.slice(0, MAX_TEXT_CONTENT_LENGTH)
    }

    if (richText.text.content.length > MAX_TEXT_CONTENT_LENGTH) {
      const text = richText.text.content
      for (let i = 0; i < text.length; i += MAX_TEXT_CONTENT_LENGTH) {
        result.push({
          ...richText,
          text: {content: text.slice(i, i + MAX_TEXT_CONTENT_LENGTH)},
        })
      }
      continue
    }

    result.push(richText)
  }
  return result
}

function splitLargeBlock(block: TextBlock): TextBlock[] {
  if (block.paragraph.rich_text.length > MAX_ARRAY_LENGTH) {
    const result: TextBlock[] = []
    const parts = block.paragraph.rich_text.reduce<RichText[][]>((acc, current) => {
      const last = acc[acc.length - 1]
      if (last && last.length < MAX_ARRAY_LENGTH) last.push(current)
      else acc.push([current])
      return acc
    }, [])
    parts.forEach(part => result.push({object: 'block', paragraph: {rich_text: part}}))
    return result
  }
  return [block]
}

export function transformTelegramMessageToNotionRichText(
  text: string,
  entities: MessageEntity[],
): RichText[] {
  const annotatedChars: RichText[] = text.split('').map(char => ({
    text: {content: char},
    annotations: {},
  }))

  entities.forEach(entity => {
    for (let i = entity.offset; i < entity.offset + entity.length; i++) {
      const annotatedChar = annotatedChars[i]
      if (!annotatedChar) throw new Error('Entity is out of bounds')
      if (entity.type === 'bold') annotatedChar.annotations.bold = true
      else if (entity.type === 'italic') annotatedChar.annotations.italic = true
      else if (entity.type === 'strikethrough') annotatedChar.annotations.strikethrough = true
      else if (entity.type === 'underline') annotatedChar.annotations.underline = true
      else if (
        entity.type === 'code' ||
        entity.type === 'blockquote' ||
        entity.type === 'bot_command' ||
        entity.type === 'spoiler' ||
        entity.type === 'pre' ||
        entity.type === 'hashtag' ||
        entity.type === 'cashtag'
      ) {
        annotatedChar.annotations = {code: true}
      } else if (entity.type === 'url') {
        const url = text.slice(entity.offset, entity.offset + entity.length)
        annotatedChar.text.link = {url}
      } else if (entity.type === 'text_link') {
        const url = entity.url
        annotatedChar.text.link = {url}
      } else if (entity.type === 'mention') {
        const mention = text.slice(entity.offset, entity.offset + entity.length)
        const url = `https://t.me/${mention.slice(1)}`
        annotatedChar.text.link = {url}
      } else if (entity.type === 'text_mention') {
        if (entity.user.username) {
          annotatedChar.text.link = {url: `https://t.me/${entity.user.username}`}
        }
      }
    }
  })

  return annotatedChars.reduce<RichText[]>((acc, current) => {
    const last = acc[acc.length - 1]
    if (last && objectsAreSimilar(last, current)) last.text.content += current.text.content
    else acc.push(current)
    return acc
  }, [])
}

function objectsAreSimilar(a: RichText, b: RichText): boolean {
  if (!annotationsAreEqual(a.annotations, b.annotations)) return false

  const link1 = a.text.link?.url
  const link2 = b.text.link?.url
  return link1 === link2
}

function annotationsAreEqual(a: Annotations, b: Annotations): boolean {
  const keys1 = Object.keys(a)
  const keys2 = Object.keys(b)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (a[key] !== b[key]) return false
  }
  return true
}

export function buildLinkToNotionPage(pageId: string): string {
  return `https://www.notion.so/${pageId.replace(/-/g, '')}`
}
