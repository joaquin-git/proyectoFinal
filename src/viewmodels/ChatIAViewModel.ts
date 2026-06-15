import { useState } from 'react';
import { ChatIAService } from '../services/ChatIAService';

export interface Mensaje {
  id: string;
  texto: string;
  esUsuario: boolean;
  timestamp: Date;
}

const respuestaOffline = (texto: string): string => {
  const t = texto.toLowerCase();
  if (t.includes('pala') || t.includes('carbon'))
    return 'Tenemos la Pala Padel Carbon por 129.00€. Es de alta gama y muy ligera.';
  if (t.includes('pelota') || t.includes('bola'))
    return 'Disponemos de botes de pelotas de Tenis Pro (5.99€) y Pádel Gold (4.50€).';
  if (t.includes('camiseta') || t.includes('ropa'))
    return 'Tenemos Camisetas Dry (19.99€) y Térmicas (25.00€). También pantalones cortos por 22.00€. ¿Buscas alguna talla específica?';
  if (t.includes('balon') || t.includes('pelota futbol'))
    return 'Tenemos balones de Fútbol Sala Élite (24.50€) y Fútbol 7 (15.00€).';
  if (t.includes('raqueta'))
    return 'Nuestra Raqueta Tenis Control cuesta 155.00€. También tenemos fundas para raqueta por 30.50€.';
  if (t.includes('talla'))
    return 'Nuestra guía de tallas incluye XS, S, M, L y XL. En el menú de ayuda tienes una tabla detallada.';
  if (t.includes('devolucion') || t.includes('devolver'))
    return 'Las devoluciones son gratuitas durante 30 días. El producto debe estar sin usar.';
  if (t.includes('envio') || t.includes('llega'))
    return 'Los envíos suelen tardar entre 48 y 72 horas laborables.';
  if (t.includes('hola'))
    return '¡Hola! ¿Cómo puedo ayudarte con tus compras o reservas hoy?';
  return `Lo siento, no entiendo bien tu consulta sobre "${texto}". Prueba a preguntarme sobre productos, tallas o envíos.`;
};

const SALUDO_INICIAL: Mensaje = {
  id: '1',
  texto: '¡Hola! Soy el asistente virtual de SportSpace. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre productos, tallas, devoluciones o envíos.',
  esUsuario: false,
  timestamp: new Date()
};

export const useChatIAViewModel = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([SALUDO_INICIAL]);
  const [escribiendo, setEscribiendo] = useState(false);
  const service = new ChatIAService();

  const enviarMensaje = async (texto: string) => {
    if (texto.trim() === '') return;

    const msgUsuario: Mensaje = {
      id: Date.now().toString(),
      texto,
      esUsuario: true,
      timestamp: new Date()
    };
    setMensajes(prev => [...prev, msgUsuario]);
    setEscribiendo(true);

    const resp = await service.sendMessage(texto);
    const textoRespuesta =
      resp && (resp.reply || resp.answer || resp.message || resp.data)
        ? resp.reply || resp.answer || resp.message || resp.data
        : respuestaOffline(texto);

    setTimeout(() => {
      const msgIA: Mensaje = {
        id: (Date.now() + 1).toString(),
        texto: textoRespuesta,
        esUsuario: false,
        timestamp: new Date()
      };
      setMensajes(prev => [...prev, msgIA]);
      setEscribiendo(false);
    }, 1500);
  };

  return { mensajes, escribiendo, enviarMensaje };
};
