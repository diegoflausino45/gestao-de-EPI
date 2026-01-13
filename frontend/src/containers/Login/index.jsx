import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import styles from './styles.module.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);
    
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleForgotPassword = () => {
        toast.info("Para redefinir sua senha, entre em contato com o administrador do sistema.", {
            autoClose: 5000,
            icon: "ℹ️"
        });
    };

    const handleCheckCapsLock = (e) => {
        if (e.getModifierState("CapsLock")) {
            setCapsLockOn(true);
        } else {
            setCapsLockOn(false);
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            await signIn(email, password);
            navigate('/'); // Redireciona para Home após sucesso
            toast.success(`Bem-vindo de volta!`);
        } catch (err) {
            toast.error(err.message || 'Erro ao tentar fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className={styles.title}>Bem-vindo de volta</h1>
                    <p className={styles.subtitle}>Acesse o sistema de Gestão de EPIs</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="email">E-mail</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.inputIcon} size={18} />
                            <input 
                                id="email"
                                type="email" 
                                className={styles.input}
                                placeholder="exemplo@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="password">Senha</label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} size={18} />
                            <input 
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className={styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyUp={handleCheckCapsLock}
                                onKeyDown={handleCheckCapsLock}
                                required
                            />
                            <button
                                type="button"
                                className={styles.togglePasswordButton}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1" // Evita que o tab pare no botão do olho
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {capsLockOn && (
                            <div className={styles.capsLockWarning}>
                                <AlertTriangle size={14} /> Caps Lock ativado
                            </div>
                        )}
                    </div>

                    <div className={styles.forgotPasswordContainer}>
                        <button type="button" className={styles.forgotPasswordButton} onClick={handleForgotPassword}>
                            Esqueci minha senha
                        </button>
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                Entrando...
                            </>
                        ) : (
                            <>
                                Entrar no Sistema
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default Login;