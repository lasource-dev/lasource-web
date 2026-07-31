import type { ReactNode } from 'react'

type MarkdownContentProps = {
  skipLeadingTitle?: boolean
  source: string
}

function inline(source: string): ReactNode[] {
  const parts = source.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, index) => {
    const code = part.match(/^`([^`]+)`$/)
    if (code) return <code key={index}>{code[1]}</code>

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) return <a href={link[2]} key={index}>{link[1]}</a>

    return part
  })
}

export function MarkdownContent({ skipLeadingTitle = false, source }: MarkdownContentProps) {
  const sourceLines = source.split('\n')
  const firstContentLine = sourceLines.findIndex((line) => line.trim())
  const lines =
    skipLeadingTitle && firstContentLine >= 0 && /^#\s+/.test(sourceLines[firstContentLine])
      ? sourceLines.filter((_, index) => index !== firstContentLine)
      : sourceLines
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }

    if (line.startsWith('```')) {
      const language = line.slice(3).trim()
      const code: string[] = []
      index += 1
      while (index < lines.length && !lines[index].startsWith('```')) {
        code.push(lines[index])
        index += 1
      }
      index += 1
      blocks.push(
        <pre key={blocks.length}>
          <code className={language ? `language-${language}` : undefined}>{code.join('\n')}</code>
        </pre>,
      )
      continue
    }

    const heading = line.match(/^(#{2,6})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      const Heading = `h${level}` as keyof React.JSX.IntrinsicElements
      blocks.push(<Heading key={blocks.length}>{inline(heading[2])}</Heading>)
      index += 1
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, ''))
        index += 1
      }
      blocks.push(
        <ul key={blocks.length}>
          {items.map((item) => <li key={item}>{inline(item)}</li>)}
        </ul>,
      )
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ''))
        index += 1
      }
      blocks.push(
        <ol key={blocks.length}>
          {items.map((item) => <li key={item}>{inline(item)}</li>)}
        </ol>,
      )
      continue
    }

    const paragraph = [line]
    index += 1
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{2,6})\s+|^```|^[-*]\s+|^\d+\.\s+/.test(lines[index])
    ) {
      paragraph.push(lines[index])
      index += 1
    }
    blocks.push(<p key={blocks.length}>{inline(paragraph.join(' '))}</p>)
  }

  return <>{blocks}</>
}
