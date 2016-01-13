# Record Scrum notes from the #openmrs IRC channel

## Before building

    npm install -g mocha

## Run ElasticSearch

### For a dev environment on OSX

    $ docker run -d -p 9200:9200 -p 9300:9300 elasticsearch -Des.network.bindHost=0.0.0.0
     
### For prod on a Digital Ocean one-click app Docker box (don't expose ElasticSearch to the outside world, since it isn't secured)

    $ docker run -d -p 127.0.0.1:9200:9200 -p 127.0.0.1:9300:9300 elasticsearch

## Run just the listener (without the webapp)

    $ node index --elasticsearch.host http://192.168.99.100:9200

## Run the listener and webapp together

First, create a "config.json" file like

    {
      "elasticsearch": {
        "host": "http://192.168.99.100:9200"
      }
    }

Then

    $ npm start
    
And see the webapp running on http://localhost:3000