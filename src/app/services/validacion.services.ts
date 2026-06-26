import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';

/**
 * @description
 * Servicio centralizado de validación reactiva para la aplicación BequianRent.
 * Provee un conjunto de validaciones personalizados y métodos auxiliares
 * Mejora la integridad de los datos en formularios de registro,
 */
@Injectable({ providedIn: 'root'})
export class ValidacionService {

  /**
   * Valida si un campo de texto está vacío o compuesto únicamente por espacios en blanco.
   * @param {AbstractControl} control Control reactivo de Angular a evaluar.
   * @returns {ValidationErrors | null} Un objeto con la llave `{ isEmpty: true }` si el campo es inválido, o `null` si es correcto.
   */
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

  /**
   * Verifica la estructura formal de una dirección de correo electrónico a través de una expresión regular estándar.
   * @param {AbstractControl} control Control reactivo que contiene el string del correo.
   * @returns {ValidationErrors | null} Error `{ emailInvalido: true }` si no pasa el patrón Regex, de lo contrario `null`.
   */
  isValidEmail(control: AbstractControl){
    const valor = control.value;
    if(!valor || typeof valor !== 'string') return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const esValido = emailRegex.test(valor);

    return esValido ? null: {emailInvalido: true};
  }

  /**
   * Validación para comprobar que el usuario posea una edad mínima obligatoria.
   * Contrasta de forma matemática los años transcurridos entre la fecha de nacimiento ingresada y la fecha actual.
   * @param {number} edadMinima El límite inferior de años exigido por la plataforma (ej: 18 años).
   * @returns {(control: AbstractControl) => ValidationErrors | null} Una función validadora personalizada para Angular Forms.
   */
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

  /**
   * Valida la igualdad estricta entre dos campos de contraseña (Password y Confirmación).
   * Actúa a nivel de `FormGroup`. Si las claves difieren, inyecta directamente el error `noCoincide`
   * en el control de confirmación para facilitar su renderizado en la interfaz.
   * @param {string} password Nombre del control de la contraseña principal (ej: 'password' o 'recupPassword').
   * @param {string} confirmPassword Nombre del control de confirmación (ej: 'confirmPassword' o 'confirmRecupPassword').
   * @returns {(group: AbstractControl) => ValidationErrors | null} Función validadora a nivel de grupo.
   */
  passwordIguales(campo1: string, campo2: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const control1 = group.get(campo1);
      const control2 = group.get(campo2);

      const valor1 = control1?.value;
      const valor2 = control2?.value;

      if (valor1 && valor2 && valor1 !== valor2) {
        control2?.setErrors({ ...control2?.errors, noCoinciden: true });
        return { noCoinciden: true };
      } 
      
      // Limpia el error específico si las contraseñas vuelven a coincidir
      if (control2?.hasError('noCoinciden')) {
        const erroresActuales = { ...control2.errors };
        
        delete erroresActuales['noCoinciden'];
        
        control2.setErrors(Object.keys(erroresActuales).length ? erroresActuales : null);
      }

      return null;
    };
  }

  /**
   * Valida la estructura y autenticidad matemática de un RUT (Rol Único Tributario) chileno.
   * * El proceso abarca:
   * 1. Verifica que el rut ingresado tenga el formato correcto.
   * 2. Separa el rut en numero correlativo y digito verificador .
   * 3. Aplicación del Algoritmo del Módulo 11 (recorrido invertido con factor multiplicador del 2 al 7).
   * 4. Comparación del residuo obtenido contra el DV ingresado (incluyendo casos especiales '0' y 'K').
   * @returns {(control: AbstractControl) => ValidationErrors | null} Validador síncrono para inyectar en controles reactivos.
   */
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

  /**
   * Validador reactivo para verificar que la dirección no contenga únicamente espacios.
   * Al ser opcional, si está vacía retorna null (válido).
   * @param {AbstractControl} control El control del formulario.
   * @returns {ValidationErrors | null} Error si solo hay espacios, null si es válido.
   */
  validDireccion(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;

    // Si no hay valor o no es texto, lo damos por válido (ya que es opcional)
    if (!valor || typeof valor !== 'string') {
        return null;
    }

    // Si tiene texto, pero al quitarle los espacios queda vacío, es inválido
    if (valor.trim().length === 0) {
        return { direccionInvalida: true };
    }

    return null; // Es una dirección válida
  }

  /**
   * Validación cruzada para el rango de fechas en la reserva de vehículos.
   * * El método realiza dos acciones críticas:
   * 1. **Validación cronológica:** Garantiza de forma estricta que la fecha de finalización (`fechaHasta`) 
   * no sea anterior a la fecha de inicio (`fechaDesde`). Si es menor, estampa el error `{ fechaAnterior: true }`.
   * 2. **Limpieza de estado (Manejo de errores persistentes):** Si el usuario corrige las fechas y el rango 
   * vuelve a ser válido, el método extrae activamente el mapa de errores de `fechaHasta`, elimina el error 
   * específico `fechaAnterior` mediante el operador `delete` y actualiza el control. Esto evita que el input 
   * quede bloqueado como inválido y preserva otros posibles errores nativos (como `required`).
   * * @param {AbstractControl} control El contenedor o formulario reactivo de nivel superior (`FormGroup`).
   * @returns {ValidationErrors | null} Error `{ fechaAnterior: true }` si el rango es ilógico, o `null` si es correcto y limpio.
   */
  validarFechasReserva(control: AbstractControl): ValidationErrors | null {
    const fechaDesde = control.get('fechaDesde')?.value;
    const fechaHasta = control.get('fechaHasta')?.value;

    if (!fechaDesde || !fechaHasta) {
      return null;
    }

    const inicio = new Date(fechaDesde);
    const fin = new Date(fechaHasta);

    // 1. Si la fecha de fin es menor al inicio, aplicamos el error
    if (fin < inicio) {
      control.get('fechaHasta')?.setErrors({ fechaAnterior: true });
      return { fechaAnterior: true };
    }

    // 2. Lógica de limpieza: Si el rango es correcto, removemos el error manualmente
    const erroresHasta = control.get('fechaHasta')?.errors;
    if (erroresHasta && erroresHasta['fechaAnterior']) {
      delete erroresHasta['fechaAnterior'];
      control.get('fechaHasta')?.setErrors(Object.keys(erroresHasta).length ? erroresHasta : null);
    }

    return null;
  }

}