# CV Studio

Editor privado del CV disponible en `/cv-studio`. La ruta no aparece enlazada en la web pública, pero la seguridad real es la contraseña y la sesión firmada del servidor.

## Configuración local

Copia las variables de `.env.example` a `.env.local` y define, como mínimo:

```env
CV_ADMIN_PASSWORD="una-contraseña-larga-y-exclusiva"
CV_SESSION_SECRET="un-secreto-aleatorio-distinto"
```

Puedes generar el secreto con:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Después ejecuta `npm run dev` y abre `http://localhost:5173/cv-studio` (usa el puerto que muestre Vite si es distinto).

## Publicación desde Vercel

Añade estas variables al proyecto en Vercel:

```env
CV_ADMIN_PASSWORD="..."
CV_SESSION_SECRET="..."
CV_PUBLISH_MODE="github"
CV_GITHUB_TOKEN="..."
CV_GITHUB_REPOSITORY="Albjav/amedina-dev"
CV_GITHUB_BRANCH="main"
```

`CV_GITHUB_TOKEN` debe ser un token de acceso de grano fino limitado a este repositorio y con permiso **Contents: Read and write**. No lo expongas como variable `VITE_*`.

## Flujo de trabajo

1. Edita los campos; el borrador se guarda solo en el navegador.
2. Comprueba el indicador A4 y pulsa **Generate PDF preview**.
3. Revisa el PDF exacto en el visor. Cualquier cambio posterior vuelve a bloquear la publicación.
4. Pulsa **Publish approved version** y confirma.

En local se actualizan los archivos del repositorio directamente. En Vercel se crea un commit atómico con el JSON, HTML y PDF; ese commit activa el despliegue habitual y mantiene el historial para poder recuperar una versión anterior.

Cambiar `CV_SESSION_SECRET` invalida todas las sesiones abiertas. La sesión privada dura ocho horas y la cookie no es accesible desde JavaScript.
