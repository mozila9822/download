-- Grant full privileges to voyageruser on the voyager database
-- MariaDB-compatible: GRANT with IDENTIFIED will create/update the user if needed.
-- For MySQL 8+, if GRANT IDENTIFIED is not supported, use CREATE/ALTER USER then GRANT.

-- MariaDB-friendly one-liner (creates user if needed and grants privileges)
GRANT ALL PRIVILEGES ON `voyager`.* TO 'voyageruser2'@'%' IDENTIFIED WITH mysql_native_password BY '19982206m.M';
FLUSH PRIVILEGES;

-- MySQL 8+ alternative (uncomment if GRANT IDENTIFIED fails):
-- CREATE USER IF NOT EXISTS 'voyageruser2'@'%' IDENTIFIED WITH mysql_native_password BY '19982206m.M';
-- ALTER USER 'voyageruser2'@'%' IDENTIFIED WITH mysql_native_password BY '19982206m.M';
-- GRANT ALL PRIVILEGES ON `voyager`.* TO 'voyageruser2'@'%';
-- FLUSH PRIVILEGES;
