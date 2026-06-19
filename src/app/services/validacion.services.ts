import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

export interface ResultadoClave {
  largoMinimo: boolean;
  largoMaximo: boolean;
  mayuscula: boolean;
  numero: boolean;
  especial: boolean;
  valida: boolean;
}

@Injectable({ providedIn: 'root'})
export class ValidacionService {

  isEmpty(control: AbstractControl){
    const valor = control.value;

    if(!valor || typeof valor !== 'string'){
      return null;
    }

    if(valor.trim().length === 0) {
      return {'isEmpty': true}
    }
      return null;
  }

  isValidEmail(control: AbstractControl){
    const valor = control.value;
    if(!valor || typeof valor !== 'string') return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const esValido = emailRegex.test(valor);

    return esValido ? null: {emailInvalido: true};
  }

  validarEdad(edadMinima: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const fechaNac = new Date(control.value);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const m = hoy.getMonth() - fechaNac.getMonth();
      
      if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      
      return edad < edadMinima ? { menorDeEdad: true } : null;
    };
  }

  passwordIguales(group: AbstractControl): ValidationErrors | null {

    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;

    if (pass && confirmPass && pass !== confirmPass) {
      group.get('confirmPassword')?.setErrors({ noCoinciden: true});
      return { noCoinciden: true}
    }
    return null;
  }


  isPasswordSecure(password: string | null | undefined): boolean {
    if (!password) return false;
    const largoCorrecto = password.length >= 8 && password.length <= 16;
    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneMinuscula = /[a-z]/.test(password);
    const tieneNumero = /\d/.test(password);

    return largoCorrecto && tieneMayuscula && tieneMinuscula && tieneNumero;
  }

  validarRutChileno() {
    return (control: AbstractControl): ValidationErrors | null => {
      const rutCompleto = control.value;
      
      // Si el campo está vacío, no lo validamos aquí (de eso se encarga Validators.required)
      if (!rutCompleto) return null; 

      // Validación de formato básico
      if (!/^[0-9]+-[0-9kK]{1}$/.test(rutCompleto)) return { rutInvalido: true };
      
      const partes = rutCompleto.split("-");
      const cuerpo = partes[0];
      const dvIngresado = partes[1].toLowerCase();
      
      // Calcular dígito verificador esperado
      let suma = 0;
      let multiplicador = 2;
      
      for (let i = cuerpo.length - 1; i >= 0; i--) {
          suma += parseInt(cuerpo.charAt(i)) * multiplicador;
          multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
      }
      
      let dvEsperado: string | number = 11 - (suma % 11);
      if (dvEsperado === 11) dvEsperado = "0";
      else if (dvEsperado === 10) dvEsperado = "k";
      else dvEsperado = dvEsperado.toString();
      
      // Si coinciden, devolvemos null (sin errores). Si no, devolvemos el error.
      return dvIngresado === dvEsperado ? null : { rutInvalido: true };
    };
  }

  validDireccion(direccion: string | null | undefined): boolean {
    if (!direccion) {
        return true;
    }
    return direccion.trim().length > 0;
  }

}