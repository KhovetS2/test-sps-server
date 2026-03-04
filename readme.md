----------------------------------
ESPANHOL
----------------------------------

## Prueba NODE

- Crear un CRUD (API REST) en Node para el registro de usuarios.
- Para la creación de la prueba, utilizar un repositorio falso de usuarios (puede ser en memoria).

## Reglas

- Debe existir un usuario administrador previamente registrado para utilizar la autenticación (no es necesario cifrar la contraseña):
{
  "name": "admin",
  "email": "admin@spsgroup.com.br",
  "type": "admin",
  "password": "1234"
}

- Crear una ruta de autenticación (token Jwt).
- Las rutas de la API solo pueden ser ejecutadas si el usuario está autenticado.
- Debe ser posible añadir usuarios con los campos: email, nombre, type, password.
- No debe ser posible registrar un correo electrónico ya existente.
- Debe ser posible eliminar usuarios.
- Debe ser posible modificar los datos de un usuario.


----------------------------------
PORTUGUÊS
----------------------------------

# Teste NODE

- Criar um CRUD (API REST) em node para cadastro de usuários
- Para a criação do teste utilizar um repositório fake dos usuários. (Pode ser em memória)

## Regras

- Deve existir um usuário admin previamente cadastrado para utilizar autenticação (não precisa criptografar a senha);
  {
    name: "admin",
    email: "admin@spsgroup.com.br",
    type: "admin"
    password: "1234"
  }

- Criar rota de autenticação (Jwt token)
- As rotas da API só podem ser executadas se estiver autenticada
- Deve ser possível adicionar usuários. Campos: email, nome, type, password
- Não deve ser possível cadastrar o e-mail já cadastrado
- Deve ser possível remover usuário
- Deve ser possível alterar os dados do usuário

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

O servidor iniciará na porta configurada (padrão: `3000`) com hot-reload via Nodemon.
El servidor se iniciará en el puerto configurado (por defecto: `3000`) con hot-reload vía Nodemon.

### Build para produção / Build para producción

```bash
npm run build
npm start
```

### Documentação da API / Documentación de la API

Após iniciar o servidor, acesse o Swagger em:
Después de iniciar el servidor, acceda al Swagger en:

```
http://localhost:3000/api-docs
```

### Usuário admin padrão / Usuario admin por defecto

```json
{
  "email": "admin@spsgroup.com.br",
  "password": "1234"
}
```

---

## Docker

### Build e execução individual / Build y ejecución individual

```bash
docker build -t test-sps-server .
docker run -p 3000:3000 test-sps-server
```

### Com docker-compose (apenas server) / Con docker-compose (solo server)

```bash
docker compose up --build
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
