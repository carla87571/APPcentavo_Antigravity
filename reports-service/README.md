# reports-service 📊

Microservicio de **análisis, consolidación y generación de reportes financieros periódicos y bajo demanda** para Centavo. Agrega datos en tiempo real de `transactions-service` y `budgets-service` para computar métricas consolidadas (ingresos, gastos, ahorro neto, tasa de ahorro, comparativa presupuestaria por categoría y alertas de sobregasto) y persistir cada reporte como un archivo accesible en disco para consulta y descarga posterior.

---

## Requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9

## Instalación

```bash
cd reports-service
cp .env.example .env    # (opcional, usa defaults: PORT=3005)
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
├── index.ts                     # Bootstrap de Express y composición de dependencias
├── config/
│   └── env.ts                   # Variables de entorno y configuración
├── models/
│   └── report.model.ts          # Interfaces, enums y DTOs del dominio
├── routes/
│   └── reports.routes.ts        # Definición de rutas REST
├── controllers/
│   └── reports.controller.ts    # Request/Response — validación y formato HTTP
├── services/
│   ├── reports.service.ts       # Lógica de agregación y persistencia de archivos
│   └── clients/
│       ├── transactions.client.ts # Cliente HTTP para transactions-service
│       └── budgets.client.ts      # Cliente HTTP para budgets-service
├── repositories/
│   └── reports.repository.ts    # Acceso a datos de reportes generados
├── middlewares/
│   └── errorHandler.ts          # Error handler global y AppError
└── utils/
    └── validation.ts            # Validación de payloads, fechas y rangos
```

**Flujo:** `Routes → Controllers → Services → Repositories / External Clients / File Storage`

---

## Variables de Entorno

| Variable                   | Descripción                                         | Valor por defecto          |
|----------------------------|-----------------------------------------------------|----------------------------|
| `PORT`                     | Puerto HTTP donde corre el servicio                 | `3005`                     |
| `TRANSACTIONS_SERVICE_URL` | URL base de `transactions-service`                  | `http://localhost:3001`    |
| `BUDGETS_SERVICE_URL`      | URL base de `budgets-service`                       | `http://localhost:3003`    |
| `REPORTS_DIR`              | Directorio en disco para guardar archivos de reporte| `./storage/reports`        |

---

## Endpoints

### 1. `POST /api/reports/monthly/current`

Genera bajo demanda el reporte financiero mensual correspondiente al mes en curso. Agrega los movimientos y presupuestos vigentes y guarda el reporte resultante en un archivo JSON en disco.

```bash
curl -X POST http://localhost:3005/api/reports/monthly/current
```

**Respuesta exitosa (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "a93b4e3f-671c-4b72-b8d5-7fa9b20892a1",
    "month": "2026-09",
    "startDate": "2026-09-01",
    "endDate": "2026-09-30",
    "title": "Reporte Mensual de Gastos - 2026-09",
    "generatedAt": "2026-09-13T20:15:00.000Z",
    "summary": {
      "totalIncome": 2500,
      "totalExpenses": 450,
      "netSavings": 2050,
      "savingsRate": 82,
      "totalTransactions": 6,
      "totalExpenseTransactions": 5,
      "totalIncomeTransactions": 1,
      "totalBudgeted": 850,
      "budgetUtilizationRate": 52.94
    },
    "categories": [
      {
        "category": "alimentacion",
        "spent": 250,
        "budgetLimit": 500,
        "remainingBudget": 250,
        "percentageBudgetConsumed": 50,
        "status": "OK",
        "transactionCount": 3
      }
    ],
    "topCategories": [
      {
        "category": "alimentacion",
        "spent": 250,
        "percentageOfTotalExpenses": 55.56
      }
    ],
    "alerts": [],
    "file": {
      "fileName": "report-2026-09-a93b4e3f-671c-4b72-b8d5-7fa9b20892a1.json",
      "filePath": "/home/carla3/ANTIGRAVITY/centavo/reports-service/storage/reports/report-2026-09-a93b4e3f-671c-4b72-b8d5-7fa9b20892a1.json",
      "fileFormat": "json",
      "fileSizeBytes": 1420,
      "downloadUrl": "/api/reports/a93b4e3f-671c-4b72-b8d5-7fa9b20892a1/download"
    }
  }
}
```

---

### 2. `POST /api/reports/monthly`

Genera el reporte mensual para un mes específico (`YYYY-MM`) o el mes actual si no se especifica.

```bash
curl -X POST http://localhost:3005/api/reports/monthly \
  -H "Content-Type: application/json" \
  -d '{
    "month": "2026-08"
  }'
```

---

### 3. `GET /api/reports`

Lista todos los reportes generados previamente, ordenados cronológicamente (más recientes primero). Soporta filtro opcional por mes.

```bash
# Todos los reportes generados
curl http://localhost:3005/api/reports

# Filtrar por mes específico
curl "http://localhost:3005/api/reports?month=2026-09"
```

---

### 4. `GET /api/reports/:id`

Obtiene los detalles estructurados en JSON de un reporte generado previamente.

```bash
curl http://localhost:3005/api/reports/a93b4e3f-671c-4b72-b8d5-7fa9b20892a1
```

---

### 5. `GET /api/reports/:id/download`

Descarga directamente el archivo físico del reporte generado desde el almacenamiento en disco (`Content-Disposition: attachment`).

```bash
curl -O -J http://localhost:3005/api/reports/a93b4e3f-671c-4b72-b8d5-7fa9b20892a1/download
```

---

### 6. `DELETE /api/reports/:id`

Elimina el registro de un reporte y remueve el archivo físico asociado del disco.

```bash
curl -X DELETE http://localhost:3005/api/reports/a93b4e3f-671c-4b72-b8d5-7fa9b20892a1
```

---

### 7. `GET /health`

Health check del servicio.

```bash
curl http://localhost:3005/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "service": "reports-service"
}
```
