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
        let self = this;
        this.client.subscribe(this.topicId, (err) => {
            console.log(err || 'Subscribed:' + self.id + ":" + self.topicId)
        });
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
  }
  
  var subscriberMap = [];
  for(let kk = 0; kk < 100; kk++) {
      subscriberMap[kk] = new Subscriber(topicId);
  }