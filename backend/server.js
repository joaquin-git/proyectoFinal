require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, getPool } = require('./database');
const { enviarConfirmacionReserva, enviarBienvenida } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const axios = require('axios');

async function extraerCoordenadasDeUrl(url) {
    try {
        const response = await axios.get(url, {
            maxRedirects: 5,
            validateStatus: (status) => status >= 200 && status < 400,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const finalUrl = response.request.res.responseUrl || url;
        const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const match = finalUrl.match(regex);
        if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        const queryRegex = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const queryMatch = finalUrl.match(queryRegex);
        if (queryMatch) return { lat: parseFloat(queryMatch[1]), lng: parseFloat(queryMatch[2]) };
        return null;
    } catch (error) {
        return null;
    }
}

app.use('/minijuego', express.static(path.join(__dirname, '../assets/minijuego'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.br')) {
      res.set('Content-Encoding', 'br');
      if (filePath.endsWith('.js.br')) res.set('Content-Type', 'application/javascript');
      else if (filePath.endsWith('.wasm.br')) res.set('Content-Type', 'application/wasm');
      else if (filePath.endsWith('.data.br')) res.set('Content-Type', 'application/octet-stream');
    } else if (filePath.endsWith('.gz')) {
      res.set('Content-Encoding', 'gzip');
      if (filePath.endsWith('.js.gz')) res.set('Content-Type', 'application/javascript');
      else if (filePath.endsWith('.wasm.gz')) res.set('Content-Type', 'application/wasm');
      else if (filePath.endsWith('.data.gz')) res.set('Content-Type', 'application/octet-stream');
    } else if (filePath.endsWith('.wasm')) {
      res.set('Content-Type', 'application/wasm');
    }
  }
}));

app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor accesible' });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, systemPrompt } = req.body;
        if (!message) return res.status(400).json({ error: 'Mensaje requerido' });

        const defaultPrompt = "Eres un asistente virtual de un complejo deportivo.";
        const finalSystemPrompt = systemPrompt || defaultPrompt;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: finalSystemPrompt },
                    { role: 'user', content: message }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const answer = response.data.choices[0].message.content;
        res.json({ reply: answer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al procesar la solicitud de IA' });
    }
});

app.post('/api/registro', async (req, res) => {
    try {
        const { nombre, usuario, email, contrasena, telefono, direccion } = req.body;
        const pool = getPool();
        const dirStr = direccion ? JSON.stringify(direccion) : null;
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, usuario, email, contrasena, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, usuario, email, contrasena, telefono || null, dirStr]
        );
        enviarBienvenida(email, nombre).catch(e => console.log('Error enviando email:', e));
        res.status(201).json({ id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, contrasena } = req.body;
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE (email = ? OR usuario = ?) AND contrasena = ?', 
            [email, email, contrasena]
        );
        if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
        
        let user = rows[0];
        if (user.direccion && user.direccion !== '[object Object]') {
            try { user.direccion = JSON.parse(user.direccion); } catch (e) {}
        }
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { nombre, usuario, email, contrasena, telefono, direccion, foto } = req.body;
        const pool = getPool();
        const dirStr = direccion && typeof direccion === 'object' ? JSON.stringify(direccion) : direccion;
        
        await pool.query(
            'UPDATE usuarios SET nombre=?, usuario=?, email=?, contrasena=?, telefono=?, direccion=?, foto=? WHERE id=?',
            [nombre, usuario, email, contrasena, telefono, dirStr, foto, req.params.id]
        );
        res.json({ mensaje: 'Actualizado' });
    } catch (err) { res.status(500).send(); }
});

app.get('/api/instalaciones', async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM instalaciones');
        const data = rows.map(r => ({ ...r, deportes: r.deportes ? JSON.parse(r.deportes) : [] }));
        res.json(data);
    } catch (err) { res.status(500).send(); }
});

app.get('/api/productos', async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM productos');
        res.json(rows);
    } catch (err) { res.status(500).send(); }
});

