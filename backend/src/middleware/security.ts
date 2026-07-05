import express from 'express';

export function trackDevice(req: express.Request, res: express.Response, next: express.NextFunction) {
  const deviceId = req.headers['x-device-id']?.toString() || req.body.deviceId || '';
  const fingerprint = req.headers['x-device-fingerprint']?.toString() || req.body.fingerprint || '';
  req.body.deviceId = deviceId;
  req.body.fingerprint = fingerprint;
  next();
}

export function detectProxy(req: express.Request) {
  const proxyHeader = req.headers['x-forwarded-for'] || req.headers['via'] || req.headers['forwarded'];
  return Boolean(proxyHeader);
}

export function fraudHook(req: express.Request) {
  const suspicious = detectProxy(req) || false;
  return { suspicious, reason: suspicious ? 'Proxy/VPN detected' : 'normal' };
}
