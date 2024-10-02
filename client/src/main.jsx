import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './scss/styles.scss';
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from "./App.jsx";
import "./index.css";
console.log(import.meta.env.SERVER_URL);
createRoot(document.getElementById("root")).render(
    <StrictMode>
       <App />
    </StrictMode>,
);
