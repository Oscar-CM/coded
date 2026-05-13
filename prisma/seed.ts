import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

const url = 'file:' + path.join(process.cwd(), 'dev.db').replace(/\\/g, '/')
const adapter = new PrismaLibSql({ url })
const prisma = new PrismaClient({ adapter })

async function upsertSetting(key: string, value: string) {
  await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } })
}

async function main() {
  // ── Categories ────────────────────────────────────────────────────────────
  const cats = await Promise.all([
    prisma.category.upsert({ where: { slug: 'software-tools' },  update: {}, create: { name: 'Software Tools',  slug: 'software-tools',  icon: '⚙️',  order: 0 } }),
    prisma.category.upsert({ where: { slug: 'script-packages' }, update: {}, create: { name: 'Script Packages', slug: 'script-packages', icon: '🐚',  order: 1 } }),
    prisma.category.upsert({ where: { slug: 'templates' },       update: {}, create: { name: 'Templates',       slug: 'templates',       icon: '🖥️',  order: 2 } }),
    prisma.category.upsert({ where: { slug: 'databases' },       update: {}, create: { name: 'Databases',       slug: 'databases',       icon: '🗃️',  order: 3 } }),
    prisma.category.upsert({ where: { slug: 'exploit-kits' },    update: {}, create: { name: 'Exploit Kits',    slug: 'exploit-kits',    icon: '🎣',  order: 4 } }),
    prisma.category.upsert({ where: { slug: 'crypto-tools' },    update: {}, create: { name: 'Crypto Tools',    slug: 'crypto-tools',    icon: '🔐',  order: 5 } }),
  ])
  const [soft, scripts, templates, databases, exploits, crypto] = cats

  // ── Subcategories ─────────────────────────────────────────────────────────
  const subSeeds: Array<{ name: string; slug: string; icon: string; categoryId: string; order: number }> = [
    { name: 'Password Tools',   slug: 'password-tools',   icon: '🔑', categoryId: soft.id,     order: 0 },
    { name: 'Network Tools',    slug: 'network-tools',    icon: '🕸️', categoryId: soft.id,     order: 1 },
    { name: 'Privacy Suite',    slug: 'privacy-suite',    icon: '👻', categoryId: soft.id,     order: 2 },
    { name: 'Monitoring',       slug: 'monitoring',       icon: '📡', categoryId: soft.id,     order: 3 },

    { name: 'Bash Scripts',     slug: 'bash-scripts',     icon: '🐧', categoryId: scripts.id,  order: 0 },
    { name: 'Python Scripts',   slug: 'python-scripts',   icon: '🐍', categoryId: scripts.id,  order: 1 },
    { name: 'Automation',       slug: 'automation',       icon: '🤖', categoryId: scripts.id,  order: 2 },
    { name: 'Security Scripts', slug: 'security-scripts', icon: '🛡️', categoryId: scripts.id,  order: 3 },

    { name: 'Admin UIs',        slug: 'admin-uis',        icon: '🖥️', categoryId: templates.id, order: 0 },
    { name: 'Landing Pages',    slug: 'landing-pages',    icon: '🌐', categoryId: templates.id, order: 1 },
    { name: 'API Templates',    slug: 'api-templates',    icon: '🔌', categoryId: templates.id, order: 2 },

    { name: 'Wordlists',        slug: 'wordlists',        icon: '📝', categoryId: databases.id, order: 0 },
    { name: 'OSINT Data',       slug: 'osint-data',       icon: '🔍', categoryId: databases.id, order: 1 },
    { name: 'Leaked Data',      slug: 'leaked-data',      icon: '💧', categoryId: databases.id, order: 2 },

    { name: 'Web Exploits',     slug: 'web-exploits',     icon: '🌐', categoryId: exploits.id,  order: 0 },
    { name: 'Network Exploits', slug: 'network-exploits', icon: '📡', categoryId: exploits.id,  order: 1 },
    { name: 'Social Eng.',      slug: 'social-eng',       icon: '🎭', categoryId: exploits.id,  order: 2 },

    { name: 'Encryption',       slug: 'encryption',       icon: '🔒', categoryId: crypto.id,    order: 0 },
    { name: 'Blockchain Tools', slug: 'blockchain-tools', icon: '⛓️', categoryId: crypto.id,    order: 1 },
    { name: 'Wallet Tools',     slug: 'wallet-tools',     icon: '💼', categoryId: crypto.id,    order: 2 },
  ]

  for (const sub of subSeeds) {
    await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: sub.categoryId, slug: sub.slug } },
      update: {},
      create: sub,
    })
  }

  // ── Products ──────────────────────────────────────────────────────────────
  const seeds = [
    { name: 'NullByte Pro',        description: 'Advanced password analysis & recovery toolkit with multi-threaded GPU acceleration.', symbol: '⚡', categoryId: soft.id,     amountIn: 47,  sellingPrice: 89.99,  potentialEarnings: 220.00, status: 'in_stock',     rarity: 'rare',      cardBg: '#0a1628', cardAccent: '#00e5ff', featured: true,  featuredOrder: 1 },
    { name: 'GhostProxy Bundle',   description: 'Anonymous routing layer with rotating proxies across 40+ countries. Zero logs.',       symbol: '👻', categoryId: soft.id,     amountIn: 12,  sellingPrice: 149.99, potentialEarnings: 380.00, status: 'almost_out',   rarity: 'epic',      cardBg: '#150a28', cardAccent: '#bf00ff', featured: true,  featuredOrder: 2 },
    { name: 'DataPulse Analytics', description: 'Real-time data stream monitor with anomaly detection and live dashboards.',             symbol: '📊', categoryId: soft.id,     amountIn: 88,  sellingPrice: 59.99,  potentialEarnings: null,   status: 'in_stock',     rarity: 'uncommon',  cardBg: '#0a2810', cardAccent: '#00ff41', featured: false, featuredOrder: null },
    { name: 'CryptoVault X',       description: 'Military-grade AES-256 encrypted file storage with plausible deniability.',            symbol: '🔐', categoryId: crypto.id,   amountIn: 0,   sellingPrice: 199.99, potentialEarnings: 500.00, status: 'out_of_stock', rarity: 'legendary', cardBg: '#282200', cardAccent: '#ffd700', featured: true,  featuredOrder: 3 },
    { name: 'NetRecon Suite',      description: 'Comprehensive network reconnaissance with port scanning, OSINT, and mapping.',         symbol: '🔭', categoryId: scripts.id,  amountIn: 31,  sellingPrice: 74.99,  potentialEarnings: 180.00, status: 'in_stock',     rarity: 'rare',      cardBg: '#001a28', cardAccent: '#00e5ff', featured: false, featuredOrder: null },
    { name: 'ZeroTrace Kit',       description: 'Complete digital footprint erasure. Purge metadata, logs, and activity trails.',       symbol: '🧹', categoryId: scripts.id,  amountIn: 5,   sellingPrice: 129.99, potentialEarnings: 310.00, status: 'almost_out',   rarity: 'epic',      cardBg: '#1a0a0a', cardAccent: '#ff2222', featured: false, featuredOrder: null },
    { name: 'Dark Dashboard UI',   description: 'Full-stack admin dashboard template. Dark theme, charts, auth, and data tables.',      symbol: '🖥️', categoryId: templates.id, amountIn: 200, sellingPrice: 39.99,  potentialEarnings: null,   status: 'in_stock',     rarity: 'common',    cardBg: '#0f0f14', cardAccent: '#7c7cff', featured: false, featuredOrder: null },
    { name: 'LeakBase Pro',        description: 'Structured breach data index with fast fuzzy search. 50M+ sanitized records.',         symbol: '🗃️', categoryId: databases.id, amountIn: 3,   sellingPrice: 299.99, potentialEarnings: 750.00, status: 'almost_out',   rarity: 'legendary', cardBg: '#280a0a', cardAccent: '#ff6b00', featured: true,  featuredOrder: 4 },
    { name: 'BashCraft Pro',       description: 'Collection of 200+ bash scripts for automation, monitoring & sysadmin.',               symbol: '🐚', categoryId: scripts.id,  amountIn: 150, sellingPrice: 29.99,  potentialEarnings: null,   status: 'in_stock',     rarity: 'common',    cardBg: '#0a1a0a', cardAccent: '#00ff41', featured: false, featuredOrder: null },
    { name: 'PhishFrame SDK',      description: 'Authorized red-team phishing simulation framework for security awareness training.',   symbol: '🎣', categoryId: exploits.id,  amountIn: 22,  sellingPrice: 179.99, potentialEarnings: 440.00, status: 'in_stock',     rarity: 'rare',      cardBg: '#1a1400', cardAccent: '#ffd700', featured: true,  featuredOrder: 5 },
    { name: 'ShadowSQL Pack',      description: 'Advanced SQL injection detection & testing toolkit for authorized pentests.',          symbol: '💉', categoryId: exploits.id,  amountIn: 0,   sellingPrice: 119.99, potentialEarnings: 290.00, status: 'out_of_stock', rarity: 'uncommon',  cardBg: '#0a0a1e', cardAccent: '#4040ff', featured: false, featuredOrder: null },
    { name: 'API Blueprint Kit',   description: 'Production-ready REST API templates with auth, rate limiting, and OpenAPI docs.',      symbol: '🔌', categoryId: templates.id, amountIn: 500, sellingPrice: 19.99,  potentialEarnings: null,   status: 'in_stock',     rarity: 'common',    cardBg: '#0f140a', cardAccent: '#80ff40', featured: false, featuredOrder: null },
  ]

  for (const p of seeds) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } })
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: { featured: p.featured, featuredOrder: p.featuredOrder } })
    } else {
      await prisma.product.create({ data: p })
    }
  }

  // ── Site Settings ─────────────────────────────────────────────────────────
  const settingSeeds = [
    ['site_name',          'CodedLogs'],
    ['site_tagline',       'Digital Asset Repository'],
    ['store_passcode',     'CODEDLOGS'],
    ['banner_enabled',     'false'],
    ['banner_message',     'New drops every Friday. Stay tuned.'],
    ['banner_color',       '#ff6b00'],
    ['wallet_btc',         '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'],
    ['wallet_eth',         '0x742d35Cc6634C0532925a3b8D7c9B8c4A2e4f5a'],
    ['wallet_usdt_trc20',  'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtHR'],
    ['wallet_bnb',         'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2'],
    ['low_stock_threshold','5'],
    ['featured_limit',     '8'],
    ['currency_symbol',    '$'],
    ['support_email',      'support@codedlogs.io'],
  ]

  for (const [key, value] of settingSeeds) {
    await upsertSetting(key, value)
  }

  console.log(`✓ Seeded ${cats.length} categories, ${subSeeds.length} subcategories, ${seeds.length} products, ${settingSeeds.length} settings.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
