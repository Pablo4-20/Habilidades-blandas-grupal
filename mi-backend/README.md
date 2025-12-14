Sistema de Gestión de Habilidades Blandas - UEB📝 Visión GeneralEste sistema digitaliza el proceso de Planificación, Seguimiento y Evaluación de Habilidades Blandas para las carreras de Ingeniería de Software y Tecnologías de la Información (TI) de la Universidad Estatal de Bolívar (UEB)1111.El proyecto se basa en la Guía para Desarrollo de Habilidades Blandas 2025-2028 2y soporta la metodología de evaluación en dos parciales (inicial y final) 3, utilizando la rúbrica de niveles 1 al 54.✨ Características PrincipalesAutenticación por Roles (RBAC): Acceso diferenciado para Administrador, Coordinador y Docente.Dashboard Unificado: Una única ruta (/dashboard) que renderiza la interfaz según el rol del usuario (UX mejorada).Planificación Docente: Los docentes pueden asociar una Habilidad Blanda a una Asignatura y un Periodo (cumpliendo con el Procedimiento, pág. 22).Diseño Elegante: Interfaz de usuario moderna construida con Tailwind CSS.Catálogos: Las Habilidades Blandas (Adaptabilidad, Liderazgo, etc.) y Asignaturas se cargan automáticamente desde los Seeders basados en el documento fuente.💻 Stack TecnológicoComponenteTecnologíaRolBackendLaravel (PHP)API RESTful y Lógica de Negocio.FrontendReact (Vite)Panel Administrativo.Base de DatosPostgreSQLPersistencia de datos académicos.EstilosTailwind CSSFramework de diseño.AutenticaciónLaravel SanctumManejo de tokens de sesión.⚙️ Configuración e Instalación1. Requisitos PreviosAsegúrate de tener instalado: PHP >= 8.2, Composer, Node.js/NPM, y un servidor PostgreSQL activo.2. Configuración del Backend (mi-backend)Ejecuta estos comandos en la carpeta raíz del proyecto (mi-backend):Bash# 2.1. Instalar dependencias de PHP
composer install

# 2.2. Duplicar el archivo de entorno
cp .env.example .env

# 2.3. Generar la clave de aplicación
php artisan key:generate
🛠️ Configuración .envEdita el archivo .env y asegúrate de que la conexión a PostgreSQL y la base de datos coincidan con lo que configuramos:Fragmento de códigoDB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ueb_habilidades_db
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_de_postgres
🚀 Migraciones y Datos de PruebaEjecuta el comando para crear la estructura de la base de datos y cargar los datos iniciales (Usuarios, Habilidades, Asignaturas):Bashphp artisan migrate:fresh --seed
🟢 Iniciar ServidorBashphp artisan serve
3. Configuración del Frontend (panel-administrativo)Abre una nueva terminal en la carpeta panel-administrativo:Bash# 3.1. Instalar dependencias de Node.js (React, Axios, Tailwind)
npm install

# 3.2. Iniciar el servidor de desarrollo
npm run dev
🔑 Autenticación y Roles de PruebaAccede al sistema en http://localhost:5173/ e inicia sesión con los siguientes usuarios de prueba:RolCorreoContraseñaAccesoDocentedocente@ueb.edu.ecpasswordPlanificación y EvaluaciónCoordinadorcoordinador@ueb.edu.ecpasswordReportes y SeguimientoAdministradoradmin@ueb.edu.ecpasswordGestión de Usuarios/Config🎯 Próximos Pasos (Roadmap)La funcionalidad principal de evaluación está pendiente de implementación:Módulo de Rúbrica de Evaluación: Crear la interfaz para que el docente pueda asignar los niveles 1 al 5 a un estudiante en un Parcial específico.Seguimiento y Reportes: Implementar la lógica de la Ficha Resumen 5 para que el Coordinador pueda generar el informe de progreso de Nivel 1 a Nivel 5.Protección de Endpoints: Fortalecer el Backend con Middleware para asegurar que solo los Docentes puedan acceder a las rutas de POST /planificaciones.