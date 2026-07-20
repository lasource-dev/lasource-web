import Link from 'next/link'

export default function HomePage() {
  return (
    <main>
      <h1>LaSource.dev</h1>
      <p>La fondation technique est prête.</p>
      <Link href="/admin">Administration Payload CMS</Link>
    </main>
  )
}
