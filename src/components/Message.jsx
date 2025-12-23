import React from 'react';

export default function Message({ message }) {
  const cls = `message ${message.role === 'user' ? 'user' : 'bot'}`;
  return (
    <div className={cls}>
      <div><strong>{message.role === 'user' ? 'You' : 'Bot'}:</strong> {message.text}</div>
    </div>
  );
}
