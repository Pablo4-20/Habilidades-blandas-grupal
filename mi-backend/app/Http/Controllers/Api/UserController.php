<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'rol' => 'required|in:admin,coordinador,docente,estudiante', // Validamos los roles permitidos
            // La contraseña será opcional, si no envían, se pone una por defecto
        ]);

        $user = User::create([
            'name' => $request->name,
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
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('file');
        $data = array_map('str_getcsv', file($file->getRealPath()));
        
        // Eliminar cabecera si existe (asumimos que la fila 1 son títulos)
        $header = array_shift($data); 

        $count = 0;
        foreach ($data as $row) {
            // Estructura esperada CSV: Nombre, Email, Rol, Password (Opcional)
            // Validamos que la fila tenga datos
            if (count($row) >= 3) {
                try {
                    User::create([
                        'name'     => $row[0],
                        'email'    => $row[1],
                        'rol'      => strtolower($row[2]), // admin, docente, coordinador
                        'password' => Hash::make($row[3] ?? 'password'),
                    ]);
                    $count++;
                } catch (\Exception $e) {
                    // Si falla (ej: email duplicado), continuamos con el siguiente
                    continue; 
                }
            }
        }

        return response()->json(['message' => "$count usuarios importados correctamente."]);
    }
    
public function update(Request $request, $id)
{
    $user = User::findOrFail($id);

    $request->validate([
        'name' => 'required',
        // IMPORTANTE: Ignorar el id actual en la validación de unique
        'email' => 'required|email|unique:users,email,'.$user->id, 
        'rol' => 'required',
        'password' => 'nullable|min:6' // Nullable permite que no se envíe
    ]);

    $data = $request->except(['password']); // Tomamos todo menos pass

    // Solo si mandaron password, la hasheamos y agregamos
    if ($request->filled('password')) {
        $data['password'] = bcrypt($request->password);
    }

    $user->update($data);
    return response()->json($user);
}
}