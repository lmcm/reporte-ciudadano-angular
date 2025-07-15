import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TipoServicio } from '../models/reporte.model';

export class ReporteValidators {
  
  // Validador para email
  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(control.value) ? null : { emailInvalido: true };
    };
  }

  // Validador para tipo de servicio
  static tipoServicio(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const tiposValidos = Object.values(TipoServicio);
      return tiposValidos.includes(control.value) ? null : { tipoServicioInvalido: true };
    };
  }

  // Validador para comentarios (longitud mínima y máxima)
  static comentarios(minLength: number = 10, maxLength: number = 1000): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = control.value.trim();
      
      if (value.length < minLength) {
        return { comentarioMuyCorto: { requiredLength: minLength, actualLength: value.length } };
      }
      
      if (value.length > maxLength) {
        return { comentarioMuyLargo: { maxLength: maxLength, actualLength: value.length } };
      }
      
      return null;
    };
  }

  // Validador para dirección
  static direccion(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = control.value.trim();
      
      if (value.length < 5) {
        return { direccionMuyCorta: true };
      }
      
      if (value.length > 200) {
        return { direccionMuyLarga: true };
      }
      
      // Validar que contenga al menos números y letras
      const hasNumbers = /\d/.test(value);
      const hasLetters = /[a-zA-Z]/.test(value);
      
      if (!hasNumbers || !hasLetters) {
        return { direccionIncompleta: true };
      }
      
      return null;
    };
  }

  // Validador para nombre de ciudadano
  static nombreCiudadano(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = control.value.trim();
      
      if (value.length < 2) {
        return { nombreMuyCorto: true };
      }
      
      if (value.length > 100) {
        return { nombreMuyLargo: true };
      }
      
      // Solo letras, espacios y algunos caracteres especiales
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
      if (!nameRegex.test(value)) {
        return { nombreInvalido: true };
      }
      
      return null;
    };
  }

  // Validador para apellidos
  static apellidos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = control.value.trim();
      
      if (value.length < 2) {
        return { apellidosMuyCorto: true };
      }
      
      if (value.length > 100) {
        return { apellidosMuyLargo: true };
      }
      
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
      if (!nameRegex.test(value)) {
        return { apellidosInvalido: true };
      }
      
      return null;
    };
  }

  // Validador para teléfono celular
  static telefono(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = control.value.trim();
      
      // Formato mexicano: 10 dígitos
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value)) {
        return { telefonoInvalido: true };
      }
      
      return null;
    };
  }

  // Validador para URLs de evidencias fotográficas
  static evidenciasFotograficas(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !Array.isArray(control.value)) return null;
      
      const urls = control.value as string[];
      
      if (urls.length > 5) {
        return { demasiadasEvidencias: { max: 5, actual: urls.length } };
      }
      
      const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      
      for (const url of urls) {
        if (!urlRegex.test(url)) {
          return { evidenciaInvalida: { url } };
        }
      }
      
      return null;
    };
  }

  // Obtener mensaje de error personalizado
  static getErrorMessage(errors: ValidationErrors): string {
    if (errors['required']) {
      return 'Este campo es obligatorio';
    }
    
    if (errors['emailInvalido']) {
      return 'Ingrese un email válido';
    }
    
    if (errors['tipoServicioInvalido']) {
      return 'Seleccione un tipo de servicio válido';
    }
    
    if (errors['comentarioMuyCorto']) {
      return `El comentario debe tener al menos ${errors['comentarioMuyCorto'].requiredLength} caracteres`;
    }
    
    if (errors['comentarioMuyLargo']) {
      return `El comentario no puede exceder ${errors['comentarioMuyLargo'].maxLength} caracteres`;
    }
    
    if (errors['direccionMuyCorta']) {
      return 'La dirección debe tener al menos 5 caracteres';
    }
    
    if (errors['direccionMuyLarga']) {
      return 'La dirección no puede exceder 200 caracteres';
    }
    
    if (errors['direccionIncompleta']) {
      return 'La dirección debe contener números y letras';
    }
    
    if (errors['nombreMuyCorto']) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (errors['nombreMuyLargo']) {
      return 'El nombre no puede exceder 100 caracteres';
    }
    
    if (errors['nombreInvalido']) {
      return 'El nombre solo puede contener letras, espacios y algunos caracteres especiales';
    }
    
    if (errors['apellidosMuyCorto']) {
      return 'Los apellidos deben tener al menos 2 caracteres';
    }
    
    if (errors['apellidosMuyLargo']) {
      return 'Los apellidos no pueden exceder 100 caracteres';
    }
    
    if (errors['apellidosInvalido']) {
      return 'Los apellidos solo pueden contener letras, espacios y algunos caracteres especiales';
    }
    
    if (errors['telefonoInvalido']) {
      return 'Ingrese un teléfono válido de 10 dígitos';
    }
    
    if (errors['demasiadasEvidencias']) {
      return `Máximo ${errors['demasiadasEvidencias'].max} evidencias fotográficas permitidas`;
    }
    
    if (errors['evidenciaInvalida']) {
      return `URL de evidencia inválida: ${errors['evidenciaInvalida'].url}`;
    }
    
    return 'Campo inválido';
  }
}