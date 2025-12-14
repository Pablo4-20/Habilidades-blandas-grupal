import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await api.post('/login', { email, password });
            
            // Guardar sesión (token y datos del usuario)
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Redirección centralizada al único dashboard
            navigate('/dashboard'); 

        } catch (err) {
            setError('Credenciales incorrectas. Verifique sus datos.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                
                {/* Encabezado */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Acceso Administrativo</h1>
                    <p className="text-gray-500 text-sm mt-1">Sistema de Habilidades Blandas - UEB</p>
                </div>

                {/* Mensaje de error */}
                {error && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg text-center" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Correo */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Correo Institucional</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition duration-200 text-gray-700 placeholder-gray-400"
                            placeholder="docente@ueb.edu.ec"
                            required
                        />
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition duration-200 text-gray-700 placeholder-gray-400 font-sans"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {/* Botón */}
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out"
                    >
                        Ingresar al Sistema
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;