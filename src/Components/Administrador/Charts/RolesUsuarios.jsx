import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const RolesUsuarios = () => {
    const [data, setData] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetch(`${apiUrl}/api/usuarios/stats`)
            .then(res => res.json())
            .then(stats => {
                if (!stats || !stats.stats || !stats.stats.porRol) return;

                const roles = stats.stats.porRol.map(r => r.TipoRol?.trim() || "Sin rol");
                const cantidades = stats.stats.porRol.map(r => r.usuarios_count || 0);

                setData({
                    labels: roles,
                    datasets: [
                        {
                            label: "Usuarios por Rol",
                            data: cantidades,
                            borderWidth: 2
                        }
                    ]
                });
            })
            .catch(err => console.error("Error cargando roles", err));
    }, [apiUrl]);

    if (!data) return <p>Cargando roles...</p>;

    return (
        <div>
            <h3>📊 Usuarios por Rol</h3>
            <Bar data={data} />
        </div>
    );
};

export default RolesUsuarios;
