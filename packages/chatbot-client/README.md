# custom-chatbot-client

A small React Chatbot widget packaged for npm. This package exposes a default `Chatbot` React component and a named `Chatbot` export.

Usage (install from npm or local file):

```jsx
import React from 'react';
import { Chatbot } from 'custom-chatbot-client';

export default function Page(){
  return <Chatbot apiUrl="https://your-api.example.com/chat" />;
}
```

Build locally:

```bash
cd packages/chatbot-client
npm install
npm run build
```

This produces `dist/index.esm.js` and `dist/index.cjs.js`. The package declares `react` and `react-dom` as peer dependencies.

Styles
------

This package extracts CSS into `dist/styles.css` during the build. Consumers should import the CSS in their app to get the default widget styling:

```js
import 'custom-chatbot-client/dist/styles.css';
import { Chatbot } from 'custom-chatbot-client';
```

If you prefer to override styles, you can either:

- Import the CSS and override specific classnames (the widget uses the `.cc-` prefix, e.g. `.cc-chatbot`, `.cc-message`).
- Provide a wrapper `className` around the widget (or use global CSS variables if you add them later).

Document any overrides in your consumer README so client teams know which classes to target.

Publishing:

```bash
cd packages/chatbot-client
npm publish --access public
```

If you want to test locally from the demo app in the repository, build and then in the demo app `package.json` set dependency to the built folder (or use `npm link`).
