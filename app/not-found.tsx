'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <pre className="text-[#ff2222] text-xs leading-5">
          {`╔═══════════════════╗\n║  404 — NOT FOUND  ║\n╚═══════════════════╝`}
        </pre>
        <p className="text-[#4a7a4a] text-xs tracking-widest">
          The requested resource does not exist.
        </p>
        <Link
          href="/"
          className="text-[#00ff41] text-xs border border-[#1a3a1a] hover:border-[#00ff41] px-4 py-2 tracking-widest transition-colors"
        >
          RETURN TO TERMINAL
        </Link>
      </div>
    </div>
  )
}
