'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  return (
    <form style={{ display: 'grid', gap: '1rem' }}>
      <h2>Forgot password</h2>
      <label>
        Email address
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <button type="submit">Send reset link</button>
    </form>
  );
}
