import { Usuario } from "../models/modelos";

export const USUARIOS: Usuario[] = [
    {
        id: 1,
        nombre: "Angelo",
        apellido: "Benvenuto",
        rut: "15940700-4",
        correo: "admin@admin.cl",
        telefono: "963083858",
        direccion: "Av. Maria Elena 370",
        password: "#Asdf1234",
        rol: "admin"
    },
    {
        id: 2,
        nombre: "Maria",
        apellido: "Quilobran",
        rut: "9843565-4",
        correo: "cliente@cliente.cl",
        telefono: "987654321",
        direccion: "Av. Maria Elena 370",
        password: "#Asdf1234",
        rol: "cliente"
    }
]