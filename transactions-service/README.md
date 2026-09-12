# transactions-service 💳

Microservicio de **registro y categorización de transacciones** para Centavo. Permite crear gastos/ingresos con monto, categoría y fecha, y consultarlos con filtros.

---

## Requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9

## Instalación

```bash
cd transactions-service
cp .env.example .env    # (opcional, usa defaults)
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
├── services/                # Lógica de negocio
├── repositories/            # Acceso a datos (in-memory por ahora)
├── middlewares/              # Error handler, futuros middlewares de auth
└── utils/                   # Validación de payloads
```

**Flujo:** `Routes → Controllers → Services → Repositories`

## Endpoints

### `POST /api/transactions`

Crea una nueva transacción.

```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.50,
    "category": "alimentacion",
    "date": "2026-09-11",
    "description": "Almuerzo en restaurante",
    "type": "expense"
  }'
```

### `GET /api/transactions`

Lista transacciones con filtros opcionales.

```bash
# Todas
curl http://localhost:3001/api/transactions

# Filtrar por categoría
curl "http://localhost:3001/api/transactions?category=alimentacion"

# Filtrar por rango de fechas
curl "http://localhost:3001/api/transactions?startDate=2026-09-01&endDate=2026-09-30"

# Filtrar por tipo
curl "http://localhost:3001/api/transactions?type=expense"
```

### `GET /api/transactions/:id`

Obtiene una transacción por su ID.

```bash
curl http://localhost:3001/api/transactions/uuid-de-la-transaccion
```

### `GET /health`

Health check del servicio.

```bash
curl http://localhost:3001/health
```

## Categorías válidas

`alimentacion`, `transporte`, `ocio`, `servicios`, `salud`, `educacion`, `vivienda`, `otros`

## Tipos válidos

`income`, `expense`
