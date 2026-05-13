import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const walletKeys = ['wallet_btc', 'wallet_eth', 'wallet_usdt_trc20', 'wallet_bnb']
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: walletKeys } } })
    return Response.json(Object.fromEntries(rows.map(r => [r.key, r.value])))
  } catch {
    return Response.json({})
  }
}
