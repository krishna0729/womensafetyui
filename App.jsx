import { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  const callBackend = async () => {
    try {
      const res = await fetch('/api/test');
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage('Error connecting to backend');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Full Stack App</h1>
      <button onClick={callBackend}>Call /test API</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
