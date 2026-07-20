#!/bin/sh
# Arranque del contenedor: migraciones y luego el servidor.
#
# Se usa un script en lugar de encadenar con `&&` en el startCommand porque
# ese encadenamiento depende de que la plataforma ejecute el comando dentro de
# una shell. Si no lo hace, `&&` y lo que sigue se pasan como argumentos al
# primer binario: las migraciones corren, el proceso termina y el servidor
# nunca arranca (sin ningun mensaje de error).
set -e

echo "[entrypoint] Aplicando migraciones de Prisma..."
npx prisma migrate deploy --schema=src/infrastructure/database/prisma/schema.prisma

echo "[entrypoint] Iniciando auth-service..."
# `exec` reemplaza el proceso de la shell por Node, de modo que Node queda como
# PID 1 y recibe SIGTERM/SIGINT directamente (apagado ordenado en el deploy).
exec node dist/main.js
