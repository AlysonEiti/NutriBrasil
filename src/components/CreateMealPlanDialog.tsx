'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  name: string;
  category: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  waterContent: number;
  imageUrl?: string;
}

interface CreateMealPlanDialogProps {
  onMealPlanCreated: () => void;
}

interface MealPlanItem {
  recipeId: string;
  category: string;
  recipe: Recipe;
}

interface SelectState {
  [key: string]: string;
}

export function CreateMealPlanDialog({ onMealPlanCreated }: CreateMealPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedItems, setSelectedItems] = useState<MealPlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<SelectState>({});
  const [planName, setPlanName] = useState('');

  const MEAL_CATEGORIES = [
    { value: 'CAFE_DA_MANHA', label: 'Café da Manhã' },
    { value: 'LANCHE_DA_MANHA', label: 'Lanche da Manhã' },
    { value: 'ALMOCO', label: 'Almoço' },
    { value: 'LANCHE_DA_TARDE', label: 'Lanche da Tarde' },
    { value: 'JANTAR', label: 'Jantar' },
    { value: 'CEIA', label: 'Ceia' },
  ];

  useEffect(() => {
    if (open) {
      fetchRecipes();
    } else {
      setSelectedItems([]);
      setSelectedRecipes({});
      setPlanName('');
    }
  }, [open]);

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes');
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const addMealItem = (category: string, recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const newItem: MealPlanItem = {
      recipeId,
      category,
      recipe,
    };

    setSelectedItems([...selectedItems, newItem]);
    setSelectedRecipes({ ...selectedRecipes, [category]: '' });
  };

  const removeMealItem = (index: number) => {
    const itemToRemove = selectedItems[index];
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
    if (itemToRemove) {
      setSelectedRecipes({ ...selectedRecipes, [itemToRemove.category]: '' });
    }
  };

  const handleRecipeSelect = (category: string, recipeId: string) => {
    setSelectedRecipes({ ...selectedRecipes, [category]: recipeId });
  };

  const handleAddRecipe = (category: string) => {
    const recipeId = selectedRecipes[category];
    if (recipeId) {
      addMealItem(category, recipeId);
    }
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Adicione pelo menos uma refeição.',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isAutomatic: false,
          name: planName || 'Rotina Personalizada',
          items: selectedItems.map(item => ({
            recipeId: item.recipeId,
            category: item.category,
          })),
        }),
      });

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: 'Rotina alimentar criada com sucesso!',
        });
        setOpen(false);
        onMealPlanCreated();
      } else {
        const error = await res.json();
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: error.error || 'Falha ao criar rotina alimentar.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao criar rotina alimentar.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (value: string) => {
    return MEAL_CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const calculateTotals = () => {
    return selectedItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.recipe.calories,
        carbs: acc.carbs + item.recipe.carbs,
        protein: acc.protein + item.recipe.protein,
        fat: acc.fat + item.recipe.fat,
        fiber: acc.fiber + item.recipe.fiber,
        water: acc.water + item.recipe.waterContent,
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, water: 0 }
    );
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Rotina
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Criar Rotina Alimentar Personalizada</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Nome da Rotina</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                placeholder="Ex: Segunda-feira, Dia de Treino, etc."
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>

            {selectedItems.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Refeições Selecionadas</h3>
                  <div className="space-y-3">
                    {selectedItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryLabel(item.category)}
                            </Badge>
                            {item.category !== 'ALMOCO' && item.recipe.category === 'ALMOCO' && (
                              <Badge variant="outline" className="text-xs">De outra categoria</Badge>
                            )}
                            <span className="font-medium text-sm">{item.recipe.name}</span>
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>{item.recipe.calories} kcal</span>
                            <span>C: {item.recipe.carbs}g</span>
                            <span>P: {item.recipe.protein}g</span>
                            <span>G: {item.recipe.fat}g</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMealItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Total Calorias</p>
                        <p className="font-semibold text-lg">{Math.round(totals.calories)} kcal</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Macronutrientes</p>
                        <p className="font-semibold">
                          C: {Math.round(totals.carbs)}g • P: {Math.round(totals.protein)}g • G: {Math.round(totals.fat)}g
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Outros</p>
                        <p className="font-semibold">
                          Fibras: {Math.round(totals.fiber)}g • Água: {Math.round(totals.water)}ml
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold">Adicionar Refeições</h3>
              {MEAL_CATEGORIES.map((category) => (
                <Card key={category.value}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">{category.label}</h4>
                      <div className="flex gap-2">
                        <Select
                          value={selectedRecipes[category.value] || ''}
                          onValueChange={(value) => handleRecipeSelect(category.value, value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecione uma receita (ou de outra categoria)" />
                          </SelectTrigger>
                          <SelectContent>
                            {recipes.map((recipe) => (
                              <SelectItem key={recipe.id} value={recipe.id}>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span>{recipe.name}</span>
                                    {recipe.category !== category.value && (
                                      <Badge variant="outline" className="text-xs">
                                        {getCategoryLabel(recipe.category)}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {recipe.calories} kcal • C: {recipe.carbs}g • P: {recipe.protein}g
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          onClick={() => handleAddRecipe(category.value)}
                          disabled={!selectedRecipes[category.value]}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || selectedItems.length === 0}
                className="flex-1"
              >
                {loading ? 'Criando...' : 'Criar Rotina'}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
