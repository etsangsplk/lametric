# LaMetric Server
Integrate your LeMetric with your VictorOps account

Create your own indicator app at developer.lametric.com/
Type: Push
Icon: VictorOps1 (1903)
Text: VictorOps

Update messages.json to refelct your Username, Password, and Company
Update web_server to use your LaMetric Token and URL

Install:
```bash
$ npm install
$ npm install lodash
$ npm install request
$ npm install ws
```

Run:
```bash
$ node web_server
```

The Lametric requires the server to be hosted to a URL.  One option is ngrok:
```bash
$ ngrok http 8080
```

You need to input the URL on you app via LaMetric's website

