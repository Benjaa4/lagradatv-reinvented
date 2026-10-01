# AUDITORÍA DE CÓDIGO, LÓGICA, REACTIVIDAD Y PERSISTENCIA

## 1. Mapeo de Componentes, Vínculos y Repercusiones

### Vista Pública
- **`HomePage` / `HeroBanner`**: Vinculado a `getMatches()`, `getTournaments()` y `site_settings`. Repercute en la redirección al "Partido Destacado" según la configuración en tiempo real (prioridad de eventos en vivo vs selección manual).
- **`TournamentDetailPage`**: Vinculado a `getTournamentById()`, filtrando sus vistas secundarias (Posiciones, Partidos, Llaves, Disciplina) según los booleanos de configuración alojados en la tabla `tournaments`.
- **`MatchesPage` / `MatchDetailPage`**: Consultas directas a `matches` y `teams`. Permiten el seguimiento y visualización sin capacidad mutacional.

### Panel de Administración (`/admin`)
- **`AdminTournamentsTab` / `AdminSettingsTab`**: Administran mutaciones globales (configuración del hero, logos, torneos destacados) inyectando en `site_settings` y `tournaments`.
- **`AdminMatchesTab` / `AdminTournamentDetailPage`**: Gestionan el flujo de torneos y el ciclo de vida de los partidos (`matches`). Modificar el estado de un partido a "Finalizado" (played) repercute lógicamente en la tabla de posiciones tras recalcular, o en el avance en brackets.
- **`AdminBracketEditor`**: Mutaciones sobre `matches` con la llave virtual (`round`, `match_order`).

---

## 2. Coherencia Crítica Admin vs Vista Pública

### Toggles de Visibilidad en Torneos
- **Validación Exitosa:** Los campos `show_standings`, `show_bracket`, `show_scorers` y `show_discipline` ocultan o muestran de forma estricta e inmediata las pestañas de navegación en `TournamentDetailPage.tsx`. No se renderizan componentes huérfanos.

### Brackets y Eliminatorias
- **Generación y Avance Automático:** El sistema de generación automática estipula correctamente las llaves con orden secuencial (`round` y `match_order`).
- **Proyección Lógica:** Al asignar un ganador (`winner_id`) en `AdminBracketEditor.tsx`, la lógica localiza dinámicamente el próximo partido (`nextMatchOrder = Math.ceil(match_order / 2)`) y actualiza automáticamente el identificador del equipo visitante o local.
- **Rondas Libres (Byes):** Los equipos "TBD" no provocan quiebres de estructura, manteniendo la integridad de las conexiones SVG en pantalla.

### Tabla de Clasificaciones (`team_standings`)
- **Cálculo Riguroso:** La función "Recalcular Automáticamente" itera exclusivamente sobre los partidos con estado `played`. 
- **Integridad Matemática:** Se realiza la suma de `played`, `won`, `drawn`, `lost`, `goalsFor`, `goalsAgainst`, `points` e inyecta la diferencia de goles (`goal_difference`). 
- **Sanciones:** El cálculo resta correctamente los `points_penalty` sobre el total matemático antes de ejecutar la persistencia vía `upsert` o `update` directo a Supabase. Las descalificaciones (`disqualified: true`) se marcan efectivamente.

### Configuración Global (`site_settings`)
- **Reactividad:** `SettingsContext` centraliza el estado global de la app. La suscripción en tiempo real vía WebSockets (`supabase.channel('public:site_settings')`) re-carga el layout y datos de Hero inmediatamente si un admin los edita.
- **HeroBanner:** Obedece fielmente al booleano `prioritize_live`, saltando a `featured_match_id` o `is_featured` si el primero falla.

### Gestión Dual de Clubes
- Se distingue la gestión de clubes base (`GlobalTeam`) de los conjuntos locales suscritos a los torneos. La separación de arrays `team_ids` ha sido auditada y preservada intacta.

---

## 3. Autenticación y Persistencia de Sesión
- El inicio de sesión y la generación de token es gestionada nativamente por `supabase.auth`. 
- **Persistencia Aprobada:** La instancia en `supabase.ts` está inicializada con `persistSession: true` y `storage: window.localStorage`. La sesión no expira al salir de la ruta protegida o refrescar el navegador (F5), garantizando resiliencia administrativa.

---

## 4. Limpieza de Datos y Tipado
- **Cero MockData:** Se confirma la inexistencia y erradicación del 100% de los datos falsos y del archivo `mockData.ts`. La persistencia y lectura proceden exclusivamente de la conexión real en la nube.
- **Sincronización Snake/Camel Case:** Los objetos transportados a la base de datos están correctamente definidos en `src/types/index.ts` previniendo errores de hidratación y desajustes 400 Bad Request (como fue solucionado anteriormente en el plural/singular de `show_bracket`).
- **Certificación TypeScript:** Tras las reestructuraciones estéticas, todo el código base ha sido verificado con `npx tsc --noEmit`. El compilador finalizó con **0 errores**, certificando robustez absoluta.
