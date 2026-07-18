// backend/src/routes/authRoutes.js

const express = require("express");
const router = express.Router();

const {
    supabaseAdmin,
    supabaseAuth,
    } = require("../supabaseClients");

    router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
        error: "Faltan credenciales",
        });
    }

    try {
        // Buscar usuario en la tabla usuarios
        const { data: userData, error: userError } = await supabaseAdmin
        .from("usuarios")
        .select("id, correo, estado, intentos_fallidos, rol")
        .eq("correo", email)
        .maybeSingle();

        if (userError) {
        throw userError;
        }

        if (!userData) {
        return res.status(401).json({
            error: "Credenciales incorrectas",
        });
        }

        const {
        id,
        estado,
        intentos_fallidos,
        rol,
        } = userData;

        // Verificar estado del usuario
        if (estado === "bloqueado") {
        return res.status(403).json({
            error:
            "Cuenta bloqueada por seguridad. Contacta al administrador.",
        });
        }

        if (estado === "inactivo") {
        return res.status(403).json({
            error:
            "Cuenta inactiva. Contacta al administrador.",
        });
        }

        // Autenticar con Supabase Auth
        const {
        data: authData,
        error: authError,
        } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
        });

        if (authError) {
        const nuevosIntentos = (intentos_fallidos || 0) + 1;

        let nuevoEstado = estado;
        let mensaje = "Credenciales incorrectas";

        if (nuevosIntentos >= 5) {
            nuevoEstado = "bloqueado";
            mensaje =
            "Cuenta bloqueada temporalmente por demasiados intentos fallidos.";
        }

        await supabaseAdmin
            .from("usuarios")
            .update({
            intentos_fallidos: nuevosIntentos,
            estado: nuevoEstado,
            })
            .eq("id", id);

        return res.status(401).json({
            error: mensaje,
        });
        }

        // Reiniciar intentos fallidos
        await supabaseAdmin
        .from("usuarios")
        .update({
            intentos_fallidos: 0,
            estado: "activo",
        })
        .eq("id", id);

        return res.status(200).json({
        message: "Login exitoso",
        user: {
            id: authData.user.id,
            email: authData.user.email,
            rol,
            estado: "activo",
        },
        token: authData.session.access_token,
        });

    } catch (err) {
        console.error("Error en login:", err);

        return res.status(500).json({
        error: "Error interno del servidor",
        detalle: err.message,
        });
    }
});

module.exports = router;