import React, { useState } from "react";

function AdminLogin({ onLogin }) {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${apiUrl}/api/userRoot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    password: password
                })
            });

            const data = await response.json();
            //console.log(password);
            if (response.ok) {
                if (data.success) {
                    onLogin(true);
                    localStorage.setItem('adminAuthenticated', 'true');
                } else {
                    setError(data.message || "Credenciales incorrectas");
                }
            } else {
                if (response.status === 401) {
                    setError("Contraseña incorrecta");
                } else if (response.status === 422) {
                    setError("Datos de entrada inválidos");
                } else if (response.status === 500) {
                    setError("Error del servidor. Intente más tarde.");
                } else {
                    setError(data.message || "Error en la autenticación");
                }
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="login-header">
                    <div className="admin-icon">
                        🔒
                    </div>
                    <h2>Acceso Administrativo</h2>
                    <p>Ingrese la contraseña de administrador</p>
                </div>
                
                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Contraseña de administrador"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={loading || !password.trim()}
                    >
                        {loading ? "Verificando..." : "Acceder"}
                    </button>
                </form>
                
                <div className="login-footer">
                    <p>Solo personal autorizado</p>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;