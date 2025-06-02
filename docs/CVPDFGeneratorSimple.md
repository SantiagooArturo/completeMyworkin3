# Generador de PDF Simple para CV

## Descripción

El `CVPDFGeneratorSimple` es un generador de PDF basado en el diseño limpio y minimalista que proporcionaste como ejemplo. Es más fácil de entender y modificar que el generador Harvard formal.

## Características

- **Diseño Simple**: Basado en el ejemplo de Francesco Lucchesi que proporcionaste
- **Fácil de Personalizar**: Código claro y comentado
- **Responsive**: Se adapta automáticamente al contenido
- **Soporte Completo**: Incluye todas las secciones del CV

## Estructura del PDF

1. **Encabezado**
   - Nombre en negrita (14pt)
   - Información de contacto en una línea (11pt)

2. **Perfil/Resumen**
   - Título "Perfil" en negrita (13pt)
   - Texto del resumen con salto de línea automático

3. **Experiencia**
   - Nombre de empresa en negrita (12pt)
   - Posición y fechas (11pt)
   - Lista de logros con viñetas

4. **Proyectos** (si aplica)
   - Nombre del proyecto en negrita
   - Descripción y tecnologías

5. **Educación**
   - Información en formato: Institución - Título - Fechas

6. **Habilidades & Certificaciones**
   - Agrupadas por categoría
   - Certificaciones listadas
   - Hobbies al final

## Cómo Usar

### En la Interfaz
1. Ve al constructor de CV
2. En la parte superior derecha, selecciona "Diseño PDF: Simple"
3. Completa tu información
4. Haz clic en "Descargar PDF"

### Programáticamente
```typescript
import { CVPDFGeneratorSimple } from '@/services/cvPDFGeneratorSimple';

// Generar PDF con datos del CV
await CVPDFGeneratorSimple.generatePDF(cvData);
```

## Personalización

### Cambiar Márgenes
```typescript
const leftMargin = 15; // Cambiar de 10 a 15 para más margen
```

### Cambiar Fuentes
```typescript
doc.setFontSize(16); // Para títulos más grandes
doc.setFont('helvetica', 'bold'); // Para texto en negrita
```

### Cambiar Espaciado
```typescript
y += 12; // Más espacio entre secciones
```

### Agregar Colores
```typescript
doc.setTextColor(0, 123, 191); // Color azul para títulos
doc.text("Título", x, y);
doc.setTextColor(0, 0, 0); // Volver a negro
```

## Ventajas del Diseño Simple

1. **Legibilidad**: Diseño limpio y fácil de leer
2. **Compatibilidad**: Funciona en todos los sistemas de seguimiento de candidatos (ATS)
3. **Profesional**: Apariencia moderna y profesional
4. **Mantenible**: Código fácil de entender y modificar
5. **Rápido**: Generación rápida del PDF

## Comparación con Harvard Formal

| Característica | Simple | Harvard Formal |
|----------------|--------|----------------|
| Velocidad | ⚡ Rápido | 🐌 Más lento |
| Personalización | ✅ Fácil | ❌ Complejo |
| Diseño | 📄 Minimalista | 🎓 Académico |
| Tamaño archivo | 📦 Pequeño | 📦 Mediano |
| Compatibilidad ATS | ✅ Excelente | ✅ Buena |

## Ejemplo de Salida

El PDF generado seguirá este formato:

```
Francesco Lucchesi Via
flucchesi88@gmail.com • Lima, Perú • +51 954600805 • linkedin.com/in/francesco-lucchesi/

Perfil
Estudiante de octavo ciclo de Administración de Empresas...

Experiencia
Yape
Practicante de Tribu Producto - Enero 2024 – Actualidad
• Creación de un piloto para fomentar sinergia entre entidades bancarias.
• Informes diarios/semanales/mensuales para +1000 clientes.

Educación
Universidad de Lima - Administración de Empresas - 2020 – Actualidad

Habilidades & Certificaciones
Software: Excel (Intermedio), PowerPoint (Avanzado)
Gestión de proyectos: Microsoft Project, Trello, Notion
```
