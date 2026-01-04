import { useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const CambiarPasswordInicial = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
        if (password.length < 8) return Swal.fire('Error', 'Mínimo 8 caracteres', 'warning');

        try {
            await api.post('/change-initial-password', {
                password,
                password_confirmation: confirmPassword
            });

            Swal.fire('¡Excelente!', 'Contraseña actualizada. Bienvenido al sistema.', 'success');
            
            // Actualizamos localStorage para que no pida cambio de nuevo
            const user = JSON.parse(localStorage.getItem('user'));
            user.must_change_password = 0; 
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/dashboard');

        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar la contraseña', 'error');
        }
    };

    return (
        // CAMBIO 1: Fondo general azul muy suave (bg-blue-50)
        <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
            {/* CAMBIO 2: Borde superior Azul Institucional Fuerte (border-blue-900) */}
            <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border-t-4 border-blue-900">
                {/* CAMBIO 3: Título en Azul Institucional */}
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Cambio de Contraseña Obligatorio</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    Por seguridad, debes cambiar la contraseña temporal asignada por el administrador antes de continuar.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Nueva Contraseña</label>
                        {/* CAMBIO 4: Anillo de foco azul al escribir (focus:ring-blue-500) */}
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e=>setPassword(e.target.value)} 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Confirmar Contraseña</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={e=>setConfirmPassword(e.target.value)} 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            required 
                        />
                    </div>
                    {/* CAMBIO 5: Botón ROJO solicitado (bg-red-600 hover:bg-red-700) */}
                    <button 
                        type="submit" 
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition shadow-md hover:shadow-lg"
                    >
                        Actualizar y Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CambiarPasswordInicial;