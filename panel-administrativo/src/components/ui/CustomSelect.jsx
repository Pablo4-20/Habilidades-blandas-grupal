import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

const CustomSelect = ({ label, options, value, onChange, icon: Icon, placeholder = "-- Seleccionar --", disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Encontrar el objeto seleccionado completo para mostrar su nombre
    const selectedOption = options.find(opt => opt.value == value);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${disabled ? 'opacity-60 pointer-events-none' : ''}`} ref={containerRef}>
            {label && (
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-blue-600" />}
                    {label}
                </label>
            )}

            {/* BOTÓN DISPARADOR */}
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full px-4 py-3 bg-white border rounded-xl cursor-pointer flex justify-between items-center transition-all duration-200
                    ${isOpen ? 'border-blue-500 ring-4 ring-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300 shadow-sm'}
                `}
            >
                <span className={`text-sm ${selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* LISTA DESPLEGABLE */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fade-in-down">
                    {options.length > 0 ? (
                        <ul className="py-1">
                            {options.map((opt) => (
                                <li 
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`
                                        px-4 py-3 text-sm cursor-pointer flex justify-between items-center transition-colors
                                        ${opt.value == value ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}
                                    `}
                                >
                                    <div className="flex flex-col">
                                        <span>{opt.label}</span>
                                        {opt.subtext && <span className="text-xs text-gray-400 font-normal mt-0.5">{opt.subtext}</span>}
                                    </div>
                                    {opt.value == value && <CheckIcon className="h-4 w-4 text-blue-600" />}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">No hay opciones disponibles</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;