import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  description:
    'Des fiches, guides et tutoriels clairs pour comprendre les technologies du développement web.',
  metadataBase: new URL('https://lasource.dev'),
  title: {
    default: 'LaSource.dev — Comprendre les technologies du développement web',
    template: '%s | LaSource.dev',
  },
}

export default function FrontendLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <header className="site-header">
          <Link aria-label="LaSource.dev, accueil" className="site-brand" href="/">
            LaSource<span>.dev</span>
          </Link>
          <nav aria-label="Navigation principale">
            <Link href="/">Accueil</Link>
            <Link href="/a-propos">À propos</Link>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <p>
            Des fiches, guides et tutoriels clairs pour comprendre les technologies du
            développement web.
          </p>
          <nav aria-label="Navigation de pied de page">
            <Link href="/">Accueil</Link>
            <Link href="/a-propos">À propos</Link>
            <Link href="/admin">Administration</Link>
          </nav>
        </footer>
      </body>
    </html>
  )
}
