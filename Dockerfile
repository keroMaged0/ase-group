FROM node:20
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

