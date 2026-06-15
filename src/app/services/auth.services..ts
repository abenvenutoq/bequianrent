import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { RolUsuario, Sesion, Usuario, ResultadoOperacion } from "../models/modelos";
import { USUARIOS } from "../data/usuarios.data";

@Injectable({ providedIn: 'root'})
export class AuthService {

    private readonly claveUsuarios = 'bequianrent_usuario';
    private readonly claveSesion = 'bequianrent_sesion';
    
    private readonly sesionSubject = new BehaviorSubject<Sesion | null>(this.obtenerSesion());
    readonly Sesion$ = this.sesionSubject.asObservable();
    

    constructor() {
        this.inicializarUsuario();
    }

    isBrowser(): boolean {
        return typeof window !== 'undefined';
    }

    inicializarUsuario(): void {
        if (!this.isBrowser()) return;

        if (!localStorage.getItem(this.claveUsuarios)) {
            localStorage.setItem(this.claveUsuarios, JSON.stringify(USUARIOS));
        }
    }

    obtenerUsusario(): Usuario[] {
        if (!this.isBrowser()) return [];

        const datos = localStorage.getItem(this.claveUsuarios);
        return datos ? JSON.parse(datos) as Usuario[] : [];
    }

    guardarUsuario(usuarios: Usuario[]): void {
        if (!this.isBrowser()) return;

        localStorage.setItem(this.claveUsuarios, JSON.stringify(usuarios));
    }

    registrar(
        nombre: string, 
        apellido: string, 
        rut: string, 
        correo: string, 
        telefono: string, 
        direccion: string, 
        password: string
    ): ResultadoOperacion {
        const usuarios = this.obtenerUsusario();

        const existeEmail = usuarios.find(item => item.correo.toLowerCase() === correo.trim().toLowerCase());
        if (existeEmail) {
            return {
                ok: false,
                mensaje: "El correo electrónico ya se encuentra registrado."
            };
        }

        const nuevoUsuario: Usuario = {
            id: this.generarId(usuarios),
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            rut: rut.trim(),
            correo: correo.trim(),
            telefono: telefono.trim(),
            direccion: direccion.trim(),
            password: password,
            rol: 'cliente'
        };

        usuarios.push(nuevoUsuario);
        this.guardarUsuario(usuarios);

        return {
            ok: true,
            mensaje: "Usuario registrado con éxito. Ya puedes iniciar sesión."
        };
    }

    iniciarSesion(correo: string, password: string): ResultadoOperacion {
        const usuario = this.obtenerUsusario().find(
            (item) => item.correo.toLowerCase() === correo.trim().toLowerCase() && item.password === password
        );

        if (!usuario) {
            return {
                ok: false,
                mensaje: "Correo o contraseña incorrectos."
            };
        }

        const sesion: Sesion = {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol,
            loged: true
        };

        if (this.isBrowser()) {
            sessionStorage.setItem(this.claveSesion, JSON.stringify(sesion));
        }
        this.sesionSubject.next(sesion);

        return {
            ok: true,
            mensaje: `Bienvenido/a ${usuario.nombre}, redireccionando ...`
        };
    }

    cambiarPassword(correo: string, nuevaClave: string): ResultadoOperacion {
        if (!this.isBrowser()) return { ok: false, mensaje: "Error del sistema" };

        const usuarios = this.obtenerUsusario();
        const index = usuarios.findIndex(u => u.correo.toLowerCase() === correo.trim().toLowerCase());

        if (index === -1) {
            return {
                ok: false,
                mensaje: "El correo electrónico no se encuentra registrado."
            };
        }

        // Actualizamos la contraseña y guardamos
        usuarios[index].password = nuevaClave;
        this.guardarUsuario(usuarios);

        return {
            ok: true,
            mensaje: "¡Contraseña actualizada con éxito! Ya puedes iniciar sesión."
        };
    }

    obtenerSesion(): Sesion | null {
        if (!this.isBrowser()) return null;
        const datos = sessionStorage.getItem(this.claveSesion);
        return datos ? JSON.parse(datos) as Sesion : null;
    }

    cerrarSesion(): void {
        if (!this.isBrowser()) return;

        sessionStorage.removeItem(this.claveSesion);
        this.sesionSubject.next(null);
    }

    estaLogueado(): boolean {
        return this.obtenerSesion() !== null;
    }

    esAdmin(): boolean {
        return this.obtenerSesion()?.rol === 'admin';
    }

    private generarId(lista: Usuario[]): number {
        if (lista.length === 0) {
            return 1;
        }
        return Math.max(...lista.map(u => Number(u.id))) + 1;
    }
}