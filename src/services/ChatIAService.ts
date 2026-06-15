import { serverConfig } from '../config/serverConfig';

export class ChatIAService {
  async sendMessage(msg: string): Promise<any> {
    try {
      const base = await serverConfig.getBaseUrl();
      const contextPrompt = "Actúa estrictamente como el Entrenador Personal y Asistente Virtual exclusivo del complejo deportivo SportSpaceJMG. Ofrece rutinas de entrenamiento, consejos de salud deportiva, calentamientos específicos para tenis, pádel o natación, y asiste de manera amable con la información del centro.";
      
      const res = await fetch(`${base}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: msg,
          systemPrompt: contextPrompt
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat error');
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}