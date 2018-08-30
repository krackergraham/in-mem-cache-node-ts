Setup
===
`yarn` or `npm i` to install dependencies  
`yarn build` to compile typescript  
`yarn start` to start server

Query API 
```
curl http://localhost:3000/api/tax?address={address}
```  

Response Object
```
{ "rate": number, "isCache": boolean } 
```


Cache logic is in `src/layers/cache.ts`