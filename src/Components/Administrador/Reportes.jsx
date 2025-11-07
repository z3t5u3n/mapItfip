import React, { useEffect, useState } from "react";

const Reportes = () => {
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("auth_token");

    useEffect(() => {
        const fetchReportes = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/consulta-error-mapa`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Error en la solicitud");

                const data = await res.json();

                if (data.success) {
                    setReportes(data.reportes);
                } else {
                    console.error("Respuesta no exitosa:", data.message);
                }
            } catch (error) {
                console.error("Error obteniendo reportes ERROR:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportes();
    }, [apiUrl, token]);

    if (loading) return <p>Cargando reportes...</p>;

    return (
        <div className="pqr-section">
            <h2>📌 Reportes de Errores del Mapa (PQR)</h2>
            <table className="users-table">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Error</th>
                        <th>Aspecto</th>
                        <th>Punto</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {reportes.map((r, index) => (
                        <tr key={index}>
                            <td>{r.Usuario}</td>
                            <td>{r.Error}</td>
                            <td>{r.Aspecto}</td>
                            <td>{r.Punto}</td>
                            <td>{r.Fecha}</td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    );
};

export default Reportes;
