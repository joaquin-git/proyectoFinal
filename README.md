# SportSpace

Aplicación móvil para la gestión de un complejo deportivo. Permite a los usuarios consultar instalaciones, reservar pistas, comprar productos y gestionar su perfil. Incluye un panel de administración para gestionar usuarios, productos e instalaciones desde la propia app.

---

## Descripción

SportSpace es una aplicación desarrollada con React Native y Expo que conecta con un backend propio en Node.js y una base de datos MySQL. La arquitectura sigue el patrón **MVVM (Model-View-ViewModel)**, separando completamente la lógica de negocio de la interfaz de usuario.

**Funcionalidades principales:**

- Registro e inicio de sesión de usuarios con contraseñas cifradas (bcrypt)
- Recuperación de contraseña por email con código de verificación de 6 dígitos
- Catálogo de instalaciones deportivas con navegación a mapas
- Reserva de pistas con disponibilidad en tiempo real por día y hora
- Tienda de productos con carrito, filtros por categoría y selección de talla/color
- Badge "Sin stock" en productos agotados con botón de añadir desactivado
- Valoraciones y reseñas de productos con puntuación por estrellas (1–5 estrellas, un voto por usuario por producto)
- Valoraciones y reseñas de instalaciones deportivas (misma mecánica, botón "Valorar" en cada centro)
- Vista de favoritos en la tienda: botón de corazón en el header para filtrar solo los productos guardados
- Productos favoritos sincronizados con el servidor (caché local en AsyncStorage + BD)
- Historial de compras con gestión de devoluciones
- Pasarela de pago (tarjeta de crédito y Bizum)
- Perfil de usuario con edición de datos y foto
- Asistente virtual con respuestas automáticas y fallback offline
- Minijuego integrado mediante WebView
- Tema oscuro y claro
- Panel de administración con CRUD completo de usuarios, productos e instalaciones
- Dashboard de administración con métricas en tiempo real
- Admin: visor de valoraciones de productos e instalaciones (solo lectura, con media y reseñas por usuario)

**Notificaciones por email:**

- Bienvenida al registrarse
- Confirmación de reserva de pista
- Cancelación de reserva
- Confirmación de compra con desglose de productos
- Confirmación de devolución con importe a reembolsar
- Código de verificación para recuperación de contraseña

**Calidad y experiencia de usuario:**

- Skeleton loaders animados mientras cargan los datos
- Toasts/notificaciones flotantes para feedback de acciones (animación corregida: sin parpadeo doble)
- Estados de error con botón de reintentar
- Pull to refresh en pantallas de datos
- Todos los mensajes de validación en español
- Mensaje de error legible si MySQL no está en ejecución al arrancar el backend

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
| bcrypt | ^5.x |
| dotenv | ^17.4.2 |

---

## Arquitectura MVVM

El proyecto sigue el patrón **Model-View-ViewModel** de forma estricta:

| Capa | Ubicación | Responsabilidad |
|---|---|---|
| **Model** | `src/models/` | Interfaces y tipos TypeScript |
| **Service** | `src/services/` | Llamadas a la API y AsyncStorage |
| **ViewModel** | `src/viewmodels/` | Lógica de negocio, estado derivado y acciones |
| **View** | `src/pantallas/` | Renderizado puro, solo estado de UI |

Las pantallas no realizan llamadas a la API directamente — toda la lógica pasa por el ViewModel correspondiente.

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
    ├── componentes/        Componentes UI reutilizables (Toolbar, SkeletonCard, ErrorState...)
    ├── config/             Configuración dinámica de la URL del servidor
    ├── contexto/           Estado global con React Context (reservas, tema, toasts)
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

### 4. Configurar la base de datos y el email

Crea un archivo `.env` dentro de `backend/` con las siguientes variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=sportspace_db
PORT=3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

> Para el envío de emails con Gmail necesitas una **contraseña de aplicación**: activa la verificación en 2 pasos en tu cuenta de Google y genera una en *Seguridad → Contraseñas de aplicaciones*.

La base de datos y las tablas se crean automáticamente al arrancar el servidor por primera vez.

### 5. Configurar la IP del servidor (dispositivo físico)

Si usas un dispositivo físico en lugar de un emulador, edita `src/config/serverConfig.ts` y reemplaza la IP en `development_network.url` con la IP local de tu máquina. Asegúrate de que el móvil y el PC estén en la misma red WiFi.

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
