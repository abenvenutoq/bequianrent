import { Reserva } from "../models/modelos";

export const RESERVAS: Reserva[] = [
    {
        id: 1,
        idVehiculo: 1,
        correo: "admin@admin.cl",
        rut: "15940700-4",
        fechaDesde: new Date("2026-06-15"),
        fechaHasta: new Date("2026-06-22"),
        total: 350000,
        estado: "Confirmada"
    },
    {
        id: 2,
        idVehiculo: 2,
        correo: "admin@admin.cl",
        rut: "15940700-4",
        fechaDesde: new Date("2026-06-16"),
        fechaHasta: new Date("2026-06-23"),
        total: 360000,
        estado: "Confirmada"
    },
    {
        id: 3,
        idVehiculo: 3,
        correo: "cliente@cliente.cl",
        rut: "9843565-4",
        fechaDesde: new Date("2026-06-17"),
        fechaHasta: new Date("2026-06-24"),
        total: 340000,
        estado: "Confirmada"
    },
    {
        id: 4,
        idVehiculo: 4,
        correo: "cliente@cliente.cl",
        rut: "9843565-4",
        fechaDesde: new Date("2026-06-18"),
        fechaHasta: new Date("2026-06-25"),
        total: 370000,
        estado: "Confirmada"
    }
]