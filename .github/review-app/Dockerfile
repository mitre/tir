ARG BASE_CONTAINER=node:22-slim

FROM $BASE_CONTAINER AS build
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /src
RUN chown node:node /src
USER node
COPY --chown=node:node . .
RUN npm ci
RUN npm run build
RUN npm prune --omit=dev && npm cache clean --force && rm -rf .git

FROM $BASE_CONTAINER
WORKDIR /src
COPY --from=build --chown=node:node /src /src
RUN mkdir -p tmp && chown node:node tmp
USER node
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
