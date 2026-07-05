import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { RolUsuario, Sesion, Usuario, ResultadoOperacion } from "../models/modelos";
import { USUARIOS } from "../data/usuarios.data";

/**
 * @description
 * Servicio para autenticación, autorización y persistencia de sesiones.
 * * Este servicio se encarga de:
 * - Mantener el estado de la sesión activa de forma reactiva mediante un `BehaviorSubject`.
 * - Controlar el ciclo de vida del registro e inicio de sesión de los usuarios en LocalStorage y SessionStorage.
 * - Validar roles y privilegios administrativos globales.
 */
@Injectable({ providedIn: 'root'})
export class AuthService {

    /** Key utilizada para guardar y recuperar la colección de usuarios del localstorage */
    private readonly claveUsuarios = 'bequianrent_usuario';
    /** Key para persistencia del token de sesión activa en localstorage */
    private readonly claveSesion = 'bequianrent_sesion';
    /** Subjet interno para almacenar estado de la sisión del usuario */
    private readonly sesionSubject = new BehaviorSubject<Sesion | null>(this.obtenerSesion());
    /** Observable para subscripcion de los componentes en tiempo real respecto a sesión (Login o Logut) */
    readonly Sesion$ = this.sesionSubject.asObservable();
    
    /**
     * Constructor del servicio.
     */
    constructor() {
        this.inicializarUsuario();
    }

    /**
     * Verifica si el codigo se esta ejecutando en browser
     * evita errores de referencias nulas durente SSR
     * @returns {boolean} `true` si se ejecuta en el browser, `false` si se ejecuta en el servidor Angular.
     */
    isBrowser(): boolean {
        return typeof window !== 'undefined';
    }

    /**
     * Verifica existencia en BD usuario en localstorage
     * Si no existe ninguna key registrada, inyecta los usuarios base.
     */
    inicializarUsuario(): void {
        if (!this.isBrowser()) return;

        if (!localStorage.getItem(this.claveUsuarios)) {
            localStorage.setItem(this.claveUsuarios, JSON.stringify(USUARIOS));
        }
    }

    /**
     * REcupera el listado completo de los usuarios registrado en la app
     * @returns {Usuario[]} Un arreglo con todos los objetos {@link Usuario} encontrados.
     */
    obtenerUsuario(): Usuario[] {
        if (!this.isBrowser()) return [];

        const datos = localStorage.getItem(this.claveUsuarios);
        return datos ? JSON.parse(datos) as Usuario[] : [];
    }

    /**
     * Sobrescribe lista actualizada de usuarios en localstorage
     * @param {Usuario[]} usuarios Colección completa de usuarios a guardar.
     */
    guardarUsuario(usuarios: Usuario[]): void {
        if (!this.isBrowser()) return;

        localStorage.setItem(this.claveUsuarios, JSON.stringify(usuarios));
    }

