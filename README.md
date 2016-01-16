# Record Scrum notes from the #openmrs IRC channel

## Before building

    npm install -g mocha

## Development

### ES (for a dev environment on OSX)

    $ docker run --name es -d -p 9200:9200 -p 9300:9300 elasticsearch -Des.network.bindHost=0.0.0.0
     
## Run just the listener (without the webapp)

    $ node index --elasticsearch.host http://192.168.99.100:9200

## Run the listener and webapp together

If you do not have elasticsearch running on localhost:9200, then create a "config.json" file like this:

    {
      "irc": {
        "channel": "#openmrstest"
      },
      "elasticsearch": {
        "host": "http://192.168.99.100:9200"
      }
    }

Then

    $ npm start
    
And see the webapp running on http://localhost:3000

### Testing the docker build locally

    $ docker run --name web -d -p 3000:3000 --link es:es -e "elasticsearch:host=http://es:9200" -e "irc:channel=#openmrstest" djazayeri/openmrs-scrumbot:1.0

## Prod

Note: this approach uses LINK networking, which will eventually be deprecated in Docker.

### ES for prod on a Digital Ocean one-click app Docker box (don't expose ElasticSearch to the outside world, since it isn't secured)

    $ docker run -d --name es -v "$PWD/esdata":/usr/share/elasticsearch/data -p 127.0.0.1:9200:9200 elasticsearch
    
### build docker image on dev machine

    $ docker build -t djazayeri/openmrs-scrumbot:1.0 .   // remember to change the version number tag
    $ docker push djazayeri/openmrs-scrumbot
    
### run webapp+bot on docker on Digital Ocean

    // this is automated as ./update-web 1.2
    $ docker rm web
    $ docker run -d -p 80:3000 --name web --link es:es -e "elasticsearch:host=http://es:9200" djazayeri/openmrs-scrumbot:1.0
