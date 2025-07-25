// src/aws/auth.js
export function getCurrentUserToken() {
  return localStorage.getItem("token");
}
