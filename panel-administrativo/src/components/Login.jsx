import { useState, useEffect } from 'react';
import api from '../services/api';
// 👇 CORRECCIÓN 1: Agregado useLocation aquí
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'; 
// 👇 CORRECCIÓN 2: Importar SweetAlert (asegúrate de haber instalado: npm install sweetalert2)
import Swal from 'sweetalert2'; 

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation(); 

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        
        // Caso 1: Verificación Exitosa
        if (queryParams.get('verified') === 'true' || queryParams.get('verified') === '1') {
            Swal.fire({
                title: '¡Cuenta Activada!',
                text: 'Tu correo electrónico ha sido verificado correctamente. Ya puedes iniciar sesión.',
                icon: 'success',
                confirmButtonColor: '#2563EB', // Blue-600
                timer: 5000,
                timerProgressBar: true
            });
            // Limpiamos la URL para que no salga el mensaje al recargar
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Caso 2: Enlace Inválido o Expirado
        if (queryParams.get('error') === 'invalid_link') {
            Swal.fire({
                title: 'Enlace Inválido',
                text: 'El enlace de verificación es incorrecto o ya ha expirado.',
                icon: 'error',
                confirmButtonColor: '#DC2626' // Red-600
            });
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await api.post('/login', { email, password });
            
            // Guardar sesión (token y datos del usuario)
            localStorage.setItem('token', response.data.access_token);
            // Asegurarse de guardar el objeto user como string
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Redirección centralizada al único dashboard
            navigate('/dashboard'); 

        } catch (err) {
            console.error(err); // Útil para ver el error real en consola
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