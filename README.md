# SportSpace

Aplicación móvil para la gestión de un complejo deportivo. Permite a los usuarios consultar instalaciones, reservar pistas, comprar productos y gestionar su perfil. Incluye un panel de administración para gestionar usuarios, productos e instalaciones desde la propia app.

---

## Descripción

SportSpace es una aplicación desarrollada con React Native y Expo que conecta con un backend propio en Node.js y una base de datos MySQL. La arquitectura sigue el patrón **MVVM (Model-View-ViewModel)**, separando completamente la lógica de negocio de la interfaz de usuario.

**Funcionalidades principales:**

- Registro e inicio de sesión de usuarios
- Catálogo de instalaciones deportivas con navegación a mapas
- Reserva de pistas con disponibilidad en tiempo real por día y hora
- Tienda de productos con carrito, filtros por categoría y selección de talla/color
- Historial de compras con gestión de devoluciones
- Pasarela de pago (tarjeta de crédito y Bizum)
- Perfil de usuario con edición de datos y foto
- Asistente virtual con respuestas automáticas
- Minijuego integrado mediante WebView
- Tema oscuro y claro
- Panel de administración con CRUD completo de usuarios, productos e instalaciones

---

## Tecnologías

### Frontend

| Tecnología | Versión |
|---|---|
| React Native | 0.81.5 |
| Expo | ~54.0.31 |
| TypeScript | ~5.9.2 |
| React Navigation | ^7.x |
| AsyncStorage | 2.2.0 |
| Expo Image Picker | ~17.0.10 |
| React Native Maps | 1.20.1 |
| React Native WebView | ^13.16.1 |

### Backend

| Tecnología | Versión |
|---|---|
| Node.js | LTS |
| Express | ^5.2.1 |
| MySQL2 | ^3.20.0 |
| Nodemailer | ^8.0.6 |
| dotenv | ^17.4.2 |

---

## Estructura del proyecto

```
SportSpaceJMG/
├── assets/                 Imágenes y recursos estáticos
│   └── minijuego/          Build del minijuego (WebView)
├── backend/                Servidor Node.js + Express
│   ├── server.js           Punto de entrada y rutas de la API REST
│   ├── database.js         Conexión y esquema MySQL
│   └── emailService.js     Envío de correos con Nodemailer
├── servicios/
│   └── api.ts              Funciones de llamada a la API REST
└── src/
    ├── componentes/        Componentes UI reutilizables
    ├── config/             Configuración dinámica de la URL del servidor
    ├── contexto/           Estado global con React Context (reservas, tema)
    ├── estilos/            Definición del tema claro/oscuro y estilos globales
    ├── models/             Modelos de datos TypeScript
    ├── navegacion/         Configuración de navegadores (React Navigation)
    ├── pantallas/          Pantallas de la aplicación (vistas MVVM)
    │   └── admin/          Pantallas del panel de administración
    ├── services/           Capa de acceso a datos (API y AsyncStorage)
    ├── tipos/              Interfaces y tipos TypeScript
    ├── utils/              Funciones de utilidad
    └── viewmodels/         Lógica de negocio, estado y acciones por pantalla
```

---

## Instalación

### Requisitos previos

- Node.js (LTS)
- Expo CLI (`npm install -g expo-cli`)
- MySQL en ejecución local
- Expo Go en el dispositivo móvil (o emulador Android/iOS)

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd SportSpaceJMG
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 4. Configurar la base de datos

Asegúrate de tener MySQL corriendo y crea un archivo `.env` dentro de `backend/` con las siguientes variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=sportspace_db
PORT=3000
```

La base de datos y las tablas se crean automáticamente al arrancar el servidor por primera vez.

### 5. Configurar la IP del servidor (dispositivo físico)

Si usas un dispositivo físico en lugar de un emulador, edita `src/config/serverConfig.ts` y reemplaza la IP en `development_network.url` con la IP local de tu máquina.

---

## Comandos para arrancar

### Backend

```bash
cd backend
node server.js
```

El servidor queda disponible en `http://localhost:3000`.

### Frontend

Desde la raíz del proyecto:

```bash
npm start
```

Para plataformas específicas:

```bash
npm run android
npm run ios
npm run web
```

Escanea el QR con Expo Go o pulsa `a` / `i` en la terminal para abrir el emulador correspondiente.
