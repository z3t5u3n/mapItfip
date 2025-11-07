import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const ActivosInactivos = () => {
    const [data, setData] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetch(`${apiUrl}/api/usuarios/stats`)
            .then(res => res.json())
            .then(stats => {
                if (!stats || !stats.stats) return;

                const { activos, inactivos } = stats.stats;
                setData({
                    labels: ["Activos", "Inactivos"],
                    datasets: [
                        {
                            data: [activos, inactivos]
                        }
                    ]
                });
            })
            .catch(err => console.error("Error:", err));
    }, [apiUrl]);

    if (!data) return <p>Cargando datos de usuarios activos...</p>;

    return (
        <div>
            <h3>🟢 Activos vs 🔴 Inactivos</h3>
            <Pie data={data} />
        </div>
    );
};

export default ActivosInactivos;
