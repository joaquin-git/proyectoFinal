const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Envía un correo de confirmación de reserva
 * @param {string} to - Email del destinatario
 * @param {object} datos - Datos de la reserva (nombre, deporte, pista, fecha, hora, precio, instalacion)
 */
async function enviarConfirmacionReserva(to, datos) {
    const { nombre, deporte, pista, fecha, hora, precio, instalacion } = datos;

    const mailOptions = {
        from: `"SportSpace" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: '¡Tu reserva en SportSpace ha sido confirmada!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #2ECC71; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">¡Reserva Confirmada!</h1>
                </div>
                <div style="padding: 30px; color: #333;">
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Tu reserva se ha realizado con éxito. Aquí tienes todos los detalles:</p>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
                        <p style="margin: 5px 0;"><strong>Deporte:</strong> ${deporte}</p>
                        <p style="margin: 5px 0;"><strong>Instalación:</strong> ${instalacion || 'No especificada'}</p>
                        <p style="margin: 5px 0;"><strong>Pista:</strong> ${pista}</p>
                        <p style="margin: 5px 0;"><strong>Fecha:</strong> ${fecha}</p>
                        <p style="margin: 5px 0;"><strong>Hora:</strong> ${hora}</p>
                        <p style="margin: 5px 0;"><strong>Precio:</strong> ${precio}</p>
                    </div>

                    <p style="margin-top: 30px;">¡Gracias por confiar en <strong>SportSpace</strong>!</p>
                    <p>Si tienes alguna duda, puedes contactarnos a través de nuestra aplicación.</p>
                </div>
                <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                    <p>&copy; 2026 SportSpace. Todos los derechos reservados.</p>
                </div>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error al enviar correo:', error);
        return false;
    }
}

/**
 * Envía un correo de bienvenida tras el registro
 * @param {string} to - Email del destinatario
 * @param {string} nombre - Nombre del usuario
 */
async function enviarBienvenida(to, nombre) {
    const mailOptions = {
        from: `"SportSpace" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: '¡Bienvenido a SportSpace!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #2ECC71; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">¡Bienvenido a SportSpace!</h1>
                </div>
                <div style="padding: 30px; color: #333;">
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Estamos encantados de tenerte con nosotros. Tu cuenta ha sido creada con éxito.</p>
                    <p>Desde ahora podrás reservar tus pistas de deporte favoritas, comprar equipamiento en nuestra tienda y participar en nuestros eventos.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="font-style: italic;">"Lleva tu pasión al siguiente nivel"</p>
                    </div>

                    <p style="margin-top: 30px;">¡Gracias por unirte a <strong>SportSpace</strong>!</p>
                </div>
                <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                    <p>&copy; 2026 SportSpace. Todos los derechos reservados.</p>
                </div>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo de bienvenida enviado: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error al enviar correo de bienvenida:', error);
        return false;
    }
}

module.exports = {
    enviarConfirmacionReserva,
    enviarBienvenida
};
