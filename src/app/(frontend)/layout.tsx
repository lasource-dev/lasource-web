import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { StructuredData } from '../../components/StructuredData'

import './globals.css'

const siteURL = (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
  description:
    'Des fiches, guides et tutoriels clairs pour comprendre les technologies du développement web.',
  metadataBase: new URL(siteURL),
  title: {
    default: 'LaSource.dev — Comprendre les technologies du développement web',
    template: '%s | LaSource.dev',
  },
  twitter: { card: 'summary', site: '@lasourcedev' },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
}

export default function FrontendLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <StructuredData
          data={[
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'LaSource.dev',
              url: siteURL,
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              inLanguage: 'fr-FR',
              name: 'LaSource.dev',
              url: siteURL,
            },
          ]}
        />
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <header className="site-header">
          <Link aria-label="LaSource.dev, accueil" className="site-brand" href="/">
            LaSource<span>.dev</span>
          </Link>
          <nav aria-label="Navigation principale">
            <Link href="/">Accueil</Link>
            <Link href="/technologies">Technologies</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/tutoriels">Tutoriels</Link>
            <Link href="/a-propos">À propos</Link>
            <Link href="/politique-affiliation">Affiliation</Link>
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
            <Link href="/technologies">Technologies</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/tutoriels">Tutoriels</Link>
            <Link href="/a-propos">À propos</Link>
          </nav>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
