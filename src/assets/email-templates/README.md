# Templates de Email - Firebase Auth

Este directorio contiene los templates de email personalizados para Firebase Authentication.

## 📧 Configuración en Firebase Console

### 1. Password Reset Template

**Ubicación:** `Firebase Console → Authentication → Templates → Password reset`

**Configuración:**
- **Subject:** `Solicitud de restablecimiento de contraseña - H. Ayuntamiento de Boca del Río`
- **Template:** Copiar contenido de `password-reset.html`
- **Action URL:** 
  - Desarrollo: `http://localhost:4200/reset-password`
  - Producción: `https://tu-dominio.com/reset-password`

### 2. Variables de Firebase

Firebase reemplaza automáticamente estas variables:
- `%LINK%` → Enlace completo con código de verificación
- `%EMAIL%` → Email del usuario
- `%APP_NAME%` → Nombre de la aplicación

### 3. Configuración adicional

**En Firebase Console → Authentication → Settings:**
- **App name:** `Reporte Ciudadano Boca del Río`
- **Support email:** `soporte@bocadelrio.gob.mx`
- **Authorized domains:** Agregar tu dominio

## 🎨 Diseño

- **Colores:** Azul #2563eb (consistente con la app)
- **Branding:** H. Ayuntamiento de Boca del Río
- **Responsive:** Compatible con todos los clientes de email
- **Profesional:** Diseño oficial y formal

## 📝 Versionado

Mantener estos archivos en control de versiones permite:
- Historial de cambios en templates
- Backup de configuraciones
- Colaboración en equipo
- Despliegue consistente entre ambientes