app.post('/api/reservas', async (req, res) => {
    try {
        const { usuario_id, instalacion_id, deporte, pista, fecha, hora, precio } = req.body;
        const pool = getPool();
        const [result] = await pool.query(
            'INSERT INTO reservas (usuario_id, instalacion_id, deporte, pista, fecha, hora, precio) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, instalacion_id, deporte, pista, fecha, hora, precio]
        );
        pool.query('SELECT nombre, email FROM usuarios WHERE id=?', [usuario_id]).then(([u]) => {
            if (u && u.length > 0 && u[0].email) {
                pool.query('SELECT nombre FROM instalaciones WHERE id=?', [instalacion_id]).then(([i]) => {
                    enviarConfirmacionReserva(u[0].email, {
                        nombre: u[0].nombre, deporte, pista, fecha, hora, precio, instalacion: i[0]?.nombre || 'Centro Deportivo'
                    }).catch(e => console.log('Error enviando email:', e));
                });
            }
        });
        res.status(201).json({ id: result.insertId });
    } catch (err) { res.status(500).send(); }
});

app.get('/api/reservas/ocupadas', async (req, res) => {
    try {
        const { instalacion_id, fecha, deporte } = req.query;
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT pista, hora, deporte FROM reservas WHERE instalacion_id = ? AND LOWER(TRIM(fecha)) = LOWER(TRIM(?)) AND deporte = ?',
            [instalacion_id, fecha, deporte]
        );
        res.json(rows);
    } catch (err) { res.status(500).send(); }
});

