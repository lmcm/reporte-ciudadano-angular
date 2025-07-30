import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { 
    path: 'inicio', 
    loadComponent: () => import('./pages/inicio/inicio.component').then(m => m.InicioComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'nuevo-reporte', 
    loadComponent: () => import('./pages/nuevo-reporte/nuevo-reporte.component').then(m => m.NuevoReporteComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'consulta-reporte', 
    loadComponent: () => import('./pages/consulta-reporte/consulta-reporte.component').then(m => m.ConsultaReporteComponent) 
  },
  { 
    path: 'mis-reportes', 
    loadComponent: () => import('./pages/mis-reportes/mis-reportes.component').then(m => m.MisReportesComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'admin-panel', 
    loadComponent: () => import('./pages/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    //canActivate: [authGuard]
  },
  { 
    path: 'reporte-detalle/:id', 
    loadComponent: () => import('./pages/reporte-detalle/reporte-detalle.component').then(m => m.ReporteDetalleComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'servicios', 
    loadComponent: () => import('./pages/servicios/servicios.component').then(m => m.ServiciosComponent),
    //canActivate: [authGuard]
  },
  { 
    path: 'nuevo-reporte-invitado', 
    loadComponent: () => import('./pages/nuevo-reporte-invitado/nuevo-reporte-invitado.component').then(m => m.NuevoReporteInvitadoComponent)
  },
  { path: '**', redirectTo: '/inicio' }
];