
#!/bin/bash
docker compose --env-file .env.development down --remove-orphans -v
