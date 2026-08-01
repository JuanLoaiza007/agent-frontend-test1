# Especificación de API del Backend para el Frontend

Este documento define los requisitos que el backend debe cumplir para compatibilidad total con el frontend desarrollado en Next.js.

## 1.1 Catálogo de modelos

El frontend debe consultar el catálogo antes de permitir consultas:

```http
GET /agent/v1/models
```

Respuesta:

```json
{
  "models": [
    {
      "name": "deepseek/deepseek-v3.2",
      "label": "DeepSeek V3.2",
      "default": true
    },
    {
      "name": "openai/gpt-4o-mini",
      "label": "OpenAI GPT-4o Mini",
      "default": false
    }
  ]
}
```

`name` es el identificador enviado al proveedor y `label` es el texto visible en la interfaz. `default` y `experimental` son opcionales y equivalen a `false` cuando se omiten. Debe existir exactamente un modelo con `default: true`. El backend siempre devuelve el catálogo completo; el frontend oculta los modelos con `experimental: true` hasta que el usuario activa la casilla correspondiente.

## 1.2 Estado persistente del backend

El frontend mantiene una conexión SSE para conocer la disponibilidad de la API:

```http
GET /agent/v1/status-stream
```

La conexión envía un evento `backend_status` al abrirse y un evento `heartbeat` cada 15 segundos. El frontend usa `EventSource`, reconexión controlada y un polling de respaldo sobre `/agent/v1/models` si el canal SSE falla o es bloqueado por el navegador.

## 1.3 Métricas de ejecución

Las duraciones visibles son calculadas exclusivamente por el backend. El frontend muestra `duration_ms` de `action_start` y `total_duration_ms` de `done`; no calcula tiempos usando la recepción de eventos SSE.

Los eventos `action_start` y `action_complete` pueden incluir `duration_ms`, `occurrence` y `timing_source: "backend"`. El evento `done` incluye `total_duration_ms` y `timing_source: "backend"`. Si una métrica no está presente, la interfaz no debe mostrar `0 s` ni fabricar una duración local.

## 1. Endpoint Base

| Configuración        | Valor                                                                |
|----------------------|----------------------------------------------------------------------|
| URL Base             | `http://localhost:8000` (configurable via `NEXT_PUBLIC_BACKEND_URL`) |
| Endpoint             | `/agent/v1/stream`                                                   |
| Método HTTP          | `POST`                                                               |
| Formato de respuesta | Server-Sent Events (SSE) - Stream                                    |

## 2. Formato de la Solicitud (Request)

El frontend envía una solicitud POST con el siguiente cuerpo:

```json
{
  "question": "Texto de la pregunta del usuario",
  "history": [],
  "model": "deepseek/deepseek-v3.2"
}
```

**Headers requeridos:**
```
Content-Type: application/json
```

`model` es obligatorio y debe pertenecer al catálogo retornado por `GET /agent/v1/models`.

Si no pertenece al catálogo, el backend responde `400` con `detail.code` igual a `MODEL_NOT_ALLOWED`, además de `default_model` y el catálogo vigente.

## 3. Formato de Eventos SSE

El backend debe enviar eventos en el siguiente formato:

```
event: <tipo_evento>
data: <json_data>
```

### 3.1 Evento: `action_start`

Envío cuando inicia una nueva acción del agente. Actualiza el Timeline del frontend.

**Datos requeridos:**
```json
{
  "action_type": "tipo_de_accion",
  "message": "Descripción de la acción"
}
```

**Tipos de acción soportados (action_type):**

| action_type            | Step en Timeline | Descripción            |
|------------------------|------------------|------------------------|
| `domain_detector`      | Planning         | Analizando consulta    |
| `vector_search`        | Vector Search    | Buscando en documentos |
| `web_search`           | Web Search       | Buscando en internet   |
| `search_web_pages`     | Web Search       | Buscando en internet   |
| `inspect_web_page`     | Page Inspection  | Inspeccionando página  |
| `page_inspection`      | Page Inspection  | Inspeccionando página  |
| `inspect_pdf_document` | PDF Inspection   | Leyendo documento PDF  |
| `pdf_inspection`       | PDF Inspection   | Leyendo documento PDF  |
| `read_pdf_section`     | PDF Section      | Leyendo sección de PDF |
| `planner`              | Planner          | Generando plan         |
| `replanner`            | Replanner        | Evaluando progreso     |
| `final_response`       | Final Response   | Generando respuesta    |

