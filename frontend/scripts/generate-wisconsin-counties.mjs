import { mkdir, writeFile } from 'node:fs/promises'
import topology from 'us-atlas/counties-10m.json' with { type: 'json' }
import { feature } from 'topojson-client'

const counties = feature(topology, topology.objects.counties).features
const wisconsinCounties = counties.filter((county) => String(county.id).startsWith('55'))
const outputUrl = new URL('../public/data/wisconsin-counties.geojson', import.meta.url)

await mkdir(new URL('../public/data/', import.meta.url), { recursive: true })
await writeFile(outputUrl, JSON.stringify({ type: 'FeatureCollection', features: wisconsinCounties }))
console.log(`Generated ${wisconsinCounties.length} Wisconsin county boundaries.`)