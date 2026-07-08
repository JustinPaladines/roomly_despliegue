// punto de entrada del servidor, esucha peticiones

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const verificarSupabaseToken = require('./authMiddleware');
const espaciosRoutes = require("./routes/espaciosRoutes");
const { generarRespuesta } = require("./services/huggingface");


const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/espacios", espaciosRoutes);

// ruta protegida, Solo si el token es válido, se ejecuta lo de adentro
app.get('/api/usuarios', verificarSupabaseToken, (req, res) => {
    res.json({ 
        mensaje: 'Usuario autenticado correctamente',
        usuario: {
            id: req.usuario.id,
            email: req.usuario.email
    }
});
});

app.post("/api/chat", async (req, res) => {

    try {

        const { messages } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "Debes enviar un arreglo de mensajes."
            });
        }

        const answer = await generarRespuesta(messages);

        res.json({
            answer
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "No se pudo generar la respuesta.",
            detail: error.message
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Servidor de autenticación en puerto ${PORT}`));