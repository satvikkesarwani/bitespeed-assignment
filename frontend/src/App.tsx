import React, { useState } from 'react';
import axios from 'axios';
import { Search, Link as LinkIcon, Mail, Phone, Users } from 'lucide-react';
import './index.css';

interface ContactResponse {
  contact: {
    primaryContatctId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

function App() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContactResponse | null>(null);
  const [error, setError] = useState('');

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) {
      setError('Please provide at least an email or phone number');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:3000/identify', {
        email: email || null,
        phoneNumber: phone || null
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>FluxKart Identity Check</h1>

      <div className="search-card">
        <form onSubmit={handleIdentify}>
          {error && <div className="error-msg">{error}</div>}

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="doc@hillvalley.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="text"
              placeholder="123456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? (
              'Identifying...'
            ) : (
              <>
                <Search size={18} />
                Identify Customer
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="result-card">
          <div className="result-header">
            <LinkIcon size={24} color="#a78bfa" />
            <h2>Consolidated Contact Found</h2>
          </div>

          <div className="data-row">
            <span className="data-label">Primary ID</span>
            <div className="data-value">
              <span className="badge primary">
                #{result.contact.primaryContatctId}
              </span>
            </div>
          </div>

          <div className="data-row">
            <span className="data-label">
              <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Linked Emails
            </span>
            <div className="data-value">
              {result.contact.emails.length > 0 ? (
                result.contact.emails.map((e, i) => (
                  <span key={i} className="badge">{e}</span>
                ))
              ) : (
                <span className="badge secondary">None</span>
              )}
            </div>
          </div>

          <div className="data-row">
            <span className="data-label">
              <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Linked Phone Numbers
            </span>
            <div className="data-value">
              {result.contact.phoneNumbers.length > 0 ? (
                result.contact.phoneNumbers.map((p, i) => (
                  <span key={i} className="badge">{p}</span>
                ))
              ) : (
                <span className="badge secondary">None</span>
              )}
            </div>
          </div>

          <div className="data-row">
            <span className="data-label">
              <Users size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Secondary IDs
            </span>
            <div className="data-value">
              {result.contact.secondaryContactIds.length > 0 ? (
                result.contact.secondaryContactIds.map((id, i) => (
                  <span key={i} className="badge secondary">#{id}</span>
                ))
              ) : (
                <span className="badge secondary">No secondary contacts</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
