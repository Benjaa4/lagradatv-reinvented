# Análisis de Arquitectura: La Grada TV

Este documento presenta un desglose técnico exhaustivo de la aplicación actual de "La Grada TV", preparado como base conceptual para su reescritura utilizando React, TypeScript y Tailwind CSS.

## 1. Catálogo de Funcionalidades y Vistas

La aplicación es una Single Page Application (SPA) centrada en la visualización de torneos de fútbol, partidos y transmisiones en vivo/grabadas.

### Vistas Principales (Públicas)
- **Home (`/`)**: Landing page principal que muestra próximos partidos, torneos destacados y los videos más recientes.
- **Torneos (`/torneos`)**: Listado general de todas las competiciones disponibles.
- **Detalle de Torneo (`/torneo/:id`)**: Vista específica que renderiza la tabla de posiciones (standings), el fixture/bracket (para torneos eliminatorios) y partidos programados.
- **Álbumes (`/albumes` y `/album/:id`)**: Galería de listas de reproducción o colecciones de videos agrupados.
- **Reproductor de Video (`/video/:id`)**: Vista inmersiva con "modo teatro" e iluminación ambiental simulada por CSS para ver transmisiones (VOD o Live).
- **Detalle de Partido (`/partido/:id`)**: Pantalla táctica del encuentro. Muestra marcador en vivo, stream embebido si lo hay, y representaciones visuales de las alineaciones (formación, titulares, suplentes, y panel disciplinario de tarjetas).
- **Páginas Legales**: Términos (`/terminos`), Privacidad (`/privacidad`), y Cookies (`/cookies`).

### Vistas de Administración (Protegidas)
- **Login (`/login`)**: Autenticación de administrador.
- **Panel de Control (`/admin`)**: Dashboard CRUD completo. Permite gestionar:
  - Torneos y Estadísticas de Equipos (agregar/eliminar puntos, goles, tarjetas).
  - Partidos (resultados, estados, fechas, enlaces de stream).
  - Generador automático de llaves (brackets) para torneos de eliminación directa.
  - Videos, Álbumes y Ubicaciones (canchas).

---

## 2. Stack Tecnológico y Dependencias Actuales

El proyecto no es un monorepo formal, pero divide su estructura en `src` (frontend) y `server` (backend).

### Frontend (Directorio raíz / `src`)
- **Core**: React 19.2, ReactDOM 19.2.
- **Enrutamiento**: React Router v7 (`react-router-dom`).
- **Construcción y Tooling**: Vite 8, ESLint. Escrito en JavaScript moderno (JSX), **sin TypeScript**.
- **Estilos**: Vanilla CSS (`App.css`, `index.css`, y varios CSS modulares como `Navbar.css`). Abuso de estilos en línea (inline-styles) en varios componentes clave.
- **Iconos**: Lucide React.

### Backend (Directorio `server`)
- **Core**: Express 5.2.1, Node.js.
- **Base de Datos**: Turso (SQLite remoto) a través de `@libsql/client`.
- **Autenticación**: `jsonwebtoken` (JWT) y `bcryptjs`.
- **Seguridad y Entorno**: `cors`, `dotenv`.

---

## 3. Manejo de Contenido Multimedia y Reproductor

La aplicación no aloja ni procesa flujos de video directamente, sino que **actúa como un agregador de streams externos**.

- **Lógica de Parseo (`src/utils/videoUtils.js`)**: Convierte URLs regulares de plataformas populares a URLs de incrustación (`embedUrls`).
  - Soporta **YouTube**: Extrae el ID de enlaces estándar, `youtu.be`, `live`, y `shorts`. Retorna el iframe embed de YouTube.
  - Soporta **Twitch**: Identifica VODs vs Live Streams de canales, y formatea el iframe nativo de Twitch.
- **Reproducción (`VideoView.jsx` y `MatchView.jsx`)**: Se utilizan etiquetas `<iframe allowFullScreen>` nativas envueltas en contenedores estilizados (modo "cinema" con brillos radiales CSS en el fondo para efecto inmersivo).
- Las transmisiones se atan tanto a la entidad `Video` genérica como directamente a un `Partido` (mediante el campo `stream_url`).

---

## 4. Flujo de Datos y Conexiones Externas

La aplicación sigue una arquitectura Cliente-Servidor tradicional vía **API REST**.

- **Endpoints del Servidor (Backend Express)**:
  - Públicos: `/api/tournaments`, `/api/videos`, `/api/albums`, `/api/locations`, `/api/matches`.
  - Protegidos (Requieren cabecera `Authorization: Bearer <token>`): Endpoints POST/PUT/DELETE.
- **Estado Global (`src/context/AppContext.jsx`)**: 
  - Al cargar la app, se disparan 5 fetchs paralelos a la API pública para traer *toda* la base de datos (Torneos, Videos, Álbumes, Sedes, Partidos).
  - El contexto retiene este enorme payload en la memoria del cliente (`useState`).
  - Las acciones del administrador modifican la base de datos vía API y luego mutan el estado global localmente para reflejar los cambios sin recargar.
