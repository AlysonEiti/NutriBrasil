'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreateRecipeDialogProps {
  onRecipeCreated: () => void;
}

export function CreateRecipeDialog({ onRecipeCreated }: CreateRecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('CAFE_DA_MANHA');
  const [ingredients, setIngredients] = useState('');
  const [preparation, setPreparation] = useState('');
  const [calories, setCalories] = useState('');
  const [carbs, setCarbs] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [waterContent, setWaterContent] = useState('');
  const [servings, setServings] = useState('1');
  const [loading, setLoading] = useState(false);

  const MEAL_CATEGORIES = [
    { value: 'CAFE_DA_MANHA', label: 'Café da Manhã' },
    { value: 'LANCHE_DA_MANHA', label: 'Lanche da Manhã' },
    { value: 'ALMOCO', label: 'Almoço' },
    { value: 'LANCHE_DA_TARDE', label: 'Lanche da Tarde' },
    { value: 'JANTAR', label: 'Jantar' },
    { value: 'CEIA', label: 'Ceia' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ingredientList = ingredients.split('\n').filter(i => i.trim());
      
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          ingredients: ingredientList,
          preparation,
          calories: parseFloat(calories),
          carbs: parseFloat(carbs),
          protein: parseFloat(protein),
          fat: parseFloat(fat),
          fiber: parseFloat(fiber) || 0,
          waterContent: parseFloat(waterContent) || 0,
          servings: parseInt(servings),
          isCustom: true,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: 'Receita criada com sucesso!',
        });
        setOpen(false);
        onRecipeCreated();
        
        // Reset form
        setName('');
        setIngredients('');
        setPreparation('');
        setCalories('');
        setCarbs('');
        setProtein('');
        setFat('');
        setFiber('');
        setWaterContent('');
        setServings('1');
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Falha ao criar receita.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao criar receita.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Receita
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Criar Nova Receita Personalizada</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Receita *</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Omelete de Espinafre"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria *</label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ingredientes * (um por linha)</label>
              <Textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="3 ovos&#10;100g de espinafre&#10;Sal a gosto"
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Modo de Preparo *</label>
              <Textarea
                value={preparation}
                onChange={(e) => setPreparation(e.target.value)}
                placeholder="1. Bata os ovos em uma tigela.&#10;2. Refogue o espinafre...&#10;3. Adicione os ovos e mexa..."
                rows={6}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Calorias (kcal) *</label>
                <Input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  step="0.1"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Carboidratos (g) *</label>
                <Input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  step="0.1"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Proteínas (g) *</label>
                <Input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  step="0.1"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gorduras (g) *</label>
                <Input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  step="0.1"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fibras (g)</label>
                <Input
                  type="number"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Água (ml)</label>
                <Input
                  type="number"
                  value={waterContent}
                  onChange={(e) => setWaterContent(e.target.value)}
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Porções</label>
                <Input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Criando...' : 'Criar Receita'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
