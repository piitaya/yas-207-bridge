import app from "./app";

const PORT = Number(process.env.PORT) || 9207;

app.listen(PORT);

console.log(`🚀 YAS 207 bridge running on port ${PORT}`);
