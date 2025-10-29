CREATE DATABASE IF NOT EXISTS voyagehub;
-- Use a widely supported auth plugin to avoid client errors (mysql2/Prisma)
-- NOTE: If connecting from outside the MySQL server (e.g. your laptop), use '%' or your specific client IP instead of 'localhost'.
CREATE USER IF NOT EXISTS 'app'@'%' IDENTIFIED WITH mysql_native_password BY 'app';
GRANT ALL PRIVILEGES ON voyagehub.* TO 'app'@'%';
FLUSH PRIVILEGES;
