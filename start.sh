#!/bin/sh

# Start Redis in the background (localhost only)
redis-server --daemonize yes --dir /tmp --bind 127.0.0.1 --port 6379

# Wait for Redis to be ready
for i in $(seq 1 20); do
  redis-cli -h 127.0.0.1 -p 6379 ping > /dev/null 2>&1 && break
  sleep 0.5
done

exec node dist/server.js
