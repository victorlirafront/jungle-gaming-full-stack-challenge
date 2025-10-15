import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '@/hooks';
import { registerSchema, type RegisterFormData } from '@/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function Register() {
  const { mutate: registerUser, isPending, error } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Criar conta</h2>
          <p className="text-muted-foreground mt-2">
            Preencha os dados para começar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error.message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder="seu@email.com"
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Username
            </label>
            <Input
              {...register('username')}
              placeholder="seu_username"
              disabled={isPending}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Senha
            </label>
            <div className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo 8 caracteres, com maiúscula, minúscula e número
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Já tem uma conta? </span>
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Fazer login
          </Link>
        </div>
      </Card>
    </div>
  );
}

