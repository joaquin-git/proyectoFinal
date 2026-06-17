require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { initDB, getPool } = require('./database');
const {
    enviarConfirmacionReserva,
    enviarBienvenida,
    enviarCancelacionReserva,
    enviarConfirmacionCompra,
    enviarConfirmacionDevolucion,
    enviarRecuperacionContrasena
} = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sportspace_jwt_secret_2025';

// ── JWT HELPERS ───────────────────────────────────────────────────────────────

function generarTokens(usuario) {
    const payload = { id: usuario.id, email: usuario.email, rol: usuario.rol };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
    const refreshToken = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '7d' });
    return { token, refreshToken };
}

function verificarToken(req, res, next) {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Token requerido' });
    try {
        req.usuario = jwt.verify(auth.split(' ')[1], JWT_SECRET);
        next();
    } catch (e) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

// ── CORS Y BODY PARSER ────────────────────────────────────────────────────────

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

// ── RUTAS PÚBLICAS ────────────────────────────────────────────────────────────

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
        const hash = await bcrypt.hash(contrasena, 10);
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, usuario, email, contrasena, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, usuario, email, hash, telefono || null, dirStr]
        );
        const [newUser] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [result.insertId]);
        const u = newUser[0];
        if (u.direccion && u.direccion !== '[object Object]') {
            try { u.direccion = JSON.parse(u.direccion); } catch (e) {}
        }
        const { contrasena: _, ...userSinPassword } = u;
        const tokens = generarTokens(userSinPassword);
        enviarBienvenida(email, nombre).catch(e => console.log('Error enviando email:', e));
        res.status(201).json({ token: tokens.token, refreshToken: tokens.refreshToken, usuario: userSinPassword });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, contrasena } = req.body;
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ? OR usuario = ?',
            [email, email]
        );
        if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

        let user = rows[0];
        let match = false;

        if (user.contrasena.startsWith('$2b$')) {
            match = await bcrypt.compare(contrasena, user.contrasena);
        } else {
            match = contrasena === user.contrasena;
            if (match) {
                const hash = await bcrypt.hash(contrasena, 10);
                await pool.query('UPDATE usuarios SET contrasena = ? WHERE id = ?', [hash, user.id]);
            }
        }

        if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

        if (user.direccion && user.direccion !== '[object Object]') {
            try { user.direccion = JSON.parse(user.direccion); } catch (e) {}
        }
        const { contrasena: _, ...userSinPassword } = user;
        const tokens = generarTokens(userSinPassword);
        res.json({ token: tokens.token, refreshToken: tokens.refreshToken, usuario: userSinPassword });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ error: 'Refresh token requerido' });
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, JWT_SECRET);
        } catch (e) {
            return res.status(401).json({ error: 'Refresh token inválido o expirado' });
        }
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [decoded.id]);
        if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });
        const u = rows[0];
        if (u.direccion && u.direccion !== '[object Object]') {
            try { u.direccion = JSON.parse(u.direccion); } catch (e) {}
        }
        const { contrasena: _, ...userSinPassword } = u;
        const tokens = generarTokens(userSinPassword);
        res.json({ token: tokens.token, refreshToken: tokens.refreshToken, usuario: userSinPassword });
    } catch (err) { res.status(500).json({ error: err.message }); }
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

