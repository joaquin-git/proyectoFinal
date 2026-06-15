const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'sportspace_db'
    });

    try {
        console.log('Verificando columna rol...');
        try {
            await pool.query('ALTER TABLE usuarios ADD COLUMN rol VARCHAR(20) DEFAULT "user"');
            console.log('Columna rol añadida.');
        } catch (e) {
            console.log('La columna rol ya existe.');
        }

        const [adminExists] = await pool.query('SELECT id FROM usuarios WHERE usuario = "admin"');
        if (adminExists.length === 0) {
            await pool.query('INSERT INTO usuarios (nombre, usuario, email, contrasena, rol) VALUES (?, ?, ?, ?, ?)', 
                ['Administrador', 'admin', 'admin@sportspace.com', 'admin', 'admin']);
            console.log('Usuario administrador creado con éxito.');
        } else {
            console.log('El usuario administrador ya existe.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
