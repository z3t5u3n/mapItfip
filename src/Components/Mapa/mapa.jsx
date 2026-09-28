import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import icoPantallaCompleta from "../../media/fullScreen.png";
import icoPantallaNorma from "../../media/normalScreen.png";
import ReportMapError from "./ReportMapError";
import camelia_gif00 from "../../media/Camelia_gif00.gif";

// import "../../Css/mapa.css";

const Mapa = memo(function Mapa({ userData, isIcon, isSidebar, fullScreen }) {
  const { unityProvider, sendMessage, isLoaded, loadingProgress } = useUnityContext({
    loaderUrl: "/Unity/Build/prueba.loader.js",
    dataUrl: "/Unity/Build/prueba.data.br",
    frameworkUrl: "/Unity/Build/prueba.framework.js.br",
    codeUrl: "/Unity/Build/prueba.wasm.br",
  });

  // 🔹 Estados
  const [general, setGeneral] = useState([]);
  const [bloquesData, setBloquesData] = useState({});
  const [isCameraMoving, setIsCameraMoving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cameraMode, setCameraMode] = useState("Manual");
  const [isAutomaticMode, setIsAutomaticMode] = useState(false);
  const [cameraSpeed, setCameraSpeed] = useState(1);
  const [showReport, setShowReport] = useState(false);
  
  // ⚡ NUEVOS ESTADOS PARA CARGA FIJA DE 6 SEGUNDOS ⚡
  const [fakeLoadProgress, setFakeLoadProgress] = useState(0);
  const [isFakeLoadDone, setIsFakeLoadDone] = useState(false);

  // Detectar si hay usuario logeado
  const isLogged = !!localStorage.getItem("authToken");

  const enviarReporteError = async (data) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reportar-error-mapa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error al enviar reporte");

      alert("✅ Reporte enviado correctamente");
      setShowReport(false);
    } catch (error) {
      alert("❌ Error al enviar reporte");
      console.error(error);
    }
  };

  // 🛰️ GPS
  const [gpsMode, setGpsMode] = useState(false);
  const [gpsData, setGpsData] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
  });
  const [gpsError, setGpsError] = useState(null);

  const unityCanvasRef = useRef(null);
  // **NUEVO:** Referencia para el input de búsqueda
  const searchInputRef = useRef(null);
  const speedOptions = [1, 2, 3, 4];

  // ⚡ LÓGICA DEL TEMPORIZADOR DE CARGA FIJA (6 SEGUNDOS) ⚡
  useEffect(() => {
    // Si la carga real de Unity ya terminó, no iniciamos la carga falsa.
    if (isLoaded) return;
    
    // Calcula cuántas veces se debe actualizar el progreso (ej: 60 veces en 6 segundos)
    const totalDuration = 6000; // 6 segundos
    const intervalTime = 100;    // 100ms
    const totalSteps = totalDuration / intervalTime;
    const progressPerStep = 100 / totalSteps;
    
    // 1. Inicia el intervalo para simular el progreso
    const interval = setInterval(() => {
      setFakeLoadProgress((prevProgress) => {
        const newProgress = prevProgress + progressPerStep;
        if (newProgress >= 100) {
          // No debe detenerse aquí, solo limitarse
          return 100;
        }
        return newProgress;
      });
    }, intervalTime);

    // 2. Establece un timeout para finalizar la carga falsa después de 6 segundos
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setFakeLoadProgress(100);
      setIsFakeLoadDone(true); // Marca que la animación de 6s ha terminado
    }, totalDuration);

    // 3. Cleanup: Limpia el intervalo y el timeout si el componente se desmonta o Unity carga
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isLoaded]); // Dependencia de isLoaded: si es true, detiene el temporizador.


  // 🧭 Lógica movimiento cámara
  useEffect(() => {
    window.CameraMovementFinished = () => {
      setIsCameraMoving(false);
      //console.log("✅ Cámara libre");
    };

    window.nombreFuncionJS = (jsonData) => {
      try {
        const data = JSON.parse(jsonData);
        setGeneral(data.general || []);
        setBloquesData({
          A: data.bloqueA || {},
          B: data.bloqueB || {},
          C: data.bloqueC || {},
          D: data.bloqueD || {},
          E: data.bloqueE || {},
        });
        console.log(bloquesData)
      } catch (error) {
        console.error("❌ Error al procesar datos:", error);
      }
    };

    window.moveCameraToMesh = (meshName) => {
      if (!isLoaded) return console.warn("⏳ Unity aún no está listo");
      if (isCameraMoving) return console.warn("🚫 Cámara en movimiento");
      if (gpsMode) return console.warn("🚫 GPS activo, movimiento manual deshabilitado");

      setIsCameraMoving(true);
      sendMessage("No_CameraMover", "MoveCameraToView", meshName);
    };

    return () => {
      delete window.nombreFuncionJS;
      delete window.moveCameraToMesh;
      delete window.CameraMovementFinished;
    };
  }, [sendMessage, isLoaded, isCameraMoving, gpsMode]);

  // 🔁 GPS seguimiento
  useEffect(() => {
    if (!gpsMode || !isLoaded) return;

    if (!("geolocation" in navigator)) {
      setGpsError("⚠️ Este dispositivo no soporta GPS o está deshabilitado.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
          accuracy: pos.coords.accuracy.toFixed(2),
          // INCLUIR RUMBO (HEADING)
          heading: pos.coords.heading ? pos.coords.heading.toFixed(2) : null,
        };
        setGpsData(coords);
        setGpsError(null);
        //console.log("📡 GPS:", coords);

        sendMessage("No_GPSManager", "OnReceiveGPS", JSON.stringify(coords));
      },
      (err) => {
        let msg = "❌ Error desconocido.";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = "🚫 Permiso de GPS denegado. Actívalo en los ajustes.";
            break;
          case err.POSITION_UNAVAILABLE:
            msg = "📡 Señal de GPS no disponible.";
            break;
          case err.TIMEOUT:
            msg = "⏱️ Tiempo de espera del GPS agotado.";
            break;
          default:
            msg = `⚠️ Error GPS: ${err.message}`;
        }
        setGpsError(msg);
        console.error(msg);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [gpsMode, isLoaded, sendMessage]);

  // 🔹 Funciones auxiliares
  const normalizeString = (str) =>
    str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  const allPlaces = Object.entries(bloquesData).flatMap(([_, grupos]) =>
    Object.values(grupos).flatMap((items) => items)
  );

  const isExternalUser = userData && userData.IdRol === 0; // valor original = 1
  const normalizedSearchQuery = normalizeString(searchQuery);
  const normalizedTargetSalon = normalizeString("Salón");

  const potentialMatches = searchQuery
    ? allPlaces.filter((place) => normalizeString(place).includes(normalizedSearchQuery))
    : [];

  const shouldRestrictBasedOnMatches =
    isExternalUser &&
    potentialMatches.some((place) => normalizeString(place).includes(normalizedTargetSalon));

  const displayRestrictedMessage = shouldRestrictBasedOnMatches;
  const filteredPlacesForDisplay = displayRestrictedMessage ? [] : potentialMatches;

  // **NUEVA FUNCIÓN:** Manejar el foco para liberar/capturar el teclado
  const handleInputFocus = useCallback((isFocus) => {
    if (isLoaded) {
      // 0 = Liberar teclado al navegador (para escribir)
      // 1 = Unity vuelve a capturar el teclado (para controles 3D)
      const captureState = isFocus ? "0" : "1";
      sendMessage("No_CameraMover", "SetInputCapture", captureState);
    }
  }, [isLoaded, sendMessage]);


  // 🔘 Controles
  const handleMeshClick = useCallback(
    (meshName) => {
      if (displayRestrictedMessage)
        return //console.log("⚠️ Usuario externo, no puede buscar salones.");
      window.moveCameraToMesh(meshName);
      setSearchQuery("");
    },
    [displayRestrictedMessage]
  );

  const handleSpeedChange = useCallback(
    (speed) => {
      setCameraSpeed(speed);
      if (isLoaded) sendMessage("No_CameraMover", "SetCameraSpeedFactor", speed.toString());
    },
    [isLoaded, sendMessage]
  );

  const toggleCameraMode = useCallback(() => {
    if (isCameraMoving) {
      // Bloquear cambio de modo si hay movimiento
      console.warn("🚫 Cámara en movimiento. No se puede cambiar de modo.");
      return;
    }

    setIsAutomaticMode((prev) => {
      const newMode = !prev;
      if (isLoaded) {
        sendMessage(
          "No_CameraMover",
          newMode ? "SetCameraModeAutomatic" : "SetCameraModeManual"
        );
        setCameraMode(newMode ? "Automatic" : "Manual");
      }
      return newMode;
    });
  }, [isLoaded, sendMessage, isCameraMoving]);

  const toggleGpsMode = useCallback(() => {
    if (!isLoaded) return console.warn("⏳ Unity aún no cargado");
    // Guardia de movimiento
    if (isCameraMoving) return console.warn("🚫 Cámara en movimiento");

    setGpsMode((prev) => {
      const newState = !prev;
      sendMessage("No_GPSManager", newState ? "ActivateGPSMode" : "DeactivateGPSMode");
      //console.log(`🛰️ GPS ${newState ? "ACTIVADO" : "DESACTIVADO"}`);
      return newState;
    });
  }, [isLoaded, sendMessage, isCameraMoving]);
  
  // 💡 Lógica de renderizado del overlay: Se muestra si Unity no ha cargado O la carga falsa no ha terminado.
  const showLoadingOverlay = !isLoaded || !isFakeLoadDone; 
  
  // La barra de progreso siempre usa el valor de la carga falsa (de 0 a 100)
  const displayPercentage = Math.round(fakeLoadProgress);

  return (
    <div className={`divMapa ${isIcon ? "divMapa-1" : ""}`}>
      {/* Cargando: Ahora se muestra si Unity no ha cargado O la animación no ha terminado */}
      

      {/* Canvas Unity */}
      <Unity
        unityProvider={unityProvider}
        ref={unityCanvasRef}
        style={{ width: "100%", height: isIcon ? "100vh" : "90vh" }}
      />

      {/* Botón pantalla completa */}
      <button
        className={`btnSceenFull ${isIcon ? "btnSceenFull-1" : ""}`}
        onClick={fullScreen}
      >
        <img
          src={isIcon ? icoPantallaNorma : icoPantallaCompleta}
          alt="Pantalla Completa"
        />
      </button>
      {isLogged && (
        <button onClick={() => setShowReport(true)} className="btn-report">
          ⚠️
        </button>
      )}
      {showReport && (
        <ReportMapError
          onClose={() => setShowReport(false)}
          onSubmit={enviarReporteError}
          bloquesData={bloquesData}
        />
      )}
      {/* Botón GPS */}
      {/*<div className="GPSControl" >
        <button
          className={`GPSButton ${gpsMode ? "Active" : ""}`}
          onClick={toggleGpsMode}
          disabled={isCameraMoving}
        >
          {gpsMode ? "GPS 3D Activado" : "Activar GPS 3D"}
        </button>
      </div>

      {/* HUD GPS */}
      {gpsMode && (
        <div className="GPSPanel">
          <div className="GPSPanel-Title">🛰️ GPS en tiempo real</div>
          {gpsError ? (
            <div className="GPSPanel-Error">{gpsError}</div>
          ) : (
            <>
              <div>Latitud: {gpsData.latitude ?? "—"}</div>
              <div>Longitud: {gpsData.longitude ?? "—"}</div>
              <div>Precisión: {gpsData.accuracy ?? "—"} m</div>
              {/* Mostrar rumbo (heading) si está disponible */}
              {gpsData.heading && <div>Rumbo: {gpsData.heading} °</div>}
            </>
          )}
        </div>
      )}

      {/* Barra de búsqueda */}
      {!gpsMode && (
        <div className={`Searche ${isIcon ? "SearcheFullScreen" : ""}`}>
          <div className="divFilter-2"></div>
          <input
            type="text"
            placeholder="Buscar lugar..."
            className="SearchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // **CORRECCIÓN:** Añadir manejo de foco para liberar el teclado
            onFocus={() => handleInputFocus(true)}
            onBlur={() => handleInputFocus(false)}
            ref={searchInputRef}
          />
          {searchQuery && (
            <div className="SearchResults">
              {displayRestrictedMessage ? (
                <button className="Btn_AccesoRestringido">
                  Debes cambiar de rol para acceder a todas las rutas.
                </button>
              ) : (
                filteredPlacesForDisplay.map((place, i) => (
                  <button
                    key={i}
                    className="Btn_mesh_1 SearchMatch"
                    onClick={() => handleMeshClick(place)}
                  >
                    {place}
                  </button>
                ))
              )}
              {searchQuery &&
                filteredPlacesForDisplay.length === 0 &&
                !displayRestrictedMessage && (
                  <div className="NoResultsMessage">No se encontraron resultados.</div>
                )}
            </div>
          )}
        </div>
      )}

      {/* Controles velocidad y modo */}
      {!gpsMode && (
        <div
          className={`OptionMapa ${isIcon || isSidebar ? "OptionMapaFullScreen" : ""}`}
        >
          <div className="divFilter-2"></div>
          <div className="SpeedControl">
            {/* <span className="Shadow_1">Velocidad:</span>
            {speedOptions.map((speed) => (
              <button
                key={speed}
                className={`SpeedButton ${cameraSpeed === speed ? "Active" : ""}`}
                onClick={() => handleSpeedChange(speed)}
                disabled={isCameraMoving}
              >
                {speed}x
              </button>
            ))} */}
            <div className="ModoRecorrer">
              <label>
                <b>Modo:</b>
              </label>
              <button
                onClick={toggleCameraMode}
                className={cameraMode === "Automatic" ? "Active" : ""}
                disabled={isCameraMoving || !isLoaded}
              >
                <b>{isAutomaticMode ? "Automático" : "Manual"}</b>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {!gpsMode && (
        <div
          className={`SidebarMapa ${isIcon || isSidebar ? "SidebarMapaFullScreen" : ""}`}
        >
          <div className="divContetMenuMapa">
            <div className="divFilter-2"></div>
            {general.map((empty, i) => {
              const isSalonInSidebar = normalizeString(empty).includes(
                normalizedTargetSalon
              );
              const shouldHideSidebarItem = isExternalUser && isSalonInSidebar;
              if (shouldHideSidebarItem) return null;

              return (
                <div className="divMenuBtn" key={i}>
                  <button
                    onClick={() => handleMeshClick(empty)}
                    disabled={!isLoaded || isCameraMoving || gpsMode}
                    style={{
                      cursor:
                        !isLoaded || isCameraMoving || gpsMode
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <b>{empty}</b>
                  </button>
                </div>
              );
            })}
          </div>
          {isExternalUser && (
            <div className="info-message-sidebar">
              Algunas opciones no se muestran para tu rol actual.
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default Mapa;
