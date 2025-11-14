
import React, { useState } from 'react';
import { LogoIcon } from './icons/Icons.tsx';

export interface User {
  name: string;
  email: string;
  password?: string;
  passwordConfirmation?: string;
}

export interface Credentials {
  email: string;
  password?: string;
}

interface AuthProps {
    onLogin: (credentials: Credentials) => Promise<string | null>;
    onRegister: (user: Omit<User, 'passwordConfirmation'>) => Promise<string | null>;
}

// Moved InputField outside of the Auth component to prevent it from being
// re-created on every render, which caused the input fields to lose focus.
const InputField = ({ id, type, label, value, onChange }: { id: string, type: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="relative">
        <input
            id={id}
            name={id}
            type={type}
            value={value}
            onChange={onChange}
            className="peer w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-3 text-white placeholder-transparent focus:outline-none focus:border-blue-500 transition-colors"
            placeholder={label}
            required
        />
        <label
            htmlFor={id}
            className="absolute left-3 -top-2.5 bg-[#1e2639] px-1 text-sm text-slate-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400"
        >
            {label}
        </label>
    </div>
);


const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const err = await onLogin({ email, password });
        setError(err);
        setLoading(false);
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            setError('As senhas não coincidem.');
            return;
        }
        setError(null);
        setLoading(true);
        const err = await onRegister({ name, email, password });
        setError(err);
        setLoading(false);
    };

    return (
        <div className="w-full max-w-md bg-[#1e2639] rounded-xl shadow-2xl p-8 animate-fade-in-down">
            <div className="text-center mb-8">
                <LogoIcon className="h-16 w-16 mx-auto mb-2" />
                <h1 className="text-2xl font-bold text-blue-400">Bem-vindo ao TALKFLOW</h1>
                <p className="text-slate-400">Sua jornada para a fluência começa aqui.</p>
            </div>

            <div className="flex border-b border-slate-700 mb-6">
                <button
                    onClick={() => { setActiveTab('login'); setError(null); }}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'login' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}
                >
                    Login
                </button>
                <button
                    onClick={() => { setActiveTab('register'); setError(null); }}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'register' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}
                >
                    Cadastrar
                </button>
            </div>

            {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <InputField id="email" type="email" label="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
                    <InputField id="password" type="password" label="Senha" value={password} onChange={e => setPassword(e.target.value)} />
                    <div>
                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                        <p className="text-right text-sm mt-3">
                            <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Esqueceu a senha?</a>
                        </p>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                     <InputField id="name" type="text" label="Nome" value={name} onChange={e => setName(e.target.value)} />
                    <InputField id="email" type="email" label="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
                    <InputField id="password" type="password" label="Senha" value={password} onChange={e => setPassword(e.target.value)} />
                    <InputField id="passwordConfirmation" type="password" label="Confirmar Senha" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} />
                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                        {loading ? 'Criando...' : 'Criar Conta'}
                    </button>
                </form>
            )}

            {error && (
                <div className="mt-4 bg-red-900/40 border border-red-700/50 text-red-400 text-sm rounded-lg p-3 text-center animate-fade-in">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Auth;