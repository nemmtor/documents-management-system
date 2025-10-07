#!/bin/bash
set -e

mongosh --host localhost -u "${MONGO_INITDB_ROOT_USERNAME}" -p "${MONGO_INITDB_ROOT_PASSWORD}" --authenticationDatabase "admin" <<EOF
use ${DB_NAME}
db.createUser({
    user: "${DB_USER}",
    pwd: "${DB_PASSWORD}",
    roles: [
        {
            role: "readWrite",
            db: "${DB_NAME}"
        }
    ]
})
EOF
