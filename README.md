# Sistema de Consulta - Universidad del Valle

## 📋 Descripción

Sistema de consulta inteligente que permite a estudiantes de pregrado de la Universidad del Valle realizar preguntas sobre trámites, procesos académicos y servicios institucionales. El sistema utiliza un agente de IA con razonamiento visible que muestra cada paso del proceso de búsqueda y análisis.

## 🎯 Características Principales

| Característica           | Descripción                                                                                                                                           |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Detección de Dominio** | Clasifica automáticamente la consulta en categorías: Académico, Administrativo-Financiero, Bienestar Estudiantil, Internacionalización, Investigación |
| **Razonamiento Visible** | Timeline que muestra en tiempo real cada paso del agente                                                                                              |
| **Búsqueda Híbrida**     | Combina búsqueda vectorial, búsqueda web e inspección de documentos PDF                                                                               |
| **Interfaz Moderna**     | Diseño limpio con los colores institucionales de la Universidad del Valle                                                                             |
| **Respuestas Citeadas**  | Muestra las fuentes consultadas con su estado de vigencia                                                                                             |

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  SearchBar  │  │   Timeline  │  │    ResponseCard        │ │
│  │  (Búsqueda) │  │ (Razonamien.)│  │   (Ficha de Trámite)  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                            │ SSE (Server-Sent Events)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  API REST   │  │   Agente    │  │   Gestor de Documentos │ │
│  │  (FastAPI)  │  │  (LangChain)│  │   (ChromaDB + RAG)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tecnologías

### Frontend
- **Next.js 16** - Framework React con App Router
- **React 19** - Biblioteca de UI
- **Tailwind CSS 4** - Estilos con utility-first
- **shadcn/ui** - Componentes accesibles y personalizables
- **Lucide React** - Iconos

### Backend
- **FastAPI** - Framework Python de alto rendimiento
- **LangChain** - Framework para desarrollo de aplicaciones con LLMs
- **ChromaDB** - Base de datos vectorial
- **OpenAI GPT** - Modelo de lenguaje

## 📁 Estructura del Proyecto

```
agent-frontend-test1/
├── app/                      # Next.js App Router
│   ├── page.jsx             # Página principal
│   ├── layout.jsx           # Layout raíz
│   └── globals.css          # Estilos globales
├── components/               # Componentes React
│   ├── SearchBar.jsx        # Barra de búsqueda
│   ├── Timeline.jsx         # Timeline de razonamiento
│   ├── ResponseCard.jsx     # Tarjeta de respuesta
│   ├── DomainTags.jsx       # Tags de dominio
│   └── ui/                  # Componentes shadcn/ui
├── lib/                     # Utilidades y configuración
│   ├── config.js            # Configuración centralizada
│   ├── constants.js         # Constantes del sistema
│   ├── hooks/               # React hooks personalizados
│   │   └── useAgentQuery.js # Hook de consulta al agente
│   └── utils/               # Utilidades
│       └── eventMapper.js   # Mapeo de eventos
└── public/                  # Recursos estáticos
```

## 🚀 Instrucciones de Ejecución

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd agent-frontend-test1

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env.local con:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Ejecución

```bash
# Iniciar el servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

### Construcción para Producción

```bash
npm run build
npm start
```

## 📱 Uso del Sistema

1. **Ingresa una consulta** en la barra de búsqueda (ej: "¿Cómo solicitar una奖学金?")
2. **Observa el proceso** en el timeline mientras el agente razona
3. **Recibe la respuesta** con las fuentes consultadas
4. **Accede a acciones** directas (enlaces a portales, formularios, etc.)

## 🎓 Autores

- **Juan** - Estudiante de Ingeniería de Sistemas
- **Julián** - Estudiante de Ingeniería de Sistemas

Universidad del Valle - Colombia

## 📄 Licencia

Este proyecto es para fines educativos - Trabajo de Grado.

---

*Sistema de Consulta Agéntico - Universidad del Valle © 2024*
