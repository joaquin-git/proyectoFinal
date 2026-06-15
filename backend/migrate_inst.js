/**
 * SCRIPT DE MIGRACIÓN DE INSTALACIONES (migrate_inst.js)
 * Este archivo se usa para actualizar la estructura de la base de datos
 * añadiendo la columna de imagen a la tabla de instalaciones y asignando una por defecto.
 */

const mysql = require('mysql2/promise'); // Importa el módulo para conectarse a MySQL

// Función principal asíncrona
async function run() {
    // Crea un pool de conexiones, ideal para manejar múltiples consultas eficientemente
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'sportspace_db'
    });

    try {
        console.log('Verificando columna imagen en instalaciones...');
        try {
            // Intenta añadir la columna 'imagen' a la tabla 'instalaciones'
            // TEXT permite almacenar URLs largas de imágenes
            await pool.query('ALTER TABLE instalaciones ADD COLUMN imagen TEXT');
            console.log('Columna imagen añadida.');
        } catch (e) {
            // Si el comando falla (generalmente porque la columna ya existe), lo captura aquí
            console.log('La columna imagen ya existe.');
        }

        // Definimos una URL de imagen genérica por defecto de Unsplash
        const defaultImg = "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=1000";
        
        // Actualiza las instalaciones que no tengan imagen o la tengan vacía, asignándoles la imagen por defecto
        await pool.query('UPDATE instalaciones SET imagen = ? WHERE imagen IS NULL OR imagen = ""', [defaultImg]);
        console.log('Imágenes de instalaciones actualizadas.');
    } catch (err) {
        // Captura cualquier otro error general
        console.error('Error:', err);
    } finally {
        await pool.end(); // Cierra el pool de conexiones al finalizar
    }
}

run(); // Ejecuta el script
