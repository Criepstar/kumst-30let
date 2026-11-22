# KUMST – 30 let / 30 Jahre · Node-SSR (Astro) im Container
# Node 24, weil astro@7 mindestens Node 22.23.4 verlangt – 24 hat Reserve.
FROM node:24-alpine AS build
WORKDIR /app

# Abhängigkeiten zuerst (bessere Layer-Caches)
COPY package.json package-lock.json ./
RUN npm ci

# Quellen kopieren und bauen (BASE_PATH/SITE_URL werden eingebacken)
COPY . .
ARG BASE_PATH=/30-let-kumst
ARG SITE_URL=https://www.trta.at/30-let-kumst
ENV BASE_PATH=$BASE_PATH SITE_URL=$SITE_URL
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4321 \
    HOST=0.0.0.0 \
    DATA_DIR=/data

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# Seed-Fotos + Skript, damit die Archivbilder bei Bedarf nachgeladen werden können
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/seed ./seed

# Galerie + Uploads liegen im Volume
RUN mkdir -p /data && chown -R node:node /data /app
VOLUME ["/data"]
USER node

# Basis-Pfad nur für die Statusprüfung (die App selbst hat ihn eingebacken)
ARG BASE_PATH=/30-let-kumst
HEALTHCHECK --interval=30s --timeout=4s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '${BASE_PATH}/robots.txt').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
