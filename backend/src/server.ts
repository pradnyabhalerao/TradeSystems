import dotenv from "dotenv";
dotenv.config();
import app from "./app";
const port = Number(process.env.PORT ?? 5000);
app.listen(port, () => console.log(`ERP API listening on http://localhost:${port}`));