app.get('/api/valoraciones/:productoId', async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT v.*, u.nombre AS usuario_nombre
            FROM valoraciones v JOIN usuarios u ON v.usuario_id = u.id
            WHERE v.producto_id = ? ORDER BY v.id DESC
        `, [req.params.productoId]);
        const [[{ media }]] = await pool.query('SELECT AVG(puntuacion) AS media FROM valoraciones WHERE producto_id = ?', [req.params.productoId]);
        res.json({ valoraciones: rows, media: media ? parseFloat(media).toFixed(1) : null });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/valoraciones-instalaciones/:instalacionId', async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT v.*, u.nombre AS usuario_nombre
            FROM valoraciones_instalaciones v JOIN usuarios u ON v.usuario_id = u.id
            WHERE v.instalacion_id = ? ORDER BY v.id DESC
        `, [req.params.instalacionId]);
        const [[{ media }]] = await pool.query('SELECT AVG(puntuacion) AS media FROM valoraciones_instalaciones WHERE instalacion_id = ?', [req.params.instalacionId]);
        res.json({ valoraciones: rows, media: media ? parseFloat(media).toFixed(1) : null });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/recuperar-contrasena', async (req, res) => {
    try {
        const { email } = req.body;
        const pool = getPool();
        const [users] = await pool.query('SELECT id, nombre FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ error: 'Email no registrado' });
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const expira = new Date(Date.now() + 15 * 60 * 1000);
        await pool.query('DELETE FROM recuperaciones WHERE email = ?', [email]);
        await pool.query('INSERT INTO recuperaciones (email, codigo, expira) VALUES (?, ?, ?)', [email, codigo, expira]);
        try {
            await enviarRecuperacionContrasena(email, { nombre: users[0].nombre, codigo });
        } catch (emailErr) {
            console.error('❌ Error enviando email de recuperación:', emailErr.message);
            return res.status(500).json({ error: 'No se pudo enviar el email. Comprueba la configuración SMTP.' });
        }
        res.json({ mensaje: 'Código enviado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/recuperar-contrasena/verificar', async (req, res) => {
    try {
        const { email, codigo, nuevaContrasena } = req.body;
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM recuperaciones WHERE email = ? AND codigo = ? AND usado = 0 AND expira > NOW()',
            [email, codigo]
        );
        if (rows.length === 0) return res.status(400).json({ error: 'Código inválido o expirado' });
        const hashNueva = await bcrypt.hash(nuevaContrasena, 10);
        await pool.query('UPDATE usuarios SET contrasena = ? WHERE email = ?', [hashNueva, email]);
        await pool.query('UPDATE recuperaciones SET usado = 1 WHERE id = ?', [rows[0].id]);
        res.json({ mensaje: 'Contraseña actualizada' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── RUTAS PROTEGIDAS (requieren JWT) ─────────────────────────────────────────

app.put('/api/usuarios/:id', verificarToken, async (req, res) => {
    try {
        const { nombre, usuario, email, contrasena, telefono, direccion, foto } = req.body;
        const pool = getPool();
        const dirStr = direccion && typeof direccion === 'object' ? JSON.stringify(direccion) : direccion;
        let contrasenaFinal = contrasena;
        if (contrasena && !contrasena.startsWith('$2b$')) {
            contrasenaFinal = await bcrypt.hash(contrasena, 10);
        }
        await pool.query(
            'UPDATE usuarios SET nombre=?, usuario=?, email=?, contrasena=?, telefono=?, direccion=?, foto=? WHERE id=?',
            [nombre, usuario, email, contrasenaFinal, telefono, dirStr, foto, req.params.id]
        );
        res.json({ mensaje: 'Actualizado' });
    } catch (err) { res.status(500).send(); }
});

app.post('/api/reservas', verificarToken, async (req, res) => {
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

app.get('/api/reservas/:usuarioId', verificarToken, async (req, res) => {
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

app.put('/api/reservas/:id', verificarToken, async (req, res) => {
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

app.delete('/api/reservas/:id', verificarToken, async (req, res) => {
    try {
        const pool = getPool();
        const [reservaRows] = await pool.query(
            'SELECT r.*, u.email, u.nombre FROM reservas r LEFT JOIN usuarios u ON r.usuario_id = u.id WHERE r.id = ?',
            [req.params.id]
        );
        await pool.query('DELETE FROM reservas WHERE id = ?', [req.params.id]);
        if (reservaRows.length > 0 && reservaRows[0].email) {
            const r = reservaRows[0];
            enviarCancelacionReserva(r.email, {
                nombre: r.nombre, deporte: r.deporte, pista: r.pista, fecha: r.fecha, hora: r.hora
            }).catch(e => console.log('Error enviando email cancelación:', e));
        }
        res.json({ mensaje: 'Borrado' });
    } catch (err) { res.status(500).send(); }
});

app.post('/api/compras', verificarToken, async (req, res) => {
    try {
        const { usuario_id, producto_id, cantidad, fecha, total, metodoPago } = req.body;
        const pool = getPool();
        await pool.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, producto_id]);
        const [result] = await pool.query('INSERT INTO compras (usuario_id, producto_id, cantidad, fecha, total) VALUES (?,?,?,?,?)', [usuario_id, producto_id, cantidad, fecha, total]);
        Promise.all([
            pool.query('SELECT nombre, email FROM usuarios WHERE id=?', [usuario_id]),
            pool.query('SELECT nombre, precio FROM productos WHERE id=?', [producto_id])
        ]).then(([[u], [p]]) => {
            if (u && u.length > 0 && p && p.length > 0 && u[0].email) {
                enviarConfirmacionCompra(u[0].email, {
                    nombre: u[0].nombre,
                    productos: [{ nombre: p[0].nombre, precio: parseFloat(p[0].precio) }],
                    total: parseFloat(total),
                    metodoPago: metodoPago || 'Tarjeta',
                    fecha: fecha || new Date().toLocaleDateString('es-ES')
                }).catch(e => console.log('Error enviando email compra:', e));
            }
        }).catch(() => {});
        res.status(201).json({ id: result.insertId });
    } catch (err) { res.status(500).send(); }
});

app.delete('/api/compras/:id', verificarToken, async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT c.*, p.nombre as producto_nombre, p.precio as producto_precio, u.email, u.nombre as usuario_nombre FROM compras c LEFT JOIN productos p ON c.producto_id = p.id LEFT JOIN usuarios u ON c.usuario_id = u.id WHERE c.id = ?',
            [req.params.id]
        );

        if (rows.length > 0) {
            const c = rows[0];
            await pool.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [c.cantidad, c.producto_id]);
            await pool.query('DELETE FROM compras WHERE id = ?', [req.params.id]);
            if (c.email) {
                enviarConfirmacionDevolucion(c.email, {
                    nombre: c.usuario_nombre,
                    productos: `${c.producto_nombre} (x${c.cantidad})`,
                    total: parseFloat(c.total),
                    fecha: new Date().toLocaleDateString('es-ES')
                }).catch(e => console.log('Error enviando email devolución:', e));
            }
            res.json({ mensaje: 'Compra devuelta y stock restaurado' });
        } else {
            res.status(404).json({ error: 'Compra no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/valoraciones', verificarToken, async (req, res) => {
    try {
        const { usuario_id, producto_id, puntuacion, comentario, fecha } = req.body;
        const pool = getPool();
        await pool.query(
            'INSERT INTO valoraciones (usuario_id, producto_id, puntuacion, comentario, fecha) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE puntuacion=?, comentario=?, fecha=?',
            [usuario_id, producto_id, puntuacion, comentario, fecha, puntuacion, comentario, fecha]
        );
        res.status(201).json({ mensaje: 'Valoración guardada' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/valoraciones-instalaciones', verificarToken, async (req, res) => {
    try {
        const { usuario_id, instalacion_id, puntuacion, comentario, fecha } = req.body;
        const pool = getPool();
        await pool.query(
            'INSERT INTO valoraciones_instalaciones (usuario_id, instalacion_id, puntuacion, comentario, fecha) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE puntuacion=?, comentario=?, fecha=?',
            [usuario_id, instalacion_id, puntuacion, comentario, fecha, puntuacion, comentario, fecha]
        );
        res.status(201).json({ mensaje: 'Valoración guardada' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/favoritos/:usuarioId', verificarToken, async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT p.* FROM favoritos f JOIN productos p ON f.producto_id = p.id WHERE f.usuario_id = ?
        `, [req.params.usuarioId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/favoritos', verificarToken, async (req, res) => {
    try {
        const { usuario_id, producto_id } = req.body;
        const pool = getPool();
        await pool.query('INSERT IGNORE INTO favoritos (usuario_id, producto_id) VALUES (?, ?)', [usuario_id, producto_id]);
        res.status(201).json({ mensaje: 'Añadido a favoritos' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/favoritos/:usuarioId/:productoId', verificarToken, async (req, res) => {
    try {
        const pool = getPool();
        await pool.query('DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?', [req.params.usuarioId, req.params.productoId]);
        res.json({ mensaje: 'Eliminado de favoritos' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PANEL DE ADMINISTRACIÓN (rutas protegidas) ────────────────────────────────

app.get('/api/admin/estadisticas', verificarToken, async (req, res) => {
    try {
        const pool = getPool();
        const [[{ totalUsuarios }]] = await pool.query('SELECT COUNT(*) AS totalUsuarios FROM usuarios WHERE rol != "admin"');
        const [[{ totalReservas }]] = await pool.query('SELECT COUNT(*) AS totalReservas FROM reservas');
        const [[{ totalCompras }]] = await pool.query('SELECT COUNT(*) AS totalCompras FROM compras');
        const [[{ ingresosTotales }]] = await pool.query('SELECT COALESCE(SUM(total), 0) AS ingresosTotales FROM compras');
        const [reservasPorDeporte] = await pool.query('SELECT deporte, COUNT(*) AS total FROM reservas GROUP BY deporte ORDER BY total DESC');
        const [productosMasVendidos] = await pool.query(`
            SELECT p.nombre, SUM(c.cantidad) AS vendidos
            FROM compras c JOIN productos p ON c.producto_id = p.id
            GROUP BY p.id, p.nombre ORDER BY vendidos DESC LIMIT 5
        `);
        const [productosStockBajo] = await pool.query('SELECT id, nombre, stock FROM productos WHERE stock <= 10 ORDER BY stock ASC');
        res.json({ totalUsuarios, totalReservas, totalCompras, ingresosTotales, reservasPorDeporte, productosMasVendidos, productosStockBajo });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/usuarios', verificarToken, async (req, res) => {
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

app.delete('/api/admin/usuarios/:id', verificarToken, async (req, res) => {
    try {
        const pool = getPool();
        await pool.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/productos', verificarToken, async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, imagen, categoria } = req.body;
        const pool = getPool();
        await pool.query('INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria) VALUES (?,?,?,?,?,?)', [nombre, descripcion, precio, stock, imagen, categoria]);
        res.status(201).json({ mensaje: 'Producto creado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/productos/:id', verificarToken, async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, imagen, categoria } = req.body;
        const pool = getPool();
        await pool.query('UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, imagen=?, categoria=? WHERE id=?', [nombre, descripcion, precio, stock, imagen, categoria, req.params.id]);
        res.json({ mensaje: 'Actualizado' });
    } catch (err) { res.status(500).send(); }
});

app.delete('/api/admin/productos/:id', verificarToken, async (req, res) => {
    try {
        const pool = getPool();
        await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Eliminado' });
    } catch (err) { res.status(500).send(); }
});

app.post('/api/admin/instalaciones', verificarToken, async (req, res) => {
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

app.put('/api/admin/instalaciones/:id', verificarToken, async (req, res) => {
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

app.delete('/api/admin/instalaciones/:id', verificarToken, async (req, res) => {
    try {
        const pool = getPool();
        await pool.query('DELETE FROM instalaciones WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Eliminada' });
    } catch (err) { res.status(500).send(); }
});

// ── ARRANQUE ──────────────────────────────────────────────────────────────────

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
`);
    });
});
