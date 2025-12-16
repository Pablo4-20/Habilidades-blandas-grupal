import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CustomSelect = ({ label, options, value, onChange, icon: Icon, placeholder = "-- Seleccionar --", disabled = false, searchable = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    const selectedOption = options.find(opt => opt.value == value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Enfocar el buscador al abrir
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus();
        }
        if (!isOpen) setSearchTerm(''); // Limpiar búsqueda al cerrar
    }, [isOpen, searchable]);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    // Filtrar opciones
  const filteredOptions = options.filter(opt => {
        const labelSafe = opt.label ? String(opt.label).toLowerCase() : '';
        const subtextSafe = opt.subtext ? String(opt.subtext).toLowerCase() : '';
        const searchSafe = searchTerm.toLowerCase();

        return labelSafe.includes(searchSafe) || subtextSafe.includes(searchSafe);
    });

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
                <span className={`text-sm truncate ${selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* LISTA DESPLEGABLE */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-72 overflow-hidden animate-fade-in-down flex flex-col">
                    
                    {/* BARRA DE BÚSQUEDA INTERNA */}
                    {searchable && (
                        <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
                                <input 
                                    ref={searchInputRef}
                                    type="text" 
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="overflow-y-auto max-h-60">
                        {filteredOptions.length > 0 ? (
                            <ul className="py-1">
                                {filteredOptions.map((opt) => (
                                    <li 
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`
                                            px-4 py-3 text-sm cursor-pointer flex justify-between items-center transition-colors border-b border-gray-50 last:border-0
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
                            <div className="px-4 py-6 text-sm text-gray-400 text-center flex flex-col items-center">
                                <p>No se encontraron resultados</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;