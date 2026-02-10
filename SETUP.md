# NutriFlow Backend - Guía de Configuración

## 🎯 Qué hemos creado

Un backend completo con:
- ✅ Node.js + Express
- ✅ MySQL (con Railway/PlanetScale)
- ✅ Google OAuth integrado
- ✅ JWT para autenticación
- ✅ API REST completa

---

## 📋 Pasos para Configurar

### 1️⃣ Crear Base de Datos MySQL en Railway (GRATIS)

1. Ve a: **https://railway.app**
2. Click en "Start a New Project"
3. Inicia sesión con GitHub
4. Click en "+ New" → "Database" → "Add MySQL"
5. Espera 30 segundos mientras se crea
6. Click en tu base de datos MySQL
7. Ve a la pestaña "Variables"
8. Copia estos valores:
   - `MYSQL_HOST`
   - `MYSQL_USER` (normalmente "root")
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_PORT`

### 2️⃣ Ejecutar el SQL para crear las tablas

1. En Railway, ve a la pestaña "Query"
2. Copia y pega todo el contenido de `backend/database/schema.sql`
3. Click en "Execute" o Ctrl+Enter

### 3️⃣ Crear archivo `.env` en el backend

1. En la carpeta `backend`, copia `.env.example` y renómbralo a `.env`
2. Rellena con tus datos de Railway:

```env
# Database (Copia de Railway)
DB_HOST=containers-us-west-XXX.railway.app
DB_USER=root
DB_PASSWORD=tu-password-de-railway
DB_NAME=railway
DB_PORT=6379

# JWT Secret (genera uno random)
JWT_SECRET=mi-secreto-super-seguro-123456

# Google OAuth (lo configuramos después)
GOOGLE_CLIENT_ID=pendiente
GOOGLE_CLIENT_SECRET=pendiente

# Session Secret
SESSION_SECRET=otra-clave-secreta-789

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server
PORT=3001
```

### 4️⃣ Instalar dependencias del backend

Abre una terminal en la carpeta `backend`:

```bash
cd C:\Users\Elias\Desktop\app\backend
npm install
```

### 5️⃣ Arrancar el backend

```bash
npm run dev
```

Deberías ver:
```
✅ MySQL connected successfully
🚀 Server running on http://localhost:3001
```

---

## 🔐 Configurar Google OAuth (Paso 6)

Ahora necesitas crear las credenciales de Google:

### 1. Ir a Google Cloud Console

1. Ve a: **https://console.cloud.google.com**
2. Crea un nuevo proyecto llamado "NutriFlow"
3. Ve a "APIs & Services" → "Credentials"
4. Click en "Create Credentials" → "OAuth Client ID"
5. Si te pide configurar "OAuth consent screen":
   - User Type: External
   - App name: NutriFlow AI
   - User support email: tu email
   - Developer contact: tu email
   - Guardar
6. Vuelve a "Create Credentials" → "OAuth Client ID"
7. Application type: **Web application**
8. Name: "NutriFlow Web"
9. Authorized redirect URIs:
   - Add: `http://localhost:3001/auth/google/callback`
10. Click "Create"
11. **Copia el Client ID y Client Secret**

### 2. Actualizar el `.env`

Pega las credenciales en tu archivo `.env`:

```env
GOOGLE_CLIENT_ID=123456-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
```

### 3. Reiniciar el backend

```bash
# Ctrl+C para detener
npm run dev
```

---

## ✅ Probar que funciona

Abre en el navegador:
- **Health check**: http://localhost:3001/health
- **Login con Google**: http://localhost:3001/auth/google

Si al hacer login con Google te redirige correctamente, ¡todo funciona! 🎉

---

## 🔄 Siguiente Paso

Ahora necesitamos **actualizar el frontend** para que use este backend en lugar de Supabase.

¿Todo claro hasta aquí?
