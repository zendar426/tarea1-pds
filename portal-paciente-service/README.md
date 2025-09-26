# Portal Paciente Service

Servicio que actúa como consumidor del servicio de licencias médicas, permitiendo a los pacientes consultar sus licencias médicas.

## Funcionalidades

- **GET /patient/{patientId}/licenses**: Obtiene todas las licencias médicas de un paciente específico

## Tecnologías

- Node.js
- TypeScript
- Express.js
- Axios (para comunicación con el servicio de licencias)

## Instalación

```bash
npm install
```

## Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## Variables de Entorno

- `PORT`: Puerto del servidor (default: 3002)
- `LICENSES_SERVICE_URL`: URL del servicio de licencias (default: http://localhost:3001)

## Endpoints

### GET /patient/{patientId}/licenses

Obtiene todas las licencias médicas de un paciente.

**Parámetros:**
- `patientId` (path): ID del paciente

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "folio": "LIC-1234567890-ABC123",
      "patientId": "11111111-1",
      "doctorId": "DOC123",
      "diagnosis": "Gripe común",
      "startDate": "2025-09-26T00:00:00.000Z",
      "days": 7,
      "status": "issued",
      "createdAt": "2025-09-26T10:30:00.000Z"
    }
  ],
  "count": 1,
  "message": "Found 1 license(s) for patient 11111111-1"
}
```

**Respuesta de error (400):**
```json
{
  "success": false,
  "error": "patientId is required",
  "code": "MISSING_PATIENT_ID"
}
```

## Health Check

**GET /health** - Verifica el estado del servicio

```json
{
  "status": "OK",
  "service": "Portal Paciente Service",
  "timestamp": "2025-09-26T10:30:00.000Z"
}
```