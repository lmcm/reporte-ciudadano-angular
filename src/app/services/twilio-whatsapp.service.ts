import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TwilioWhatsappService {
  private http = inject(HttpClient);
  private readonly TWILIO_URL = `${environment.twilio.apiUrl}/${environment.twilio.accountSid}/Messages.json`;

  sendReportNotification(phoneNumber: string, reportNumber: string): Observable<any> {
    // Limpiar y validar número de teléfono
    const cleanPhone = phoneNumber.replace(/\D/g, ''); // Solo dígitos
    
    if (!cleanPhone || cleanPhone.length !== 10) {
      return throwError(() => new Error('Número de teléfono inválido. Debe tener 10 dígitos.'));
    }

    const message = `🚨 *Nuevo Reporte Ciudadano*\n\n` +
                   `Su reporte ha sido creado exitosamente.\n` +
                   `*Número de reporte:* ${reportNumber}\n\n` +
                   `Gracias por contribuir al mejoramiento de Boca del Río.\n\n` +
                   `_H. Ayuntamiento de Boca del Río_`;

    const formData = new URLSearchParams();
    formData.append('From', environment.twilio.whatsappFrom);
    formData.append('To', `whatsapp:+521${cleanPhone}`);
    formData.append('Body', message);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${environment.twilio.accountSid}:${environment.twilio.authToken}`)
    });

    return this.http.post(this.TWILIO_URL, formData.toString(), { headers });
  }
}