// app/wallet/page.tsx
import type { Metadata } from 'next';

// Мета-данные страницы
export const metadata: Metadata = {
  title: 'GAD Wallet',
  description: 'Non-custodial GAD wallet in your browser',
};

// Импортируем КЛИЕНТСКИЙ компонент напрямую — это допустимо.
// Вся поддерево <App/> станет клиентским автоматически.
import App from './client/App';

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0B0C10]">
      <App />
    </div>
  );
}
