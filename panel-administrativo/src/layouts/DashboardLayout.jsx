import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    // Estado para controlar la barra lateral (true = abierta, false = cerrada)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Pasamos el estado y la función para cambiarlo al Sidebar 
            */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* El margen izquierdo (ml) se ajusta dinámicamente con una transición suave 
                ml-64 = 256px (Abierto) | ml-20 = 80px (Cerrado)
            */}
            <main 
                className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'ml-64' : 'ml-20'
                }`}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;