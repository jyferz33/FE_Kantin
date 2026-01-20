export function saveRoleSession(role: "siswa" | "stand", payload: any) {
  localStorage.setItem(`${role}_session`, JSON.stringify(payload));

  // ✅ dari response kamu tokennya di access_token
  const token =
    payload?.access_token ||
    payload?.token ||
    payload?.data?.token ||
    payload?.data?.access_token;

  if (token) localStorage.setItem(`${role}_token`, token);
}

export function getRoleToken(role: "siswa" | "stand") {
  return localStorage.getItem(`${role}_token`);
}

export function isLoggedIn(role: "siswa" | "stand") {
  return !!localStorage.getItem(`${role}_session`);
}

export function logoutRole(role: "siswa" | "stand") {
  localStorage.removeItem(`${role}_session`);
  localStorage.removeItem(`${role}_token`);
}