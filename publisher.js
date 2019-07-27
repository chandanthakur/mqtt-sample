const mqtt = require('mqtt')
const uuidv1 = require('uuid/v1');
// WebSocket connect url
const WebSocket_URL = 'ws://134.209.158.29:8083/mqtt'
// TCP/TLS connect url
const TCP_URL = 'mqtt://134.209.158.29:1883'
const TCP_TLS_URL = 'mqtts://134.209.158.29:8883'

var topicId = "/stockticker";
class Subscriber {
    constructor(topicId) {
        this.topicId = topicId;
        this.id = uuidv1();
        this.initalizeClient();
    }

    set name(name) {
      this._name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    get name() {
      return this._name;
    }

    initalizeClient() {
        let self = this;
        this.options =  {
            connectTimeout: 4000,
            clientId: this.id,
            keepalive: 60,
            clean: true,
        };

        this.client = mqtt.connect(WebSocket_URL, this.options);
        this.client.on('connect', () => {
            self.onBrokerConnected();
        });

        this.client.on('reconnect', (error) => {
            self.onBrokerReconnected(error);
        });
        
        this.client.on('error', (error) => {
            self.onBrokerConnectionError(error);
        });
        
        // handle message event
        this.client.on('message', (topic, message) => {
            self.onBrokerMessageReceived(topic, message);
        });
    }

    onBrokerConnected() {
        this.startPublishWorker();
    }

    onBrokerReconnected(error) {
        console.error(error);
    }

    onBrokerConnectionError(error) {
        console.error(error);
    }

    onBrokerMessageReceived(topic, message) {
        console.log('Received from', topic, ':', message.toString())
    }

    startPublishWorker() {
        var updateId = 0;
        let self = this;
        function intervalFunc() {
          self.publish(updateId++);
        }

        setInterval(intervalFunc, 1000);
    }

    publish(updateId) {
        var payload = JSON.stringify({symbol: "msft", value: 140 + Math.random(), updateId: updateId});
        this.client.publish(topicId, payload, (err) => {
            if(!err) {
                console.log('Publish Success: ' + updateId);
            } else {
                console.error(err);
            }
        });
    }
  }
  
  var subscriberMap = [];
  for(let kk = 0; kk < 1; kk++) {
      subscriberMap[kk] = new Subscriber(topicId);
  }