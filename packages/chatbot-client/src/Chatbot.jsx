import React, { useState } from 'react';
import './styles.css';

export default function Chatbot({ apiUrl = '', onMessage }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  function send() {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setText('');

    // call API if provided
    if (apiUrl) {
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text })
      })
        .then((r) => r.json())
        .then((data) => {
          const reply = { id: Date.now() + 1, role: 'bot', text: data?.reply ?? String(data) };
          setMessages((m) => [...m, reply]);
          if (onMessage) onMessage(reply);
        })
        .catch((err) => {
          const reply = { id: Date.now() + 1, role: 'bot', text: 'Error: could not reach server' };
          setMessages((m) => [...m, reply]);
          if (onMessage) onMessage(reply);
        });
    } else {
      // fallback local echo
      const reply = { id: Date.now() + 1, role: 'bot', text: `Echo: ${userMsg.text}` };
      setTimeout(() => {
        setMessages((m) => [...m, reply]);
        if (onMessage) onMessage(reply);
      }, 200);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter') send();
  }

  return (
    <div className="cc-chatbot">
      <div className="cc-window">
        {messages.length === 0 && <div className="cc-empty">Say hello 👋</div>}
        {messages.map((m) => (
          <div key={m.id} className={`cc-message ${m.role === 'user' ? 'cc-user' : 'cc-bot'}`}>
            <strong>{m.role === 'user' ? 'You' : 'Bot'}:</strong> {m.text}
          </div>
        ))}
      </div>

      <div className="cc-input-row">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type a message"
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
