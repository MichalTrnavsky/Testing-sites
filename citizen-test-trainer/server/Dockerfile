# CitizenPrep server + static app. Node 22 for built-in node:sqlite.
FROM node:22-slim

WORKDIR /app

# Install server deps first (better layer caching).
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm ci --omit=dev

# App (static) + server code.
COPY app ./app
COPY server ./server

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Persist the SQLite DB outside the image.
VOLUME ["/data"]
ENV DB_PATH=/data/data.sqlite

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||8080)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/server.js"]
