import React, { useState, useEffect } from "react";
import Header from "../Components/header";
// import "../Css/global.css"
// import "../Css/registro.css"; // Asegúrate de tener estilos para .input-error
import { useNavigate } from "react-router-dom";

// Mueve BasicFormFields FUERA de la función Registro
const BasicFormFields = ({
    nombre,
    apellidos, // Nuevo prop para apellidos
    documento,
    tipoDocumento,
    onFieldChange,
    documentTypesOptions,
    errors // Nuevo prop para errores de validación
}) => (
    <>
        <input
            type="text"
            name="nombre"
            placeholder="Nombre usuario"
            value={nombre}
            onChange={onFieldChange}
            className={errors.nombre ? "input-error" : ""} // Clase para resaltar
        />
        {errors.nombre && <p className="error-message">{errors.nombre[0]}</p>} {/* Mostrar mensaje de error */}

        <input
            type="text"
            name="apellidos" // Campo de apellidos
            placeholder="Apellidos"
            value={apellidos}
            onChange={onFieldChange}
            className={errors.apellidos ? "input-error" : ""}
        />
        {errors.apellidos && <p className="error-message">{errors.apellidos[0]}</p>}

        <input
            type="text"
            name="documento"
            placeholder="Número de documento"
            value={documento}
            onChange={onFieldChange}
            className={errors.documento ? "input-error" : ""}
        />
        {errors.documento && <p className="error-message">{errors.documento[0]}</p>}

        <select
            name="tipoDocumento"
            value={tipoDocumento}
            onChange={onFieldChange}
            className={errors.tipoDocumento ? "input-error" : ""}
        >
            <option value="">Tipo de Documento</option>
            {documentTypesOptions.map((type) => (
                <option key={type.IdDocumento} value={type.IdDocumento}>
                    {type.TipoDocumento}
                </option>
            ))}
        </select>
        {errors.tipoDocumento && <p className="error-message">{errors.tipoDocumento[0]}</p>}
    </>
);


function Registro() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState("Externo");
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState(""); // Nuevo estado para apellidos
    const [documento, setDocumento] = useState("");
    const [tipoDocumento, setTipoDocumento] = useState("");
    const [documentTypes, setDocumentTypes] = useState([]);
    const [isLoadingDocumentTypes, setIsLoadingDocumentTypes] = useState(true);
    const [errorDocumentTypes, setErrorDocumentTypes] = useState(null);
    const [validationErrors, setValidationErrors] = useState({}); // Nuevo estado para errores de validación

    /////////Manejo de ruta
    const apiUrl = process.env.REACT_APP_API_URL;
    // useEffect para cargar los tipos de documento al montar el componente (sin cambios aquí)
    useEffect(() => {
        const fetchDocumentTypes = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/documentos`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setDocumentTypes(data);
                //console.log("Tipos de documento cargados:", data);
            } catch (error) {
                console.error("Error al cargar los tipos de documento:", error);
                setErrorDocumentTypes("No se pudieron cargar los tipos de documento.");
            } finally {
                setIsLoadingDocumentTypes(false);
            }
        };

        fetchDocumentTypes();
    }, []);

    // const handleRoleChange = (event) => {
    //     setSelectedRole(event.target.value);
    //     setNombre("");
    //     setApellidos(""); // Reiniciar apellidos
    //     setDocumento("");
    //     setTipoDocumento("");
    //     setValidationErrors({}); // Limpiar errores al cambiar de rol
    // };

    const handleBasicFieldChange = (event) => {
        const { name, value } = event.target;
        // Limpiar el error específico para el campo modificado
        setValidationErrors(prevErrors => ({
            ...prevErrors,
            [name]: null // Limpia el error al empezar a escribir de nuevo
        }));

        if (name === "nombre") {
            setNombre(value);
        } else if (name === "apellidos") { // Manejar apellidos
            setApellidos(value);
        } else if (name === "documento") {
            // Solo permitir números en el campo de documento
            const re = /^[0-9\b]+$/;
            if (value === '' || re.test(value)) {
                setDocumento(value);
            }
        } else if (name === "tipoDocumento") {
            setTipoDocumento(value);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setValidationErrors({}); // Limpiar errores de validación anteriores

        // Datos a enviar a Laravel, incluyendo apellidos
        const formData = {
            nombre,
            apellidos,
            documento,
            tipoDocumento,
            rol: selectedRole,
        };

        //console.log("Datos a enviar:", formData);

        try {
            const response = await fetch(`${apiUrl}/api/registro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Si Laravel devuelve errores de validación (estado 422)
                if (response.status === 422 && errorData.errors) {
                    setValidationErrors(errorData.errors); // Almacena los errores de validación
                }
                throw new Error(errorData.message || 'Error en el registro');
            }

            const data = await response.json();
            //console.log("Respuesta del backend:", data);

            alert("Registro exitoso!");
            // Limpiar formulario y errores después de un registro exitoso
            setNombre("");
            setApellidos("");
            setDocumento("");
            setTipoDocumento("");
            setSelectedRole("");
            setValidationErrors({});
            navigate("/");
        } catch (error) {
            console.error("Hubo un error al enviar los datos:", error);
            // Mostrar un mensaje de error general si no son errores de validación
            if (!Object.keys(validationErrors).length) { // Si no se setearon errores específicos
                alert("Error en el registro: " + error.message);
            }
        }
    };

    return (
        <div className="divRegistro">
            <Header />
            <div className="divContentForm">
                <div className="divForm">
                    <form onSubmit={handleSubmit}>
                        <div className="formSection">
                            <h3>Registro Externo</h3>
                            {isLoadingDocumentTypes ? (
                                <p>Cargando tipos de documento...</p>
                            ) : errorDocumentTypes ? (
                                <p style={{ color: 'red' }}>{errorDocumentTypes}</p>
                            ) : (
                                <BasicFormFields
                                    nombre={nombre}
                                    apellidos={apellidos} // Pasa apellidos
                                    documento={documento}
                                    tipoDocumento={tipoDocumento}
                                    onFieldChange={handleBasicFieldChange}
                                    documentTypesOptions={documentTypes}
                                    errors={validationErrors} // Pasa los errores de validación
                                />
                            )}
                        </div>
                        <button type="submit" className="submitButton">Registrarse</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Registro;