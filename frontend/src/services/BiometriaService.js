// frontend/src/services/BiometriaService.js

const API_URL = import.meta.env.VITE_BIOMETRIA_API_URL || 'http://localhost:4000';

class BiometriaService {
    /**
     * Verifica se o Agente Local está rodando e qual o status.
     * Útil para mostrar um indicador na UI antes mesmo de tentar capturar.
     */
    async checkStatus() {
        try {
            const response = await fetch(`${API_URL}/status`);
            if (!response.ok) throw new Error('Serviço indisponível');
            return await response.json();
        } catch (error) {
            // Retorna offline em vez de estourar erro, facilitando a UI
            return { status: 'offline', error: error.message };
        }
    }

    /**
     * Solicita a captura da digital ao driver.
     * @returns {Promise<{template: string, image: string}>}
     */
    async capturar() {
        try {
            const response = await fetch(`${API_URL}/capturar-digital`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erro desconhecido na leitura');
            }

            return {
                template: data.template, // O hash para salvar no SQL Server
                image: data.image,       // A imagem Base64 para mostrar na tela
                metadata: data.metadata  // Info do dispositivo (opcional)
            };
        } catch (error) {
            // Padroniza o erro para o Frontend tratar
            throw new Error(
                error.message === 'Failed to fetch'
                    ? 'Não foi possível conectar ao Leitor. Verifique se o driver está rodando.'
                    : error.message
            );
        }
    }
}

export default new BiometriaService();