#!/bin/sh
# Script de importação do dataset para MongoDB
# Executado automaticamente pelo docker-compose via entrypoint

set -e

MONGO_HOST="${MONGO_HOST:-mongo}"
MONGO_PORT="${MONGO_PORT:-27017}"
DB_NAME="jogostabuleiro"
COLLECTION="jogos"
DATA_FILE="/app/dados/jogos.json"

# Confirma que o ficheiro existe
if [ ! -f "$DATA_FILE" ]; then
    echo "ERRO: ficheiro $DATA_FILE não encontrado!"
    ls -la /app/dados/ 2>/dev/null || echo "(pasta /app/dados não existe)"
    exit 1
fi

echo ">>> A aguardar MongoDB em $MONGO_HOST:$MONGO_PORT..."
until mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --eval "db.adminCommand('ping')" --quiet; do
    echo "MongoDB ainda não disponível. A aguardar 2 segundos..."
    sleep 2
done

echo ">>> MongoDB disponível!"

# Verifica se já existe dados na collection
COUNT=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet \
    --eval "db = db.getSiblingDB('$DB_NAME'); db.$COLLECTION.countDocuments()" 2>/dev/null || echo "0")

if [ "$COUNT" -gt "0" ]; then
    echo ">>> Collection '$COLLECTION' já tem $COUNT documentos. A saltar importação."
else
    echo ">>> A importar $DATA_FILE para $DB_NAME.$COLLECTION ..."
    mongoimport \
        --host "$MONGO_HOST" \
        --port "$MONGO_PORT" \
        --db "$DB_NAME" \
        --collection "$COLLECTION" \
        --file "$DATA_FILE" \
        --jsonArray
    echo ">>> Importação concluída!"
fi
