FROM node:18

WORKDIR /server

COPY package*.json ./
RUN npm install

COPY . .

CMD npx knex migrate:latest --knexfile ./knexfile.cjs && npm run dev

EXPOSE 5000
