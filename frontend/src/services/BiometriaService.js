const API_URL = import.meta.env.VITE_BIOMETRIA_API_URL || 'http://localhost:4000';
const DEFAULT_TIMEOUT = 10000; // 10 segundos para biometria (processamento é pesado)

class BiometriaService {
    /**
     * Helper para fetch com timeout
     */
    async fetchWithTimeout(resource, options = {}) {
        const { timeout = DEFAULT_TIMEOUT } = options;
        
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error('Tempo de resposta excedido. O scanner ou o driver podem estar ocupados.');
            }
            throw error;
        }
    }

    /**
     * Verifica se o backend (Node + Python) está online
     */
    async checkStatus() {
        try {
            const response = await this.fetchWithTimeout(`${API_URL}/status`, { timeout: 3000 });
            if (!response.ok) throw new Error("Offline");
            return await response.json();
        } catch (error) {
            console.warn("[Biometria] Serviço offline:", error);
            return { status: 'offline' };
        }
    }

    /**
     * USADO NO MODAL DE CADASTRO
     * Chama a rota que aciona o Python para extração de template.
     */
    async capturar() {
        try {
            console.log("[Biometria] Iniciando captura de cadastro...");
            const response = await this.fetchWithTimeout(`${API_URL}/capturar-cadastro`, { timeout: 15000 });
            
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMsg = data?.error || data?.message || `Erro do Servidor (${response.status})`;
                throw new Error(errorMsg);
            }

            if (!data.success) {
                throw new Error(data.error || 'Erro ao capturar digital.');
            }

            return {
                template: data.template_final,
                image: data.image_preview
            };
        } catch (error) {
            console.error("[Biometria] Falha na captura:", error);
            throw new Error(
                error.message.includes('Failed to fetch')
                    ? 'Serviço de biometria offline. Verifique se o driver está rodando.'
                    : error.message
            );
        }
    }

    /**
     * USADO NO MODAL DE ENTREGA DE EPI
     * Envia o template do banco para o backend comparar com o dedo atual.
     */
    async verificar(templateDoBanco) {
        if (!templateDoBanco) {
            throw new Error("Template biométrico do usuário não encontrado.");
        }

        try {
            console.log("[Biometria] Iniciando validação de entrega...");
            const response = await this.fetchWithTimeout(`${API_URL}/validar-entrega`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateSalvoNoBanco: templateDoBanco }),
                timeout: 12000
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMsg = data?.error || data?.msg || data?.message || `Erro na validação (${response.status})`;
                throw new Error(errorMsg);
            }

            if (!data.success) {
                throw new Error(data.error || data.msg || 'Erro na validação.');
            }

            return data.match;

        } catch (error) {
            console.error("[Biometria] Falha na validação:", error);
            throw new Error(
                error.message.includes('Failed to fetch')
                    ? 'Serviço offline. Valide manualmente.' 
                    : error.message
            );
        }
    }
}

export default new BiometriaService();