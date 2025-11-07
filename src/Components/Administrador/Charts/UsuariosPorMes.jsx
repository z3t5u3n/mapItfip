import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const UsuariosPorMes = () => {
    const [data, setData] = useState(null);
    const [filter, setFilter] = useState("6"); // 1,2,6 o "all"
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetch(`${apiUrl}/api/historial-registros`)////api/historial-registros
            .then((res) => res.json())
            .then((registros) => {
                if (!registros || registros.length === 0) return;

                const usuariosPorMes = {};
                registros.forEach((reg) => {
                    const fecha = new Date(reg.Fecha_Sys);
                    const key = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, "0")}`;
                    if (!usuariosPorMes[key]) usuariosPorMes[key] = 0;
                    usuariosPorMes[key]++;
                });

                let labels = Object.keys(usuariosPorMes);
                let values = Object.values(usuariosPorMes);

                if (filter !== "all") {
                    const monthsToShow = parseInt(filter);
                    labels = labels.slice(-monthsToShow);
                    values = values.slice(-monthsToShow);
                }

                setData({
                    labels,
                    datasets: [
                        {
                            label: `Usuarios registrados (${filter === "all" ? "Todos los meses" : `Últimos ${filter} meses`})`,
                            data: values,
                            borderWidth: 2,
                            fill: false,
                        },
                    ],
                });
            })
            .catch((err) => console.error("Error:", err));
    }, [apiUrl, filter]);

    if (!data) return <p>Cargando usuarios por mes...</p>;

    return (
        <>
            <h3>📈 Usuarios secciones por Mes</h3>
            <div className="filters">
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="1">Mes actual</option>
                    <option value="2">Últimos 2 meses</option>
                    <option value="6">Últimos 6 meses</option>
                    <option value="all">Todos los meses</option>
                </select>
            </div>
            <Line data={data} />
        </>
    );
};

export default UsuariosPorMes;
