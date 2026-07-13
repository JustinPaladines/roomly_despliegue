import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../styles/global.css";

const GestionReservas = () => {
    const navigate = useNavigate();

    const [espacios, setEspacios] = useState([]);

    const [espacioId, setEspacioId] = useState("");
    const [fecha, setFecha] = useState("");
    const [horaInicio, setHoraInicio] = useState("");
    const [observacion, setObservacion] = useState("");

    useEffect(() => {
        obtenerEspacios();
    }, []);

    const obtenerEspacios = async () => {
        const { data, error } = await supabase
            .from("espacios")
            .select("*")
            .neq("estado", "mantenimiento")
            .order("id", { ascending: true });

        if (error) {
            console.error(error);
            return;
        }

        setEspacios(data);
    };

    const validarFormulario = () => {
        if (!espacioId) {
            alert("Debe seleccionar un espacio");
            return false;
        }

        if (!fecha) {
            alert("Debe seleccionar una fecha");
            return false;
        }

        if (!horaInicio) {
            alert("Debe seleccionar una hora");
            return false;
        }

        const hoy = new Date().toISOString().split("T")[0];

        if (fecha < hoy) {
            alert("No puede reservar fechas pasadas");
            return false;
        }

        return true;
    };

    const limpiarFormulario = () => {
        setEspacioId("");
        setFecha("");
        setHoraInicio("");
        setObservacion("");
    };

    const crearReserva = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        const {
            data: { user }
        } = await supabase.auth.getUser();

        const { error } = await supabase
            .from("reservas")
            .insert([
                {
                    usuario_id: user.id,
                    espacio_id: Number(espacioId),
                    fecha,
                    hora_inicio: horaInicio,
                    estado: "activa",
                    observacion
                }
            ]);

        if (error) {
            alert(error.message);
            return;
        }

        alert("Reserva creada correctamente");

        limpiarFormulario();
    };

    return (
    <div className="page-container">
        <h1 className="page-title">
            Nueva Reserva
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

        <form
            className="form-card formulario-gestion"
            onSubmit={crearReserva}
        >
            <div className="grupo-campo">
                <label>Espacio:</label>

                <select
                    className="form-input"
                    value={espacioId}
                    onChange={(e) =>
                        setEspacioId(e.target.value)
                    }
                    required
                >
                    <option value="">
                        Seleccione un espacio
                    </option>

                    {espacios.map((espacio) => (
                        <option
                            key={espacio.id}
                            value={espacio.id}
                        >
                            {espacio.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grupo-campo">
                <label>Fecha:</label>

                <input
                    className="form-input"
                    type="date"
                    value={fecha}
                    onChange={(e) =>
                        setFecha(e.target.value)
                    }
                    required
                />
            </div>

            <div className="grupo-campo">
                <label>Hora de inicio:</label>

                <input
                    className="form-input"
                    type="time"
                    value={horaInicio}
                    onChange={(e) =>
                        setHoraInicio(e.target.value)
                    }
                    required
                />
            </div>

            <div className="grupo-campo">
                <label>Observación:</label>

                <input
                    className="form-input"
                    type="text"
                    value={observacion}
                    onChange={(e) =>
                        setObservacion(e.target.value)
                    }
                    placeholder="Opcional"
                />
            </div>

            <button
                type="submit"
                className="btn btn-primary btn-full"
            >
                Reservar
            </button>
        </form>
    </div>
);
};

export default GestionReservas;