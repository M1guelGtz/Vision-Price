#!/bin/bash
# =====================================================================
# Crea las dos bases de datos (auth_db y projects_db) y dos usuarios
# con permisos SOLO sobre su propia base. Se ejecuta automaticamente
# la primera vez que arranca el contenedor con el volumen vacio.
#
# Las variables AUTH_DB_*, PROJECTS_DB_* se inyectan desde docker-compose
# a traves del archivo .env.
# =====================================================================
set -e

mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
    -- ============ auth_db ============
    CREATE DATABASE IF NOT EXISTS \`${AUTH_DB_NAME}\`
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci;

    CREATE USER IF NOT EXISTS '${AUTH_DB_USER}'@'%'
        IDENTIFIED BY '${AUTH_DB_PASSWORD}';

    GRANT ALL PRIVILEGES ON \`${AUTH_DB_NAME}\`.*
        TO '${AUTH_DB_USER}'@'%';

    -- ============ projects_db ============
    CREATE DATABASE IF NOT EXISTS \`${PROJECTS_DB_NAME}\`
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci;

    CREATE USER IF NOT EXISTS '${PROJECTS_DB_USER}'@'%'
        IDENTIFIED BY '${PROJECTS_DB_PASSWORD}';

    GRANT ALL PRIVILEGES ON \`${PROJECTS_DB_NAME}\`.*
        TO '${PROJECTS_DB_USER}'@'%';

    -- Refrescar privilegios
    FLUSH PRIVILEGES;
EOSQL

echo "Bases ${AUTH_DB_NAME} y ${PROJECTS_DB_NAME} creadas correctamente."
