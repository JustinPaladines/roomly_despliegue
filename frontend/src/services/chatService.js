export async function enviarMensaje(messages) {

    const response = await fetch("http://localhost:3000/api/chat", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            messages
        })

    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al conectar con el servidor.");
    }

    return data.answer;

}