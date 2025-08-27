export const getSimulatedResponse = (mode, limit) => {
  let responseText = "";
  switch (mode) {
    case "Summarize":
      responseText = "Summary prepared (stub). Hook /api/summarize for real response.";
      break;
    case "Rephrase":
      responseText = "Rephrased variant (stub). Connect /api/rephrase.";
      break;
    case "Write Code":
      responseText = "Code draft generated (stub). Wire to /api/code.";
      break;
    case "Publication":
      responseText = "Publication-style writeup (stub). Wire to /api/publication.";
      break;
    default:
      responseText = "Standard reply (stub).";
      break;
  }
  return responseText.slice(0, limit);
};

// Real login API call
// Change this URL to match your backend API (local or production)
const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function loginUser(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return await res.json(); // Should return token or user info
}