// Importante: config/env carga dotenv y debe requerirse antes que ./src/app,
// porque app.js (transitivamente) construye el cliente de Anthropic al cargarse,
// y ese cliente lee ANTHROPIC_API_KEY del entorno en el momento del import.
const { port } = require("./src/config/env");
const app = require("./src/app");

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
