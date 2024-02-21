# TIR

## Description

TIR is a web application to dynamically manage compliance data for a system.

Tir is a Armenian god of wisdom and the namesake of the TIR (Test Ingest Respository).  TIR will help manage a system's STIG/SRG/SCTM content from a myriad of test tool formats.

## Features

* Group system compliance data
* Store STIG results files and their hsitory for a system .
* Store Quarterly DISA STIG libraries.
* Streamline Quarterly STIG Update Process
* Import automated test tool results
* Export compliance data

## Dev Setup

### Prerequisites:

- node v18+

### Clone repo
```bash
git clone <cloneurl>
cd tir
```

### Install dependencies:

```bash
npm install
```


#### `.env` for SQLite config
```ini
SQLITE=true
JWT_KEY= //Required: Key that TIR will use for JWT
INIT_PASSWORD= //Required:  Initial Password for initial TIR admin Account
```

#### `.env` for Postgres config
```ini
PORT= //Optional: Dev Web Server Port Defaults to 3000
DATABASE_HOST= //Required: Postgres Database IP/FQDN
DATABASE_PORT= //Optional: Defaults to 5432
DATABASE_USER= //Required: Postgres User
DATABASE_PASSWORD= //Required: Postgres User INIT_PASSWORD
DATABASE_NAME= //Required: Database Name for TIR
JWT_KEY= //Required: Key that TIR will use for JWT
INIT_PASSWORD= //Required:  Initial Password for initial TIR admin Account
```

#### Initialize Database

```bash
npm run dbinit
```

## Start local server

### Start development server

```bash
npm run dev
```

### Start production build server (HTTP)

```bash
npm run build;
node .output/server/index.mjs
```

## Nuxt Modules included:

- [eslint](https://nuxt.com/modules/eslint)
- [pinia](https://nuxt.com/modules/pinia)
- [tailwindcss](https://nuxt.com/modules/tailwindcss)
- [devtools](https://nuxt.com/modules/devtools)
