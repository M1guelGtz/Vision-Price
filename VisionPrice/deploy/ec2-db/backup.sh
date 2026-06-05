#!/bin/bash
# =====================================================================
# Backup diario de las dos bases de datos.
# Uso (en la EC2):
#   chmod +x backup.sh
#   ./backup.sh
#
# Agendar con cron (diario a las 03:00 hora EC2):
#   crontab -e
#   0 3 * * * /home/ec2-user/visionprice/deploy/ec2-db/backup.sh >> /home/ec2-user/visionprice/deploy/ec2-db/backup.log 2>&1
# =====================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Cargar variables del .env
set -a
source ./.env
set +a

BACKUP_DIR="$SCRIPT_DIR/backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=7

dump_db() {
  local db="$1"
  local out="$BACKUP_DIR/${db}-${TIMESTAMP}.sql.gz"
  echo "Dumping $db -> $out"
  docker exec visionprice-mysql \
    mysqldump -uroot -p"${MYSQL_ROOT_PASSWORD}" \
      --single-transaction --routines --triggers --databases "$db" \
    | gzip > "$out"
}

dump_db "$AUTH_DB_NAME"
dump_db "$PROJECTS_DB_NAME"

# Eliminar backups mayores a RETENTION_DAYS dias
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completado: $(ls -lh $BACKUP_DIR | tail -2)"
