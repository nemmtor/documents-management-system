#!/bin/bash
set -e

mongosh --host localhost -u "${MONGO_INITDB_ROOT_USERNAME}" -p "${MONGO_INITDB_ROOT_PASSWORD}" --authenticationDatabase "admin" <<EOF
use ${DOCUMENT_DB_NAME}
db.createUser({
    user: "${DOCUMENT_DB_USER}",
    pwd: "${DOCUMENT_DB_PASSWORD}",
    roles: [
        {
            role: "readWrite",
            db: "${DOCUMENT_DB_NAME}"
        }
    ]
})
EOF
