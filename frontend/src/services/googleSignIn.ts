import axios from 'axios';

const apiBase = '/api';

export type GoogleSignInPayload = {
  email: string;
  name?: string;
  googleId: string;
  deviceId?: string;
  fingerprint?: string;
};

export async function googleSignIn(payload: GoogleSignInPayload) {
  // Backend expects: { email, name, googleId, deviceId, fingerprint }
  return axios.post(`${apiBase}/auth/google`, payload, {
    withCredentials: true,
  });
}

