import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Skeleton } from '@/components/ui';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useToastStore } from '@/store/toast.store';
import { authService } from '@/services';
import { getErrorMessage } from '@/types/error.types';

export function Profile() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const addToast = useToastStore((state) => state.addToast);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleEdit = () => {
    setUsername(profile?.username || '');
    setFullName(profile?.fullName || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUsername('');
    setFullName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfileMutation.mutateAsync({
        username: username !== profile?.username ? username : undefined,
        fullName: fullName !== profile?.fullName ? fullName : undefined,
      });

      addToast({
        type: 'success',
        title: 'Perfil atualizado!',
      });

      setIsEditing(false);
    } catch (error: unknown) {
      addToast({
        type: 'error',
        title: 'Erro ao atualizar perfil',
        message: getErrorMessage(error),
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      addToast({
        type: 'error',
        title: 'Senha muito curta',
        message: 'A nova senha deve ter pelo menos 6 caracteres',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      addToast({
        type: 'error',
        title: 'Senhas não conferem',
      });
      return;
    }

    try {
      await authService.changePassword(currentPassword, newPassword);

      addToast({
        type: 'success',
        title: 'Senha alterada!',
        message: 'Sua senha foi alterada com sucesso',
      });

      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: unknown) {
      addToast({
        type: 'error',
        title: 'Erro ao alterar senha',
        message: getErrorMessage(error),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-2">Erro ao carregar perfil</p>
            <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Perfil não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{profile.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-gray-900">{profile.username}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                <p className="mt-1 text-gray-900">{profile.fullName || 'Não informado'}</p>
              </div>

              <div className="pt-4">
                <Button onClick={handleEdit}>Editar Perfil</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-500 text-sm">{profile.email} (não editável)</p>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu username"
                  minLength={3}
                  maxLength={50}
                  required
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  maxLength={255}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent>
          {!isChangingPassword ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Altere sua senha para manter sua conta segura
              </p>
              <Button onClick={() => setIsChangingPassword(true)} variant="outline">
                Trocar Senha
              </Button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Atual
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Digite a nova senha novamente"
                  minLength={6}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">Alterar Senha</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

