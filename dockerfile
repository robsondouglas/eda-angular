FROM node:17.9.1-alpine3.15 as angular
RUN npm i --location=global @angular/cli@14.1.0

FROM angular as init
WORKDIR /src
COPY package.json .
RUN npm i

FROM init as source
COPY . .

FROM source as build
RUN npm run build
RUN cp ./dist /. -R 
RUN rm -rf src/

FROM nginx:1.23.1 as srv
COPY .docker/nginx.conf . 
COPY --from=build /dist /usr/share/nginx/html

FROM srv
ARG WS_URL=http://localhost:4002/ 
ARG API_URL=http://localhost:4003/
ENV WS_URL=$WS_URL
ENV API_URL=$API_URL
RUN  envsubst < nginx.conf > /etc/nginx/conf.d/default.conf

EXPOSE 80