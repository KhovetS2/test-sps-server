import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SPS Server API",
            version: "1.0.0",
            description:
                "API REST com autenticação OAuth2.0 (JWT) e CRUD de usuários",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your access_token",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "admin" },
                        email: {
                            type: "string",
                            format: "email",
                            example: "admin@spsgroup.com.br",
                        },
                        type: { type: "string", example: "admin" },
                        created_at: {
                            type: "string",
                            format: "date-time",
                        },
                        updated_at: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                CreateUser: {
                    type: "object",
                    required: ["name", "email", "type", "password"],
                    properties: {
                        name: { type: "string", example: "John Doe" },
                        email: {
                            type: "string",
                            format: "email",
                            example: "john@example.com",
                        },
                        type: { type: "string", example: "user" },
                        password: {
                            type: "string",
                            example: "securepassword",
                        },
                    },
                },
                UpdateUser: {
                    type: "object",
                    properties: {
                        name: { type: "string", example: "John Doe" },
                        email: {
                            type: "string",
                            format: "email",
                            example: "john@example.com",
                        },
                        type: { type: "string", example: "user" },
                        password: {
                            type: "string",
                            example: "newpassword",
                        },
                    },
                },
            },
        },
    },
    apis: ["./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
