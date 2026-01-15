import React, { useEffect, useState, useRef } from 'react';
import styles from './styles.module.css';
import BiometriaService from '../../services/BiometriaService';
import { Fingerprint, ScanFace, CheckCircle, XCircle, Loader2 } from 'lucide-react';

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
                }, 1200);
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
                
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <ScanFace size={24} color="#2563eb" />
                    </div>
                    <h3>Autenticação Biométrica</h3>
                </div>

                <p className={styles.description}>
                    Confirme a identidade de <strong>{userName}</strong> para concluir a operação.
                </p>

                <div className={styles.scanContainer}>
                    {status === 'scanning' && (
                        <div className={styles.scannerAnimation}>
                            <Fingerprint size={80} className={styles.fingerprintBase} />
                            <div className={styles.scanLine}></div>
                        </div>
                    )}
                    {status === 'success' && <CheckCircle size={80} className={styles.iconSuccess} />}
                    {status === 'error' && <XCircle size={80} className={styles.iconError} />}
                    {status === 'idle' && <Fingerprint size={80} className={styles.fingerprintIdle} />}
                </div>

                <div className={`${styles.statusBadge} ${styles[status]}`}>
                    {status === 'scanning' && <Loader2 size={16} className={styles.spin} />}
                    <span>{message}</span>
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