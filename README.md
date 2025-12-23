# custom-chatbot

A small React + Redux chatbot example packaged with Webpack and tested with Jest + React Testing Library.

Getting started

Install dependencies:

```bash
cd custom-chatbot
npm install
```

Run development server:

```bash
npm start
```

Run tests:

```bash
npm test
```

Build for production:

```bash
npm run build
```

Build Docker image:

```bash
docker build -t custom-chatbot:latest .
```

Run Docker container:

```bash
docker run -p 8080:80 custom-chatbot:latest
```

Client package:

If you want to publish the chat widget as a separate npm package, there's a client package at `packages/chatbot-client`.

Build and publish it separately:

```bash
cd packages/chatbot-client
npm install
npm run build
npm publish --access public
```
