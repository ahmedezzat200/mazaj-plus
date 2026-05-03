import { LoginHeader } from './login/LoginHeader';
import { LoginBrandPanel } from './login/LoginBrandPanel';
import { LoginForm } from './login/LoginForm';

export function Login() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LoginHeader />

      <main className="flex-1 flex items-center py-12 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="order-2 lg:order-1">
              <LoginBrandPanel />
            </div>
            <div className="order-1 lg:order-2">
              <LoginForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
