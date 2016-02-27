FROM node:5-onbuild
RUN wget https://github.com/jwilder/dockerize/releases/download/v0.2.0/dockerize-linux-amd64-v0.2.0.tar.gz \
&& tar -C /usr/local/bin -xzvf dockerize-linux-amd64-v0.2.0.tar.gz

EXPOSE 3000
