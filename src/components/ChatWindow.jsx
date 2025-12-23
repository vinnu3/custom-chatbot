import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Message from './Message';
import { addMessage } from '../store/chatSlice';

export default function ChatWindow() {
  const [text, setText] = useState('');
  const messages = useSelector((s) => s.chat.messages);
  const dispatch = useDispatch();

  function send() {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text: text.trim() };
    dispatch(addMessage(userMsg));
    setText('');

    // simple mock reply
    setTimeout(() => {
      const reply = { id: Date.now() + 1, role: 'bot', text: `Echo: ${userMsg.text}` };
      dispatch(addMessage(reply));
    }, 300);
  }

  function onKey(e) {
    if (e.key === 'Enter') send();
  }

  return (
    <div>
      <div className="chat-window" data-testid="chat-window">
        {messages.length === 0 && <div data-testid="empty">Say hello 👋</div>}
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
      </div>

      <div className="input-row">
        <input
          aria-label="message-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
        />
        <button onClick={send} aria-label="send-button">Send</button>
      </div>
    </div>
  );
}
