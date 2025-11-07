import React from "react";
import UsuariosPorMes from "./Charts/UsuariosPorMes";
import RolesUsuarios from "./Charts/RolesUsuarios";
import ActivosInactivos from "./Charts/ActivosInactivos";
// import "../../Css/estadisticas.css";

const Estadisticas = () => {
    return (
        <div className="estadisticas-container">
            <div className="chart-card">
                <UsuariosPorMes />
            </div>
            <div className="chart-card">
                <RolesUsuarios />
            </div>
            <div className="chart-card">
                <ActivosInactivos />
            </div>
        </div>
    );
};

export default Estadisticas;
