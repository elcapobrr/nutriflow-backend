# NutriFlow Backend

Backend API para NutriFlow AI con autenticación OAuth y MySQL.

## Stack Tecnológico

- Node.js + Express
- MySQL (Railway/PlanetScale)
- Passport.js (Google OAuth)
- JWT Authentication
- bcrypt para passwords

## Instalación Rápida

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

## Endpoints de API

### Autenticación
- `GET /auth/google` - Iniciar login con Google
- `GET /auth/google/callback` - Callback de Google OAuth
- `GET /auth/me` - Obtener usuario actual
- `POST /auth/logout` - Cerrar sesión

### Usuario
- `GET /api/users/profile` - Obtener perfil nutricional
- `POST /api/users/profile` - Actualizar perfil nutricional

### Alimentos
- `GET /api/foods` - Listar comidas del usuario
- `POST /api/foods` - Añadir comida
- `DELETE /api/foods/:id` - Eliminar comida

## Configuración

Ver `SETUP.md` para guía completa de configuración.

## Scripts

- `npm start` - Producción
- `npm run dev` - Desarrollo con nodemon

## Estructura

```
backend/
├── config/         # Configuración (DB, Passport)
├── routes/         # Rutas de la API
├── middleware/     # Middleware (auth)
├── database/       # SQL schemas
├── server.js       # Entry point
└── package.json
```
