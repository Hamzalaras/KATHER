import 'dotenv/config';
import { parseTrustProxy, validateRequiredEnv } from './utils/environment.js';

try {
  process.env.TRUST_PROXY = String(parseTrustProxy(process.env.TRUST_PROXY));
  validateRequiredEnv();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const { default: app } = await import('./server.js');

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