app.get('/api/reservas/:usuarioId', async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT r.*, i.nombre as centro_nombre, i.direccion as centro_direccion, i.imagen as centro_imagen
            FROM reservas r
            LEFT JOIN instalaciones i ON r.instalacion_id = i.id
            WHERE r.usuario_id = ?
            ORDER BY r.id DESC
        `, [req.params.usuarioId]);
        res.json(rows);
    } catch (err) { res.status(500).send(); }
});

app.put('/api/reservas/:id', async (req, res) => {
    try {
        const { instalacion_id, deporte, pista, fecha, hora, precio } = req.body;
        const pool = getPool();
        await pool.query(
            'UPDATE reservas SET instalacion_id=?, deporte=?, pista=?, fecha=?, hora=?, precio=? WHERE id=?',
            [instalacion_id, deporte, pista, fecha, hora, precio, req.params.id]
        );
        res.json({ mensaje: 'Reserva actualizada' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/reservas/:id', async (req, res) => {
    try {
        const pool = getPool();
        await pool.query('DELETE FROM reservas WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Borrado' });
    } catch (err) { res.status(500).send(); }
});

app.post('/api/compras', async (req, res) => {
    try {
        const { usuario_id, producto_id, cantidad, fecha, total } = req.body;
        const pool = getPool();
        await pool.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, producto_id]);
        const [result] = await pool.query('INSERT INTO compras (usuario_id, producto_id, cantidad, fecha, total) VALUES (?,?,?,?,?)', [usuario_id, producto_id, cantidad, fecha, total]);
        res.status(201).json({ id: result.insertId });
    } catch (err) { res.status(500).send(); }
});

app.delete('/api/compras/:id', async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT producto_id, cantidad FROM compras WHERE id = ?', [req.params.id]);
        
        if (rows.length > 0) {
            const { producto_id, cantidad } = rows[0];
            await pool.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [cantidad, producto_id]);
            await pool.query('DELETE FROM compras WHERE id = ?', [req.params.id]);
            res.json({ mensaje: 'Compra devuelta y stock restaurado' });
        } else {
            res.status(404).json({ error: 'Compra no encontrada' });
        }
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

app.get('/api/admin/usuarios', async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM usuarios');
        const data = rows.map(u => {
            if (u.direccion && u.direccion !== '[object Object]') {
                try { u.direccion = JSON.parse(u.direccion); } catch (e) {}
            }
            return u;
        });
        res.json(data);
    } catch (err) { res.status(500).send(); }
});

app.delete('/api/admin/usuarios/:id', async (req, res) => {
    try {
        const pool = getPool();
        await pool.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/productos', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, imagen, categoria } = req.body;
        const pool = getPool();
        await pool.query('INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria) VALUES (?,?,?,?,?,?)', [nombre, descripcion, precio, stock, imagen, categoria]);
        res.status(201).json({ mensaje: 'Producto creado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/productos/:id', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, imagen, categoria } = req.body;
        const pool = getPool();
        await pool.query('UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, imagen=?, categoria=? WHERE id=?', [nombre, descripcion, precio, stock, imagen, categoria, req.params.id]);
        res.json({ mensaje: 'Actualizado' });
    } catch (err) { res.status(500).send(); }
});

app.delete('/api/admin/productos/:id', async (req, res) => {
    try {
        const pool = getPool();
        await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Eliminado' });
    } catch (err) { res.status(500).send(); }
});

app.post('/api/admin/instalaciones', async (req, res) => {
    try {
        let { nombre, direccion, deportes, horario, puntuacion, web, instagram, imagen, latitud, longitud, googleMapsUrl } = req.body;
        if (googleMapsUrl && googleMapsUrl.startsWith('http')) {
            const coords = await extraerCoordenadasDeUrl(googleMapsUrl);
            if (coords) { latitud = coords.lat; longitud = coords.lng; }
        }
        const pool = getPool();
        await pool.query(
            'INSERT INTO instalaciones (nombre, direccion, deportes, horario, puntuacion, web, instagram, imagen, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, direccion, JSON.stringify(deportes), horario, puntuacion, web, instagram, imagen, latitud || 0, longitud || 0]
        );
        res.status(201).json({ mensaje: 'Instalación creada' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/instalaciones/:id', async (req, res) => {
    try {
        let { nombre, direccion, deportes, horario, puntuacion, web, instagram, imagen, latitud, longitud, googleMapsUrl } = req.body;
        if (googleMapsUrl && googleMapsUrl.startsWith('http')) {
            const coords = await extraerCoordenadasDeUrl(googleMapsUrl);
            if (coords) { latitud = coords.lat; longitud = coords.lng; }
        }
        const pool = getPool();
        await pool.query(
            'UPDATE instalaciones SET nombre=?, direccion=?, deportes=?, horario=?, puntuacion=?, web=?, instagram=?, imagen=?, latitud=?, longitud=? WHERE id=?',
            [nombre, direccion, JSON.stringify(deportes), horario, puntuacion, web, instagram, imagen, latitud, longitud, req.params.id]
        );
        res.json({ mensaje: 'Actualizada' });
    } catch (err) { res.status(500).send(); }
});

app.delete('/api/admin/instalaciones/:id', async (req, res) => {
    try {
        const pool = getPool();
        await pool.query('DELETE FROM instalaciones WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Eliminada' });
    } catch (err) { res.status(500).send(); }
});

function obtenerIPsLocales() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    const ips = [];
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push({ interfaz: name, ip: iface.address });
            }
        }
    }
    return ips;
}

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════════════╗
║    ✅ Servidor SportSpace ejecutándose                      ║
╚════════════════════════════════════════════════════════════╝

🔗 URLs de conexión:
   • Localhost:     http://localhost:${PORT}/api
   • Emulador Android: http://10.0.2.2:${PORT}/api

🌐 Direcciones IP locales (para otros dispositivos):
`);
        const ips = obtenerIPsLocales();
        if (ips.length > 0) {
            ips.forEach(({ interfaz, ip }) => {
                console.log(`   • ${interfaz}: http://${ip}:${PORT}/api`);
            });
        } else {
            console.log('   • No se encontraron interfaces de red locales');
        }
        console.log(`
💡 Para conectar desde otro dispositivo en la red:
   Reemplaza 192.168.X.X con tu IP local en Panel de Debug

🔍 Endpoint de prueba: GET /api/ping
`);
    });
});