# Reporte Ciudadano Angular

Este es un proyecto Angular convertido desde el proyecto HTML original de Reporte Ciudadano para el Ayuntamiento de Boca del Río.

## Características

- **Página de Inicio**: Landing page con información sobre los servicios
- **Login**: Página de autenticación de usuarios
- **Nuevo Reporte**: Formulario para crear reportes ciudadanos
- **Consulta de Reporte**: Búsqueda de reportes por folio
- **Mis Reportes**: Panel de usuario con historial de reportes
- **Panel de Administración**: Vista administrativa para gestionar reportes
- **Detalle de Reporte**: Vista detallada con gestión de estado y comentarios
- **Servicios**: Galería de servicios completados

## Tecnologías Utilizadas

- Angular 17+ (Standalone Components)
- TypeScript
- Tailwind CSS
- Angular Router
- Angular Forms (Template-driven)

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── header/
│   │   └── footer/
│   ├── pages/
│   │   ├── inicio/
│   │   ├── login/
│   │   ├── nuevo-reporte/
│   │   ├── consulta-reporte/
│   │   ├── mis-reportes/
│   │   ├── admin-panel/
│   │   ├── reporte-detalle/
│   │   └── servicios/
│   ├── app.component.ts
│   └── app.routes.ts
├── index.html
├── main.ts
└── styles.css
```

## Instalación y Ejecución

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn

### Pasos para ejecutar

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo**:
   ```bash
   npm start
   ```
   o
   ```bash
   ng serve
   ```

3. **Abrir en el navegador**:
   Navega a `http://localhost:4200`

### Comandos adicionales

- **Build para producción**:
  ```bash
  npm run build
  ```

- **Ejecutar tests**:
  ```bash
  npm test
  ```

## Rutas Disponibles

- `/inicio` - Página principal
- `/login` - Inicio de sesión
- `/nuevo-reporte` - Crear nuevo reporte
- `/consulta-reporte` - Consultar estado de reporte
- `/mis-reportes` - Historial de reportes del usuario
- `/admin-panel` - Panel administrativo
- `/reporte-detalle/:id` - Detalle específico de un reporte
- `/servicios` - Servicios realizados

## Funcionalidades Implementadas

### Componentes Reutilizables
- **Header**: Navegación principal con logo y menú
- **Footer**: Pie de página con información legal

### Páginas Funcionales
- **Formularios reactivos** en nuevo reporte y login
- **Navegación dinámica** entre páginas
- **Gestión de estado** en detalle de reportes
- **Filtros y búsqueda** en panel administrativo
- **Galería de imágenes** en servicios

### Características Técnicas
- **Lazy Loading** de componentes para mejor rendimiento
- **Standalone Components** (Angular 17+)
- **Responsive Design** con Tailwind CSS
- **TypeScript** para tipado fuerte
- **Routing** con parámetros dinámicos

## Troubleshooting Firebase

### Error: "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore"

**Causa:** Incompatibilidad de versiones entre Angular, Angular Fire y Firebase.

**Solución:**

1. **Verificar versiones compatibles:**
   - Angular 17 → Angular Fire 17.x → Firebase 10.x
   - Angular 18 → Angular Fire 18.x → Firebase 11.x

2. **Reinstalar dependencias:**
   ```bash
   # Eliminar dependencias conflictivas
   npm uninstall @angular/fire firebase
   
   # Limpiar completamente
   rm -rf node_modules package-lock.json
   
   # Reinstalar con versiones compatibles (Angular 17)
   npm install
   npm install @angular/fire@^17.1.0 firebase@^10.12.5 --save
   ```

3. **Verificar instalación:**
   ```bash
   npm list @angular/fire firebase
   ```

4. **Versiones recomendadas para Angular 17:**
   ```json
   {
     "@angular/fire": "^17.1.0",
     "firebase": "^10.12.5"
   }
   ```

### Configuración Firebase

**Variables de entorno requeridas:**
- `environment.firebase.apiKey`
- `environment.firebase.authDomain`
- `environment.firebase.projectId`
- `environment.firebase.storageBucket`
- `environment.firebase.messagingSenderId`
- `environment.firebase.appId`

**Providers en main.ts:**
```typescript
provideFirebaseApp(() => initializeApp(environment.firebase)),
provideFirestore(() => getFirestore()),
provideStorage(() => getStorage())
```

## Próximas Mejoras

- Integración con backend/API
- Autenticación real con JWT
- Subida de archivos/imágenes
- Notificaciones en tiempo real
- Mapas interactivos
- Tests unitarios y e2e
- PWA (Progressive Web App)

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## Contacto

Proyecto desarrollado para el H. Ayuntamiento de Boca del Río, Veracruz.