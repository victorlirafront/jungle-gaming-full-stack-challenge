import { useState } from 'react';
import { Comment } from '@/lib/mock-data';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

interface CommentListProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
}

export function CommentList({ comments, onAddComment }: CommentListProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comentários</h3>

      {/* Add new comment */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button type="submit" size="sm">
              Adicionar Comentário
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum comentário ainda. Seja o primeiro a comentar!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {comment.user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

