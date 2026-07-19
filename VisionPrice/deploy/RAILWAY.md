# Despliegue en Railway — VisionPrice

## TL;DR de las diferencias contra EC2

| Tema | EC2 (lo que hicimos antes) | Railway |
|---|---|---|
| Base de datos | Contenedor MySQL + volumen manual | **Servicio MySQL gestionado. El volumen es automático, no configuras nada.** |
| HTTPS | nginx + certbot manual | **Incluido gratis** en el dominio `*.up.railway.app` |
| Puerto | Fijabas 3000 / 3001 | **Railway inyecta `PORT` dinámico. NO lo definas tú.** |
| Secretos | Archivo `.env` en el server | Variables en el panel de Railway |
| Migraciones | En el `command` del compose | En `startCommand` de `railway.json` (ya configurado) |

**Respuesta corta a "¿ocupo un volumen?": NO.** El servicio MySQL de Railway ya trae su
volumen persistente administrado. Solo necesitarías configurar un volumen manual si
levantaras MySQL como contenedor propio, y en Railway no hay razón para hacer eso.

---

## Arquitectura en Railway

Vas a crear **1 proyecto** con **4 servicios**:

```
Proyecto: VisionPrice
├── MySQL            (base de datos de auth)     ← managed, volumen automático
├── MySQL-Projects   (base de datos de projects) ← managed, volumen automático
├── auth-service     (Docker, Root Dir: VisionPriceAuth)
└── projects-service (Docker, Root Dir: VisionPriceProjects)
```

**¿Por qué dos MySQL y no uno?** Es el patrón canónico de microservicios:
*database per service*. Cada servicio es dueño de sus datos y nadie lee la tabla
del otro. Además en Railway es más simple: cada base expone su propia variable de
referencia y no tienes que crear bases ni usuarios a mano.

> **Alternativa más barata:** si el crédito del plan Hobby te preocupa, puedes usar
> **un solo MySQL** y crear la segunda base a mano (`CREATE DATABASE projects_db;`
> desde la pestaña *Data*), apuntando `projects-service` a
> `mysql://root:PASS@HOST:PORT/projects_db`. Funciona, pero pierdes el aislamiento.

---

## Qué se sube al repo

Railway despliega **desde tu repositorio de GitHub**, no subes archivos a mano.
Solo asegúrate de que estén commiteados:

```
VisionPriceAuth/
  Dockerfile          ✔ ya existe
  .dockerignore       ✔ ya existe
  railway.json        ✔ NUEVO — builder + startCommand + healthcheck
  package.json        ✔ CORREGIDO — prisma movido a dependencies
  src/                ✔
VisionPriceProjects/
  (lo mismo)
```

**NUNCA** commitees ningún `.env`. Los secretos van en el panel de Railway.

Los archivos de `deploy/ec2-db/` y `deploy/ec2-services/` **no se usan en Railway**.
Puedes dejarlos (documentan el despliegue alternativo en EC2) o borrarlos.

---

## Paso 1 — Crear el proyecto y las bases

