const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

function main() {
  const keys = webpush.generateVAPIDKeys();
  const content = `VAPID_PUBLIC_KEY=${keys.publicKey}\nVAPID_PRIVATE_KEY=${keys.privateKey}\n`;
  const outPath = path.resolve(__dirname, '.env.vapid');
  fs.writeFileSync(outPath, content, { encoding: 'utf8' });
  console.log('Generated VAPID keys and wrote to .env.vapid');
  console.log(content);
}

main();
