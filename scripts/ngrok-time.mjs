import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ngrok = require('@expo/ngrok');
const os = require('os');
const path = require('path');
const configPath = path.join(os.homedir(), '.expo', 'ngrok.yml');

const t0 = Date.now();
try {
  const url = await ngrok.connect({
    hostname: 'x4maln-souzanna-8081.exp.direct',
    authtoken: '5W1bR67GNbWcXqmxZzBG1_56GezNeaX6sSRvn8npeQ8',
    configPath,
    port: 8081,
    onStatusChange(s) { console.log(`[${Date.now()-t0}ms] status:`, s); },
  });
  console.log(`[${Date.now()-t0}ms] CONNECTED URL:`, url);
} catch (e) {
  console.error(`[${Date.now()-t0}ms] CONNECT ERROR:`, e);
}
process.exit(0);
