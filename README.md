# Record Scrum notes from the #openmrs IRC channel
[![Dependency Status](https://david-dm.org/djazayeri/openmrs-contrib-scrumbot.svg)](https://david-dm.org/djazayeri/openmrs-contrib-scrumbot) [![devDependency Status](https://david-dm.org/djazayeri/openmrs-contrib-scrumbot/dev-status.svg)](https://david-dm.org/djazayeri/openmrs-contrib-scrumbot#info=devDependencies)

You may set settings such as the channel and the elasticsearch host in `.env`, which is in this working directory, or optionally in `config.json`. A sample `.env` file is provided. `config.js` has defaults.

## Before building

    npm install -g mocha

## Development

This requires [docker-compose][] for provisioning. For development, simply do:

    $ docker run --name scrumbot-es -d -p 9200:9200 -p 9300:9300 elasticsearch -Des.network.bindHost=0.0.0.0

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

``` shell
    $ docker-compose run web
```

## Production

Note: this approach uses LINK networking, which will eventually be deprecated in Docker.

### ES for production on a Digital Ocean one-click app Docker box (don't expose ElasticSearch to the outside world, since it isn't secured)

**Order here matters.**

    ``` shell
        $ docker-compose -f docker-compose.override.yml -f docker-compose-prod.yml up -d
    ```
### dockerhub does builds automatically

Whenever you commit code to this repository it is automatically built as djazayeri/openmrs-contrib-scrumbot:latest

### run webapp+bot on docker on Digital Ocean

``` shell
    $ docker pull djazayeri/openmrs-contrib-scrumbot:latest
    $ docker rm web
    $ docker run -d -p 80:3000 --name web --link es:es -e "elasticsearch:host=http://es:9200" djazayeri/openmrs-contrib-scrumbot:latest
```

   You may also use [docker-compose][] to handle this:

``` shell
    $ docker-compose -f docker-compose.yml -f docker-compose-prod.yml up -d
```

[docker-compose]: https://docs.docker.com/compose/