**Ejemplo:**
```
event: action_start
data: {"action_type": "vector_search", "message": "Buscando en la base de conocimientos..."}
```

### 3.2 Evento: `domain_detected`

Envío cuando se detecta el dominio de la consulta.

**Datos requeridos:**
```json
{
  "domain": "nombre_del_dominio",
  "domain_label": "Etiqueta legible del dominio",
  "confidence": 0.95
}
```

**Ejemplo:**
```
event: domain_detected
data: {"domain": "academico", "domain_label": "Académico", "confidence": 0.95}
```

### 3.3 Evento: `answer_chunk`

Envío de fragmentos de la respuesta final (streaming).

**Datos requeridos:**
```json
{
  "content": " fragmento de texto de la respuesta",
  "is_last": false
}
```

**Campo opcional:**
- `is_last`: `true` cuando es el último fragmento

**Ejemplo:**
```
event: answer_chunk
data: {"content": "La respuesta es...", "is_last": false}
```

### 3.4 Evento: `done`

Envío cuando el procesamiento del agente finaliza completamente.

**Datos requeridos:**
```json
{
  "question": "Pregunta original",
  "answer": "Respuesta completa final",
  "detected_domain": "dominio_detectado",
  "domain_confidence": 0.95,
  "sources": [],
  "action_links": []
}
```

### 3.5 Evento: `error`

Si falla un modelo después de iniciado el stream, el backend emite un evento `error` y finaliza con un `done` cuyo `detected_domain` es `error`. Si falla antes del primer evento, puede reintentar con el modelo marcado como `default`.

**Campos opcionales:**
- `sources`: Array de fuentes utilizadas
- `action_links`: Array de enlaces de acciones relacionadas

**Ejemplo:**
```
event: done
data: {"question": "¿Cómo me matriculo?", "answer": "Para matricularse...", "detected_domain": "academico", "domain_confidence": 0.95, "sources": [], "action_links": []}
```

## 4. Orden de Eventos

El orden típico de eventos enviados por el backend debe ser:

1. `domain_detected` - (opcional) Cuando se identifica el dominio
2. Múltiples `action_start` - Para cada paso del agente
3. Múltiples `answer_chunk` - Para la respuesta en streaming
4. `done` - Para indicar finalización

## 5. Ejemplo de Conversación Completa

```
event: domain_detected
data: {"domain": "academico", "domain_label": "Académico", "confidence": 0.95}

event: action_start
data: {"action_type": "planning", "message": "Analizando la consulta..."}

event: action_start
data: {"action_type": "vector_search", "message": "Buscando en documentos..."}

event: action_start
data: {"action_type": "planner", "message": "Generando plan de respuesta..."}

event: answer_chunk
data: {"content": "Para ", "is_last": false}

event: answer_chunk
data: {"content": "realizar ", "is_last": false}

event: answer_chunk
data: {"content": "su matrícula...", "is_last": true}

event: done
data: {"question": "¿Cómo me matriculo?", "answer": "Para realizar su matrícula...", "detected_domain": "academico", "domain_confidence": 0.95, "sources": [], "action_links": []}
```

## 6. Notas Importantes

### 6.1 Compatibilidad con Timeline

El frontend usa los siguientes pasos del Timeline:
- **Planning**: Análisis inicial de la consulta
- **Domain Detected**: Dominio identificado
- **Vector Search**: Búsqueda en base de conocimientos
- **Web Search**: Búsqueda en internet
- **Page/PDF Inspection**: Inspección de fuentes externas
- **Planner/Replanner**: Generación y evaluación de planes
- **Final Response**: Respuesta final

### 6.2 Manejo de Errores

Si ocurre un error, el backend debe:
- Enviar un evento `done` con `detected_domain: "error"`
- O manejar el error mediante el flujo normal de eventos
- Para `MODEL_NOT_ALLOWED`, el frontend selecciona el `default_model`, lo guarda y reintenta una sola vez.
- El backend no acepta modelos fuera del catálogo.

### 6.3 Configuración de Puerto

El backend debe ejecutarse en el puerto configurado (por defecto `8000`). La URL completa del endpoint será:
```
http://localhost:8000/agent/v1/stream
```

## 7. Changelog

| Versión | Fecha      | Cambios                       |
|---------|------------|-------------------------------|
| 1.0.0   | 2026-03-11 | Versión inicial del documento |

---

*Documento generado automáticamente para el proyecto agent-frontend-test1*
