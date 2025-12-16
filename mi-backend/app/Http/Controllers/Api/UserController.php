<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    // 1. Listar todos los usuarios
    public function index()
    {
        // Devolvemos todos ordenados por ID descendente
        return User::orderBy('id', 'desc')->get();
    }

    // 2. Crear un nuevo usuario manualmente
    public function store(Request $request)
    {
        $request->validate([
            'cedula' => 'required|digits:10|unique:users,cedula',
            'nombres' => 'required|string',  
            'apellidos' => 'required|string', 
            'email' => 'required|email|unique:users,email',
            'rol' => 'required|in:admin,coordinador,docente,estudiante', // Validamos los roles permitidos
            // La contraseña será opcional, si no envían, se pone una por defecto
        ]);
        if (Estudiante::where('cedula', $request->cedula)->exists()) {
            return response()->json([
                'message' => 'Esta cédula ya pertenece a un Estudiante.'
            ], 422);
        }

        $user = User::create([
            'cedula' => $request->cedula,
            'nombres' => $request->nombres, 
        'apellidos' => $request->apellidos, 
            'email' => $request->email,
            'password' => Hash::make($request->password ?? 'password'), // Contraseña default: password
            'rol' => $request->rol
        ]);

        return response()->json(['message' => 'Usuario creado correctamente', 'user' => $user]);
    }

    // 3. Eliminar usuario
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
    // Importación Masiva de Usuarios (CSV)
// --- CARGA MASIVA INTELIGENTE (USUARIOS) ---
    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file']);
        $file = $request->file('file');
        
        $contenido = file_get_contents($file->getRealPath());
        $primerLinea = explode(PHP_EOL, $contenido)[0] ?? '';
        $separador = str_contains($primerLinea, ';') ? ';' : ',';

        $data = array_map(function($linea) use ($separador) {
            return str_getcsv($linea, $separador);
        }, file($file->getRealPath()));

        array_shift($data); 

        $count = 0;
        $actualizados = 0;

        foreach ($data as $index => $row) {
            if (empty($row) || count($row) < 6) continue;

            try {
                // --- 1. NORMALIZACIÓN ---
                
                // Cédula: Corregir ceros
                $cedulaCSV = trim($row[0]);
                $cedulaFinal = str_pad($cedulaCSV, 10, '0', STR_PAD_LEFT);
                
                if (Estudiante::where('cedula', $cedulaFinal)->exists()) {
                    throw new \Exception("La cédula $cedulaFinal ya está registrada como Estudiante.");
                }
                // Nombres/Apellidos: Formato Título (Juan Pérez)
                $nombresFinal   = mb_convert_case(trim($row[1]), MB_CASE_TITLE, "UTF-8");
                $apellidosFinal = mb_convert_case(trim($row[2]), MB_CASE_TITLE, "UTF-8");
                
                // Email: Minúsculas
                $emailFinal = strtolower(trim($row[3]));
                
                // Rol: Minúsculas estrictas para que funcione la seguridad
                $rolFinal = strtolower(trim($row[5])); 


                // --- 2. BÚSQUEDA ---
                $usuario = User::where('cedula', $cedulaFinal)
                               ->orWhere('cedula', $cedulaCSV)
                               ->orWhere('email', $emailFinal)
                               ->first();

                // --- 3. GUARDADO ---
                $datosUsuario = [
                    'cedula'    => $cedulaFinal,
                    'nombres'   => $nombresFinal,
                    'apellidos' => $apellidosFinal,
                    'email'     => $emailFinal,
                    'password'  => bcrypt(trim($row[4])), 
                    'rol'       => $rolFinal
                ];

                if ($usuario) {
                    $usuario->update($datosUsuario);
                    $actualizados++;
                } else {
                    User::create($datosUsuario);
                    $count++;
                }

            } catch (\Exception $e) {
                return response()->json([
                    'message' => "Error en Fila " . ($index + 1) . ": " . $e->getMessage()
                ], 500);
            }
        }

        return response()->json([
            'message' => "Proceso completado: $count nuevos, $actualizados actualizados."
        ]);
    }
    
public function update(Request $request, string $id)
{
    $user = User::findOrFail($id);

    $request->validate([
        // unique:users,cedula,ID -> Ignora el ID actual para que no de error si no cambia su propia cédula
        'cedula' => 'required|digits:10|unique:users,cedula,' . $user->id, 
        'nombres' => 'required|string',
        'apellidos' => 'required|string',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'rol' => 'required'
    ]);

    $data = $request->except(['password']);
    if ($request->filled('password')) {
        $data['password'] = Hash::make($request->password);
    }

    $user->update($data);
    return response()->json($user);
}
}