1. Entra a [railway.app](https://railway.app) → **New Project**.
2. **+ New → Database → Add MySQL**. Se crea el servicio `MySQL` con su volumen.
3. Repite: **+ New → Database → Add MySQL**. Renómbralo a `MySQL-Projects`
   (clic en el servicio → Settings → Service Name).

Railway crea automáticamente en cada uno una base llamada `railway` y expone las
variables `MYSQL_URL`, `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, etc.

## Paso 2 — Desplegar auth-service

1. **+ New → GitHub Repo** → selecciona tu repositorio.
2. Clic en el servicio creado → **Settings**:
   - **Root Directory**: `VisionPriceAuth`
     *(ajusta la ruta si tu repo anida las carpetas; debe ser el directorio que
     contiene el `Dockerfile`)*
   - **Builder**: se detecta solo como Dockerfile gracias a `railway.json`.
3. Ve a la pestaña **Variables** y pega las de la sección de abajo.
4. **Settings → Networking → Generate Domain**. Te da algo como
   `visionprice-auth-production.up.railway.app` **con HTTPS incluido**.

## Paso 3 — Desplegar projects-service

Igual que el anterior, pero con **Root Directory**: `VisionPriceProjects`.

---

## Variables de entorno

### auth-service

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{MySQL.MYSQL_URL}}` |
| `JWT_ACCESS_SECRET` | *(genera: `openssl rand -hex 32`)* — **mínimo 32 chars** |
| `JWT_REFRESH_SECRET` | *(genera otro distinto: `openssl rand -hex 32`)* |
| `GOOGLE_CLIENT_ID` | Tu **Web** Client ID de Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Tu Web Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://<tu-dominio-auth>.up.railway.app/auth/google/callback` |
| `GOOGLE_MOBILE_CLIENT_IDS` | Tu **Android** Client ID (el de la huella SHA-1) |
| `REFRESH_TOKEN_COOKIE` | `false` |

### projects-service

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{MySQL-Projects.MYSQL_URL}}` |
| `JWT_ACCESS_SECRET` | **EXACTAMENTE el mismo valor que en auth-service** |

> `${{MySQL.MYSQL_URL}}` es una **variable de referencia** de Railway: resuelve sola
> al connection string interno de esa base. No copies la URL a mano — si Railway
> rota la contraseña, la referencia se actualiza sola.

> **`JWT_ACCESS_SECRET` compartido:** `auth-service` firma los tokens y
> `projects-service` solo los verifica. Si los secretos difieren, `projects` responde
> 401 a todo. Para no equivocarte, usa **Shared Variables** del proyecto
> (Settings del proyecto → Shared Variables) y referéncialo con `${{shared.JWT_ACCESS_SECRET}}`
> en ambos servicios.

### ⚠️ NO definas `PORT`

Railway lo inyecta automáticamente con un valor dinámico. Tu código ya hace
`app.listen({ port: env.PORT, host: '0.0.0.0' })`, que es exactamente lo correcto.
Si defines `PORT=3000` a mano, el health check falla y el deploy se cae.

---

## Paso 4 — Verificar

```bash
curl https://<tu-dominio-auth>.up.railway.app/health
curl https://<tu-dominio-projects>.up.railway.app/health
```

Ambos deben responder `{"status":"ok","uptime":...}`.

En los **Deploy Logs** de cada servicio busca:
```
All migrations have been successfully applied.
auth-service listening on :XXXX
```

---

## Paso 5 — Actualizar Google Cloud Console

Agrega tu nuevo dominio a **Authorized redirect URIs** del Web Client:
```
https://<tu-dominio-auth>.up.railway.app/auth/google/callback
```

## Paso 6 — Apuntar la app Flutter

```bash
flutter run --release \
  --dart-define=API_BASE_URL=https://<tu-dominio-auth>.up.railway.app \
  --dart-define=PROJECTS_API_BASE_URL=https://<tu-dominio-projects>.up.railway.app \
  --dart-define=GOOGLE_WEB_CLIENT_ID=<tu-web-client-id>
```

**Bonus:** al ser HTTPS, ya no necesitas tocar `network_security_config.xml` para
permitir cleartext en Android 9+. Y te habilita la práctica de **SSL pinning** sin
tener que montar nginx + certbot.

---

## Troubleshooting

| Síntoma | Causa | Solución |
|---|---|---|
| `Prisma Client did not initialize` | El client no se generó o el prune lo borró | Ya corregido: el Dockerfile regenera después del prune |
| `prisma: command not found` | El CLI estaba en devDependencies | Ya corregido: movido a `dependencies` |
| Health check timeout | Definiste `PORT` a mano | Bórrala; deja que Railway la inyecte |
| `401` en todos los `/projects` | Los `JWT_ACCESS_SECRET` no coinciden | Usa Shared Variables |
| `P1001 Can't reach database` | `DATABASE_URL` mal referenciada | Usa `${{MySQL.MYSQL_URL}}`, no la URL pública |
| Build no encuentra el Dockerfile | Root Directory incorrecto | Apunta a la carpeta que contiene el Dockerfile |
