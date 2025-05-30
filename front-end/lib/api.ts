const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
    users: {
      getAll: () => fetch(`${API_BASE}/users`).then(res => res.json()),
      getById: (id: number) => fetch(`${API_BASE}/users/${id}`).then(res => res.json()),
      create: (userData: any) => 
        fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        }).then(res => res.json())
    },
    events: {
      getAll: () => fetch(`${API_BASE}/events`).then(res => res.json()),
      create: (eventData: any) =>
        fetch(`${API_BASE}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        }).then(res => res.json())
    }
  };