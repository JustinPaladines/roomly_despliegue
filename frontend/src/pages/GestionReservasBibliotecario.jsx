import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../styles/global.css";

const GestionReservasBibliotecario = () => {
    const navigate = useNavigate();

    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        obtenerReservas();
    }, []);

    const obtenerReservas = async () => {
        const { data, error } = await supabase
            .from("reservas")
            .select("*")
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
                estado: "cancelada"
            })
            .eq("id", id);

        if (error) {
            alert(error.message);
            return;
        }

        obtenerReservas();
    };

    const finalizarReserva = async (id) => {
        const confirmar = window.confirm(
            "¿Desea finalizar esta reserva?"
        );

        if (!confirmar) return;

        const { error } = await supabase
            .from("reservas")
            .update({
                estado: "finalizada",
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
            Gestión de Reservas
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
                            <th>Usuario</th>
                            <th>Espacio</th>
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
                                <td>{reserva.usuario_id}</td>
                                <td>{reserva.espacio_id}</td>
                                <td>{reserva.fecha}</td>
                                <td>{reserva.hora_inicio}</td>
                                <td>{reserva.estado}</td>
                                <td>{reserva.observacion}</td>

                                <td>
                                    {reserva.estado === "activa" && (
                                        <>
                                            <button
                                                className="btn btn-success"
                                                onClick={() =>
                                                    finalizarReserva(
                                                        reserva.id
                                                    )
                                                }
                                            >
                                                Finalizar
                                            </button>

                                            <button
                                                className="btn btn-danger spacer-xs"
                                                onClick={() =>
                                                    cancelarReserva(
                                                        reserva.id
                                                    )
                                                }
                                            >
                                                Cancelar
                                            </button>
                                        </>
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
}

export default GestionReservasBibliotecario;