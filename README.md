# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Firebase Authentication

Para administrar el proyecto Firebase desde este equipo, instala la CLI globalmente. No la añadas como dependencia de la aplicación: el SDK `firebase` del `package.json` es el que usa el cliente.

```sh
npm install -g firebase-tools
firebase login
```

En Firebase Authentication, habilita los proveedores Google y Correo/contraseña. Para Vercel, configura `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` y `VITE_FIREBASE_APP_ID` como variables de entorno. En local, usa `.env.local`, que está excluido de Git.

## Firebase Hosting

El sitio `autovaultgarage` está vinculado al directorio `dist` en `firebase.json` y al proyecto `autovaultgarage-8923e` en `.firebaserc`. Después de iniciar sesión y compilar, despliega con:

```sh
npm run build
firebase deploy --only hosting:autovaultgarage --project autovaultgarage-8923e
```
