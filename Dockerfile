ARG BASE_CONTAINER
FROM $BASE_CONTAINER 
USER node
WORKDIR /src
COPY --chown=node:node . .
RUN npm run build
RUN npm prune -production
