#!/bin/sh
# Script de seed: importa livros.json para MongoDB se a collection estiver vazia

set -e

MONGO_HOST="${MONGO_HOST:-mongo}"
MONGO_PORT="${MONGO_PORT:-27017}"
DB_NAME="leituras"
COLLECTION="livros"
DATA_FILE="/app/dados/livros.json"

echo ">>> A aguardar MongoDB em $MONGO_HOST:$MONGO_PORT..."
until mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --eval "db.adminCommand('ping')" --quiet; do
    echo "MongoDB ainda não disponível. A aguardar 2 segundos..."
    sleep 2
done

echo ">>> MongoDB disponível!"

COUNT=$(mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --quiet \
    --eval "db = db.getSiblingDB('$DB_NAME'); db.$COLLECTION.countDocuments()" 2>/dev/null || echo "0")

if [ "$COUNT" -gt "0" ]; then
    echo ">>> Collection '$COLLECTION' já tem $COUNT documentos. A saltar seed."
else
    echo ">>> A importar $DATA_FILE para $DB_NAME.$COLLECTION ..."
    mongoimport \
        --host "$MONGO_HOST" \
        --port "$MONGO_PORT" \
        --db "$DB_NAME" \
        --collection "$COLLECTION" \
        --file "$DATA_FILE" \
        --jsonArray
    echo ">>> Seed concluído!"
fi
