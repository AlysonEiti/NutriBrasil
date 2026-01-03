'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Utensils, User, Calendar, Plus, RefreshCw, Flame, Wheat, Beef, Droplets, Trash2, Edit2, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CreateRecipeDialog } from '@/components/CreateRecipeDialog';
import { CreateMealPlanDialog } from '@/components/CreateMealPlanDialog';

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
  ingredients: string;
  preparation: string;
  servings: number;
  isCustom: boolean;
}

interface MealPlanItem {
  id: string;
  category: string;
  recipe: Recipe;
}

interface MealPlan {
  id: string;
  name: string;
  date: string;
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  totalFiber: number;
  totalWater: number;
  isAutomatic: boolean;
  items: MealPlanItem[];
}

interface UserProfile {
  id: string;
  name: string;
  gender: string;
  height: number;
  weight: number;
  age: number;
  goal: string;
  mealsPerDay: number;
  activityLevel: number;
  basalMetabolicRate: number;
  dailyCalorieNeed: number;
  targetCalories: number;
  manualBMR?: number;
}

const MEAL_CATEGORY_LABELS: Record<string, string> = {
  CAFE_DA_MANHA: 'Café da Manhã',
  LANCHE_DA_MANHA: 'Lanche da Manhã',
  ALMOCO: 'Almoço',
  LANCHE_DA_TARDE: 'Lanche da Tarde',
  JANTAR: 'Jantar',
  CEIA: 'Ceia',
};

const GOAL_LABELS: Record<string, string> = {
  EMAGRECIMENTO: 'Emagrecimento',
  GANHO_MASSA: 'Ganho de Massa',
  MANUTENCAO: 'Manutenção',
};

