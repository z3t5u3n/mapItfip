// Interfaz.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from "../Components/header";
import Sidebar from "../Components/Mapa/sidebar";
import Mapa from "../Components/Mapa/mapa";
// import '../Css/interfaz.css'
// import "../Css/global.css"
import DatoUsuario from "../Components/Mapa/DatoUsuario";
// import FondoManual from "../Components/Mapa/fondoManual";
// import ManualUsuario from "../Components/Mapa/ManualUsuario";

function Interfaz() {
    const [isSidebar, setIsSidebar] = useState(false);
    const [manualStep, setManualStep] = useState(1);
    const [isIcon, setIsIcon] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [userData, setUserData] = useState(null);

    const userDocumento = searchParams.get('documento');

    /////////Manejo de ruta
    const apiUrl = process.env.REACT_APP_API_URL;
    const accionMenu = () => setIsSidebar(!isSidebar);
    const fullScreen = () => setIsIcon(!isIcon);

    const handleCambio = (e) => {
        const clickedId = e.currentTarget.id;
        //console.log("ID del botón clicado:" + clickedId);
        switch (clickedId) {
            case "Data":
                document.querySelector(".divDatoUsuario").style.display = "flex";
                break;
            case "Mapa":
                document.querySelector(".divDatoUsuario").style.display = "none";
                break;
        }
    };

    const handleNextStep = (nextStep) => {
        setManualStep(nextStep);
        switch (nextStep) {
            case 2:
                document.querySelector(".divDatoUsuario").style.zIndex = "2";
                document.querySelector(".divFilter-3").style.display = "none";
                break;
            case 3:
                document.querySelector(".divDatoUsuario").style.zIndex = "0";
                document.querySelector(".divSidebar").style.zIndex = "2";
                document.querySelector(".divSidebar").style.boxShadow = "0 0 10px 5px red";
                document.querySelector(".divFilter-3").style.display = "block";
                document.querySelector("#imgAvatar").classList.remove("imgAvatar-1");
                document.querySelector("#imgAvatar").classList.add("imgAvatar");
                break;
            case 4:
                document.querySelector(".divSidebar").style.zIndex = "1";
                document.querySelector(".divMapa").style.zIndex = "2";
                document.querySelector(".divSidebar").style.boxShadow = "0 0 5px black";
                break;
            case 5:
                document.querySelector(".OptionMapa").style.boxShadow = "0 0 10px 5px red";
                break;
            case 6:
                document.querySelector(".OptionMapa").style.boxShadow = "none";
                document.querySelector(".SpeedControl").style.boxShadow = "0 0 10px 5px red";
                break;
            case 7:
                document.querySelector(".SpeedControl").style.boxShadow = "none";
                document.querySelector(".Searche").style.boxShadow = "0 0 10px 5px red";
                break;
            case 8:
                document.querySelector(".divMapa").style.zIndex = "0";
                document.querySelector(".Searche").style.boxShadow = "none";
                break;
            case 9:
                document.querySelector(".divManualUsuario").style.display = "none";
                document.querySelector(".divFondoManual").style.display = "none";
                break;
        }
    };

    const handleUserUpdate = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const userResponse = await fetch(`${apiUrl}/api/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            if (userResponse.ok) {
                const userDetails = await userResponse.json();
                setUserData(userDetails);
            } else {
                throw new Error('Error al refrescar los datos del usuario.');
            }
        } catch (error) {
            console.error('Error al refrescar los datos:', error);
        }
    };


    useEffect(() => {
        const fetchUserDataAndProtectedData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.warn('No hay token de autenticación. Redirigiendo a login.');
                navigate(`${apiUrl}/login`);
                return;
            }

            try {
                const userResponse = await fetch(`${apiUrl}/api/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });

                if (userResponse.status === 401) {
                    alert('Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    navigate('/');
                    return;
                }

                if (!userResponse.ok) {
                    throw new Error(`HTTP error fetching user data! status: ${userResponse.status}`);
                }

                const userDetails = await userResponse.json();
                //console.log('Datos completos del usuario:', userDetails);
                setUserData(userDetails);

                const interfazResponse = await fetch(`${apiUrl}/api/interfaz-data`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });

                if (interfazResponse.status === 401) {
                    alert('Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    navigate('/');
                    return;
                }

                if (!interfazResponse.ok) {
                    throw new Error(`HTTP error fetching interfaz data! status: ${interfazResponse.status}`);
                }

                const interfazData = await interfazResponse.json();
                //console.log('Datos protegidos de la interfaz:', interfazData);

            } catch (error) {
                console.error('Error al obtener datos:', error);
            }
        };

        fetchUserDataAndProtectedData();
    }, [navigate, userDocumento]);
    //console.log("Interfaz", userData)
    return (
        <div className="divInterfaz">
            {/* <FondoManual /> */}
            {/* <ManualUsuario handleNextStep={handleNextStep} currentStep={manualStep}/> */}
            {isIcon ? '' : <Header />}
            {isIcon ? '' : <Sidebar isSidebar={isSidebar} accionMenu={accionMenu} handleCambio={handleCambio} />}
            <Mapa userData={userData} isSidebar={isSidebar} isIcon={isIcon} fullScreen={fullScreen} accionMenu={accionMenu} />
            <DatoUsuario userData={userData} isSidebar={isSidebar} onUserUpdate={handleUserUpdate} />
        </div>
    );
}

export default Interfaz;