- **Caché y Preferencias**: Se utiliza `localStorage` para hidratar la sesión del admin (`adminToken`) y guardar equipos/torneos favoritos del usuario (`appFavorites`).

---

## 5. Modelos de Datos para TypeScript

Para la refactorización a TS, estas son las interfaces inferidas de la base de datos y la UI:

```typescript
type MatchModality = 'f5' | 'f7' | 'f11';
type MatchStatus = 'scheduled' | 'live' | 'played';
type TournamentType = 'league' | 'knockout';

interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  season?: string;
  description?: string;
  image?: string;
  match_type: MatchModality;
  standings?: TeamStanding[];
}

interface TeamStanding {
  id: string;
  tournament_id: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  fouls: number;
  disqualified: boolean;
  logo?: string;
}

interface Match {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  date: string; // Formato DD/MM/YYYY o similar
  time: string; // Formato HH:MM
  location_id?: string;
  status: MatchStatus;
  home_score: number;
  away_score: number;
  stream_url?: string;
  round?: string; // e.g., 'round_of_16', 'quarterfinal', 'semifinal', 'final'
  match_order?: number;
  bracket_code?: string; // Sistema semántico: O1-O8, C1-C4, S1-S2, F1
  home_penalties?: number | null;
  away_penalties?: number | null;
  description?: string;
  match_type: MatchModality;
  lineups?: string | LineupsData; // JSON stringificado en BD
}

interface LineupPlayer {
  id: string;
  name?: string;
  fullName?: string;
  number: number;
  role: string; // 'Goalkeeper', 'Defender', etc.
  isCaptain?: boolean;
  yellowCards: number;
  redCards: number;
  priorYellowCount: number;
}

interface TeamLineup {
  formation: string; // e.g., '4-3-3'
  formationName?: string;
  coach?: string;
  starting: LineupPlayer[];
  substitutes: LineupPlayer[];
}

interface LineupsData {
  home: TeamLineup;
  away: TeamLineup;
}

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  type: 'live' | 'recording';
  date: string;
  views: number;
  album_id?: string;
}

interface Album {
  id: string;
  title: string;
  thumbnail?: string;
  date: string;
}

interface Location {
  id: string;
  name: string;
  map_url?: string;
}
```

---

## 6. Deuda Técnica y Puntos a Mejorar (Refactorización)

La arquitectura actual tiene varios problemas de escala y limpieza de código que deberán solucionarse en la nueva versión con React+TS+Tailwind:

1. **Estado Global Obeso y Cuello de Botella (`AppContext.jsx`)**:
   - Actualmente **todo** (auth, modales, fetching, y estado de CRUD de todas las entidades) reside en un único archivo Context de +600 líneas.
   - *Solución*: Mover el fetching a herramientas como React Query (`@tanstack/react-query`) o SWR. Separar el contexto de Autenticación del contexto de UI (Modales, Favoritos).
2. **Abuso de Estilos en Línea y CSS Disperso**:
   - Archivos como `MatchView.jsx` y `VideoView.jsx` tienen componentes gigantes con objetos `style={{ ... }}` extremadamente complejos (hasta 10-15 propiedades por nodo).
   - *Solución*: La migración a **Tailwind CSS** eliminará por completo esta deuda, trasladando estas propiedades a clases utilitarias legibles.
3. **Fetching Inicial Masivo**:
   - La aplicación descarga toda la base de datos al inicio en `/api/tournaments`, `/matches`, etc., sin importar en qué vista esté el usuario.
   - *Solución*: Implementar paginación, filtros o peticiones bajo demanda (Lazy loading de datos por vista).
4. **Acoplamiento de Lógica de Negocio en la Vista**:
   - Existen algoritmos de progresión de torneo (brackets) y parseo de video directamente mezclados dentro de funciones de componentes o en el `AppContext`.
   - *Solución*: Aislar lógica pura (como `bracketUtils.js` y `lineupUtils.js`) mejorándola con tipado fuerte de TypeScript.
5. **Tipado Inexistente**:
   - Al ser JavaScript, las propiedades dentro de `match.lineups` o `match.bracket_code` son propensas a errores en tiempo de ejecución (frecuentemente validado con strings serializados en JSON manual).
   - *Solución*: TypeScript forzará la consistencia de esquemas entre cliente y servidor.
6. **Componentes Demasiado Grandes**:
   - `MatchView.jsx` tiene +1100 líneas y maneja simultáneamente la lógica de Scoreboard, Tabs, Renders Condicionales de equipos, etc.
   - *Solución*: Dividir en componentes atómicos (`Scoreboard.tsx`, `TacticalPitch.tsx`, `DisciplinePanel.tsx`).
