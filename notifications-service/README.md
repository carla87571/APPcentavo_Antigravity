# notifications-service 🔔

Microservicio de **alertas y notificaciones de sobregasto** para Centavo. Recibe eventos de nuevas transacciones, evalúa el consumo acumulado contra el presupuesto configurado para la categoría correspondiente y genera alertas de advertencia o de límite excedido.

---

## Requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9

## Instalación

```bash
cd notifications-service
cp .env.example .env    # (opcional, usa defaults: PORT=3004)
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
├── services/                # Lógica de cálculo de sobregasto y emisión de alertas
├── repositories/            # Acceso a datos (in-memory con seed de presupuestos)
├── middlewares/              # Error handler global y AppError
└── utils/                   # Validación de payloads de eventos y presupuestos
```

**Flujo:** `Routes → Controllers → Services → Repositories`

---

## Endpoints

### 1. `POST /api/notifications/events/transaction`

Recibe un evento de transacción, actualiza el gasto acumulado en el presupuesto de la categoría y evalúa si se debe disparar una alerta (`WARNING` al 80%, `CRITICAL` al 100%).

```bash
curl -X POST http://localhost:3004/api/notifications/events/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "tx-12345",
    "amount": 420.00,
    "category": "alimentacion",
    "date": "2026-09-11",
    "type": "expense",
    "description": "Supermercado semanal"
  }'
```

**Respuesta de ejemplo (Alerta generada al superar el 80%):**
```json
{
  "success": true,
  "alertGenerated": true,
  "data": {
    "notification": {
      "id": "c1f74fae-bfa9-43c2-a89e-ec8ba79b9cf9",
      "type": "budget_warning",
      "severity": "warning",
      "title": "⚠️ Alerta de Consumo en ALIMENTACION",
      "message": "Has alcanzado el 84% de tu presupuesto para \"alimentacion\" (umbral de advertencia: 80%). Gasto acumulado: $420.00 / $500.00.",
      "category": "alimentacion",
      "transactionId": "tx-12345",
      "budgetLimit": 500,
      "currentSpent": 420,
      "percentageSpent": 84,
      "read": false,
      "createdAt": "2026-09-11T23:05:00.000Z"
    },
    "budgetStatus": {
      "category": "alimentacion",
      "limit": 500,
      "spent": 420,
      "percentageSpent": 84,
      "remaining": 80,
      "status": "WARNING"
    }
  }
}
```

---

### 2. `GET /api/notifications`

Lista el historial de alertas y notificaciones generadas. Soporta filtros opcionales por categoría, severidad y estado de lectura.

```bash
# Todas las notificaciones
curl http://localhost:3004/api/notifications

# Solo no leídas
curl "http://localhost:3004/api/notifications?unreadOnly=true"

# Filtrar por categoría
curl "http://localhost:3004/api/notifications?category=alimentacion"

# Filtrar por severidad (warning / critical)
curl "http://localhost:3004/api/notifications?severity=critical"
```

---

### 3. `GET /api/notifications/:id`

Obtiene los detalles de una notificación específica por su ID.

```bash
curl http://localhost:3004/api/notifications/c1f74fae-bfa9-43c2-a89e-ec8ba79b9cf9
```

---

### 4. `PATCH /api/notifications/:id/read`

Marca una notificación como leída.

```bash
curl -X PATCH http://localhost:3004/api/notifications/c1f74fae-bfa9-43c2-a89e-ec8ba79b9cf9/read
```

---

### 5. `GET /api/notifications/budgets`

Lista los límites presupuestarios y el gasto actual de cada categoría.

```bash
curl http://localhost:3004/api/notifications/budgets
```

---

### 6. `PUT /api/notifications/budgets/:category`

Configura o actualiza el límite presupuestario y el umbral de advertencia para una categoría.

```bash
curl -X PUT http://localhost:3004/api/notifications/budgets/alimentacion \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 600,
    "warningThreshold": 0.85
  }'
```

---

### 7. `GET /health`

Health check del servicio.

```bash
curl http://localhost:3004/health
```

---

## Categorías válidas

`alimentacion`, `transporte`, `ocio`, `servicios`, `salud`, `educacion`, `vivienda`, `otros`
