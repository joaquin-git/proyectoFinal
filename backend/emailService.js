const nodemailer = require('nodemailer');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false }
});

const estiloBase = (contenido) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #2ECC71; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SportSpace</h1>
        </div>
        <div style="padding: 30px; color: #333;">
            ${contenido}
        </div>
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>&copy; 2026 SportSpace. Todos los derechos reservados.</p>
        </div>
    </div>`;

const enviar = async (to, subject, html) => {
    const info = await transporter.sendMail({
        from: `"SportSpace" <${process.env.EMAIL_USER}>`,
        to, subject, html
    });
    console.log('Correo enviado a', to, ':', info.response);
    return true;
};

async function enviarBienvenida(to, nombre) {
    const html = estiloBase(`
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Estamos encantados de tenerte con nosotros. Tu cuenta ha sido creada con éxito.</p>
        <p>Desde ahora podrás reservar tus pistas de deporte favoritas, comprar equipamiento en nuestra tienda y participar en nuestros eventos.</p>
        <div style="text-align: center; margin-top: 30px;">
            <p style="font-style: italic;">"Lleva tu pasión al siguiente nivel"</p>
        </div>
        <p style="margin-top: 30px;">¡Gracias por unirte a <strong>SportSpace</strong>!</p>
    `);
    return enviar(to, '¡Bienvenido a SportSpace!', html);
}

async function enviarConfirmacionReserva(to, datos) {
    const { nombre, deporte, pista, fecha, hora, precio, instalacion } = datos;
    const html = estiloBase(`
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Tu reserva se ha realizado con éxito. Aquí tienes todos los detalles:</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 5px 0;"><strong>Deporte:</strong> ${deporte}</p>
            <p style="margin: 5px 0;"><strong>Instalación:</strong> ${instalacion || 'Centro Deportivo'}</p>
            <p style="margin: 5px 0;"><strong>Pista:</strong> ${pista}</p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${fecha}</p>
            <p style="margin: 5px 0;"><strong>Hora:</strong> ${hora}</p>
            <p style="margin: 5px 0;"><strong>Precio:</strong> ${precio}</p>
        </div>
        <p style="margin-top: 30px;">¡Te esperamos en la pista!</p>
    `);
    return enviar(to, '¡Tu reserva en SportSpace ha sido confirmada!', html);
}

async function enviarCancelacionReserva(to, datos) {
    const { nombre, deporte, pista, fecha, hora } = datos;
    const html = estiloBase(`
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Tu reserva ha sido <strong>cancelada</strong> correctamente.</p>
        <div style="background-color: #fff3f3; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #FF4444;">
            <p style="margin: 5px 0;"><strong>Deporte:</strong> ${deporte}</p>
            <p style="margin: 5px 0;"><strong>Pista:</strong> ${pista}</p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${fecha}</p>
            <p style="margin: 5px 0;"><strong>Hora:</strong> ${hora}</p>
        </div>
        <p style="margin-top: 20px;">Si deseas hacer una nueva reserva, puedes hacerlo desde la aplicación en cualquier momento.</p>
    `);
    return enviar(to, 'Reserva cancelada en SportSpace', html);
}

async function enviarConfirmacionCompra(to, datos) {
    const { nombre, productos, total, metodoPago, fecha } = datos;
    const productosHtml = productos.map(p =>
        `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.nombre}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${p.precio.toFixed(2)}€</td>
        </tr>`
    ).join('');
    const html = estiloBase(`
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>¡Gracias por tu compra! Tu pedido ha sido procesado correctamente.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr style="background-color: #f9f9f9;">
                    <th style="padding: 10px; text-align: left;">Producto</th>
                    <th style="padding: 10px; text-align: right;">Precio</th>
                </tr>
            </thead>
            <tbody>${productosHtml}</tbody>
            <tfoot>
                <tr>
                    <td style="padding: 10px; font-weight: bold;">TOTAL</td>
                    <td style="padding: 10px; font-weight: bold; text-align: right; color: #2ECC71;">${total.toFixed(2)}€</td>
                </tr>
            </tfoot>
        </table>
        <p style="margin-top: 20px;"><strong>Método de pago:</strong> ${metodoPago}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p style="margin-top: 20px;">Tu pedido llegará en un plazo de 48-72 horas laborables.</p>
    `);
    return enviar(to, '¡Compra confirmada en SportSpace!', html);
}

async function enviarConfirmacionDevolucion(to, datos) {
    const { nombre, productos, total, fecha } = datos;
    const html = estiloBase(`
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Hemos procesado tu devolución correctamente.</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 5px 0;"><strong>Productos devueltos:</strong> ${productos}</p>
            <p style="margin: 5px 0;"><strong>Importe a reembolsar:</strong> <span style="color: #2ECC71; font-weight: bold;">${total.toFixed(2)}€</span></p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${fecha}</p>
        </div>
        <p style="margin-top: 20px;">El reembolso se procesará en un plazo de 3-5 días laborables.</p>
    `);
    return enviar(to, 'Devolución procesada en SportSpace', html);
}

async function enviarRecuperacionContrasena(to, datos) {
    const { nombre, codigo } = datos;
    const html = estiloBase(`
        <p>Hola <strong>${nombre || 'usuario'}</strong>,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p>Usa el siguiente código de verificación en la aplicación:</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #2ECC71; background: #f0fff4; padding: 15px 25px; border-radius: 10px; border: 2px dashed #2ECC71;">
                ${codigo}
            </span>
        </div>
        <p style="color: #888; font-size: 13px;">Este código expira en <strong>15 minutos</strong>. Si no solicitaste este cambio, ignora este correo.</p>
    `);
    return enviar(to, 'Recuperación de contraseña - SportSpace', html);
}

module.exports = {
    enviarBienvenida,
    enviarConfirmacionReserva,
    enviarCancelacionReserva,
    enviarConfirmacionCompra,
    enviarConfirmacionDevolucion,
    enviarRecuperacionContrasena,
};
