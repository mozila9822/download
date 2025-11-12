const mysql = require('mysql2/promise')

function parseMysqlUrl(url) {
  const u = new URL(url)
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: (u.pathname || '').replace(/^\//, ''),
  }
}

async function main() {
  try { require('dotenv').config({ path: '.env.local' }) } catch {}
  if (!process.env.DATABASE_URL) { try { require('dotenv').config({ path: '.env' }) } catch {} }
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing')
  const cfg = parseMysqlUrl(url)
  const conn = await mysql.createConnection({ host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password, database: cfg.database })

  const destinations = [
    ['uk', 'United Kingdom'],
    ['europe', 'Europe'],
    ['asia', 'Asia'],
    ['africa', 'Africa'],
    ['americas', 'Americas'],
    ['oceania', 'Oceania'],
  ]
  for (const [slug, name] of destinations) {
    await conn.execute(
      'INSERT IGNORE INTO Destination (id, slug, name, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
      [`dest_${slug}`, slug, name]
    )
  }

  const services = [
    ['svc_hotel_london_ritz', 'Hotel', 'The Ritz London', 'Iconic luxury hotel in Piccadilly', 450, 399, 'London, UK', 'https://picsum.photos/seed/ritz-london/1200/800'],
    ['svc_hotel_paris_fs', 'Hotel', 'Four Seasons George V', 'Art-deco landmark near Champs-Élysées', 520, 475, 'Paris, France', 'https://picsum.photos/seed/fourseasons-paris/1200/800'],
    ['svc_tour_kenya_safari', 'Tour', 'Kenya Classic Safari', 'Guided safari through Masai Mara', 1299, null, 'Kenya, Africa', 'https://picsum.photos/seed/kenya-safari/1200/800'],
    ['svc_tour_santorini_romance', 'Tour', 'Santorini Romantic Escape', 'Sunset cruise and private wine tasting', 899, 799, 'Santorini, Greece', 'https://picsum.photos/seed/santorini-romance/1200/800'],
  ]
  for (const [id, category, title, description, price, offerPrice, location, imageUrl] of services) {
    await conn.execute(
      'INSERT IGNORE INTO Service (id, category, title, description, price, offerPrice, location, imageUrl, createdAt, status, available, startDate, endDate, isOffer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, NULL, NULL, ?)',
      [id, category === 'City Break' ? 'CityBreak' : category, title, description, price, offerPrice, location, imageUrl, 'Active', 1, offerPrice != null && Number(offerPrice) > 0 ? 1 : 0]
    )
  }

  const rules = [
    ['pr_hotel_weekend', null, 'Hotel', 'Weekend 1.10×', 1, null, null, 1, 1.10, null, 15],
    ['pr_tour_peak', null, 'Tour', 'Peak Season 1.20×', 1, null, null, 0, 1.20, null, 20],
    ['pr_fixed_fs_paris', 'svc_hotel_paris_fs', null, 'Fixed £499', 1, null, null, 0, null, 499, 25],
  ]
  for (const [id, serviceId, category, name, active, startDate, endDate, weekendOnly, multiplier, fixedOverride, priority] of rules) {
    await conn.execute(
      'INSERT IGNORE INTO PricingRule (id, serviceId, category, name, active, startDate, endDate, weekendOnly, multiplier, fixedOverride, priority, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [id, serviceId, category ? (category === 'City Break' ? 'CityBreak' : category) : null, name, active, startDate, endDate, weekendOnly, multiplier, fixedOverride, priority]
    )
  }

  await conn.end()
  process.stdout.write('OK\n')
}

main().catch((e) => { process.stderr.write(String(e && e.message || e)); process.exit(1) })

