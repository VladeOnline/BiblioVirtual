# Documentacion De La App (BiblioVerse)

## 1) Resumen
BiblioVerse es una aplicacion web para gestionar y consumir:
- Libros (con PDF + portada)
- Mangas (con portada)
- Capitulos de manga (PDF o imagenes)

Incluye autenticacion con JWT, panel de administracion y soporte de datos mock cuando el backend no esta disponible.

## 2) Stack Tecnologico
- Frontend: React 19 + TypeScript + Vite + Tailwind
- Backend: Node.js + Express 5
- Base de datos: MongoDB (Mongoose)
- Subida de archivos: Multer
- Auth: JSON Web Token (JWT)

## 3) Estructura Principal Del Proyecto
```text
BiblioVirtual/
├─ src/                    # Frontend React
│  ├─ components/          # Componentes UI
│  ├─ context/             # Contextos globales (Auth, BackendStatus)
│  ├─ hooks/               # Hooks (mock data, etc.)
│  ├─ pages/               # Pantallas de la app
│  │  └─ admin/            # Formularios del panel admin (separados)
│  ├─ services/            # Cliente API + mock data
│  └─ types/               # Tipos TypeScript
├─ server/                 # Backend Express
│  ├─ middleware/          # Auth y upload
│  ├─ models/              # Modelos Mongoose (User, Book, Manga, Chapter)
│  ├─ routes/              # Rutas API (auth, books, mangas, chapters)
│  ├─ uploads/             # Archivos subidos (auto-creado)
│  └─ server.js            # Entrada del backend
├─ .env                    # Variables locales (ignorado por git)
├─ .env.example            # Plantilla de variables
└─ package.json            # Scripts y dependencias
```

## 4) Frontend: Como Se Conforma
- `src/App.tsx`: define rutas y proteccion de rutas privadas/admin.
- `src/context/AuthContext.tsx`: mantiene sesion de usuario y metodos `login/register/logout`.
- `src/context/BackendStatusContext.tsx`: valida disponibilidad de backend (`/api/health`) y activa modo mock.
- `src/pages/Admin.tsx`: panel administrativo (listados + acciones CRUD).
- `src/pages/admin/BookForm.tsx`, `MangaForm.tsx`, `ChapterForm.tsx`: formularios desacoplados del Admin principal.
- `src/services/api.ts`: cliente Axios con token en headers e interceptor para 401.

## 5) Backend: Como Se Conforma
- `server/server.js`:
  - Carga variables de entorno.
  - Verifica `JWT_SECRET` obligatorio.
  - Crea carpetas de `uploads` automaticamente (`books`, `covers`, `chapters`).
  - Expone API bajo `/api/*`.
  - Sirve archivos estaticos (`/uploads` y `dist` en produccion).
  - Tiene middleware global de errores.
- `server/middleware/auth.js`: valida JWT y protege rutas admin.
- `server/middleware/upload.js`: configura almacenamiento y validaciones de tipo de archivo.
- `server/routes/*.js`: endpoints de auth/libros/mangas/capitulos.
- `server/models/*.js`: esquemas y modelos de MongoDB.

## 6) Variables De Entorno
Archivo local: `.env`

Minimas:
```env
PORT=5000
MONGODB_URI=mongodb+srv://.../bibliverse?...
JWT_SECRET=tu_clave_larga_y_segura
```

Notas:
- `.env` no se sube a git.
- Usa `.env.example` como plantilla compartible.

## 7) Scripts Importantes
- `npm run dev`: levanta frontend (Vite).
- `npm run server`: levanta backend Express.
- `npm run build`: compila frontend para produccion.
- `npm run start`: build + backend.

## 8) Flujo General De La App
1. Usuario abre frontend.
2. Frontend consulta API (`/api/...`) con Axios.
3. Si hay token, se envia en `Authorization: Bearer`.
4. Backend valida token y permisos.
5. Backend lee/escribe MongoDB.
6. Archivos subidos se guardan en `server/uploads/*`.
7. Si backend no responde, frontend puede mostrar datos mock en ciertas vistas.

## 9) Endpoints Base
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- CRUD de:
  - `/api/books`
  - `/api/mangas`
  - `/api/chapters`

## 10) Estado Actual
- Proyecto ya esta en la raiz del repositorio (sin carpeta contenedora `app`).
- Rama de trabajo preparada: `develop`.
- `main` y `develop` estan sincronizadas al momento de esta documentacion.

