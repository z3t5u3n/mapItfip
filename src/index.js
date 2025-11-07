import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css';
// import App from './App';
import Interfaz from './Pages/interfaz';
import reportWebVitals from './reportWebVitals';
import Registro from './Pages/registro';
import Login from './Pages/login';
import ProtectedRoute from './Utils/ProtectedRoute';
import DashboardAdmin from './Pages/dashboardAdmin';
// import './Css/variables.css';
import './Css/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/4rb01c4rr0p3rr0" element={<DashboardAdmin />} />
        <Route path="/registro" element={<Registro />} />
        <Route element={<ProtectedRoute />}> {/* Este es el "contenedor" de rutas protegidas*/}
          <Route path="/interfazMapa" element={<Interfaz />} /> {/* La ruta que quieres proteger*/}
        </Route>
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Routes>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
