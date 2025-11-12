/**
 * Convert OurAirports airports.csv to src/lib/airports.json
 * Usage: node scripts/ourairports-to-json.js <input_csv_path> <output_json_path>
 * Source dataset: https://ourairports.com/data/
 */
const fs = require('fs')
const path = require('path')

function parseCsvLine(line) {
  // Very simple CSV parser for quoted fields; good enough for this dataset
  const result = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  result.push(cur)
  return result
}

function main() {
  const input = process.argv[2]
  const output = process.argv[3] || path.join(process.cwd(), 'src', 'lib', 'airports.json')
  if (!input) {
    console.error('Missing input CSV path.\nUsage: node scripts/ourairports-to-json.js data/airports.csv src/lib/airports.json')
    process.exit(1)
  }

  const raw = fs.readFileSync(input, 'utf8')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const header = parseCsvLine(lines[0])
  const colIdx = Object.fromEntries(header.map((h, i) => [h, i]))

  const items = []
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    const type = cols[colIdx['type']] || ''
    if (!type || !/^large_airport|medium_airport|small_airport$/.test(type)) continue
    const iata = cols[colIdx['iata_code']] || ''
    const gps = cols[colIdx['gps_code']] || ''
    const ident = cols[colIdx['ident']] || ''
    const code = (iata || gps || ident).trim()
    if (!code) continue
    const name = (cols[colIdx['name']] || '').trim()
    const city = (cols[colIdx['municipality']] || '').trim()
    const country = (cols[colIdx['iso_country']] || '').trim()
    items.push({ code, name, city, country, type: 'airport' })
  }

  const out = { airports: items }
  fs.writeFileSync(output, JSON.stringify(out, null, 2), 'utf8')
  console.log(`Wrote ${items.length} airports to ${output}`)
}

main()

