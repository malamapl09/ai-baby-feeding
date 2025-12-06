import { APP_NAME } from '@/config/constants';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-rose-600">{APP_NAME}</h1>
          <p className="text-gray-600 mt-2">Smart meal plans for your little one</p>
        </div>
        {children}
      </div>
    </div>
  );
}