    /**
     * Registra una nueva cuenta de usuario en el sistema.
     * Valida de forma estricta que el correo electrónico no esté duplicado antes de realizar la inserción.
     * @param {string} nombre Nombre del usuario.
     * @param {string} apellido Apellido del usuario.
     * @param {string} rut Rol Único Tributario (RUT) chileno ya formateado.
     * @param {string} correo Dirección de correo electrónico único.
     * @param {string} fechaNacimiento Fecha de nacimiento en formato string plano.
     * @param {string} password Contraseña maestra de la cuenta.
     * @param {string} [direccion] Dirección residencial (campo opcional).
     * @returns {ResultadoOperacion} Resultado del flujo con éxito o error de duplicidad.
     */
    registrar(
        nombre: string, 
        apellido: string, 
        rut: string, 
        correo: string, 
        fechaNacimiento: string, 
        direccion: string, 
        password: string
    ): ResultadoOperacion {
        const usuarios = this.obtenerUsuario();

        const existeEmail = usuarios.find(item => item.correo.toLowerCase() === correo.trim().toLowerCase());
        if (existeEmail) {
            return {
                ok: false,
                mensaje: "El correo electrónico ya se encuentra registrado."
            };
        }

        // Creación del nuevo usuario asignándole rol de cliente por defecto
        const nuevoUsuario: Usuario = {
            id: this.generarId(usuarios),
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            rut: rut.trim(),
            correo: correo.trim(),
            fechaNacimiento: fechaNacimiento.trim(),
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

    /**
     * Valida las credenciales de acceso e inicia la sesión si coinciden.
     * En caso de éxito, crea un objeto de sesión en SessionStorage y notifica a los flujos reactivos.
     * @param {string} correo Correo electrónico introducido en el formulario.
     * @param {string} password Contraseña introducida en el formulario.
     * @returns {ResultadoOperacion} Objeto de interfaz con el estado (`ok: boolean`) y el mensaje descriptivo del resultado.
     */
    iniciarSesion(correo: string, password: string): ResultadoOperacion {
        const usuario = this.obtenerUsuario().find(
            (item) => item.correo.toLowerCase() === correo.trim().toLowerCase() && item.password === password
        );

        if (!usuario) {
            return {
                ok: false,
                mensaje: "Correo o contraseña incorrectos."
            };
        }

        // Estructuración del payload de sesión
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

    /**
     * Permite restablecer la contraseña de un usuario mediante su correo de identificación.
     * @param {string} correo Correo del usuario que solicita la recuperación.
     * @param {string} nuevaClave Nueva clave que reemplazará a la anterior.
     * @returns {ResultadoOperacion} Estado e informe de la operación de actualización.
     */
    cambiarPassword(correo: string, nuevaClave: string): ResultadoOperacion {
        if (!this.isBrowser()) return { ok: false, mensaje: "Error del sistema" };

        const usuarios = this.obtenerUsuario();
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

    /**
     * Lee directamente el SessionStorage para extraer el estado síncrono de la sesión en el instante actual.
     * @returns {Sesion | null} El objeto {@link Sesion} activo o `null` si la sesión no ha iniciado.
     */
    obtenerSesion(): Sesion | null {
        if (!this.isBrowser()) return null;
        const datos = sessionStorage.getItem(this.claveSesion);
        return datos ? JSON.parse(datos) as Sesion : null;
    }

    /**
     * Destruye las variables de sesión del almacenamiento temporal del navegador,
     * limpia el caché dinámico del subject y fuerza la desconexión del usuario en el sistema.
     */
    cerrarSesion(): void {
        if (!this.isBrowser()) return;

        sessionStorage.removeItem(this.claveSesion);
        this.sesionSubject.next(null);
    }

    /**
     * Indica si existe algún usuario autenticado en la ventana activa.
     * @returns {boolean} `true` si el usuario está logueado, de lo contrario `false`.
     */
    estaLogueado(): boolean {
        return this.obtenerSesion() !== null;
    }

    /**
     * Evalúa si el usuario autenticado posee privilegios de administrador.
     * Comúnmente utilizado en los Guards de protección de rutas de administración (`admin-panel`).
     * @returns {boolean} `true` si el rol es estrictamente 'admin', de lo contrario `false`.
     */
    esAdmin(): boolean {
        return this.obtenerSesion()?.rol === 'admin';
    }

    esCliente(): boolean {
        return this.obtenerSesion()?.rol === 'cliente';
    }

    /**
     * Genera de forma autoincremental un nuevo identificador numérico único para un usuario.
     * * Evalúa la colección actual:
     * - Si la lista está completamente vacía, inicializa el conteo retornando el ID `1`.
     * - Si ya existen registros, mapea los IDs, extrae el valor máximo numérico y le suma `1`.
     * * @private
     * @param {Usuario[]} lista Colección actual de usuarios registrados sobre la cual buscar el ID máximo.
     * @returns {number} El nuevo identificador numérico único listo para ser asignado al nuevo registro.
     */
    private generarId(lista: Usuario[]): number {
        if (lista.length === 0) {
            return 1;
        }
        return Math.max(...lista.map(u => Number(u.id))) + 1;
    }
}