// Не полное описание типов, а только те, которые используются в проекте

export interface RichText {
  text: {
    content: string // max size: 2000 characters
    link?: {
      url: string // max size: 2000 characters
    }
  }
  annotations: Annotations
}

export interface Annotations {
  [key: string]: boolean | undefined
  bold?: boolean
  italic?: boolean
  strikethrough?: boolean
  underline?: boolean
  code?: boolean
}

export interface TextBlock {
  object: 'block'
  paragraph: {
    rich_text: RichText[]
  }
}
