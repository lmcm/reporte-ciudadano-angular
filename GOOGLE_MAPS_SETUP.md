# Configuración de Google Maps

## Pasos para obtener la API Key de Google Maps

### 1. Crear proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. **Habilitar facturación** (ver opciones abajo si tienes problemas con RFC)

#### ⚠️ Problema con RFC en México
Si Google no acepta tu RFC personal, tienes estas opciones:

**Opción A: Usar datos de empresa**
- Necesitas RFC de empresa registrada
- Razón social y dirección fiscal

**Opción B: Usar tarjeta internacional**
- Cambiar país a "Estados Unidos" temporalmente
- Usar dirección de EE.UU. (puedes usar una dirección de servicio de reenvío)
- Ejemplo: 1600 Amphitheatre Parkway, Mountain View, CA 94043

**Opción C: Implementar alternativa gratuita (Recomendado)**
- Usar OpenStreetMap + Leaflet (100% gratuito)
- Sin límites ni facturación requerida
- Misma funcionalidad

### 2. Habilitar APIs necesarias
1. Ve a "APIs y servicios" > "Biblioteca"
2. Busca y habilita:
   - **Maps JavaScript API**
   - **Geocoding API** (opcional, para búsqueda de direcciones)

### 3. Crear API Key
1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "Clave de API"
3. Copia la API Key generada

### 4. Configurar restricciones (Recomendado)
1. Haz clic en la API Key creada
2. En "Restricciones de aplicación":
   - Selecciona "Referentes HTTP (sitios web)"
   - Agrega tu dominio: `localhost:4200/*` (desarrollo) y tu dominio de producción
3. En "Restricciones de API":
   - Selecciona "Restringir clave"
   - Marca "Maps JavaScript API"

### 5. Configurar en la aplicación
1. Abre `src/environments/environment.ts`
2. Reemplaza `YOUR_GOOGLE_MAPS_API_KEY` con tu API Key:

```typescript
googleMaps: {
  apiKey: 'TU_API_KEY_AQUI'
}
```

## Costos
- **Gratis**: Hasta $200 USD mensuales (~28,500 cargas de mapa)
- **Después**: $7 USD por cada 1,000 cargas adicionales

## Alternativa GRATUITA: OpenStreetMap
Si no puedes configurar Google Maps, implementa esta alternativa:

```bash
# Instalar Leaflet
npm install leaflet @types/leaflet
```

```typescript
// En angular.json agregar:
"styles": [
  "node_modules/leaflet/dist/leaflet.css",
  "src/styles.css"
]
```

Esta alternativa es **completamente gratuita** y funciona igual de bien.

## Funcionalidad implementada
- ✅ Mapa interactivo centrado en Boca del Río, Veracruz
- ✅ Clic para seleccionar ubicación del problema
- ✅ Marcador visual en la ubicación seleccionada
- ✅ Coordenadas guardadas en el reporte
- ✅ Limpieza del marcador al resetear formulario

## Uso
1. El usuario hace clic en cualquier punto del mapa
2. Se coloca un marcador en esa ubicación
3. Las coordenadas se muestran debajo del mapa
4. Las coordenadas se incluyen automáticamente en el reporte