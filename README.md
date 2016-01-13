Before building

    npm install -g mocha
    
For a dev environment on OSX

    $ docker run -d -p 9200:9200 -p 9300:9300 elasticsearch -Des.network.bindHost=0.0.0.0
    $ node index --elasticsearch.host http://192.168.99.100:9200
     
