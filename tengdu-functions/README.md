Go to the functions directory

```
cd functions
```

Install dependencies

```
npm install
```

Run tests

```
npm test
```

To deploy all functions run

```
firebase deploy --only functions
```

Deploy a specific function (Reccomended so we don't accidentally alter other functions)

```
firebase deploy --only functions:functionName
```
