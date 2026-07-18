import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/global.css";

const AtencionEstudiantes = () => {
    const navigate = useNavigate();

    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);

    const [buscar, setBuscar] = useState("");
    const [estado, setEstado] = useState("");
    const [fecha, setFecha] = useState("");

    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
    const [observacion, setObservacion] = useState("");

    useEffect(() => {
        obtenerReservas();
    }, []);

    const obtenerReservas = async () => {
        try {
            setLoading(true);

            const parametros = new URLSearchParams();

            if (buscar.trim()) {
                parametros.append("buscar", buscar.trim());
            }

            if (estado) {
                parametros.append("estado", estado);
            }

            if (fecha) {
                parametros.append("fecha", fecha);
            }

            const query = parametros.toString();

            const data = await api(
                `/api/atencion/reservas${query ? `?${query}` : ""}`
            );

            setReservas(data);

        } catch (error) {
            console.error("Error al cargar reservas:", error);
            alert(error.message || "No se pudieron cargar las reservas");
        } finally {
            setLoading(false);
        }
    };

    const limpiarFiltros = () => {
        setBuscar("");
        setEstado("");
        setFecha("");
        obtenerReservas();
    };

    const abrirIncidente = (reserva) => {
        setReservaSeleccionada(reserva);
        setObservacion(reserva.observacion || "");
    };

    const cerrarIncidente = () => {
        setReservaSeleccionada(null);
        setObservacion("");
    };

    const registrarIncidente = async () => {
        if (!observacion.trim()) {
            alert("Debe escribir una observación");
            return;
        }

        try {
            await api(
                `/api/atencion/reservas/${reservaSeleccionada.id}/incidente`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        observacion
                    })
                }
            );

            alert("Incidente registrado correctamente");

            cerrarIncidente();
            obtenerReservas();

        } catch (error) {
            console.error(
                "Error al registrar incidente:",
                error
            );

            alert(
                error.message ||
                "No se pudo registrar el incidente"
            );
        }
    };

    return (
        <div className="page-container">
            <h1 className="page-title">
                Atención a Estudiantes
            </h1>

            <div className="page-actions">
                <button
                    className="btn btn-danger btn-back"
                    onClick={() => navigate(-1)}
                >
                    Regresar
                </button>
            </div>

            <hr className="section-divider" />

            <div className="filtros">
                <input
                    className="form-input"
                    type="text"
                    placeholder="Buscar estudiante, correo o reserva"
                    value={buscar}
                    onChange={(e) =>
                        setBuscar(e.target.value)
                    }
                />

                <select
                    className="form-input"
                    value={estado}
                    onChange={(e) =>
                        setEstado(e.target.value)
                    }
                >
                    <option value="">
                        Todos los estados
                    </option>

                    <option value="activa">
                        Activa
                    </option>

                    <option value="cancelada">
                        Cancelada
                    </option>

                    <option value="finalizada">
                        Finalizada
                    </option>

                    <option value="pendiente">
                        Pendiente
                    </option>
                </select>

                <input
                    className="form-input"
                    type="date"
                    value={fecha}
                    onChange={(e) =>
                        setFecha(e.target.value)
                    }
                />

                <button
                    className="btn btn-primary"
                    onClick={obtenerReservas}
                >
                    Buscar
                </button>

                <button
                    className="btn btn-success"
                    onClick={limpiarFiltros}
                >
                    Limpiar
                </button>
            </div>

            {loading ? (
                <p className="loading">
                    Cargando reservas...
                </p>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Estudiante</th>
                                <th>Correo</th>
                                <th>Espacio</th>
                                <th>Biblioteca</th>
                                <th>Fecha</th>
                                <th>Hora inicio</th>
                                <th>Estado</th>
                                <th>Observación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {reservas.length > 0 ? (
                                reservas.map((reserva) => (
                                    <tr key={reserva.id}>
                                        <td>
                                            {reserva.id}
                                        </td>

                                        <td>
                                            {reserva.usuario?.nombre ||
                                                "Sin usuario"}
                                        </td>

                                        <td>
                                            {reserva.usuario?.correo ||
                                                "Sin correo"}
                                        </td>

                                        <td>
                                            {reserva.espacio?.nombre ||
                                                reserva.espacio_id}
                                        </td>

                                        <td>
                                            {reserva.espacio?.biblioteca ||
                                                "Sin biblioteca"}
                                        </td>

                                        <td>
                                            {reserva.fecha}
                                        </td>

                                        <td>
                                            {reserva.hora_inicio}
                                        </td>

                                        <td>
                                            {reserva.estado}
                                        </td>

                                        <td>
                                            {reserva.observacion ||
                                                "Sin observaciones"}
                                        </td>

                                        <td>
                                            <button
                                                className="btn btn-success"
                                                onClick={() => abrirIncidente(reserva)}
                                            >
                                                Registrar incidente
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11">
                                        No se encontraron reservas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {reservaSeleccionada && (
                <div className="form-card formulario-gestion">
                    <h2>
                        Registrar incidente
                    </h2>

                    <p>
                        <strong>
                            Estudiante:
                        </strong>{" "}
                        {reservaSeleccionada.usuario?.nombre}
                    </p>

                    <p>
                        <strong>
                            Reserva:
                        </strong>{" "}
                        #{reservaSeleccionada.id}
                    </p>

                    <label>
                        Observación / Incidente:
                    </label>

                    <textarea
                        className="form-input"
                        rows="5"
                        value={observacion}
                        onChange={(e) =>
                            setObservacion(e.target.value)
                        }
                        placeholder="Escriba el incidente u observación..."
                    />

                    <button
                        className="btn btn-primary"
                        onClick={registrarIncidente}
                    >
                        Guardar Observación
                    </button>

                    <button
                        className="btn btn-danger spacer-xs"
                        onClick={cerrarIncidente}
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
};

export default AtencionEstudiantes;