import React, { useState, useEffect } from "react";

/**
 * GestionUsuarios.jsx
 * - Carga usuarios desde /api/usuarios
 * - Carga roles desde /api/roles
 * - Carga tipos de documento desde /api/documentos
 * - Filtra por búsqueda / rol / tipo documento
 * - Edita usuarios en línea y guarda con PUT /api/usuarios/{id}/update
 * - Activa / desactiva usuarios via PUT /api/usuarios/{id}/toggle-activo
 */

const GestionUsuarios = () => {
  const apiUrl = process.env.REACT_APP_API_URL || "";

  // Data
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [documentos, setDocumentos] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroText, setFiltroText] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("todos");

  // Editing state
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    Nombres: "",
    Apellidos: "",
    CorreoIntitucional: "",
    TipoRol: "",
    IdDocumento: "",
    NumeroDocumento: ""
  });
  const [savingId, setSavingId] = useState(null); // to show saving state per user
  const [togglingId, setTogglingId] = useState(null);

  // Fetch roles, documentos and usuarios
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError("");

      try {
        // Parallel requests
        const [rolesRes, docRes, usersRes] = await Promise.all([
          fetch(`${apiUrl}/api/roles`),
          fetch(`${apiUrl}/api/documentos`),
          fetch(`${apiUrl}/api/usuarios`)
        ]);

        if (!rolesRes.ok) throw new Error("Error cargando roles");
        if (!docRes.ok) throw new Error("Error cargando tipos de documento");
        if (!usersRes.ok) throw new Error("Error cargando usuarios");

        const rolesData = await rolesRes.json();
        const docData = await docRes.json();
        // users endpoint might return { success:true, usuarios: [...] } or array;
        const usersData = await usersRes.json();

        // Normalize users array in case controller returns { success, usuarios }
        const usuariosArray = Array.isArray(usersData)
          ? usersData
          : (usersData.usuarios || []);

        setRoles(Array.isArray(rolesData) ? rolesData : (rolesData.roles || []));
        setDocumentos(Array.isArray(docData) ? docData : (docData.documentos || []));
        setUsuarios(usuariosArray);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtering logic
  const usuariosFiltrados = usuarios.filter((u) => {
    // filtroTexto: buscar por nombres, apellidos o número de documento
    const text = filtroText.trim().toLowerCase();
    const textMatch = !text || (
      ((u.Nombres || u.nombres || "").toString().toLowerCase().includes(text)) ||
      ((u.Apellidos || u.apellidos || "").toString().toLowerCase().includes(text)) ||
      ((u.NumeroDocumento || u.documento || "").toString().toLowerCase().includes(text))
    );

    // filtroRol: comparar TipoRol o IdRol según lo que tu API entrega
    const rolMatch = !filtroRol || (
      (u.TipoRol && u.TipoRol.toString() === filtroRol.toString()) ||
      (u.IdRol && u.IdRol.toString() === filtroRol.toString())
    );

    // filtroDocumento: comparar IdDocumento
    const docMatch = filtroDocumento === "todos" || (
      (u.IdDocumento && u.IdDocumento.toString() === filtroDocumento.toString()) ||
      (u.TipoDocumento && u.TipoDocumento.toString() === filtroDocumento.toString())
    );

    return textMatch && rolMatch && docMatch;
  });

  // Start editing a user: preload fields
  const startEditing = (usuario) => {
    setEditingUserId(usuario.IdUsuario || usuario.id);
    setEditForm({
      Nombres: usuario.Nombres || usuario.nombres || "",
      Apellidos: usuario.Apellidos || usuario.apellidos || "",
      CorreoIntitucional: usuario.CorreoIntitucional || usuario.correo || "",
      TipoRol: usuario.TipoRol || usuario.TipoRol || "", // might be string
      IdDocumento: usuario.IdDocumento || usuario.IdDocumento || "",
      NumeroDocumento: usuario.NumeroDocumento || usuario.NumeroDocumento || ""
    });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditForm({
      Nombres: "",
      Apellidos: "",
      CorreoIntitucional: "",
      TipoRol: "",
      IdDocumento: "",
      NumeroDocumento: ""
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes to backend
  const saveUserEdit = async (idUsuario) => {
    setSavingId(idUsuario);
    setError("");
    try {
      const payload = {
        Nombres: editForm.Nombres,
        Apellidos: editForm.Apellidos,
        CorreoIntitucional: editForm.CorreoIntitucional,
        TipoRol: editForm.TipoRol,
        IdDocumento: editForm.IdDocumento,
        NumeroDocumento: editForm.NumeroDocumento
      };

      const res = await fetch(`${apiUrl}/api/usuarios/${idUsuario}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok && data && data.message) {
        throw new Error(data.message || "Error al actualizar usuario");
      }

      // Optimistically update UI: find user and merge fields
      setUsuarios((prev) =>
        prev.map((u) =>
          (u.IdUsuario === idUsuario || u.id === idUsuario)
            ? { ...u, ...payload }
            : u
        )
      );

      setEditingUserId(null);
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      setError(err.message || "Error al guardar cambios");
    } finally {
      setSavingId(null);
    }
  };

  // Toggle active/inactive
  const toggleUsuarioActivo = async (idUsuario) => {
    setTogglingId(idUsuario);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/usuarios/${idUsuario}/toggle-activo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al cambiar estado");
      }

      // Update UI: find user and toggle Activo / IdActivo field
      setUsuarios((prev) =>
        prev.map((u) => {
          if (u.IdUsuario === idUsuario || u.id === idUsuario) {
            // Backend returns { activo: true/false } per prior snippets
            const activo = (data.activo !== undefined) ? data.activo : !(u.Activo ?? (u.IdActivo === 1));
            // Normalize both fields depending on model
            return {
              ...u,
              Activo: activo,
              IdActivo: activo ? 1 : 0
            };
          }
          return u;
        })
      );
    } catch (err) {
      console.error("Error toggle:", err);
      setError(err.message || "Error al cambiar estado");
    } finally {
      setTogglingId(null);
    }
  };

  // Utility: render role name (when roles come as objects)
  const getRoleLabel = (user) => {
    if (user.TipoRol) return user.TipoRol;
    if (user.IdRol) {
      const r = roles.find((rr) => String(rr.IdRol || rr.id) === String(user.IdRol));
      return r ? (r.TipoRol || r.name || r.label) : "Sin Rol";
    }
    return "Sin Rol";
  };

  if (loading) {
    return (
      <div className="section-content">
        <h2>Gestión de Usuarios</h2>
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="section-content">
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Gestión de Usuarios</h2>
        <div>
          <button className="refresh-btn" onClick={() => window.location.reload()}>🔄 Recargar</button>
        </div>
      </div>

      {error && <div className="error-message" style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      <div className="users-stats" style={{ marginBottom: 16 }}>
        <div className="stat-badge total"><span>Total: {usuarios.length}</span></div>
      </div>

      {/* Filters */}
      <div className="filtros-container" style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o documento..."
          value={filtroText}
          onChange={(e) => setFiltroText(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", minWidth: 240 }}
        />

        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r.IdRol || r.id} value={r.IdRol || r.id}>
              {r.TipoRol || r.name || r.label}
            </option>
          ))}
        </select>

        <select value={filtroDocumento} onChange={(e) => setFiltroDocumento(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
          <option value="todos">Todos los tipos de documento</option>
          {documentos.map((d) => (
            <option key={d.IdDocumento || d.id} value={d.IdDocumento || d.id}>
              {d.TipoDocumento || d.name || `Documento ${d.IdDocumento || d.id}`}
            </option>
          ))}
        </select>

        <button onClick={() => { setFiltroText(""); setFiltroRol(""); setFiltroDocumento("todos"); }} style={{ padding: 8, borderRadius: 6 }}>
          🧹 Limpiar filtros
        </button>
      </div>

      {/* Table */}
      <div className="table-container" style={{ overflowX: "auto" }}>
        <table className="users-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f7f7f7" }}>
              <th style={{ padding: 10 }}>ID Usuario</th>
              <th style={{ padding: 10 }}>Nombres</th>
              <th style={{ padding: 10 }}>Apellidos</th>
              <th style={{ padding: 10 }}>Documento</th>
              <th style={{ padding: 10 }}>Correo</th>
              <th style={{ padding: 10 }}>Rol</th>
              <th style={{ padding: 10 }}>Estado</th>
              <th style={{ padding: 10 }}>Fecha Registro</th>
              <th style={{ padding: 10 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: 12, textAlign: "center" }}>No se encontraron usuarios con los filtros aplicados</td>
              </tr>
            ) : (
              usuariosFiltrados.map((usuario) => {
                const id = usuario.IdUsuario || usuario.id;
                const isEditing = editingUserId === id;

                return (
                  <tr key={id} style={{ borderBottom: "1px solid #eaeaea" }}>
                    <td style={{ padding: 8 }}>{id}</td>

                    <td style={{ padding: 8 }}>
                      {isEditing ? (
                        <input name="Nombres" value={editForm.Nombres} onChange={handleEditChange} />
                      ) : (
                        usuario.Nombres || usuario.nombres
                      )}
                    </td>

                    <td style={{ padding: 8 }}>
                      {isEditing ? (
                        <input name="Apellidos" value={editForm.Apellidos} onChange={handleEditChange} />
                      ) : (
                        usuario.Apellidos || usuario.apellidos
                      )}
                    </td>

                    <td style={{ padding: 8 }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <select name="IdDocumento" value={editForm.IdDocumento} onChange={handleEditChange}>
                            <option value="">Tipo</option>
                            {documentos.map(d => (
                              <option key={d.IdDocumento || d.id} value={d.IdDocumento || d.id}>{d.TipoDocumento || d.name}</option>
                            ))}
                          </select>
                          <input name="NumeroDocumento" value={editForm.NumeroDocumento} onChange={handleEditChange} />
                        </div>
                      ) : (
                        `${usuario.NumeroDocumento || usuario.documento || ""}`
                      )}
                    </td>

                    <td style={{ padding: 8 }}>
                      {isEditing ? (
                        <input name="CorreoIntitucional" value={editForm.CorreoIntitucional} onChange={handleEditChange} />
                      ) : (
                        usuario.CorreoIntitucional || usuario.correo || "—"
                      )}
                    </td>

                    <td style={{ padding: 8 }}>
                      {isEditing ? (
                        <select name="TipoRol" value={editForm.TipoRol} onChange={handleEditChange}>
                          <option value="">Seleccionar rol</option>
                          {roles.map(r => (
                            <option key={r.IdRol || r.id} value={r.IdRol || r.id}>{r.TipoRol || r.name}</option>
                          ))}
                        </select>
                      ) : (
                        getRoleLabel(usuario)
                      )}
                    </td>

                    <td style={{ padding: 8 }}>
                      <span style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        background: (usuario.Activo || usuario.IdActivo === 1) ? "#e6fff0" : "#fff0f0",
                        color: (usuario.Activo || usuario.IdActivo === 1) ? "#046a2a" : "#8a1f1f",
                        fontWeight: 600
                      }}>
                        {(usuario.Activo || usuario.IdActivo === 1) ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td style={{ padding: 8 }}>
                      {usuario.Fecha_Sys ? new Date(usuario.Fecha_Sys).toLocaleDateString() : "N/A"}
                    </td>

                    <td style={{ padding: 8 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        {isEditing ? (
                          <>
                            <button onClick={() => saveUserEdit(id)} disabled={savingId === id}>
                              {savingId === id ? "Guardando..." : "Guardar"}
                            </button>
                            <button onClick={cancelEditing}>Cancelar</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditing(usuario)}>Editar</button>
                            <button onClick={() => toggleUsuarioActivo(id)} disabled={togglingId === id}>
                              {togglingId === id ? "..." : ((usuario.Activo || usuario.IdActivo === 1) ? "Desactivar" : "Activar")}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionUsuarios;