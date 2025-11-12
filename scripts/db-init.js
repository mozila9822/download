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
  const conn = await mysql.createConnection({ host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password, database: cfg.database, multipleStatements: true })

  const stmts = [
    `CREATE TABLE IF NOT EXISTS User (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NULL,
      phone VARCHAR(64) NULL,
      address VARCHAR(255) NULL,
      role ENUM('Admin','Staff','User','SuperAdmin') NOT NULL DEFAULT 'User',
      passwordHash VARCHAR(255) NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS Service (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      category ENUM('CityBreak','Tour','Hotel','Flight','CoachRide') NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price DOUBLE NOT NULL,
      offerPrice DOUBLE NULL,
      location VARCHAR(255) NOT NULL,
      imageUrl TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
      available TINYINT(1) NOT NULL DEFAULT 1,
      startDate DATETIME NULL,
      endDate DATETIME NULL,
      isOffer TINYINT(1) NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS Booking (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      userId INT NOT NULL,
      serviceId VARCHAR(191) NOT NULL,
      bookingDate DATETIME NOT NULL,
      travelDate DATETIME NOT NULL,
      numberOfTravelers INT NOT NULL,
      totalPrice DOUBLE NOT NULL,
      paymentStatus VARCHAR(64) NOT NULL,
      status VARCHAR(64) NOT NULL DEFAULT 'PendingPayment',
      contactEmail VARCHAR(255) NULL,
      contactPhone VARCHAR(64) NULL,
      contactName VARCHAR(255) NULL,
      notes TEXT NULL,
      travelers JSON NULL,
      currency VARCHAR(16) NOT NULL DEFAULT 'usd',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      extras JSON NULL,
      INDEX Booking_serviceId_fkey (serviceId),
      INDEX Booking_userId_fkey (userId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS Payment (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      bookingId VARCHAR(191) NOT NULL,
      userId INT NOT NULL,
      provider VARCHAR(64) NOT NULL,
      intentId VARCHAR(191) NULL,
      clientSecret VARCHAR(191) NULL,
      status VARCHAR(64) NOT NULL,
      amount INT NOT NULL,
      currency VARCHAR(16) NOT NULL DEFAULT 'usd',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX Payment_bookingId_fkey (bookingId),
      INDEX Payment_userId_fkey (userId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS SiteSettings (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      siteTitle VARCHAR(255) NOT NULL DEFAULT 'VoyagerHub',
      domains JSON NULL,
      logoUrl VARCHAR(255) NULL,
      faviconUrl VARCHAR(255) NULL,
      footer JSON NULL,
      navigation JSON NULL,
      sections JSON NULL,
      theme JSON NULL,
      seoTitle VARCHAR(255) NULL,
      seoDescription TEXT NULL,
      seoKeywords VARCHAR(255) NULL,
      version INT NOT NULL DEFAULT 1,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS SiteSettingsHistory (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      settingsId VARCHAR(191) NOT NULL,
      version INT NOT NULL,
      data JSON NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX SiteSettingsHistory_settingsId_fkey (settingsId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS SupportThread (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      userId INT NOT NULL,
      assignedAdminId INT NULL,
      subject VARCHAR(255) NULL,
      status ENUM('Open','InProgress','Pending','Resolved','Urgent') NOT NULL DEFAULT 'Open',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX SupportThread_assignedAdminId_fkey (assignedAdminId),
      INDEX SupportThread_userId_fkey (userId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS SupportMessage (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      threadId VARCHAR(191) NOT NULL,
      adminId INT NULL,
      userId INT NULL,
      messageText TEXT NOT NULL,
      attachments JSON NULL,
      readByUser TINYINT(1) NOT NULL DEFAULT 0,
      readByAdmin TINYINT(1) NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX SupportMessage_adminId_fkey (adminId),
      INDEX SupportMessage_threadId_fkey (threadId),
      INDEX SupportMessage_userId_fkey (userId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS Availability (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      serviceId VARCHAR(191) NOT NULL,
      date DATETIME NOT NULL,
      capacity INT NOT NULL DEFAULT 1,
      booked INT NOT NULL DEFAULT 0,
      blocked TINYINT(1) NOT NULL DEFAULT 0,
      priceOverride DOUBLE NULL,
      notes TEXT NULL,
      UNIQUE KEY Availability_service_date_unique (serviceId, date),
      INDEX Availability_serviceId_idx (serviceId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS PricingRule (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      serviceId VARCHAR(191) NULL,
      category ENUM('CityBreak','Tour','Hotel','Flight','CoachRide') NULL,
      name VARCHAR(255) NOT NULL,
      active TINYINT(1) NOT NULL DEFAULT 1,
      startDate DATETIME NULL,
      endDate DATETIME NULL,
      weekendOnly TINYINT(1) NOT NULL DEFAULT 0,
      multiplier DOUBLE NULL,
      fixedOverride DOUBLE NULL,
      priority INT NOT NULL DEFAULT 10,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX PricingRule_serviceId_idx (serviceId),
      INDEX PricingRule_category_idx (category),
      INDEX PricingRule_active_date_idx (active, startDate, endDate)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS Destination (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      slug VARCHAR(191) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      gallery JSON NULL,
      attractions JSON NULL,
      featuredHotelIds JSON NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  ]

  for (const sql of stmts) {
    await conn.execute(sql)
  }

  await conn.end()
  process.stdout.write('OK\n')
}

main().catch((e) => { process.stderr.write(String(e && e.message || e)); process.exit(1) })
