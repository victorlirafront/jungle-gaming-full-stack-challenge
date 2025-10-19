import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Skeleton } from '@/components/ui';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useToastStore } from '@/store/toast.store';

export function Profile() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const addToast = useToastStore((state) => state.addToast);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

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
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao atualizar perfil',
        message: error?.message || 'Tente novamente',
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
            <p className="text-sm text-muted-foreground">{(error as any)?.message || 'Tente novamente'}</p>
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
    <div className="max-w-2xl mx-auto p-6">
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
    </div>
  );
}

