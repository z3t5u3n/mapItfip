import React, { useState, useEffect } from "react";
import AdminLogin from "../Utils/AdminLogin";
import DashboardContent from "../Components/Administrador/DashboardContent";
import TablaHistorialRegistro from '../Components/Administrador/TablaHistorialRegistro';
import PerfilAdmin from "../Components/Administrador/PerfilAdmin";
import GestionUsuarios from "../Components/Administrador/GestionUsuarios";
import Reportes from "../Components/Administrador/Reportes";
import Estadisticas from "../Components/Administrador/Estadisticas";
// import Configuracion from "../Components/Administrador/Configuracion";
// import '../Css/dashboardAdmin.css';
//
function DashboardAdmin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeSection, setActiveSection] = useState("dashboard");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const authStatus = localStorage.getItem('adminAuthenticated');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (success) => {
        setIsAuthenticated(success);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('adminAuthenticated');
        setActiveSection("dashboard");
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const renderSection = () => {
        switch (activeSection) {
            case "dashboard":
                return <DashboardContent />;
            case "estadisticas":
                return <Estadisticas />;
            case "profile":
                return <PerfilAdmin />;
            case "users":
                return <GestionUsuarios />;
            case "reports":
                return <Reportes />;
            case "settings":
            // return <Configuracion />;
            default:
                return <DashboardContent />;
        }
    };

    if (!isAuthenticated) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    return (
        <div className="dashboard-admin">
            <header className="admin-header">
                <div className="header-left">
                    <button className="menu-toggle" onClick={toggleSidebar}>
                        {sidebarCollapsed ? "☰" : "✕"}
                    </button>
                    <h1>Panel de Administración</h1>
                </div>
                <div className="header-right">
                    <button className="logout-btn" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <div className="dashboard-content">
                <nav className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Administrador-MapItfip</h3>
                    </div>
                    <ul className="sidebar-menu">
                        <li className={activeSection === "dashboard" ? "active" : ""}>
                            <button onClick={() => setActiveSection("dashboard")}>
                                <span className="menu-icon">🕒</span>
                                <span className="menu-text">Historial</span>
                            </button>
                        </li>
                        <li className={activeSection === "estadisticas" ? "active" : ""}>
                            <button onClick={() => setActiveSection("estadisticas")}>
                                <span className="menu-icon">📊</span>
                                <span className="menu-text">Estadísticas</span>
                            </button>
                        </li>
                        <li className={activeSection === "profile" ? "active" : ""}>
                            <button onClick={() => setActiveSection("profile")}>
                                <span className="menu-icon">👤</span>
                                <span className="menu-text">Mi Perfil</span>
                            </button>
                        </li>
                        <li className={activeSection === "users" ? "active" : ""}>
                            <button onClick={() => setActiveSection("users")}>
                                <span className="menu-icon">👥</span>
                                <span className="menu-text">Gestión de Usuarios</span>
                            </button>
                        </li>
                        <li className={activeSection === "reports" ? "active" : ""}>
                            <button onClick={() => setActiveSection("reports")}>
                                <span className="menu-icon">⚠️</span>
                                <span className="menu-text">Reportes del Mapa</span>
                            </button>
                        </li>
                        <li className={activeSection === "settings" ? "active" : ""}>
                            <button onClick={() => setActiveSection("settings")}>
                                <span className="menu-icon">⚙️</span>
                                <span className="menu-text">Configuración</span>
                            </button>
                        </li>
                    </ul>
                </nav>

                <main className={`admin-main ${sidebarCollapsed ? 'expanded' : ''}`}>
                    {renderSection()}
                </main>
            </div>
        </div>
    );
}

export default DashboardAdmin;