import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';

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

  passwordIguales(campo1: string, campo2: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const valor1 = group.get(campo1)?.value;
      const valor2 = group.get(campo2)?.value;

      if (valor1 && valor2 && valor1 !== valor2) {
        group.get(campo2)?.setErrors({ noCoinciden: true });
        return { noCoinciden: true };
      }
      return null;
    };
  }

  validarRutChileno() {
    return (control: AbstractControl): ValidationErrors | null => {
      const rutCompleto = control.value;
      
      if (!rutCompleto) return null; 

      if (!/^[0-9]+-[0-9kK]{1}$/.test(rutCompleto)) return { rutInvalido: true };
      
      const partes = rutCompleto.split("-");
      const cuerpo = partes[0];
      const dvIngresado = partes[1].toLowerCase();
      
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
      
      return dvIngresado === dvEsperado ? null : { rutInvalido: true };
    };
  }

  validDireccion(direccion: string | null | undefined): boolean {
    if (!direccion) {
        return true;
    }
    return direccion.trim().length > 0;
  }

  validarFechasReserva(control: AbstractControl): ValidationErrors | null {
    const fechaDesde = control.get('fechaDesde')?.value;
    const fechaHasta = control.get('fechaHasta')?.value;

    if (!fechaDesde || !fechaHasta) {
      return null;
    }

    const inicio = new Date(fechaDesde);
    const fin = new Date(fechaHasta);

    if (fin < inicio) {
      control.get('fechaHasta')?.setErrors({ fechaAnterior: true });
      return { fechaAnterior: true };
    }

    const erroresHasta = control.get('fechaHasta')?.errors;
    if (erroresHasta && erroresHasta['fechaAnterior']) {
      delete erroresHasta['fechaAnterior'];
      control.get('fechaHasta')?.setErrors(Object.keys(erroresHasta).length ? erroresHasta : null);
    }

    return null;
  }

}