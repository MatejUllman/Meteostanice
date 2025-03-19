FROM node:20-alpine

WORKDIR /app

COPY package.json /app/package.json

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "8000"]