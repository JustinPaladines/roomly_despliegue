import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../styles/global.css";

const GestionBibliotecas = () => {
    const navigate = useNavigate();

    const [bibliotecas, setBibliotecas] = useState([]);
    const [loading, setLoading] = useState(true);

    const [nombre, setNombre] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [horarioApertura, setHorarioApertura] = useState("");
    const [horarioCierre, setHorarioCierre] = useState("");

    const [modoEdicion, setModoEdicion] = useState(false);
    const [bibliotecaEditando, setBibliotecaEditando] = useState(null);

    useEffect(() => {
        obtenerBibliotecas();
    }, []);

    const obtenerBibliotecas = async () => {
        const { data, error } = await supabase
            .from("bibliotecas")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.error(error);
            return;
        }

        setBibliotecas(data);
        setLoading(false);
    };

    const validarFormulario = () => {
        if (!nombre.trim()) {
            alert("El nombre es obligatorio");
            return false;
        }

        if (nombre.trim().length < 3) {
            alert("El nombre debe tener al menos 3 caracteres");
            return false;
        }

        if (!ubicacion.trim()) {
            alert("La ubicación es obligatoria");
            return false;
        }

        if (!horarioApertura) {
            alert("Debe ingresar la hora de apertura");
            return false;
        }

        if (!horarioCierre) {
            alert("Debe ingresar la hora de cierre");
            return false;
        }

        if (horarioApertura >= horarioCierre) {
            alert("La hora de apertura debe ser menor a la hora de cierre");
            return false;
        }

        return true;
    };

    const limpiarFormulario = () => {
        setNombre("");
        setUbicacion("");
        setHorarioApertura("");
        setHorarioCierre("");

        setModoEdicion(false);
        setBibliotecaEditando(null);
    };

    const crearBiblioteca = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        const { error } = await supabase
            .from("bibliotecas")
            .insert([
                {
                    nombre,
                    ubicacion,
                    horario_apertura: horarioApertura,
                    horario_cierre: horarioCierre,
                    estado: "activa"
                }
            ]);

        if (error) {
            alert(error.message);
            return;
        }

        limpiarFormulario();
        obtenerBibliotecas();
    };

    const cargarEdicion = (biblioteca) => {
        setModoEdicion(true);

        setBibliotecaEditando(biblioteca.id);

        setNombre(biblioteca.nombre);
        setUbicacion(biblioteca.ubicacion);
        setHorarioApertura(biblioteca.horario_apertura);
        setHorarioCierre(biblioteca.horario_cierre);
    };

    const actualizarBiblioteca = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        const { error } = await supabase
            .from("bibliotecas")
            .update({
                nombre,
                ubicacion,
                horario_apertura: horarioApertura,
                horario_cierre: horarioCierre
            })
            .eq("id", bibliotecaEditando);

        if (error) {
            alert(error.message);
            return;
        }

        limpiarFormulario();
        obtenerBibliotecas();
    };

    const eliminarBiblioteca = async (id) => {
        const confirmar = window.confirm(
            "¿Desea eliminar esta biblioteca?"
        );

        if (!confirmar) return;

        const { error } = await supabase
            .from("bibliotecas")
            .delete()
            .eq("id", id);

        if (error) {
            alert(error.message);
            return;
        }

        obtenerBibliotecas();
    };

    return (
    <div className="page-container">
        <h1 className="page-title">
            Gestión de Bibliotecas
        </h1>

        <div className="page-actions">
            <button
                className="btn btn-danger btn-back"
                onClick={() => navigate(-1)}
            >
                Regresar
            </button>
        </div>

        <form
            className="form-card formulario-gestion"
            onSubmit={
                modoEdicion
                    ? actualizarBiblioteca
                    : crearBiblioteca
            }
        >
            <input
                className="form-input"
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />

            <input
                className="form-input"
                type="text"
                placeholder="Ubicación"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
            />

            <input
                className="form-input"
                type="time"
                value={horarioApertura}
                onChange={(e) =>
                    setHorarioApertura(e.target.value)
                }
            />

            <input
                className="form-input"
                type="time"
                value={horarioCierre}
                onChange={(e) =>
                    setHorarioCierre(e.target.value)
                }
            />

            <button
                type="submit"
                className={`btn ${
                    modoEdicion
                        ? "btn-success"
                        : "btn-primary"
                }`}
            >
                {modoEdicion
                    ? "Actualizar Biblioteca"
                    : "Crear Biblioteca"}
            </button>

            {modoEdicion && (
                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={limpiarFormulario}
                >
                    Cancelar
                </button>
            )}
        </form>

        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Ubicación</th>
                        <th>Apertura</th>
                        <th>Cierre</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {!loading &&
                        bibliotecas.map((biblioteca) => (
                            <tr key={biblioteca.id}>
                                <td>{biblioteca.id}</td>
                                <td>{biblioteca.nombre}</td>
                                <td>{biblioteca.ubicacion}</td>
                                <td>{biblioteca.horario_apertura}</td>
                                <td>{biblioteca.horario_cierre}</td>
                                <td>{biblioteca.estado}</td>

                                <td>
                                    <button
                                        className="btn btn-success"
                                        onClick={() =>
                                            cargarEdicion(biblioteca)
                                        }
                                    >
                                        Editar
                                    </button>

                                    <button
                                        className="btn btn-danger spacer-xs"
                                        onClick={() =>
                                            eliminarBiblioteca(
                                                biblioteca.id
                                            )
                                        }
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    </div>
);
}

export default GestionBibliotecas;