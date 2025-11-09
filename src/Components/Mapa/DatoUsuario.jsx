// DatoUsuario.jsx
import React, { useState, useEffect } from "react";

function DatoUsuario({ userData, isSidebar, onUserUpdate }) {
    //console.log("DatoUsuario", userData);
    const rolesMap = {
        1: "Externo",
        2: "Estudiante",
        3: "Administrativo o Profesor",
    };

    const [selectedRoleId, setSelectedRoleId] = useState(1);
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
    const [showRoleSpecificForm, setShowRoleSpecificForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [carreras, setCarreras] = useState([]);
    const [semestres, setSemestres] = useState([]);

    const initialRoleId = userData?.IdRol;
    const isSpecializedRole = initialRoleId === 2 || initialRoleId === 3;

    const apiUrl = process.env.REACT_APP_API_URL;

    // Inicializa los estados cuando el usuario esté disponible
    useEffect(() => {
        if (userData) {
            setSelectedRoleId(userData.IdRol);
        }
    }, [userData]);

    // Carga carreras y semestres
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;

                const [carrerasRes, semestresRes] = await Promise.all([
                    fetch(`${apiUrl}/api/carreras`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${apiUrl}/api/semestres`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (!carrerasRes.ok || !semestresRes.ok) {
                    throw new Error('Error al cargar datos de carreras o semestres.');
                }

                const carrerasData = await carrerasRes.json();
                const semestresData = await semestresRes.json();

                setCarreras(carrerasData);
                setSemestres(semestresData);
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
                setStatusMessage({ text: 'Error al cargar opciones de carrera/semestre.', type: 'error' });
            }
        };

        fetchDropdownData();
    }, [apiUrl]);

    if (!userData) {
        return (
            <div className="divDatoUsuario">
                <div className="divFilter-3"></div>
                <div className="contentDatoUsuario">
                    <p>Cargando datos del usuario...</p>
                </div>
            </div>
        );
    }

    const { NumeroDocumento, Nombre, Apellidos } = userData;

    const handleRoleChange = (e) => {
        const newRoleId = parseInt(e.target.value);
        if (isSpecializedRole && newRoleId !== 1 && newRoleId !== initialRoleId) {
            setStatusMessage({ text: 'Error: Si ya tiene un rol establecido, solo puede cambiar a Externo o mantener su rol actual.', type: 'error' });
            setSelectedRoleId(initialRoleId);
            setShowRoleSpecificForm(false);
            return;
        }

        setSelectedRoleId(newRoleId);
        setShowRoleSpecificForm(newRoleId !== 1 && (!isSpecializedRole || newRoleId === initialRoleId));
        setFormData({});
        setStatusMessage({ text: '', type: '' });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveRole = async () => {
        setStatusMessage({ text: '', type: '' });

        if (selectedRoleId === 2 || selectedRoleId === 3) {
            if (!formData.CorreoInstitucional) {
                setStatusMessage({ text: 'El correo institucional es obligatorio para este rol.', type: 'error' });
                return;
            }
            if (selectedRoleId === 2 && (!formData.IdCarrera || !formData.IdSemestre)) {
                setStatusMessage({ text: 'La carrera y el semestre son obligatorios para estudiantes.', type: 'error' });
                return;
            }
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setStatusMessage({ text: 'No autenticado. Por favor, inicia sesión.', type: 'error' });
                return;
            }

            // 🔹 NUEVO: Verificar si el correo institucional está activo antes del cambio de rol
            const checkEmail = await fetch(`${apiUrl}/api/verify-institutional-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    correo: formData.CorreoInstitucional || ''
                })
            });
            //console.log(formData)
            const emailCheck = await checkEmail.json();
            if (!checkEmail.ok || !emailCheck.active) {
                setStatusMessage({ text: 'El correo institucional no está activo o verificado. Actívalo antes de cambiar de rol.', type: 'error' });
                return;
            }

            // 🔹 Si pasa la verificación, proceder con el cambio
            const requestBody = {
                userId: userData.IdUsuario,
                newRoleId: selectedRoleId,
                ...(selectedRoleId !== 1 && { roleSpecificData: formData })
            };

            const response = await fetch(`${apiUrl}/api/user/update-role-and-data`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 401) {
                setStatusMessage({ text: 'Sesión expirada o no autorizado. Reautentícate.', type: 'error' });
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el rol y los datos.');
            }

            const result = await response.json();
            setStatusMessage({ text: result.message || 'Rol y datos actualizados exitosamente.', type: 'success' });

            setShowRoleSpecificForm(false);
            setFormData({});

            if (onUserUpdate) {
                onUserUpdate();
            }

        } catch (error) {
            console.error('Error al guardar el rol y los datos:', error);
            setStatusMessage({ text: error.message || 'Hubo un error al actualizar el rol y los datos.', type: 'error' });
        }
    };

    const renderRoleSpecificForm = () => {
        if (!showRoleSpecificForm && (selectedRoleId === initialRoleId && !isSpecializedRole)) {
            return null;
        }

        if (isSpecializedRole && selectedRoleId !== initialRoleId && selectedRoleId !== 1) {
            return null;
        }

        switch (selectedRoleId) {
            case 2:
                return (
                    <div className="role-form-container role-selector-container">
                        <h3>Datos de Estudiante</h3>
                        <div className="form-group">
                            <label htmlFor="correoInstitucionalEst">Correo Institucional:</label>
                            <input
                                type="email"
                                id="correoInstitucionalEst"
                                name="CorreoInstitucional"
                                placeholder="Correo Institucional"
                                value={formData.CorreoInstitucional || ''}
                                onChange={handleFormChange}
                                required
                                disabled={isSpecializedRole}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="carrera">Carrera:</label>
                            <select
                                id="carrera"
                                name="IdCarrera"
                                value={formData.IdCarrera || ''}
                                onChange={handleFormChange}
                                required
                                disabled={isSpecializedRole}
                            >
                                <option value="">Selecciona una carrera</option>
                                {carreras.map(carrera => (
                                    <option key={carrera.IdCarrera} value={carrera.IdCarrera}>
                                        {carrera.Carrera}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="semestre">Semestre:</label>
                            <select
                                id="semestre"
                                name="IdSemestre"
                                value={formData.IdSemestre || ''}
                                onChange={handleFormChange}
                                required
                                disabled={isSpecializedRole}
                            >
                                <option value="">Selecciona un semestre</option>
                                {semestres.map(semestre => (
                                    <option key={semestre.IdSemestre} value={semestre.IdSemestre}>
                                        {semestre.Semestre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {isSpecializedRole && (
                            <p className="info-message">Estos datos ya fueron establecidos. Para cambiarlos, contacta al administrador.</p>
                        )}
                    </div>
                );
            case 3:
                return (
                    <div className="role-form-container">
                        <h3>Datos de Profesor/Administrativo</h3>
                        <div className="form-group">
                            <label htmlFor="correoInstitucionalProf">Correo Institucional:</label>
                            <input
                                type="email"
                                id="correoInstitucionalProf"
                                name="CorreoInstitucional"
                                value={formData.CorreoInstitucional || ''}
                                onChange={handleFormChange}
                                required
                                disabled={isSpecializedRole}
                            />
                        </div>
                        {isSpecializedRole && (
                            <p className="info-message">Estos datos ya fueron establecidos. Para cambiarlos, contacta al administrador.</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`divDatoUsuario ${isSidebar ? "divDatoUsuarioFullScreen" : ""}`}>
            <div className="divFilter-3"></div>
            <div className="contentDatoUsuario">
                <h2>Detalles del Usuario</h2>
                {NumeroDocumento && <p><strong>Documento:</strong> {NumeroDocumento}</p>}
                {Nombre && <p><strong>Nombre:</strong> {Nombre}</p>}
                {Apellidos && <p><strong>Apellidos:</strong> {Apellidos}</p>}
                {selectedRoleId && <p><strong>Rol Actual:</strong> {rolesMap[selectedRoleId] || 'Desconocido'}</p>}

            {/*<div className="role-selector-container">
                    <label htmlFor="role-select">Cambiar Rol:</label>
                    <select
                        id="role-select"
                        value={selectedRoleId}
                        onChange={handleRoleChange}
                        disabled={isSpecializedRole && selectedRoleId !== 1}
                    >
                        {Object.entries(rolesMap).map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                </div>*/}

                {isSpecializedRole && selectedRoleId !== 1 && (
                    <p className="info-message">
                        Ya tienes un rol especializado establecido. Si necesitas cambiarlo a otro rol especializado o editar tus datos, contacta al administrador. Solo puedes volver a "Externo".
                    </p>
                )}

                {renderRoleSpecificForm()}

                {(selectedRoleId !== initialRoleId || (selectedRoleId !== 1 && initialRoleId === 1)) && (
                    <button className="save-role-button" onClick={handleSaveRole}>
                        Guardar Cambio de Rol y Datos
                    </button>
                )}

                {statusMessage.text && (
                    <div className={`status-message ${statusMessage.type}`}>
                        {statusMessage.text}
                    </div>
                )}

                <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#777' }}>
                    ¡Bienvenido a la sección de datos!
                </p>
            </div>
        </div>
    );
}

export default DatoUsuario;
