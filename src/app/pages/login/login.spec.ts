import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';


import { Login } from './login';
import { AuthService } from '../../services/auth.services';

describe('Pruebas Unitarias - Componente Login', () => {

    let component: Login;
    let fixture: ComponentFixture<Login>;
    
    // Creación de mocks

    const mockAuthService = {
        login: () => ({ok: true, mensaje: 'Éxito'}),
        cambiarPassword: () => ({ok: true, mensaje: 'Contraseña actualizada correctamente'})
    };

    const mockRouter = {
        navigate: () => {}
    };

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

    // Test para el cambio de contraseña si el from es válido
    it('Debe recuperar la contraseña correctamente si el formulario es válido', () => {
        component.recupForm.patchValue({
            recupCorreo: 'correo@prueba.com',
            recupPassword: 'NewPassword123',
            recupConfirmPassword: 'NewPassword123'
        });

        component.recuperarPassword();

        expect(component.recupExito).toBeTruthy();
        expect(component.mensajeRecup).toBe('Contraseña actualizada correctamente');
    });

    // Test invalidar si el correo no existe.
    it('Debe mostrar un error si el correo no existe o no esta registrado', () => {
        component.recupForm.patchValue({
            recupCorreo: 'fantasma@noexiste.com',
            recupPassword: 'NewPassword123',
            recupConfirmPassword: 'NewPassword123'
        });

        vi.spyOn(mockAuthService, 'cambiarPassword').mockReturnValue({ 
            ok: false, 
            mensaje: 'El correo ingresado no existe' 
        });

        component.recuperarPassword();

        expect(component.recupExito).toBeFalsy();
        expect(component.mensajeRecup).toBe('El correo ingresado no existe');
    });

    // Pruebas para login

    it('Debe validar formato correo válido', () => {
        const correo = component.loginForm.get('correo');

        correo?.setValue('correo@correo.cl');

        expect(correo?.errors?.['emailInvalido']).toBeFalsy();
    });

    it('Debe invalidar correo sin formato correcto', () =>{
        const correo = component.loginForm.get('correo');

        correo?.setValue('correo@correo');

        expect(correo?.errors?.['emailInvalido']).toBeTruthy();
    });

    // Pruebas para recuperar contraseña

    it('Debe validar formato correo válido', () => {
        const correo = component.recupForm.get('recupCorreo');

        correo?.setValue('correo@correo.cl');

        expect(correo?.errors?.['emailInvalido']).toBeFalsy();
    });

    it('Debe invalidar correo sin formato correcto', () =>{
        const correo = component.recupForm.get('recupCorreo');

        correo?.setValue('correo@correo');

        expect(correo?.errors?.['emailInvalido']).toBeTruthy();
    });

    // Pruebas individuales para contraseña

    it('Debe invalidar el formulario si las contraseñas no coinciden', () => {
        const pass = component.recupForm.get('recupPassword');
        const confirmPass = component.recupForm.get('recupConfirmPassword');

        pass?.setValue('Abcd.1234');
        confirmPass?.setValue('TotalmenteDistinta.99');

        component.recupForm.updateValueAndValidity();

        expect(confirmPass?.errors?.['noCoinciden']).toBeTruthy();
        expect(component.recupForm.valid).toBeFalsy();
    });

    it('Debe invalidar una contraseña sin numero', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('Qweqwe');

        expect(password?.errors?.['pattern']).toBeTruthy();
    });

    it('Debe validar una contraseña con numero', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('Qwe123');

        expect(password?.errors?.['pattern']).toBeFalsy();
    });

    it('Debe invalidar una contraseña sin mayuscula', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('qwe123');

        expect(password?.errors?.['pattern']).toBeTruthy();
    });

    it('Debe validar una contraseña con mayuscula', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('Qwe123');

        expect(password?.errors?.['pattern']).toBeFalsy();
    });

    it('Debe validar una contraseña con 6 caracteres', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('Qwe123');

        expect(password?.errors?.['minlength']).toBeFalsy();
    });

    it('Debe validar una contraseña con 18 caracteres', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('asdfghjklqwertyuio');

        expect(password?.errors?.['maxlength']).toBeFalsy();
    });

    it('Debe invalidar una contraseña con menos de 6 caracteres', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('Qwe12');

        expect(password?.errors?.['minlength']).toBeTruthy();
    });

    it('Debe invalidar una contraseña con mas de 18 caracteres', () => {
        const password = component.recupForm.get('recupPassword');

        password?.setValue('asdfghjklqwertyuiop');

        expect(password?.errors?.['maxlength']).toBeTruthy();
    });   





});
