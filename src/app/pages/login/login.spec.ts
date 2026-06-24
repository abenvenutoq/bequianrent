import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Login } from './login';
import { AuthService } from '../../services/auth.services';

/**
 * @description
 * Suite de Pruebas Unitarias para el componente {@link Login}.
 * * Esta suite tiene como objetivo validar el correcto comportamiento de la interfaz de autenticación,
 * verificando de forma estricta que las directivas, los controles de formularios reactivos y,
 * sobre todo, las **4 validaciones de seguridad de contraseñas** obligatorias funcionen según el diseño.
 */
describe('Pruebas Unitarias - Componente Login', () => {

    let component: Login;
    let fixture: ComponentFixture<Login>;
    
    /** Mock controlado del servicio AuthService para aislar las pruebas de llamadas reales de datos */
    const mockAuthService = {
        login: () => ({ok: true, mensaje: 'Éxito'}),
        cambiarPassword: () => ({ok: true, mensaje: 'Contraseña actualizada correctamente'})
    };

    /** Mock del enrutador de Angular para validar navegaciones síncronas */
    const mockRouter = {
        navigate: () => {}
    };

    /** Mock del ActivatedRoute para simular parámetros URL */
    const mockActivateRoute = {
        snapshot: {
            queryParams: {}
        }
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Login, ReactiveFormsModule],
            providers: [
                { provide: AuthService, useValue: mockAuthService},
                { provide: Router, useValue: mockRouter},
                { provide: ActivatedRoute, useValue: mockActivateRoute}
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(Login);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Debe crear el componente correctamente', () => {
        expect(component).toBeTruthy();
    });

    it('Debe invalidar una contraseña si NO contiene una letra mayúscula', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('qwe123');

        expect(password?.errors?.['pattern']).toBeTruthy();
    });

    it('Debe validar una contraseña con mayuscula', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('Qwe123');

        expect(password?.errors?.['pattern']).toBeFalsy();
    });

    /**
     * @test Valida form si la contraseña tiene más de 6 caracteres.
     */
    it('Debe validar una contraseña con 6 caracteres', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('Qwe123');

        expect(password?.errors?.['minlength']).toBeFalsy();
    });

    /**
     * @test Valida form si la contraseña tiene maximo 18 caracteres.
     */
    it('Debe validar una contraseña con 18 caracteres', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('asdfghjklqwertyuio');

        expect(password?.errors?.['maxlength']).toBeFalsy();
    });

    /**
     * @test Invalida form si la contraseña tiene menos de 6 caracteres.
     */
    it('Debe invalidar una contraseña con menos de 6 caracteres', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('Qwe12');

        expect(password?.errors?.['minlength']).toBeTruthy();
    });

    /**
     * @test Invalida form si la contraseña tiene más de 18 caracteres.
     */
    it('Debe invalidar una contraseña con mas de 18 caracteres', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('asdfghjklqwertyuiop');

        expect(password?.errors?.['maxlength']).toBeTruthy();
    });

    /**
     * @test Comprueba que la función limpiarFormularioLogin vacíe los controles y mensajes de login.
     */
    it('Debe limpiar el formulario de login y restablecer los estados', () => {
        component.loginForm.controls['correo'].setValue('test@correo.cl');
        component.loginForm.controls['password'].setValue('Password123');
        component.mensaje = 'Mensaje de prueba';
        component.enviado = true;

        component.limpiarFormularioLogin();

        expect(component.loginForm.controls['correo'].value).toBeNull();
        expect(component.loginForm.controls['password'].value).toBeNull();
        expect(component.mensaje).toBe('');
        expect(component.enviado).toBeFalsy();
    });

    /**
     * @test Comprueba que la función limpiarFormularioRecuperar vacíe los controles y mensajes de recuperación.
     */
    it('Debe limpiar el formulario de recuperación de contraseña y restablecer los estados', () => {
        component.recupForm.controls['recupCorreo'].setValue('test@correo.cl');
        component.recupForm.controls['recupPassword'].setValue('Password123');
        component.recupForm.controls['recupConfirmPassword'].setValue('Password123');
        component.mensajeRecup = 'Mensaje recuperación de prueba';
        component.recupExito = true;

        component.limpiarFormularioRecuperar();

        expect(component.recupForm.controls['recupCorreo'].value).toBeNull();
        expect(component.recupForm.controls['recupPassword'].value).toBeNull();
        expect(component.recupForm.controls['recupConfirmPassword'].value).toBeNull();
        expect(component.mensajeRecup).toBe('');
        expect(component.recupExito).toBeFalsy();
    });
});