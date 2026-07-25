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

Después ejecuta `npm run dev` y abre `http://localhost:5173/cv-studio` o el puerto que muestre Vite si es distinto.

## Publicación desde Vercel

Añade estas variables al proyecto en Vercel:

```env
CV_ADMIN_PASSWORD="..."
CV_SESSION_SECRET="..."
CV_PUBLISH_MODE="github"
CV_GITHUB_TOKEN="..."
CV_GITHUB_REPOSITORY="Albjav12345/amedina-dev"
CV_GITHUB_BRANCH="main"
```

`CV_GITHUB_TOKEN` debe ser un token de acceso de grano fino limitado a este repositorio y con permiso **Contents: Read and write**. No lo expongas como variable `VITE_*`.

## Flujo de trabajo

1. Edita los campos visuales o abre la pestaña **Source** para editar el JSON completo del CV.
2. La preview en vivo se actualiza automáticamente cuando los datos son válidos.
3. Comprueba el indicador A4 y pulsa **Generate PDF preview**.
4. Revisa el PDF exacto en el visor. Cualquier cambio posterior vuelve a bloquear la publicación.
5. Pulsa **Publish approved version** y confirma.

## Diseño y personalización

La pestaña **Design** modifica el mismo documento estructurado que usa el resto del editor. El preset **Original** reproduce el CV publicado actual y sirve como punto de retorno seguro.

- Las diez paletas cambian únicamente los colores. Las cinco composiciones cambian tipografía, proporciones y tratamiento de bloques. Se pueden combinar libremente y ninguna modifica el contenido.
- Los controles avanzados permiten elegir fuentes distintas para cuerpo y titulares, ajustar escala, peso, interlineado, ancho de la barra lateral, ritmo vertical, márgenes, redondeado, acentos y encuadre de la fotografía.
- Cada barra de contenido —información superior, idiomas, experiencia y portfolio— tiene anchura y altura independientes. También se puede alinear a izquierda, centro o derecha y ajustar la separación interna de sus columnas.
- Cada deslizador muestra visualmente el progreso e incluye botones `−` y `+`, además de un campo numérico para valores exactos. El botón de reinicio recupera su valor original y un doble clic sobre el deslizador también lo restablece.
- **Restore original design** recupera todos los valores visuales del CV actual sin tocar el contenido.
- El indicador A4 comprueba tanto la barra lateral como el cuerpo principal. Si aparece una advertencia, reduce la escala tipográfica, el ritmo vertical o la altura de los bloques antes de generar el PDF.
- Todos los valores de diseño también aparecen en **Source**, dentro de `design`, y se validan antes de incorporarlos al HTML.

## Distribución del Studio

Los dos separadores verticales del editor son ajustables:

- Arrastra el primero para cambiar el ancho del menú de secciones.
- Arrastra el segundo para repartir el espacio entre los formularios y la preview del PDF.
- Un doble clic recupera el ancho inicial. Con el separador enfocado, las flechas izquierda y derecha hacen ajustes precisos; `Shift` acelera el cambio y `Inicio` restablece el valor.
- La distribución queda guardada únicamente en el navegador y se recupera al volver a abrir el Studio. No forma parte del CV ni se publica.

## Zoom y revisión

La preview en vivo y el visor del PDF definitivo comparten los mismos controles:

- `Ctrl + rueda` amplía o reduce alrededor de la posición del cursor.
- Arrastra el documento para desplazarte cuando esté ampliado.
- Los botones de lupa ajustan el zoom por pasos.
- Pulsa el porcentaje para volver al 100 %.
- El botón de encuadre ajusta la página completa al espacio disponible.
- En el visor definitivo también funcionan `Ctrl + +`, `Ctrl + -` y `Ctrl + 0`.

## Source editor

La pestaña **Source** es el código fuente real del CV. No es un HTML alternativo ni un modo separado: es el mismo objeto de datos que alimenta los campos visuales.

- Si editas un campo visual, el JSON se actualiza.
- Si editas el JSON y sigue siendo válido, los campos visuales y la preview se actualizan al instante.
- Si el JSON tiene un error, la preview y la publicación quedan bloqueadas hasta corregirlo o pulsar **Reload from visual editor**.
- El bloque **View generated PDF HTML/CSS** muestra el HTML final generado desde el JSON, pero es de solo lectura para mantener una única fuente de verdad.

En local se actualizan los archivos del repositorio directamente. En Vercel se crea un commit atómico con el JSON, HTML y PDF; ese commit activa el despliegue habitual y mantiene el historial para poder recuperar una versión anterior.

Cambiar `CV_SESSION_SECRET` invalida todas las sesiones abiertas. La sesión privada dura ocho horas y la cookie no es accesible desde JavaScript.
