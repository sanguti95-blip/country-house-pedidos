# 🌿 COUNTRY HOUSE — DOCUMENTO MAESTRO DE CONTEXTO & ARQUITECTURA
> **Archivo de Memoria Permanente del Proyecto**  
> *Última actualización: 2026-09-02*

---

## 1. 📋 INFORMACIÓN GENERAL DEL NEGOCIO
- **Nombre Oficial**: Country House
- **Lema Oficial**: `"Calidad y frescura todos los días®"`
- **Número Oficial WhatsApp Pedidos**: `+506 8941-610` (`5068941610`)
- **Usuario GitHub / Propietario**: `sanguti95-blip`
- **Repositorio de Código**: `https://github.com/sanguti95-blip/country-house-pedidos`
- **URL de Producción (GitHub Pages)**: `https://sanguti95-blip.github.io/country-house-pedidos/`

---

## 2. 🗄️ BASE DE DATOS EN LA NUBE (SUPABASE)
- **Proveedor**: Supabase (PostgreSQL 15+)
- **Project ID**: `brjralkrguufpkzwnlhl`
- **Project URL**: `https://brjralkrguufpkzwnlhl.supabase.co`
- **Publishable Client Key**: `sb_publishable_p61DQUM4Bg7ktnxLOo76DA_m5dzz5M1`
- **Estado de Tablas**: 100% Creadas, Activas y Pobladas
- **Total de Productos Sembrados**: **311 productos** con nombres limpios, precios, emojis y desglose completo de macronutrientes (calorías, proteínas, carbohidratos, grasas).

### Tablas y Esquema:
1. `productos`: Catálogo, precios, categorías, porciones, macros y tags dietéticos.
2. `pedidos`: Historial de órdenes, modalidad, dirección, forma de pago y totales.
3. `detalles_pedido`: Ítems por orden, cantidades y subtotales.
4. `metricas_picking`: Tiempos de alisto en bodega (hora inicio/fin, segundos totales y promedio por ítem).
5. `rutas_gps_envio`: Coordenadas en tiempo real de latitud/longitud del repartidor y tiempo estimado de llegada.
6. `perfiles_nutricionales_ia`: Perfiles de fitness, metas calóricas y planes generados por IA.

---

## 3. 🛵 REGLAS DE NEGOCIO & LOGÍSTICA OFICIALES

### A. Modalidades de Entrega:
1. **🛵 Entrega a Domicilio**:
   - **Horario Oficial**: `10:00 AM a 4:00 PM`
   - **Costo de Envío**: `₡1.000,00` colones fijos (se suma automáticamente al total).
   - **Rangos Horarios Táctiles**:
     - `⚡ Lo antes posible (10am - 4pm)`
     - `🌅 Mañana (10:00 AM - 1:00 PM)`
     - `☀️ Tarde (1:00 PM - 4:00 PM)`
2. **🏬 Recoger en Tienda (Pickup / Punto de Venta)**:
   - **Horario Oficial**: `9:00 AM a 6:30 PM`
   - **Costo**: `₡0 / GRATIS`.
   - **Rangos Horarios Táctiles**:
     - `⚡ En ~30-45 min (9am - 6:30pm)`
     - `🌅 Mañana (9:00 AM - 1:00 PM)`
     - `☀️ Tarde (1:00 PM - 4:30 PM)`
     - `🌇 Tarde-Noche (4:30 PM - 6:30 PM)`

### B. Reglas Financieras y de Pago:
- **Descuento Especial**: `10%` automático de descuento sobre el subtotal del catálogo.
- **Formas de Pago Soportadas**:
  - `📲 Sinpe Móvil` (con copia de número y confirmación).
  - `💵 Efectivo`.
  - `💳 Tarjeta`.

---

## 4. 📱 ARQUITECTURA DE LA APLICACIÓN (4 MÓDULOS)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        COUNTRY HOUSE PLATFORM                          │
├───────────────┬───────────────────┬───────────────────┬────────────────┤
│  🛍️ TIENDA    │   🤖 ASESOR IA    │    ⏱️ BODEGA      │ 🛵 RASTREO GPS │
│  Catálogo     │   Canastas &      │    Cronómetro     │  Mapa Leaflet  │
│  Sidebar      │   Recetas Gym     │    Métricas x     │  Repartidor en │
│  Checkout     │   con Gemini      │    Ítem / Cola    │  Tiempo Real   │
└───────────────┴───────────────────┴───────────────────┴────────────────┘
```

1. **🛍️ Módulo Tienda**:
   - **UI Sólida de Alto Rendimiento**: Cero transparencias ni `backdrop-filter: blur` ("Liquid Glass eliminado"). Renderizado a 60 FPS con contrastes nítidos en modo claro y oscuro.
   - **Menú Lateral Deslizable (Sidebar Drawer)**: Se abre desde la derecha con la lista completa de categorías y filtros dietéticos.
   - **Vista de Ver Pedido Independiente**: Pantalla completa dedicada sin cortes, con scroll táctil continuo de arriba a abajo.
2. **🤖 Módulo Asesor Nutricional IA (Motor Gemini)**:
   - Formulario de perfil físico (Hipertrofia, Déficit, Keto, Salud).
   - Cálculo automático de requerimiento calórico y macronutrientes.
   - Generación de canasta semanal con botón directo `🛒 Cargar Canasta al Carrito`.
   - Generación de **3 recetas saludables personalizadas** usando los ingredientes del catálogo.
3. **⏱️ Módulo Bodega & Picking**:
   - Tablero táctil para el personal de alisto con cronómetro de alta precisión.
   - Checklist interactivo de productos por orden.
   - Cálculo automático de segundos por ítem y emisión del tiempo dinámico estimado (`⏱️ 15 - 25 min`) a todos los clientes en la tienda web.
4. **🛵 Módulo Rastreo GPS en Vivo**:
   - Mapa interactivo con Leaflet.js y OpenStreetMap.
   - Marcador del local Country House, domicilio del cliente y moto de reparto en movimiento.
   - Velocímetro y tiempo estimado de llegada dinámico.

---

## 5. 📂 ESTRUCTURA DE ARCHIVOS EN EL PROYECTO

```
C:\Users\pc\.gemini\antigravity\scratch\country-house-pedidos\
├── index.html                  # Aplicación web completa lista para producción
├── PROJECT_CONTEXT.md          # Este documento maestro de contexto
├── generate.py                 # Generador Python para compilación del catálogo
└── database/
    ├── schema.sql              # DDL oficial de PostgreSQL / Supabase
    ├── seed_data.sql           # Datos maestros iniciales
    └── queries_metricas.sql    # Consultas de analítica de alisto
```

---

## 6. 🚀 COMANDOS ÚTILES PARA COMPILACIÓN Y DESPLIEGUE

### Desplegar cambios a GitHub Pages:
```powershell
cd C:\Users\pc\.gemini\antigravity\scratch\country-house-pedidos
git add .
git commit -m "Descripción de los cambios"
git push origin master
```

### Validar sintaxis y DOM con Node.js + JSDOM:
```powershell
node -e "const { JSDOM } = require('jsdom'); JSDOM.fromFile('index.html', { runScripts: 'dangerously', pretendToBeVisual: true }).then(dom => { console.log('DOM Parsed Successfully'); process.exit(0); });"
```