const getMealCategoriesFromCount = (count: number): string[] => {
  switch (count) {
    case 3:
      return ['CAFE_DA_MANHA', 'ALMOCO', 'JANTAR'];
    case 4:
      return ['CAFE_DA_MANHA', 'ALMOCO', 'LANCHE_DA_TARDE', 'JANTAR'];
    case 5:
      return ['CAFE_DA_MANHA', 'LANCHE_DA_MANHA', 'ALMOCO', 'LANCHE_DA_TARDE', 'JANTAR'];
    case 6:
      return ['CAFE_DA_MANHA', 'LANCHE_DA_MANHA', 'ALMOCO', 'LANCHE_DA_TARDE', 'JANTAR', 'CEIA'];
    default:
      return ['CAFE_DA_MANHA', 'ALMOCO', 'JANTAR'];
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeMealPlanId, setActiveMealPlanId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingPlanName, setEditingPlanName] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, mealPlansRes, recipesRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/meal-plans'),
        fetch('/api/recipes'),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (mealPlansRes.ok) {
        const mealPlansData = await mealPlansRes.json();
        setMealPlans(mealPlansData);
        if (mealPlansData.length > 0 && !activeMealPlanId) {
          setActiveMealPlanId(mealPlansData[0].id);
        }
      }

      if (recipesRes.ok) {
        const recipesData = await recipesRes.json();
        setRecipes(recipesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao carregar os dados.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMealPlan = async () => {
    try {
      const res = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAutomatic: true, name: 'Rotina Automática' }),
      });

      if (res.ok) {
        const newMealPlan = await res.json();
        setMealPlans([newMealPlan, ...mealPlans]);
        setActiveMealPlanId(newMealPlan.id);
        toast({
          title: 'Sucesso',
          description: 'Rotina alimentar gerada automaticamente!',
        });
      } else {
        const error = await res.json();
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: error.error || 'Falha ao gerar rotina alimentar.',
        });
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao gerar rotina alimentar.',
      });
    }
  };

  const handleDeleteMealPlan = async (id: string) => {
    try {
      const res = await fetch(`/api/meal-plans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMealPlans(mealPlans.filter(p => p.id !== id));
        if (activeMealPlanId === id) {
          setActiveMealPlanId(mealPlans.length > 1 ? mealPlans[0].id : null);
        }
        toast({
          title: 'Sucesso',
          description: 'Rotina alimentar removida.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao remover rotina.',
      });
    }
  };

  const handleUpdatePlanName = async () => {
    if (!editingPlanName || !newPlanName) return;

    try {
      const res = await fetch('/api/meal-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingPlanName, name: newPlanName }),
      });

      if (res.ok) {
        setMealPlans(mealPlans.map(p => 
          p.id === editingPlanName ? { ...p, name: newPlanName } : p
        ));
        setEditingPlanName(null);
        setNewPlanName('');
        toast({
          title: 'Sucesso',
          description: 'Nome da rotina atualizado!',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao atualizar nome.',
      });
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('Tem certeza que deseja limpar todo o banco de dados? Isso apagará todas as rotinas, receitas e perfil.')) {
      return;
    }
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        setProfile(null);
        setMealPlans([]);
        setRecipes([]);
        setActiveMealPlanId(null);
        toast({
          title: 'Sucesso',
          description: 'Banco de dados limpo com sucesso!',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao limpar banco de dados.',
      });
    }
  };

  const getCaloriePercentage = () => {
    if (!profile) return 0;
    const activePlan = mealPlans.find(p => p.id === activeMealPlanId);
    if (!activePlan) return 0;
    return Math.min((activePlan.totalCalories / profile.targetCalories) * 100, 100);
  };

  const formatNumber = (num: number) => Math.round(num * 10) / 10;

  const activePlan = mealPlans.find(p => p.id === activeMealPlanId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">NutriBrasil</h1>
          </div>
          <nav>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="dashboard" asChild>
                  <button className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Rotinas</span>
                  </button>
                </TabsTrigger>
                <TabsTrigger value="recipes" asChild>
                  <button className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    <span className="hidden sm:inline">Receitas</span>
                  </button>
                </TabsTrigger>
                <TabsTrigger value="profile" asChild>
                  <button className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Perfil</span>
                  </button>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl flex-1">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Minhas Rotinas</h2>
                <p className="text-muted-foreground">
                  Gerencie suas rotinas alimentares
                </p>
              </div>
              <div className="flex gap-2">
                {recipes.length === 0 && (
                  <Button onClick={handleSeedDatabase}>
                    <Plus className="mr-2 h-4 w-4" />
                    Carregar Receitas
                  </Button>
                )}
                <Button variant="outline" onClick={handleResetDatabase}><Trash2 className="mr-2 h-4 w-4" />Limpar</Button>
                <CreateMealPlanDialog onMealPlanCreated={fetchData} />
              </div>
            </div>

            {!profile ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Crie seu perfil</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure suas informações pessoais para calcular suas necessidades nutricionais.
                  </p>
                  <Button onClick={() => setActiveTab('profile')}>
                    Criar Perfil
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Calorias</CardTitle>
                      <Flame className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {activePlan ? formatNumber(activePlan.totalCalories) : 0}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{profile.targetCalories} kcal
                        </span>
                      </div>
                      <Progress value={getCaloriePercentage()} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Carboidratos</CardTitle>
                      <Wheat className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {activePlan ? formatNumber(activePlan.totalCarbs) : 0}g
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Proteínas</CardTitle>
                      <Beef className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {activePlan ? formatNumber(activePlan.totalProtein) : 0}g
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Gorduras</CardTitle>
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {activePlan ? formatNumber(activePlan.totalFat) : 0}g
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {profile && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Seu Perfil</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {profile.name || 'Usuário'} • {profile.age} anos • {profile.weight}kg • {profile.height}cm
                          </p>
                        </div>
                        <Badge variant={profile.goal === 'EMAGRECIMENTO' ? 'default' : profile.goal === 'GANHO_MASSA' ? 'secondary' : 'outline'}>
                          {GOAL_LABELS[profile.goal]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxa Metabólica Basal:</span>
                        <span className="font-medium">{profile.basalMetabolicRate} kcal {profile.manualBMR && '(Informado manualmente)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gasto Calórico Diário:</span>
                        <span className="font-medium">{profile.dailyCalorieNeed} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Meta Calórica:</span>
                        <span className="font-medium">{profile.targetCalories} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Refeições por dia:</span>
                        <span className="font-medium">{profile.mealsPerDay}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  <Button onClick={handleGenerateMealPlan} disabled={recipes.length === 0}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Gerar Rotina Automática
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {mealPlans.length === 0 ? (
                    <Card className="md:col-span-2">
                      <CardContent className="p-12 text-center">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Nenhuma rotina alimentar configurada</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Gere automaticamente uma rotina baseada no seu perfil ou crie sua própria rotina personalizada.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    mealPlans.map((plan) => (
                      <Card 
                        key={plan.id} 
                        className={activeMealPlanId === plan.id ? 'ring-2 ring-primary' : 'cursor-pointer hover:shadow-lg transition-shadow'}
                        onClick={() => setActiveMealPlanId(plan.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              {editingPlanName === plan.id ? (
                                <div className="flex gap-2">
                                  <input
                                    value={newPlanName}
                                    onChange={(e) => setNewPlanName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdatePlanName();
                                      } else if (e.key === 'Escape') {
                                        setEditingPlanName(null);
                                        setNewPlanName('');
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdatePlanName();
                                    }}
                                  >
                                    Salvar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPlanName(null);
                                      setNewPlanName('');
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <CardTitle>{plan.name}</CardTitle>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPlanName(plan.id);
                                      setNewPlanName(plan.name);
                                    }}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMealPlan(plan.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              )}
                              <p className="text-sm text-muted-foreground mt-1">
                                {plan.isAutomatic ? 'Gerada automaticamente' : 'Personalizada'} • {plan.items.length} refeições
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-3 text-xs text-muted-foreground mb-2">
                            <span>{plan.totalCalories} kcal</span>
                            <span>C: {formatNumber(plan.totalCarbs)}g</span>
                            <span>P: {formatNumber(plan.totalProtein)}g</span>
                            <span>G: {formatNumber(plan.totalFat)}g</span>
                          </div>
                          {activeMealPlanId === plan.id && (
                            <ScrollArea className="h-[300px] pr-2">
                              <div className="space-y-2">
                                {plan.items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                                    {item.recipe.imageUrl && (
                                      <img 
                                        src={item.recipe.imageUrl} 
                                        alt={item.recipe.name}
                                        className="w-16 h-16 object-cover rounded-md"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {MEAL_CATEGORY_LABELS[item.category]}
                                        </Badge>
                                        {item.category !== item.recipe.category && (
                                          <Badge variant="outline" className="text-xs">
                                            Original: {MEAL_CATEGORY_LABELS[item.recipe.category]}
                                          </Badge>
                                        )}
                                        {item.recipe.isCustom && (
                                          <Badge variant="outline">Personalizada</Badge>
                                        )}
                                      </div>
                                      <p className="font-medium text-sm">{item.recipe.name}</p>
                                      <div className="flex gap-2 text-xs text-muted-foreground">
                                        <span>{item.recipe.calories} kcal</span>
                                        <span>•</span>
                                        <span>C: {item.recipe.carbs}g</span>
                                        <span>•</span>
                                        <span>P: {item.recipe.protein}g</span>
                                        <span>•</span>
                                        <span>G: {item.recipe.fat}g</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Catálogo de Receitas</h2>
                <p className="text-muted-foreground">Explore e gerencie suas receitas</p>
              </div>
              <CreateRecipeDialog onRecipeCreated={fetchData} />
            </div>

            <div className="space-y-6">
              {Object.entries(MEAL_CATEGORY_LABELS).map(([key, label]) => {
                const categoryRecipes = recipes.filter(r => r.category === key);
                if (categoryRecipes.length === 0) return null;

                return (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle>{label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {categoryRecipes.map((recipe) => (
                          <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                {recipe.imageUrl && (
                                  <img 
                                    src={recipe.imageUrl} 
                                    alt={recipe.name}
                                    className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="font-semibold">{recipe.name}</h4>
                                    {recipe.isCustom && (
                                      <Badge variant="outline" className="shrink-0">Personalizada</Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Flame className="h-3 w-3" />
                                      {recipe.calories} kcal
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Wheat className="h-3 w-3" />
                                      C: {recipe.carbs}g
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Beef className="h-3 w-3" />
                                      P: {recipe.protein}g
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Droplets className="h-3 w-3" />
                                      G: {recipe.fat}g
                                    </span>
                                  </div>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="w-full mt-2">
                                        Ver Receita Completa
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl max-h-[80vh]">
                                      <DialogHeader>
                                        <DialogTitle>{recipe.name}</DialogTitle>
                                      </DialogHeader>
                                      <ScrollArea className="h-[60vh] pr-4">
                                        <div className="space-y-4">
                                          {recipe.imageUrl && (
                                            <img 
                                              src={recipe.imageUrl} 
                                              alt={recipe.name}
                                              className="w-full h-64 object-cover rounded-lg"
                                            />
                                          )}
                                          <div className="flex gap-2">
                                            <Badge>{MEAL_CATEGORY_LABELS[recipe.category]}</Badge>
                                            {recipe.isCustom && (
                                              <Badge variant="outline">Personalizada</Badge>
                                            )}
                                          </div>

                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="text-base">Informações Nutricionais</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div>
                                                  <p className="text-muted-foreground">Calorias</p>
                                                  <p className="font-semibold">{recipe.calories} kcal</p>
                                                </div>
                                                <div>
                                                  <p className="text-muted-foreground">Carboidratos</p>
                                                  <p className="font-semibold">{recipe.carbs}g</p>
                                                </div>
                                                <div>
                                                  <p className="text-muted-foreground">Proteínas</p>
                                                  <p className="font-semibold">{recipe.protein}g</p>
                                                </div>
                                                <div>
                                                  <p className="text-muted-foreground">Gorduras</p>
                                                  <p className="font-semibold">{recipe.fat}g</p>
                                                </div>
                                                <div>
                                                  <p className="text-muted-foreground">Fibras</p>
                                                  <p className="font-semibold">{recipe.fiber}g</p>
                                                </div>
                                                <div>
                                                  <p className="text-muted-foreground">Água</p>
                                                  <p className="font-semibold">{recipe.waterContent}ml</p>
                                                </div>
                                                <div>
                                                  <p className="text-muted-foreground">Porções</p>
                                                  <p className="font-semibold">{recipe.servings}</p>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>

                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="text-base">Ingredientes</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <ul className="list-disc list-inside space-y-1">
                                                {JSON.parse(recipe.ingredients).map((ing: string, idx: number) => (
                                                  <li key={idx}>{ing}</li>
                                                ))}
                                              </ul>
                                            </CardContent>
                                          </Card>

                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="text-base">Modo de Preparo</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <p className="whitespace-pre-line text-sm">{recipe.preparation}</p>
                                            </CardContent>
                                          </Card>
                                        </div>
                                      </ScrollArea>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {recipes.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Utensils className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma receita disponível</h3>
                    <p className="text-muted-foreground mb-6">
                      Carregue as receitas iniciais para começar.
                    </p>
                    <Button onClick={handleSeedDatabase}>
                      <Plus className="mr-2 h-4 w-4" />
                      Carregar Receitas Iniciais
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Perfil</h2>
              <p className="text-muted-foreground">Configure suas informações pessoais e metas</p>
            </div>

            <ProfileForm
              existingProfile={profile}
              onProfileSaved={() => {
                fetchData();
                toast({
                  title: 'Sucesso',
                  description: 'Perfil atualizado com sucesso!',
                });
              }}
            />
          </div>
        )}
      </main>

      <footer className="border-t bg-muted/50 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>NutriBrasil © 2024 - Planejamento alimentar saudável</p>
        </div>
      </footer>
    </div>
  );
}

interface ProfileFormProps {
  existingProfile: UserProfile | null;
  onProfileSaved: () => void;
}

function ProfileForm({ existingProfile, onProfileSaved }: ProfileFormProps) {
  const [name, setName] = useState(existingProfile?.name || '');
  const [gender, setGender] = useState(existingProfile?.gender || 'MASCULINO');
  const [height, setHeight] = useState(existingProfile?.height || 170);
  const [weight, setWeight] = useState(existingProfile?.weight || 70);
  const [age, setAge] = useState(existingProfile?.age || 30);
  const [goal, setGoal] = useState(existingProfile?.goal || 'MANUTENCAO');
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState(existingProfile?.activityLevel || 1.2);
  const [useManualBMR, setUseManualBMR] = useState(!!existingProfile?.manualBMR);
  const [manualBMR, setManualBMR] = useState(existingProfile?.manualBMR?.toString() || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingProfile) {
      const initialMeals = getMealCategoriesFromCount(existingProfile.mealsPerDay || 3);
      setSelectedMeals(initialMeals);
    }
  }, [existingProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = existingProfile ? '/api/profile' : '/api/profile';
      const method = existingProfile ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          gender,
          height,
          weight,
          age,
          goal,
          mealsPerDay: selectedMeals.length,
          activityLevel,
          manualBMR: useManualBMR ? manualBMR : null,
        }),
      });

      if (res.ok) {
        onProfileSaved();
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Falha ao salvar perfil.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao salvar perfil.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingProfile ? 'Editar Perfil' : 'Criar Perfil'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome (opcional)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gênero</label>
            <select
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Altura (cm)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min="100"
                max="250"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Peso (kg)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                min="30"
                max="300"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Idade</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                min="16"
                max="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Objetivo</label>
            <select
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              <option value="MANUTENCAO">Manutenção de Peso</option>
              <option value="EMAGRECIMENTO">Emagrecimento</option>
              <option value="GANHO_MASSA">Ganho de Massa Muscular</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Refeições por dia (selecione as que deseja)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMeals.includes('CAFE_DA_MANHA')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMeals([...selectedMeals, 'CAFE_DA_MANHA']);
                    } else {
                      setSelectedMeals(selectedMeals.filter(m => m !== 'CAFE_DA_MANHA'));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">Café da Manhã</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMeals.includes('LANCHE_DA_MANHA')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMeals([...selectedMeals, 'LANCHE_DA_MANHA']);
                    } else {
                      setSelectedMeals(selectedMeals.filter(m => m !== 'LANCHE_DA_MANHA'));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">Lanche da Manhã</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMeals.includes('ALMOCO')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMeals([...selectedMeals, 'ALMOCO']);
                    } else {
                      setSelectedMeals(selectedMeals.filter(m => m !== 'ALMOCO'));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">Almoço</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMeals.includes('LANCHE_DA_TARDE')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMeals([...selectedMeals, 'LANCHE_DA_TARDE']);
                    } else {
                      setSelectedMeals(selectedMeals.filter(m => m !== 'LANCHE_DA_TARDE'));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">Lanche da Tarde</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMeals.includes('JANTAR')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMeals([...selectedMeals, 'JANTAR']);
                    } else {
                      setSelectedMeals(selectedMeals.filter(m => m !== 'JANTAR'));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">Jantar</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMeals.includes('CEIA')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMeals([...selectedMeals, 'CEIA']);
                    } else {
                      setSelectedMeals(selectedMeals.filter(m => m !== 'CEIA'));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">Ceia</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nível de Atividade Física</label>
            <select
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              value={activityLevel}
              onChange={(e) => setActivityLevel(Number(e.target.value))}
            >
              <option value="1.2">Sedentário (pouco ou nenhum exercício)</option>
              <option value="1.375">Levemente Ativo (exercício leve 1-3 dias/sem)</option>
              <option value="1.55">Moderadamente Ativo (exercício moderado 3-5 dias/sem)</option>
              <option value="1.725">Muito Ativo (exercício pesado 6-7 dias/sem)</option>
              <option value="1.9">Extremamente Ativo (exercício muito pesado + trabalho físico)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useManualBMR}
                onChange={(e) => setUseManualBMR(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Usar Taxa Metabólica Basal manual</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Marque esta opção se você tem sua TMB medida por equipamento especializado para maior precisão.
            </p>
            {useManualBMR && (
              <div className="pl-6">
                <label className="text-sm font-medium">TMB (kcal/dia)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-input bg-background rounded-md mt-1"
                  value={manualBMR}
                  onChange={(e) => setManualBMR(e.target.value)}
                  placeholder="Ex: 1500"
                  min="1000"
                  max="4000"
                  required
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : existingProfile ? 'Atualizar Perfil' : 'Criar Perfil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
