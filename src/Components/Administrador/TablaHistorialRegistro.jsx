// TablaHistorialRegistro.jsx
import React, { useState, useEffect } from 'react';

const TablaHistorialRegistro = () => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        nombre: '',
        semestre: '',
        carrera: '',
        idRol: ''
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Función para probar diferentes endpoints
    const fetchHistorial = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const queryParams = new URLSearchParams();
            
            if (filters.nombre) queryParams.append('nombre', filters.nombre);
            if (filters.semestre) queryParams.append('semestre', filters.semestre);
            if (filters.carrera) queryParams.append('carrera', filters.carrera);
            if (filters.idRol) queryParams.append('idRol', filters.idRol);

            // Probar diferentes endpoints posibles
            const endpoints = [
                'http://192.168.80.23:8000/api/usuarios/historial',
                'http://192.168.80.23:8000/api/historial',
                'http://192.168.80.23:8000/api/registros',
                'http://192.168.80.23:8000/api/user-history',
                'http://192.168.80.23:8000/api/users/history'
            ];

            let response = null;
            let successfulEndpoint = null;

            // Probar cada endpoint hasta encontrar uno que funcione
            for (const endpoint of endpoints) {
                try {
                    const testResponse = await fetch(`${endpoint}?${queryParams}`);
                    if (testResponse.ok) {
                        response = testResponse;
                        successfulEndpoint = endpoint;
                        //console.log(`✅ Endpoint funcionando: ${endpoint}`);
                        break;
                    }
                } catch (err) {
                    //console.log(`❌ Endpoint falló: ${endpoint}`);
                    continue;
                }
            }

            // Si no se encontró ningún endpoint funcionando
            if (!response) {
                throw new Error('No se pudo encontrar un endpoint válido para el historial');
            }

            const data = await response.json();
            setHistorial(data);
            
        } catch (error) {
            console.error('Error fetching historial:', error);
            setError(error.message);
            
            // Datos de ejemplo para desarrollo mientras se soluciona el endpoint
            setHistorial(generateSampleData());
        } finally {
            setLoading(false);
        }
    };

    // Generar datos de ejemplo
    const generateSampleData = () => {
        return [
            {
                id: 1,
                usuario: {
                    id: 101,
                    nombre: 'Juan Pérez',
                    email: 'juan@example.com',
                    telefono: '123456789',
                    semestre: '5to',
                    carrera: 'Ingeniería de Sistemas'
                },
                accion: 'Registro',
                fechaRegistro: '2024-01-15 10:30:00',
                idRol: 2,
                rol: 'Estudiante',
                detalles: 'Usuario registrado en el sistema'
            },
            {
                id: 2,
                usuario: {
                    id: 102,
                    nombre: 'María García',
                    email: 'maria@example.com', 
                    telefono: '987654321',
                    semestre: '3ro',
                    carrera: 'Administración'
                },
                accion: 'Actualización',
                fechaRegistro: '2024-01-16 14:20:00',
                idRol: 3,
                rol: 'Docente',
                detalles: 'Perfil actualizado'
            },
            {
                id: 3,
                usuario: {
                    id: 103,
                    nombre: 'Carlos López',
                    email: 'carlos@example.com',
                    telefono: '555555555',
                    semestre: '4to',
                    carrera: 'Medicina'
                },
                accion: 'Registro',
                fechaRegistro: '2024-01-17 09:15:00',
                idRol: 2,
                rol: 'Estudiante',
                detalles: 'Nuevo registro académico'
            }
        ];
    };

    useEffect(() => {
        fetchHistorial();
    }, [filters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleViewUser = (userData) => {
        setSelectedUser(userData);
        setShowModal(true);
    };

    const clearFilters = () => {
        setFilters({
            nombre: '',
            semestre: '',
            carrera: '',
            idRol: ''
        });
    };

    // Función para recargar intentando con el endpoint de usuarios
    const retryWithUsuarios = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://192.168.80.23:8000/api/usuarios');
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const usuarios = await response.json();
            
            // Transformar datos de usuarios a formato de historial
            const historialData = usuarios.map(usuario => ({
                id: usuario.id,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombres + ' ' + usuario.apellidos,
                    email: usuario.correo,
                    documento: usuario.documento,
                    rol: usuario.rol,
                    estado: usuario.estado,
                    fechaRegistro: usuario.fecha_registro
                },
                accion: 'Registro',
                fechaRegistro: usuario.fecha_registro,
                idRol: usuario.id_rol || 2,
                rol: usuario.rol,
                detalles: `Usuario ${usuario.estado} en el sistema`
            }));
            
            setHistorial(historialData);
            setError(null);
        } catch (error) {
            console.error('Error con endpoint de usuarios:', error);
            setError('No se pudieron cargar los datos. Usando datos de ejemplo.');
            setHistorial(generateSampleData());
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading">Cargando historial de registros...</div>
            <button onClick={retryWithUsuarios} className="btn-secondary">
                🔄 Intentar con datos de usuarios
            </button>
        </div>
    );

    return (
        <div className="tabla-historial">
            <div className="header-section">
                <h2>Historial de Registros</h2>
                <div className="header-actions">
                    <button onClick={retryWithUsuarios} className="btn-primary">
                        🔄 Cargar desde Usuarios
                    </button>
                    <button onClick={fetchHistorial} className="btn-secondary">
                        🔍 Probar Endpoints
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <strong>⚠️ Aviso:</strong> {error}
                    <div className="error-actions">
                        <button onClick={retryWithUsuarios} className="btn-small">
                            Usar datos de usuarios
                        </button>
                        <button onClick={fetchHistorial} className="btn-small">
                            Reintentar
                        </button>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="filters-section">
                <h3>Filtros de Búsqueda</h3>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Nombre:</label>
                        <input
                            type="text"
                            value={filters.nombre}
                            onChange={(e) => handleFilterChange('nombre', e.target.value)}
                            placeholder="Buscar por nombre"
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label>Semestre:</label>
                        <select
                            value={filters.semestre}
                            onChange={(e) => handleFilterChange('semestre', e.target.value)}
                        >
                            <option value="">Todos los semestres</option>
                            <option value="1ro">1ro</option>
                            <option value="2do">2do</option>
                            <option value="3ro">3ro</option>
                            <option value="4to">4to</option>
                            <option value="5to">5to</option>
                            <option value="6to">6to</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Carrera:</label>
                        <input
                            type="text"
                            value={filters.carrera}
                            onChange={(e) => handleFilterChange('carrera', e.target.value)}
                            placeholder="Filtrar por carrera"
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label>Rol:</label>
                        <select
                            value={filters.idRol}
                            onChange={(e) => handleFilterChange('idRol', e.target.value)}
                        >
                            <option value="">Todos los roles</option>
                            <option value="1">Administrador</option>
                            <option value="2">Estudiante</option>
                            <option value="3">Docente</option>
                            <option value="4">Invitado</option>
                        </select>
                    </div>
                </div>
                
                <div className="filter-actions">
                    <button onClick={fetchHistorial} className="btn-primary">
                        🔍 Aplicar Filtros
                    </button>
                    <button onClick={clearFilters} className="btn-secondary">
                        🗑️ Limpiar Filtros
                    </button>
                </div>
            </div>

            {/* Información de registros */}
            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-label">Total de Registros:</span>
                    <span className="stat-value">{historial.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Filtros Activos:</span>
                    <span className="stat-value">
                        {Object.values(filters).filter(val => val !== '').length}
                    </span>
                </div>
            </div>

            {/* Tabla de Historial */}
            <div className="table-container">
                <table className="historial-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Acción</th>
                            <th>Fecha Registro</th>
                            <th>Rol</th>
                            <th>Detalles</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historial.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    No se encontraron registros con los filtros aplicados
                                </td>
                            </tr>
                        ) : (
                            historial.map(registro => (
                                <tr key={registro.id}>
                                    <td className="id-cell">{registro.id}</td>
                                    <td>
                                        <div className="user-info">
                                            <strong>{registro.usuario.nombre}</strong>
                                            <small>{registro.usuario.email}</small>
                                            {registro.usuario.documento && (
                                                <small>Doc: {registro.usuario.documento}</small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`action-badge ${registro.accion.toLowerCase()}`}>
                                            {registro.accion}
                                        </span>
                                    </td>
                                    <td className="date-cell">
                                        {new Date(registro.fechaRegistro).toLocaleDateString()}
                                        <br />
                                        <small>
                                            {new Date(registro.fechaRegistro).toLocaleTimeString()}
                                        </small>
                                    </td>
                                    <td>
                                        <span className="role-badge">
                                            {registro.rol}
                                        </span>
                                    </td>
                                    <td className="details-cell">
                                        {registro.detalles}
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleViewUser(registro.usuario)}
                                            className="btn-view"
                                            title="Ver detalles del usuario"
                                        >
                                            👁️ Ver
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Detalles del Usuario */}
            {showModal && selectedUser && (
                <UserDetailsModal 
                    user={selectedUser} 
                    onClose={() => setShowModal(false)} 
                />
            )}
        </div>
    );
};

// Componente Modal separado
const UserDetailsModal = ({ user, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>👤 Detalles del Usuario</h3>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>
                <div className="modal-body">
                    <div className="user-details-grid">
                        <div className="detail-group">
                            <h4>Información Personal</h4>
                            <div className="detail-item">
                                <label>ID:</label>
                                <span>{user.id}</span>
                            </div>
                            <div className="detail-item">
                                <label>Nombre:</label>
                                <span>{user.nombre}</span>
                            </div>
                            <div className="detail-item">
                                <label>Email:</label>
                                <span>{user.email}</span>
                            </div>
                            {user.telefono && (
                                <div className="detail-item">
                                    <label>Teléfono:</label>
                                    <span>{user.telefono}</span>
                                </div>
                            )}
                        </div>

                        <div className="detail-group">
                            <h4>Información Académica</h4>
                            {user.semestre && (
                                <div className="detail-item">
                                    <label>Semestre:</label>
                                    <span>{user.semestre}</span>
                                </div>
                            )}
                            {user.carrera && (
                                <div className="detail-item">
                                    <label>Carrera:</label>
                                    <span>{user.carrera}</span>
                                </div>
                            )}
                            {user.documento && (
                                <div className="detail-item">
                                    <label>Documento:</label>
                                    <span>{user.documento}</span>
                                </div>
                            )}
                        </div>

                        <div className="detail-group">
                            <h4>Información del Sistema</h4>
                            <div className="detail-item">
                                <label>Rol:</label>
                                <span className="role-badge">{user.rol || 'No especificado'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Estado:</label>
                                <span className={`status-badge ${user.estado?.toLowerCase() || 'active'}`}>
                                    {user.estado || 'Activo'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-primary">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TablaHistorialRegistro;