// Запуск бота в режиме polling для локальной разработки
// Использование: npx tsx scripts/bot-polling.ts

import { createBot } from '../lib/bot';

// Подгрузить .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  const bot = createBot();
  console.log('🤖 GADFamilyM2E_bot запускается в режиме polling...');
  bot.launch(); // non-blocking
  console.log('✅ Бот активен. Напиши /start в @GADFamilyM2E_bot');

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch(console.error);
