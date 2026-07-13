import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../styles/global.css";

const MisReservas = () => {
    const navigate = useNavigate();

    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        obtenerReservas();
    }, []);

    const obtenerReservas = async () => {
        const {
            data: { user }
        } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from("reservas")
            .select("*")
            .eq("usuario_id", user.id)
            .order("id", { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        setReservas(data);
        setLoading(false);
    };

    const cancelarReserva = async (id) => {
        const confirmar = window.confirm(
            "¿Desea cancelar esta reserva?"
        );

        if (!confirmar) return;

        const { error } = await supabase
            .from("reservas")
            .update({
                estado: "cancelada",
                finalizada_at: new Date().toISOString()
            })
            .eq("id", id);

        if (error) {
            alert(error.message);
            return;
        }

        obtenerReservas();
    };

    return (
    <div className="page-container">
        <h1 className="page-title">
            Mis Reservas
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
                            <th>Espacio ID</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Estado</th>
                            <th>Observación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {reservas.map((reserva) => (
                            <tr key={reserva.id}>
                                <td>{reserva.id}</td>
                                <td>{reserva.espacio_id}</td>
                                <td>{reserva.fecha}</td>
                                <td>{reserva.hora_inicio}</td>
                                <td>{reserva.estado}</td>
                                <td>{reserva.observacion}</td>

                                <td>
                                    {reserva.estado === "activa" && (
                                        <button
                                            className="btn btn-danger"
                                            onClick={() =>
                                                cancelarReserva(
                                                    reserva.id
                                                )
                                            }
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);
};

export default MisReservas;