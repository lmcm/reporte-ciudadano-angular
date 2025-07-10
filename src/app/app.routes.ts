import { Routes } from '@angular/router';

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
    loadComponent: () => import('./pages/nuevo-reporte/nuevo-reporte.component').then(m => m.NuevoReporteComponent) 
  },
  { 
    path: 'consulta-reporte', 
    loadComponent: () => import('./pages/consulta-reporte/consulta-reporte.component').then(m => m.ConsultaReporteComponent) 
  },
  { 
    path: 'mis-reportes', 
    loadComponent: () => import('./pages/mis-reportes/mis-reportes.component').then(m => m.MisReportesComponent) 
  },
  { 
    path: 'admin-panel', 
    loadComponent: () => import('./pages/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent) 
  },
  { 
    path: 'reporte-detalle/:id', 
    loadComponent: () => import('./pages/reporte-detalle/reporte-detalle.component').then(m => m.ReporteDetalleComponent) 
  },
  { 
    path: 'servicios', 
    loadComponent: () => import('./pages/servicios/servicios.component').then(m => m.ServiciosComponent) 
  },
  { path: '**', redirectTo: '/inicio' }
];