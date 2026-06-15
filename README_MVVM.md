MVVM scaffold agregado

Archivos y carpetas añadidos:
- `src/models` tipos y entidades.
- `src/services` servicios y barrel export.
- `src/viewmodels` hooks ViewModel (ejemplo de login).
- `src/di/Container.ts` contenedor simple de dependencias.
- `src/migration/CHECKLIST.md` pasos recomendados.

Uso rápido
1. Importar `useLoginViewModel` desde `src/viewmodels` en la `View`.
2. Preferir la inyección desde `src/di/Container.ts` para facilitar tests.

Siguientes pasos opcionales
- Añadir aliases en `tsconfig.json` y actualizar imports.
- Refactorizar otras pantallas siguiendo el ejemplo `PantallaLogin`.
