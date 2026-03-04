----------------------------------
ESPANHOL
----------------------------------

## PRUEBA SPS SERVER

- API REST con CRUD de usuarios y autenticación JWT

## Reglas

- Crear una API RESTful con Node.js + Express + TypeScript
- Implementar registro y autenticación de usuarios con JWT
- Usar SQLite como base de datos
- Validar datos con Zod
- Documentación Swagger disponible en `/api-docs`

----------------------------------
PORTUGUÊS
----------------------------------

# SPS SERVER TEST

- API REST com CRUD de usuários e autenticação JWT

# Regras

- Criar uma API RESTful com Node.js + Express + TypeScript
- Implementar registro e autenticação de usuários com JWT
- Usar SQLite como banco de dados
- Validar dados com Zod
- Documentação Swagger disponível em `/api-docs`

---

## Como utilizar / Cómo utilizar

### Pré-requisitos / Prerrequisitos

- [Node.js](https://nodejs.org/) v20+
- npm ou yarn

### Instalação / Instalación

```bash
npm install
```

### Variáveis de Ambiente / Variables de Entorno

Crie um arquivo `.env` na raiz do projeto / Cree un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
JWT_SECRET=sps-jwt-secret-change-in-production
JWT_REFRESH_SECRET=sps-refresh-secret-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Executar em desenvolvimento / Ejecutar en desarrollo

```bash
npm run dev
```

O servidor iniciará em `http://localhost:3000`.
El servidor se iniciará en `http://localhost:3000`.

### Build para produção / Build para producción

```bash
npm run build
npm start
```

### Swagger

Acesse a documentação da API em / Acceda a la documentación de la API en:

```
http://localhost:3000/api-docs
```

---

## Docker

### Build e execução individual / Build y ejecución individual

```bash
docker build -t test-sps-server .
docker run -p 3000:3000 test-sps-server
```

### Com docker-compose (server + react) / Con docker-compose (server + react)

Para executar ambos os projetos juntos, clone os dois repositórios e crie um `docker-compose.yml` no diretório pai.
Para ejecutar ambos proyectos juntos, clone ambos repositorios y cree un `docker-compose.yml` en el directorio padre.

A estrutura esperada é / La estructura esperada es:

```
sps/
├── docker-compose.yml    ← criar este arquivo / crear este archivo
├── test-sps-server/
└── test-sps-react/
```

Crie o arquivo `docker-compose.yml` com o seguinte conteúdo / Cree el archivo `docker-compose.yml` con el siguiente contenido:

```yaml
services:
  api:
    build: ./test-sps-server
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - JWT_SECRET=sps-jwt-secret-change-in-production
      - JWT_REFRESH_SECRET=sps-refresh-secret-change-in-production
      - JWT_EXPIRES_IN=15m
      - JWT_REFRESH_EXPIRES_IN=7d
    volumes:
      - sqlite-data:/app/data
    restart: unless-stopped

  web:
    build:
      context: ./test-sps-react
      args:
        - REACT_APP_SERVER_URL=http://localhost:3000
    ports:
      - "3001:80"
    depends_on:
      - api
    restart: unless-stopped

volumes:
  sqlite-data:
```

Em seguida, execute / Luego ejecute:

```bash
docker compose up --build
```

| Serviço / Servicio | URL                          |
| ------------------- | ---------------------------- |
| API (Server)        | http://localhost:3000         |
| Swagger             | http://localhost:3000/api-docs |
| Frontend (React)    | http://localhost:3001         |
