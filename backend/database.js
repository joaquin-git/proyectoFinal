/**
 * CONFIGURACIÓN DE LA BASE DE DATOS Y GESTIÓN DE TABLAS (MySQL)
 * Este archivo se encarga de conectar con el servidor MySQL, crear la base de datos si no existe,
 * definir las tablas necesarias para la app y rellenarlas con datos iniciales de prueba.
 */

const mysql = require('mysql2/promise');

// Configuración de conexión al servidor MySQL (Localhost en este caso)
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'sportspace_db'
};

// Pool de conexiones para gestionar múltiples peticiones de forma eficiente
let pool;

/**
 * Función principal que inicializa todo el entorno de datos
 */
async function initDB() {
    console.log("Conectando al servidor MySQL...");
    try {
        // Primera conexión para asegurar que la base de datos existe
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root'
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS sportspace_db');
        await connection.end();

        // Creamos el pool apuntando ya a nuestra base de datos específica
        pool = mysql.createPool(dbConfig);

        console.log('Conectado a la base de datos MySQL (sportspace_db). Creando tablas si no existen...');

        // --- DEFINICIÓN DE TABLAS ---

        // 1. Tabla Usuarios: Almacena credenciales, perfil y foto (en Base64)
        // Usamos VARCHAR(255) para strings normales y MEDIUMTEXT para fotos en base64 (que ocupan mucho)
        await pool.query(`CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255),
            usuario VARCHAR(255) UNIQUE,
            email VARCHAR(255) UNIQUE,
            contrasena VARCHAR(255),
            foto TEXT,
            telefono VARCHAR(50),
            direccion TEXT
        )`);

        // Actualizaciones automáticas de columnas si la tabla ya existía (migraciones rápidas)
        try {
            await pool.query('ALTER TABLE usuarios ADD COLUMN rol VARCHAR(20) DEFAULT "user"');
        } catch (e) { /* Columna ya existe */ }

        try {
            await pool.query('ALTER TABLE usuarios MODIFY COLUMN foto MEDIUMTEXT');
        } catch (e) { /* Columna ya modificada o error */ }

        // 2. Tabla Instalaciones: Centros deportivos con coordenadas para el mapa
        // latitud y longitud son FLOAT para poder posicionarlos en el mapa de Google
        await pool.query(`CREATE TABLE IF NOT EXISTS instalaciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255),
            latitud FLOAT,
            longitud FLOAT,
            direccion TEXT,
            deportes TEXT, -- Guardamos la lista de deportes como un string JSON
            horario VARCHAR(100),
            puntuacion VARCHAR(10),
            web TEXT,
            instagram TEXT,
            imagen TEXT
        )`);

        // 3. Tabla Productos (Tienda): Catálogo de artículos disponibles
        await pool.query(`CREATE TABLE IF NOT EXISTS productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255),
            descripcion TEXT,
            precio DECIMAL(10, 2), -- DECIMAL para evitar errores de precisión en moneda
            stock INT,
            imagen TEXT,
            categoria VARCHAR(100)
        )`);

        // 4. Tabla Reservas: Registro de citas en pistas deportivas
        // Relacionada con usuarios e instalaciones mediante Claves Foráneas (FK)
        await pool.query(`CREATE TABLE IF NOT EXISTS reservas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT,
            instalacion_id INT,
            deporte VARCHAR(100),
            pista VARCHAR(100),
            fecha VARCHAR(50),
            hora VARCHAR(50),
            precio VARCHAR(50),
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE, -- Si se borra el usuario, se borran sus reservas
            FOREIGN KEY(instalacion_id) REFERENCES instalaciones(id) ON DELETE SET NULL
        )`);

        // 5. Tabla Compras: Historial de pedidos de la tienda
        await pool.query(`CREATE TABLE IF NOT EXISTS compras (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT,
            producto_id INT,
            cantidad INT,
            fecha VARCHAR(50),
            total DECIMAL(10, 2),
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY(producto_id) REFERENCES productos(id) ON DELETE CASCADE
        )`);

        // 6. Tabla Recuperaciones: Códigos temporales para recuperar contraseña
        await pool.query(`CREATE TABLE IF NOT EXISTS recuperaciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255),
            codigo VARCHAR(6),
            expira DATETIME,
            usado TINYINT DEFAULT 0
        )`);

        // 7. Tabla Valoraciones: Puntuaciones y comentarios de productos
        await pool.query(`CREATE TABLE IF NOT EXISTS valoraciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT,
            producto_id INT,
            puntuacion INT,
            comentario TEXT,
            fecha VARCHAR(50),
            UNIQUE KEY unica_valoracion (usuario_id, producto_id),
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY(producto_id) REFERENCES productos(id) ON DELETE CASCADE
        )`);

        // 8. Tabla Favoritos: Productos guardados por cada usuario
        await pool.query(`CREATE TABLE IF NOT EXISTS favoritos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT,
            producto_id INT,
            UNIQUE KEY unico_favorito (usuario_id, producto_id),
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY(producto_id) REFERENCES productos(id) ON DELETE CASCADE
        )`);

        // 9. Tabla Valoraciones de instalaciones
        await pool.query(`CREATE TABLE IF NOT EXISTS valoraciones_instalaciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT,
            instalacion_id INT,
            puntuacion INT,
            comentario TEXT,
            fecha VARCHAR(50),
            UNIQUE KEY unica_val_inst (usuario_id, instalacion_id),
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY(instalacion_id) REFERENCES instalaciones(id) ON DELETE CASCADE
        )`);

        // --- INSERCIÓN DE DATOS INICIALES (Solo si las tablas están vacías) ---

        // Usuarios por defecto (Test y Admin)
        const [users] = await pool.query('SELECT COUNT(*) AS count FROM usuarios');
        if (users[0].count === 0) {
            console.log('Insertando usuario de prueba...');
            await pool.query(`INSERT INTO usuarios (nombre, usuario, email, contrasena) VALUES (?, ?, ?, ?)`,
                ['Usuario Test', 'test', 'test@test.com', '1234']);
        }

        const [adminExists] = await pool.query('SELECT id FROM usuarios WHERE usuario = "admin"');
        if (adminExists.length === 0) {
            console.log('Insertando administrador...');
            await pool.query(`INSERT INTO usuarios (nombre, usuario, email, contrasena, rol) VALUES (?, ?, ?, ?, ?)`,
                ['Administrador', 'admin', 'admin@sportspace.com', 'admin', 'admin']);
        }

        // Catálogo de la tienda
        const [products] = await pool.query('SELECT COUNT(*) AS count FROM productos');
        if (products[0].count === 0) {
            console.log('Insertando productos de prueba...');
            const productosTest = [
                { id: 1, nombre: 'Bote Pelotas Tenis Pro', desc: 'Tenis', precio: 5.99, stock: 100, img: 'https://contents.mediadecathlon.com/m12484985/k$84cf359df538b035aab63d9ca206f902/picture.jpg' },
                { id: 2, nombre: 'Pala Padel Carbon', desc: 'Pádel', precio: 129.00, stock: 100, img: 'https://www.padelnuestro.com/media/catalog/product/1/1/113685-pala-adidas-metalbone-carbon-ctrl-3-4-ar1ca1u45-1500x1500-1_1.jpg' },
                { id: 3, nombre: 'Balón Fútbol Sala Élite', desc: 'Fútbol Sala', precio: 24.50, stock: 100, img: 'https://www.dondeporte.com/3557723-large_default/balon-futbol-sala-umbro-neo-swerve-futsal-blanco-azul-rojo-t4.jpg' },
                { id: 4, nombre: 'Camiseta Dry', desc: 'Ropa', precio: 19.99, stock: 100, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop' },
                { id: 5, nombre: 'Raqueta Tenis Control', desc: 'Tenis', precio: 155.00, stock: 100, img: 'https://www.tennis-point.es/cdn/shop/files/0060220312900000.jpg?crop=center&v=1774122774&width=2500' },
                { id: 6, nombre: 'Muñequeras Absorbentes', desc: 'Complementos', precio: 8.00, stock: 100, img: 'https://m.media-amazon.com/images/I/61kaqBwAKyL.jpg' },
                { id: 7, nombre: 'Bote Pelotas Pádel Gold', desc: 'Pádel', precio: 4.50, stock: 100, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMFgx9lmHibhiaiA7ShgDH1-Q4SLV8M3w7eg&s' },
                { id: 8, nombre: 'Guantes Portero Grip Pro', desc: 'Fútbol 7', precio: 45.00, stock: 100, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaIeV3LhAG6eiErPmOYjdr18AvelT9qyjW_A&s' },
                { id: 9, nombre: 'Calcetines', desc: 'Ropa', precio: 12.00, stock: 100, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuZbnowLD4YxFEdvMzz-FYl1H4KuEcmsAJeA&s' },
                { id: 10, nombre: 'Pantalón Corto Deporte', desc: 'Ropa', precio: 22.00, stock: 100, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThjuqfJMpZ3uEhLT5hDf3XXEq7amC76EyBJA&s' },
                { id: 11, nombre: 'Camiseta Térmica Deporte', desc: 'Ropa', precio: 25.00, stock: 100, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4ekbZhg9Or6ilKCScW3WfXa-EJWeBGVPoOQ&s' },
                { id: 12, nombre: 'Bote de Agua', desc: 'Complementos', precio: 9.99, stock: 100, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnMKs5F_SgfXwXsQuYq65yl5Pq_ZY1t7ZrqQ&s' },
                { id: 13, nombre: 'Funda Pala de Padel', desc: 'Pádel', precio: 30.00, stock: 100, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGWY0fIQQ2HX3soc1wy_Ixs6lXaUG65l7w1Q&s' },
                { id: 14, nombre: 'Funda Raqueta de Tenis', desc: 'Tenis', precio: 30.50, stock: 100, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ28zHRZI6AdZ0Na9ebXNuwpD6-6BQYX-IeMw&s' },
                { id: 15, nombre: 'Balón de futbol 7', desc: 'Fútbol 7', precio: 15.00, stock: 100, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgKW6cGTNmEJrn0k9b6xC5P_-p9uTMyXWjoA&s' }
            ];
            for (const p of productosTest) {
                await pool.query('INSERT INTO productos (id, nombre, descripcion, precio, stock, imagen) VALUES (?, ?, ?, ?, ?, ?)',
                    [p.id, p.nombre, p.desc, p.precio, p.stock, p.img]);
            }
        }

        // Listado de instalaciones originales
        const [insts] = await pool.query('SELECT COUNT(*) AS count FROM instalaciones');
        if (insts[0].count === 0) {
            console.log('Insertando instalaciones por defecto...');
            const instalaciones = [
                { nombre: 'Pádel Sport Granada Indoor', lat: 37.20234, lng: -3.63312, direccion: 'Calle Almuñécar, 14, Pol. Juncaril', deportes: ['Pádel'], horario: '09:00 - 23:30', puntuacion: '4.7', web: 'https://padelsportgranada.com/', instagram: 'https://www.instagram.com/padelsportgranada/' },
                { nombre: 'Complejo Deportivo Núñez Blanca', lat: 37.16132, lng: -3.59281, direccion: 'Calle Pedro Machuca, s/n, Zaidín', deportes: ['Tenis', 'Fútbol Sala', 'Natación'], horario: '07:30 - 22:30', puntuacion: '4.3', web: 'https://deportes.granada.org/index.php?pag=64', instagram: '' },
                { nombre: 'Estadio de la Juventud', lat: 37.18512, lng: -3.61205, direccion: 'Calle Camino de Ronda, 97', deportes: ['Pádel', 'Tenis', 'Fútbol 7', 'Atletismo'], horario: '08:00 - 22:30', puntuacion: '4.5', web: 'https://www.juntadeandalucia.es/organismos/culturaydeporte/areas/deporte/instalaciones/granada/estadio-juventud.html', instagram: '' },
                { nombre: 'Real Sociedad de Tenis Granada', lat: 37.16954, lng: -3.60951, direccion: 'Calle de la Sultana, s/n', deportes: ['Tenis', 'Pádel', 'Gimnasio'], horario: '08:00 - 22:00', puntuacion: '4.8', web: 'https://www.rstgranada.com/', instagram: '' },
                { nombre: 'Campus Tenis & Pádel (PTS)', lat: 37.14856, lng: -3.60052, direccion: 'Av. del Conocimiento, s/n (PTS)', deportes: ['Pádel', 'Tenis'], horario: '08:00 - 23:00', puntuacion: '4.6', web: 'https://campustenispadel.com/', instagram: 'https://www.instagram.com/campustenispadel/' },
                { nombre: 'Pádel Center Las Gabias', lat: 37.13501, lng: -3.66804, direccion: 'Calle de los Huertos, s/n, Las Gabias', deportes: ['Pádel'], horario: '09:00 - 23:00', puntuacion: '4.4', web: 'https://padelcenterlasgabias.com/', instagram: '' },
                { nombre: 'CD Inacua Antonio Prieto', lat: 37.19851, lng: -3.61552, direccion: 'Calle Carretera de Alfacar, s/n', deportes: ['Fútbol Sala', 'Pádel', 'Natación'], horario: '07:00 - 23:00', puntuacion: '4.2', web: 'https://www.inacua.com/antonio-prieto/', instagram: '' }
            ];
            for (const i of instalaciones) {
                await pool.query('INSERT INTO instalaciones (nombre, latitud, longitud, direccion, deportes, horario, puntuacion, web, instagram) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [i.nombre, i.lat, i.lng, i.direccion, JSON.stringify(i.deportes), i.horario, i.puntuacion, i.web, i.instagram]);
            }
        }

        console.log("Base de datos preparada con éxito!");
    } catch (err) {
        console.error('Error inicializando base de datos MySQL:', err.message);
    }
}

module.exports = {
    initDB,
    getPool: () => {
        if (!pool) throw new Error('No se pudo conectar con la base de datos. Asegúrate de que MySQL está en ejecución.');
        return pool;
    }
};
