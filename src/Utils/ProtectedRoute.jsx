import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children, redirectPath = '/' }) => {
    // 1. Obtener el token de autenticación del almacenamiento local
    const authToken = localStorage.getItem('authToken'); //

    // 2. Verificar si el token existe
    if (!authToken) { //
        // Si no hay token, redirige al usuario a la ruta de login
        // 'replace' asegura que la entrada actual en el historial sea reemplazada
        return <Navigate to={redirectPath} replace />; //
    }

    // 3. Si el token existe, permite el acceso al componente hijo
    // 'children' se usa si la ruta está definida como <Route><ProtectedRoute><MyComponent /></ProtectedRoute></Route>
    // 'Outlet' se usa si la ruta está definida como <Route element={<ProtectedRoute />}> <Route path="..." element={<MyComponent />} /> </Route>
    return children ? children : <Outlet />;
};

export default ProtectedRoute;