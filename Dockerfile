ARG BASE_CONTAINER=registry1.dso.mil/ironbank/opensource/nodejs/nodejs20:20-slim
FROM $BASE_CONTAINER 
USER root
RUN mkdir /cert_loc && chown 1000:1000 /cert_loc
RUN mkdir /mounted && chown 1000:1000 /mounted
USER 1000
WORKDIR /src
COPY --chown=1000:1000 . .
RUN mkdir tmp
RUN npm run build
RUN npm prune -production
