# Tengdu

## Project setup

To start the project run

```
npm install
npm start
```

### Folders

- app
  - This app uses expo router so the navigation is defined with the folder and file setup under the app folder. Files and folders create a route to a page. Index file under a folder will be rendered when the path to the folder is given. A common layout for each route can be defined with the \_layout file, each file in a folder will render in the \_layout file under that specific folder. See https://docs.expo.dev/router/introduction/ for more information on expo router.
- components
  - Common components
- db
  - Functions to get and post data from firestore database
- hooks
- models
  - User defined models
- pages
  - Re-usable pages
- providers
  - Providers for global states
- storage
  - Functions to get and post data to firebsae storage
- utils
  - Misc utility functions
