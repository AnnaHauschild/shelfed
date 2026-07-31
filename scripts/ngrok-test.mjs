import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const ngrokPath = require.resolve('@expo/ngrok', { paths: [process.cwd() + '/node_modules/expo/node_modules/@expo/cli'] });
console.log('resolved @expo/ngrok at:', ngrokPath);
const ngrok = require(ngrokPath);

const os = require('os');
const path = require('path');
const configPath = path.join(os.homedir(), '.expo', 'ngrok.yml');
console.log('configPath:', configPath);

try {
  const url = await ngrok.connect({
    hostname: '2x2cb8c-souzanna-8081.exp.direct',
    authtoken: '5W1bR67GNbWcXqmxZzBG1_56GezNeaX6sSRvn8npeQ8',
    configPath,
    port: 8081,
    onStatusChange(s) { console.log('status:', s); },
  });
  console.log('CONNECTED URL:', url);
} catch (e) {
  console.error('CONNECT ERROR:', e);
}
process.exit(0);
