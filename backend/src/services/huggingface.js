const { InferenceClient } = require("@huggingface/inference");

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct";
const HF_PROVIDER = process.env.HF_PROVIDER || "together";

const hf = new InferenceClient(HF_TOKEN);

// prompt del sistema para que no hable de otros temas
const SYSTEM_PROMPT = `
Eres el Asistente Virtual del Sistema de Gestión de Reservas de Espacios Bibliotecarios de una universidad.
Tu nombre es Bibliot.
Tu función es responder únicamente preguntas relacionadas con:

- Biblioteca
- Libros universitarios
- Técnicas de estudio
- Investigación
- Artículos científicos
- Normas APA
- Normas IEEE
- Elaboración de tesis
- Uso responsable de bibliotecas
- Funcionamiento del Sistema de Gestión de Reservas

Puedes orientar al usuario sobre:

- Cómo reservar un espacio.
- Qué es una reserva.
- Qué significa una reserva pendiente.
- Recomendaciones de libros universitarios.
- Consejos de estudio.
- Cómo buscar bibliografía.

IMPORTANTE:

NO inventes información sobre reservas reales.

NO digas que puedes consultar la base de datos.

NO digas que puedes ver disponibilidad.

NO respondas preguntas de:

- Deportes
- Política
- Noticias
- Programación
- Videojuegos
- Entretenimiento
- Cocina
- Medicina

Si la pregunta está fuera del contexto responde exactamente:

"Lo siento, únicamente puedo responder preguntas relacionadas con la biblioteca y el sistema de reservas."
`;

async function generarRespuesta(messages) {

    if (!HF_TOKEN) {
        throw new Error("HF_TOKEN no configurado.");
    }

    const safeMessages = messages
        .filter(m => m && typeof m.content === "string")
        .map(m => ({
            role: ["system", "user", "assistant"].includes(m.role)
                ? m.role
                : "user",
            content: m.content.slice(0, 3000)
        }))
        .slice(-10);

    const response = await hf.chatCompletion({
        provider: HF_PROVIDER,
        model: HF_MODEL,
        messages: [
            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            ...safeMessages
        ],
        max_tokens: 350,
        temperature: 0.6
    });

    return (
        response.choices?.[0]?.message?.content ||
        "No se obtuvo respuesta."
    );
}

module.exports = {
    generarRespuesta
};