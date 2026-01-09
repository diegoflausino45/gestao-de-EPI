const API_URL = import.meta.env.VITE_BIOMETRIA_API_URL || 'http://localhost:4000';

class BiometriaService {
    /**
     * Verifica se o backend (Node + Python) está online
     */
    async checkStatus() {
        try {
            const response = await fetch(`${API_URL}/status`);
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
            // Chama a nova rota do Node.js que conversa com o Python
            const response = await fetch(`${API_URL}/capturar-cadastro`);
            
            // 1. Tenta ler o JSON primeiro, pois o backend envia detalhes mesmo em caso de erro (ex: 500)
            const data = await response.json().catch(() => null);

            // 2. Se o backend mandou um erro estruturado, usamos ele.
            if (!response.ok) {
                const errorMsg = data?.error || data?.message || `Erro do Servidor (${response.status})`;
                throw new Error(errorMsg);
            }

            if (!data.success) {
                throw new Error(data.error || 'Erro ao capturar digital.');
            }

            // Mapeia os nomes novos do backend para o que o seu Modal espera
            return {
                // O Modal espera 'template', o backend novo manda 'template_final'
                template: data.template_final,

                // O Modal espera 'image', o backend novo manda 'image_preview'
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
            const response = await fetch(`${API_URL}/validar-entrega`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateSalvoNoBanco: templateDoBanco })
            });

            // 1. Tenta ler o JSON primeiro
            const data = await response.json().catch(() => null);

            // 2. Prioriza a mensagem do backend em caso de erro HTTP
            if (!response.ok) {
                const errorMsg = data?.error || data?.msg || data?.message || `Erro na validação (${response.status})`;
                throw new Error(errorMsg);
            }

            if (!data.success) {
                // Erros de lógica do driver (ex: timeout, dedo não detectado)
                throw new Error(data.error || data.msg || 'Erro na validação.');
            }

            // Retorna true (match) ou false (no match)
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