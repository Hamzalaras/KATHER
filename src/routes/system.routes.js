import { Router } from 'express';
import packageJson from '../../package.json' with { type: 'json' };
import { getReadinessStatus } from '../services/system.services.js';



const router = Router();

const buildMeta = { name: packageJson.name, version: packageJson.version };

router.get('/health', (req, res) => {

  res.status(200).json({
    status: 'healthy',
    service: buildMeta.name,
    version: buildMeta.version,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

router.get('/ready', async (req, res) => {
  
  const { httpStatus, checks } = await getReadinessStatus();

  res.status(httpStatus).json({
    status: httpStatus === 200 ? 'ready' : 'degraded',
    service: buildMeta.name,
    version: buildMeta.version,
    timestamp: new Date().toISOString(),
    checks,
  });

});

export default router;