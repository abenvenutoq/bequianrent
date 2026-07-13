import { Reserva } from "../models/modelos";

export const RESERVAS: Reserva[] = [
    {
        id: 1,
        idVehiculo: 1,
        correo: "admin@bequianrent.cl",
        rut: "15940700-4",
        fechaDesde: "2026-06-15",
        fechaHasta: "2026-06-22",
        total: 350000,
        estado: "Completada"
    },
    {
        id: 2,
        idVehiculo: 2,
        correo: "admin@bequianrent.cl",
        rut: "15940700-4",
        fechaDesde: "2026-06-16",
        fechaHasta: "2026-06-23",
        total: 360000,
        estado: "Completada"
    },
    {
        id: 3,
        idVehiculo: 3,
        correo: "cliente@gmail.com",
        rut: "9843565-4",
        fechaDesde: "2026-06-17",
        fechaHasta: "2026-06-24",
        total: 340000,
        estado: "Completada"
    },
    {
        id: 4,
        idVehiculo: 4,
        correo: "cliente@gmail.com",
        rut: "9843565-4",
        fechaDesde: "2026-06-18",
        fechaHasta: "2026-06-25",
        total: 370000,
        estado: "Completada"
    }
]