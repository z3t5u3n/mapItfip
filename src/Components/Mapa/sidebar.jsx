import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

// import "../../Css/sidebar.css";

function Sidebar({ isSidebar, accionMenu, isCambio, handleCambio }) {
    // Nueva función temporal para depuración
    const navigate = useNavigate();

    /////////Manejo de ruta
    const apiUrl = process.env.REACT_APP_API_URL;
    // La función que definimos arriba (deberías ponerla en un archivo separado para reutilizarla)
    const handleLogout = async () => {
        const token = localStorage.getItem('authToken');
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        navigate('/'); // Redirección inmediata

        if (!token) return;

        try {
            await fetch(`${apiUrl}/api/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
            });
            //console.log("Cierre de sesión exitoso en el servidor.");
        } catch (error) {
            console.error("Error al notificar cierre de sesión:", error);
        }
    };

    // const handleButtonClickDebug = (e) => {
    //     const clickedId = e.currentTarget.id;
    //     //console.log("DEBUG: Botón clicado en Sidebar con ID:", clickedId); // <-- ¡Punto de depuración clave!
    //     alert("DEBUG: Botón clicado en Sidebar con ID: " + clickedId); // <-- ¡Otro punto de depuración!
    //     handleCambio(e); // Llama a la prop handleCambio pasando el evento original
    // };
    return (
        <div className={`divSidebar ${isSidebar ? "divSidebarHidden" : ""}`}>
            <div className="divFilter-2"></div>
            <div className="SidebarMenu">
                {/* Modifica onClick para pasar el evento 'e' */}
                <button id="Data" className="SidebarMenu-btn" onClick={(e) => { handleCambio(e) }}><b>Datos</b></button>{/*probando*/}
                <button id="Mapa" className="SidebarMenu-btn" onClick={(e) => { handleCambio(e) }}><b>Mapa Virtual</b></button>
                {/* <button><b>ESTRUCTURA ITFIP</b></button> */}
            <button className="logout logout-btn" onClick={handleLogout}>Salir</button>
            </div>
            <button className={`btnSidebar ${isSidebar ? "btnSidebarHidde" : ""}`} onClick={accionMenu}>{isSidebar ? <b>☰</b> : <b>x</b>}</button>
        </div>
    );
}
export default Sidebar;