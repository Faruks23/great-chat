import dotenv from 'dotenv';
import { createServerApp } from './app';
import { initVapid } from './modules/notification/push.service';

dotenv.config();

const server = createServerApp();
const PORT = process.env.PORT || 5000;

// initialize VAPID keys for web-push (generates keys if missing)
initVapid();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
