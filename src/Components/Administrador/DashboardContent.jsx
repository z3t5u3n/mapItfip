import React, { useState, useEffect } from 'react';

const DashboardContent = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [searchHistorial, setSearchHistorial] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL;

    // Cargar usuarios
    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/api/usuarios`);
            if (!response.ok) throw new Error('Error cargando usuarios');
            const data = await response.json();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar historial
    const fetchHistorial = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/historial-registros`);
            if (!response.ok) throw new Error('Error cargando historial');
            const data = await response.json();
            setHistorial(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error historial:', error);
        }
    };

    useEffect(() => {
        fetchUsuarios();
        fetchHistorial();
    }, []);

    // Filtrar historial por nombre
    const historialFiltrado = historial.filter(item =>
        item.usuario &&
        `${item.usuario.Nombres} ${item.usuario.Apellidos}`
            .toLowerCase()
            .includes(searchHistorial.toLowerCase())
    );

    const handleViewUser = (usuario) => {
        if (!usuario) return;
        setSelectedUser(usuario);
        setShowModal(true);
    };

    // 🔹 Función para mostrar texto del rol:
    const getRolTexto = (rol) => {
        switch (rol) {
            case 1: return "Externo";
            case 2: return "Estudiante";
            case 3: return "Administrativo / Profesor";
            default: return "Sin Rol";
        }
    };

    return (
        <div className="dashboard-content">
            <h1>Dashboard Principal</h1>

            {/* ===== Historial de Sesiones ===== */}
            <div className="historial-section" style={{ marginTop: '30px' }}>
                <h2>📅 Historial de Inicios de Sesión</h2>

                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="text"
                        placeholder="🔎 Buscar por nombre..."
                        value={searchHistorial}
                        onChange={(e) => setSearchHistorial(e.target.value)}
                        style={{
                            padding: '8px',
                            width: '250px',
                            borderRadius: '5px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>

                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID Usuario</th>
                            <th>Nombre</th>
                            <th>Fecha</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historialFiltrado.length === 0 ? (
                            <tr><td colSpan="4">No se encontraron registros.</td></tr>
                        ) : (
                            historialFiltrado.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.IdUsuario}</td>
                                    <td>{item.usuario ? `${item.usuario.Nombres} ${item.usuario.Apellidos}` : '---'}</td>
                                    <td>{new Date(item.Fecha_Sys).toLocaleString()}</td>
                                    <td>
                                        {item.usuario && (
                                            <button onClick={() => handleViewUser(item.usuario)}>👁 Ver usuario</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ===== Modal Detalles de Usuario ===== */}
            {showModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>👤 Detalles del Usuario</h3>
                        <p><strong>ID:</strong> {selectedUser.IdUsuario}</p>
                        <p><strong>Nombre:</strong> {selectedUser.Nombres}</p>
                        <p><strong>Apellidos:</strong> {selectedUser.Apellidos}</p>
                        <p><strong>Rol:</strong> {getRolTexto(selectedUser.IdRol)}</p>

                        {/* 🔹 Mostrar correo solo si NO es externo */}
                        {selectedUser.IdRol !== 1 && (
                            <p><strong>Correo Institucional:</strong> {selectedUser.CorreoIntitucional || "No registrado"}</p>
                        )}

                        <button onClick={() => setShowModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardContent;
