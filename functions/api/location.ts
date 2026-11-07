import { parseCfLocation } from '../../src/location'

export const onRequestGet: PagesFunction = ({ request }) => {
  const place = parseCfLocation(request.cf)
  if (!place) return new Response(null, { status: 404 })
  return Response.json(place, { headers: { 'cache-control': 'private, max-age=600' } })
}
