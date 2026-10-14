# contacts-app-angular (Node 22 friendly)

- Angular runtime 18.2.x; CLI/build pinned to 18.2.21 (works on Node v22.19.0, npm 11.6.1)
- Uses local CLI via `npx` to avoid global CLI mismatches
- CRUD app ported from Vue: search, filter, sort, pagination, modal, routes

## Install
```
rmdir /S /Q node_modules  2>nul
del /F /Q package-lock.json 2>nul
npm cache clean --force
npm i
```

## Mock API
```
npm run serve:api  // http://localhost:5174
```

## Run
```
npm start         // http://localhost:4200
```
