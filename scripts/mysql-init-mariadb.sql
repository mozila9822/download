-- MariaDB 10.4+ initialization for app user using mysql_native_password
-- Applies cleanly on hosts where the default auth plugin is gssapi or others
-- Adjusts user 'myuser' to use mysql_native_password and grants on 'mydatabase'

-- Create database if missing
CREATE DATABASE IF NOT EXISTS mydatabase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ensure we recreate the user with the correct auth plugin
DROP USER IF EXISTS 'myuser'@'localhost';
DROP USER IF EXISTS 'myuser'@'%';
DROP USER IF EXISTS 'myuser'@'127.0.0.1';
DROP USER IF EXISTS 'myuser'@'::1';

-- Create the user using mysql_native_password for compatibility with Prisma/mysql2
CREATE USER 'myuser'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('mypassword');
CREATE USER 'myuser'@'%'         IDENTIFIED VIA mysql_native_password USING PASSWORD('mypassword');
CREATE USER 'myuser'@'127.0.0.1' IDENTIFIED VIA mysql_native_password USING PASSWORD('mypassword');
CREATE USER 'myuser'@'::1'       IDENTIFIED VIA mysql_native_password USING PASSWORD('mypassword');

-- Grant privileges on the target database
GRANT ALL PRIVILEGES ON mydatabase.* TO 'myuser'@'localhost';
GRANT ALL PRIVILEGES ON mydatabase.* TO 'myuser'@'%';
GRANT ALL PRIVILEGES ON mydatabase.* TO 'myuser'@'127.0.0.1';
GRANT ALL PRIVILEGES ON mydatabase.* TO 'myuser'@'::1';

FLUSH PRIVILEGES;

-- Verification queries (optional):
-- SELECT user, host, plugin FROM mysql.user WHERE user='myuser';
-- SHOW GRANTS FOR 'myuser'@'localhost';
-- SHOW GRANTS FOR 'myuser'@'%';
-- SHOW GRANTS FOR 'myuser'@'127.0.0.1';
-- SHOW GRANTS FOR 'myuser'@'::1';

-- If the server default forces GSSAPI, consider:
-- SHOW VARIABLES LIKE 'default_authentication_plugin';
-- SET GLOBAL default_authentication_plugin = 'mysql_native_password';
