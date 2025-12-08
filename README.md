```.env
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=YOUR_DB_NAME
DB_HOST=YOUR_DB_HOST
DB_PORT=YOUR_DB_PORT
ACCESS_TOKEN_SECRET=YOUR_ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET=YOUR_REFRESH_TOKEN_SECRET
```

create & fill in the `.env` file in the [`client/src`](server/src/):
```.env
REACT_APP_BASE_API_URL=YOUR_BASE_API_URL
```


For start server you need write: 
```
docker-compose up --build
```

For start client you need write: 
```
npm start 
```
