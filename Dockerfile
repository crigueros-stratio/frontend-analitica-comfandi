#desplegar en dcos
#docker rmi camiloriguer/frontend-analytics
#docker build -t camiloriguer/frontend-analytics .
#docker push camiloriguer/frontend-analytics:latest
#scalar a 0 y luego a 1 el servicio frontend-analytics

FROM node:12
RUN mkdir -p /opt/eduardo
WORKDIR /opt/eduardo
COPY . ./
RUN npm install http-server -g
RUN npm install -g @angular/cli
RUN npm install
RUN ng build --prod --base-href=
EXPOSE 8080
RUN chmod a+x ./entrypoint.sh
RUN chown $USER:$USER ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]