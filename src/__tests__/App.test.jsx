import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import store from '../store';
import App from '../App';

test('renders the chat window and can send a message', async () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  const input = screen.getByLabelText('message-input');
  const send = screen.getByLabelText('send-button');

  expect(screen.getByTestId('chat-window')).toBeInTheDocument();

  await userEvent.type(input, 'hello');
  userEvent.click(send);

  // After sending, user's message should appear
  expect(await screen.findByText(/You:/)).toBeInTheDocument();
});
