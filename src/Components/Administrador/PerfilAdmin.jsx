import React, { useState, useEffect } from "react";

function PerfilAdmin() {
    const [adminData, setAdminData] = useState({
        Nombre: '',
        Apellidos: '',
        CorreoIntitucional: '',
        Contraseña: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/data`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success && data.admin) {
                setAdminData({
                    Nombre: data.admin.Nombre || '',
                    Apellidos: data.admin.Apellidos || '',
                    CorreoIntitucional: data.admin.CorreoIntitucional || '',
                    Contraseña: ''
                });
            }
        } catch (error) {
            console.error('Error al cargar datos del administrador:', error);
            setMessage("Error al cargar datos del perfil");
        }
    };

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${apiUrl}/api/admin/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(adminData)
            });

            const data = await response.json();

            if (data.success) {
                setMessage("Datos actualizados correctamente");
                setEditMode(false);
                setAdminData(prev => ({ ...prev, Contraseña: '' }));
            } else {
                setMessage(data.message || "Error al actualizar datos");
            }
        } catch (error) {
            console.error('Error al actualizar:', error);
            setMessage("Error de conexión al actualizar datos");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdminData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const cancelEdit = () => {
        setEditMode(false);
        fetchAdminData();
        setMessage("");
    };

    return (
        <div className="section-content">
            <div className="profile-header">
                <h2>Mi Perfil</h2>
                {!editMode && (
                    <button 
                        className="edit-btn"
                        onClick={() => setEditMode(true)}
                    >
                        Editar Perfil
                    </button>
                )}
            </div>

            {message && (
                <div className={`message ${message.includes('correctamente') ? 'success-message' : 'error-message'}`}>
                    {message}
                </div>
            )}

            <div className="profile-card">
                {editMode ? (
                    <form onSubmit={handleUpdateAdmin} className="profile-form">
                        <div className="form-group">
                            <label>Nombre</label>
                            <input
                                type="text"
                                name="Nombre"
                                value={adminData.Nombre}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Apellidos</label>
                            <input
                                type="text"
                                name="Apellidos"
                                value={adminData.Apellidos}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Correo Institucional</label>
                            <input
                                type="email"
                                name="CorreoIntitucional"
                                value={adminData.CorreoIntitucional}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Nueva Contraseña (dejar en blanco para no cambiar)</label>
                            <input
                                type="password"
                                name="Contraseña"
                                value={adminData.Contraseña}
                                onChange={handleInputChange}
                                placeholder="Nueva contraseña"
                            />
                        </div>
                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="save-btn"
                                disabled={loading}
                            >
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </button>
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={cancelEdit}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-info">
                        <div className="info-item">
                            <label>Nombre:</label>
                            <span>{adminData.Nombre}</span>
                        </div>
                        <div className="info-item">
                            <label>Apellidos:</label>
                            <span>{adminData.Apellidos}</span>
                        </div>
                        <div className="info-item">
                            <label>Correo Institucional:</label>
                            <span>{adminData.CorreoIntitucional}</span>
                        </div>
                        <div className="info-item">
                            <label>Estado:</label>
                            <span className="status-active">Activo</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PerfilAdmin;