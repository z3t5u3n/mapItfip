// ManualUsuario.jsx
import React from "react";
// import "../../Css/ManualUsuario.css";
import camelia from "../../media/avatar/Camelia.gif";

function ManualUsuario({ currentStep, handleNextStep }) {
    // Array of messages and their associated styles/actions
    const messages = [
        {
            text: "Hola soy Camelia, tu Asistente Virtual.<br/>Yo te Explicare el funcionamiento<br/>de la interfaz de <b className='Resaltar'>MAPITFIP</b>",
            class: "divMensaje-1"
        },
        {
            text: "Aqui el usario puede ver los datos de el.<br/>Ademas de eso puede cambiar de rol,<br/>Para usar todo la funciones de<b className='Resaltar'>MAPITFIP</b>",
            class: "divMensaje-2"
        },
        {
            text: "Este es el menu lateral. <br/> Desde aqui puedes cambiar entre <b>'Datos'</b> y <b>'Mapa Virtua'</b>.<br/> Para acceder a sus diferentes funciones.",
            class: "divMensaje-3"
        },
        {
            text: "Esta es la interfaz de <b>Mapa  Virtul</b>. <br/>La interfaz tiene diferentes funcines y mecanicas.<br/>A continuacion te explico cuales son",
            class: "divMensaje-4"
        },
        {
            text: "En el menu de abajo, puedes ver algunos edificos del <b>Mapa  Virtul</b>. <br/>Aqui puedes ver los Edificios principales de <b>'ITFIP'</b>.<br/>Con un Simple Click te guiara al Edificio que indica.",
            class: "divMensaje-5"
        },
        {
            text: "Este menu tiene funciones principales del <b>Mapa  Virtul</b>.<br/>Puedes Cambiar la velocidad para ir mas rapido o lento en el <b>Mapa  Virtul</b>.<br/>Ademas de intercambiar en modo Automatico o el manual para explorar el <b>Mapa  Virtul</b>.",
            class: "divMensaje-6"
        },
        {
            text: "En la parte de arriba tenos un buscador.<br/>Aqui puedes buscar de forma mas eficiente el lugar requerido.<br/>Esto hace mas facil el uso del <b>Mapa  Virtul</b>.",
            class: "divMensaje-7"
        },
        {
            text: "Espero que te halla servido este mini-tutorial de <b>MAPITFIP</b>.<br/>Sobre el uso y la mecanicas que puede encontra en la plataforma.<br/>Esperamos que difrutes y te animes a visitar<b>ITFIP</b>.",
            class: "divMensaje-8"
        }

        // ... add the rest of your messages here
    ];

    // Get the current message based on the currentStep prop
    const currentMessage = messages[currentStep - 1];

    if (!currentMessage) return null; // Don't render if there's no message

    return (
        <div className="divManualUsuario">
            <div id="divAvatar" className={`divAvatar ${currentStep === 2 ? 'divAvatar-1 avatar-flipped' : ''}`}>
                <img id="imgAvatar" className={`imgAvatar ${currentStep === 2 ? 'imgAvatar-1' : ''}`} src={camelia} alt="Camelia" />
            </div>
            <div className={`divMensaje ${currentMessage.class}`}>
                <p dangerouslySetInnerHTML={{ __html: currentMessage.text }}></p>
                <button id={`paso-${currentStep}`} className="btnNext" onClick={() => handleNextStep(currentStep + 1)}>
                    <b>Seguir</b>
                </button>
            </div>
        </div>
    );
}

export default ManualUsuario;