import { createRoot } from "react-dom/client";
import { verifyJsCorp } from './core/js-corp-lock';
import App from "./App.tsx";
import "./index.css";

// Core Integrity Check
verifyJsCorp();

createRoot(document.getElementById("root")!).render(<App />);
