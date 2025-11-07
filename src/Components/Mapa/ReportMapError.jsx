import React, { useState } from "react";
// import "./ReportMapError.css";

const ReportMapError = ({ onSubmit, onClose }) => {
  const [tipoError, setTipoError] = useState("");
  const [aspecto, setAspecto] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Nuevo estado

  const opciones = {
    "Carga": ["No carga mapa", "No carga texturas"],
    "Visualizacion": ["Visualización de textura mal", "Mesh/edificio invisible"],
    "Movimiento Camara": [
      "Movimiento cámara lagueado",
      "Rotación cámara lagueada",
      "Movimiento automático atraviesa objetos",
      "Movimiento automático salta destino",
      "Movimiento manual atraviesa objetos"
    ],
    "Datos/Formulario": ["Error datos incorrectos", "Formulario no envía"]
  };

  const enviarReporte = () => {
    if (!tipoError || !aspecto) {
      alert("⚠️ Debes seleccionar tipo y aspecto del error");
      return;
    }

    // Si es un error de carga del mapa, automáticamente se guarda "Mapa"
    const puntoFinal =
      tipoError === "Carga" && (aspecto === "No carga mapa" || aspecto === "No carga texturas")
        ? "Mapa"
        : searchQuery || "No especificado";

    onSubmit({
      error: tipoError,
      aspecto,
      punto: puntoFinal
    });
  };

  return (
    <div className="reporte-overlay">
      <div className="reporte-modal">
        <h2>⚠️ Reportar Problema del Mapa</h2>

        {/* Selección tipo de error */}
        <label>Tipo de Error</label>
        <select
          value={tipoError}
          onChange={(e) => {
            setTipoError(e.target.value);
            setAspecto("");
          }}
        >
          <option value="">Seleccionar...</option>
          <option value="Carga">Carga</option>
          <option value="Visualizacion">Visualización</option>
          <option value="Movimiento Camara">Movimiento Cámara</option>
        </select>

        {/* Selección aspecto */}
        {tipoError && (
          <>
            <label>Aspecto del Error</label>
            <select value={aspecto} onChange={(e) => setAspecto(e.target.value)}>
              <option value="">Seleccionar...</option>
              {opciones[tipoError]?.map((op, index) => (
                <option key={index} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Input del Punto / Ubicación solo si NO es error general de carga */}
        {!(tipoError === "Carga" && (aspecto === "No carga mapa" || aspecto === "No carga texturas")) && (
          <>
            <label>Punto / Ubicación del error (opcional)</label>
            <input
              type="text"
              placeholder="Buscar lugar..."
              className="SearchInput"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </>
        )}

        {/* Botones */}
        <div className="botones">
          <button className="btn-enviar" onClick={enviarReporte}>Enviar</button>
          <button className="btn-cerrar" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ReportMapError;
