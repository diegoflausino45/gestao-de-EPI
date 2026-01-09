import React, { useEffect, useState, useRef } from 'react';
import styles from './styles.module.css';
import BiometriaService from '../../services/BiometriaService';
import { Fingerprint } from 'lucide-react'; // Usando ícone padrão da biblioteca

export default function BiometriaAuthModal({ isOpen, onClose, onSuccess, userTemplate, userName }) {
    const [status, setStatus] = useState('idle'); // idle, scanning, success, error
    const [message, setMessage] = useState('Posicione o dedo no leitor...');
    const hasScanned = useRef(false);

    useEffect(() => {
        if (isOpen && status === 'idle' && !hasScanned.current) {
            startScan();
        }
        
        // Reset ao fechar
        if (!isOpen) {
            setStatus('idle');
            setMessage('Posicione o dedo no leitor...');
            hasScanned.current = false;
        }
    }, [isOpen]);

    const startScan = async () => {
        if (!userTemplate) {
            setStatus('error');
            setMessage('Usuário sem biometria cadastrada. Impossível validar.');
            return;
        }

        setStatus('scanning');
        setMessage('Lendo biometria...');
        hasScanned.current = true;

        try {
            // Chama o serviço blindado
            const isMatch = await BiometriaService.verificar(userTemplate);

            if (isMatch) {
                setStatus('success');
                setMessage('Identidade confirmada!');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1000);
            } else {
                setStatus('error');
                setMessage('Biometria não confere. Tente novamente.');
            }
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Erro de comunicação com o leitor.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3>Autenticação Biométrica</h3>
                <p>Confirme a identidade de <strong>{userName}</strong></p>

                <div className={styles.iconContainer}>
                    {status === 'scanning' && <div className={styles.fingerprint}><Fingerprint size={64} color="#007bff" /></div>}
                    {status === 'success' && <Fingerprint size={64} color="#28a745" />}
                    {status === 'error' && <Fingerprint size={64} color="#dc3545" />}
                    {status === 'idle' && <Fingerprint size={64} color="#666" />}
                </div>

                <div className={status === 'error' ? styles.errorText : styles.statusText}>
                    {message}
                </div>

                <div className={styles.actions}>
                    <button className={styles.btnCancel} onClick={onClose} disabled={status === 'success'}>
                        Cancelar
                    </button>
                    {status === 'error' && (
                        <button className={styles.btnRetry} onClick={() => { hasScanned.current = false; startScan(); }}>
                            Tentar Novamente
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}