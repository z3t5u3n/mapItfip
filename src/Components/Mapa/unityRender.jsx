import /*React, */{ /*useEffect, useState,*/ useRef } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

////////////7
function UnityRender() {
    const { unityProvider, /*sendMessage,*/ isLoaded, /*unload*/ } = useUnityContext({
        loaderUrl: "/Unity/Build/prueba.loader.js",
        dataUrl: "/Unity/Build/prueba.data",
        frameworkUrl: "/Unity/Build/prueba.framework.js",
        codeUrl: "/Unity/Build/prueba.wasm",
        webglContextAttributes: {
            preserveDrawingBuffer: true,
            keyboardControl: false, // ← Clave para solucionar el problema
        },
    });
    const unityCanvasRef = useRef(null);

    return (
        <div className="divUnityRender">
            {!isLoaded && <p>⏳ Cargando Unity...</p>}
            <div ref={unityCanvasRef} className="ConteinerUnity">
                <Unity unityProvider={unityProvider} className="Unity" />
            </div>
        </div>
    )
}
export default UnityRender;