import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../Components/header";
// import "../Css/registro.css";
// import "../Css/global.css"


function Login() {
    const [documento, setDocumento] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleDocumentChange = (event) => {
        const value = event.target.value;
        const re = /^[0-9\b]+$/;
        if (value === '' || re.test(value)) {
            setDocumento(value);
            setError(null);
        }
    };

    /////////Manejo de ruta
    const apiUrl = process.env.REACT_APP_API_URL;
    const handleLoginSubmit = async (event) => {
        event.preventDefault(); // <-- **IMPORTANTE: Evitar el recargo de la página**
        setError(null); // Limpiar errores previos

        if (!documento) {
            setError("Por favor, ingresa tu número de documento.");
            return; // Detener la ejecución si no hay documento
        }

        try {
            const response = await fetch(`${apiUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ documento }),
            });

            if (response.ok) { // Si la respuesta es exitosa (código 200-299)
                const data = await response.json();
                //console.log("Login exitoso:", data);

                localStorage.setItem('authToken', data.token);
                // Si guardaste el usuario completo en localStorage, asegúrate de que 'user' tenga 'NumeroDocumento'
                localStorage.setItem('userData', JSON.stringify(data.user));

                // Redirige a /interfazMapa y añade el número de documento como parámetro de consulta
                // navigate(`/interfazMapa?documento=${documento}`); // <-- **CAMBIO AQUÍ**
                navigate(`/interfazMapa`);
            } else { // Si la respuesta no fue OK (ej. 404, 422, 500)
                const errorData = await response.json();
                setError(errorData.message || 'Error al iniciar sesión.');
                console.error("Error en el login:", errorData);
            }
        } catch (err) { // Para errores de red o errores antes de que el servidor responda
            console.error("Error de red o inesperado durante el login:", err);
            setError("No se pudo conectar con el servidor. Intenta de nuevo.");
        }
    };
    return (
        <div className="divLogin">
            <Header />
            <div className="divContentLogin">
                <div className="divForm">
                    <form onSubmit={handleLoginSubmit}>
                        <div className="formSection">
                            <h3>Login</h3>
                            <input
                                type="text"
                                name="documento"
                                placeholder="Número de documento"
                                value={documento}
                                onChange={handleDocumentChange}
                                className={error ? "input-error" : ""}
                            />
                            {error && <p className="error-message">{error}</p>}
                            <button type="submit" className="submitButton">Iniciar</button>
                            <button className="btnRegistrar" onClick={() => { navigate("/registro") }}>registrar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Login;