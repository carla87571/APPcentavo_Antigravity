# budgets-service 🎯

Microservicio de **definición y seguimiento de presupuestos** por categoría para Centavo. Permite crear, listar, actualizar y consultar presupuestos con límites monetarios y periodicidad (mensual, semanal, anual).

---

## Requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9

## Instalación

```bash
cd budgets-service
cp .env.example .env    # (opcional, usa defaults: PORT=3003)
npm install
```

## Scripts

| Comando         | Descripción                                |
|-----------------|--------------------------------------------|
| `npm run dev`   | Arranca en modo desarrollo con hot-reload  |
| `npm run build` | Compila TypeScript a `dist/`               |
| `npm start`     | Arranca la build de producción             |

## Arquitectura

```text
src/
├── index.ts                 # Bootstrap de Express y composición de dependencias
├── config/env.ts            # Variables de entorno
├── models/                  # Interfaces y enums del dominio
├── routes/                  # Definición de rutas REST
├── controllers/             # Request/Response — validación y formato
├── services/                # Lógica de negocio de presupuestos
├── repositories/            # Acceso a datos (in-memory con seed)
├── middlewares/              # Error handler global y AppError
└── utils/                   # Validación de payloads
```

**Flujo:** `Routes → Controllers → Services → Repositories`

---

## Endpoints

### 1. `POST /api/budgets`

Crea o actualiza un presupuesto por categoría.

```bash
curl -X POST http://localhost:3003/api/budgets \
  -H "Content-Type: application/json" \
  -d '{
    "category": "alimentacion",
    "limit": 600,
    "period": "monthly",
    "startDate": "2026-09-01"
  }'
```

*Nota: Se acepta `limit` o su alias `amount` para conveniencia.*

**Respuesta exitosa (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "e2c3491f-0b32-4416-89d5-39d2c2069e21",
    "category": "alimentacion",
    "limit": 600,
    "period": "monthly",
    "startDate": "2026-09-01",
    "warningThreshold": 0.8,
    "createdAt": "2026-09-13T04:35:00.000Z",
    "updatedAt": "2026-09-13T04:35:00.000Z"
  }
}
```

---

### 2. `GET /api/budgets`

Lista todos los presupuestos activos con soporte de filtros opcionales.

```bash
# Todos los presupuestos
curl http://localhost:3003/api/budgets

# Filtrar por categoría
curl "http://localhost:3003/api/budgets?category=alimentacion"

# Filtrar por periodo
curl "http://localhost:3003/api/budgets?period=monthly"
```

---

### 3. `GET /api/budgets/category/:category`

Obtiene el presupuesto activo para una categoría específica.

```bash
curl http://localhost:3003/api/budgets/category/alimentacion
```

---

### 4. `GET /api/budgets/:id`

Obtiene los detalles de un presupuesto por su ID.

```bash
curl http://localhost:3003/api/budgets/e2c3491f-0b32-4416-89d5-39d2c2069e21
```

---

### 5. `PUT /api/budgets/:id`

Actualiza el límite o periodicidad de un presupuesto existente.

```bash
curl -X PUT http://localhost:3003/api/budgets/e2c3491f-0b32-4416-89d5-39d2c2069e21 \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 750,
    "period": "monthly"
  }'
```

---

### 6. `DELETE /api/budgets/:id`

Elimina un presupuesto por su ID.

```bash
curl -X DELETE http://localhost:3003/api/budgets/e2c3491f-0b32-4416-89d5-39d2c2069e21
```

---

### 7. `GET /health`

Health check del servicio.

```bash
curl http://localhost:3003/health
```

---

## Categorías válidas

`alimentacion`, `transporte`, `ocio`, `servicios`, `salud`, `educacion`, `vivienda`, `otros`

## Periodos válidos

`monthly`, `weekly`, `annual`
