import { Usuario } from "../models/modelos";

export const USUARIOS: Usuario[] = [
    {
        id: 1,
        nombre: "Administrador",
        apellido: "Bequianrent",
        rut: "15940700-4",
        correo: "admin@bequianrent.cl",
        fechaNacimiento: "1984-11-13",
        direccion: "",
        password: "*Qwe123",
        rol: "admin"
    },
    {
        id: 2,
        nombre: "Maria",
        apellido: "Quilobran",
        rut: "9843565-4",
        correo: "cliente@gmail.com",
        fechaNacimiento: "1962-12-23",
        direccion: "Av. Maria Elena 370",
        password: "*Qwe123",
        rol: "cliente"
    }
]