export const dynamic = 'force-static'

export async function GET() {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

  if (!pubId) {
    return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }

  const body = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/plain' } })
}
