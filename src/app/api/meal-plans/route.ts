import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const MEAL_CATEGORIES = [
  'CAFE_DA_MANHA',
  'LANCHE_DA_MANHA',
  'ALMOCO',
  'LANCHE_DA_TARDE',
  'JANTAR',
  'CEIA'
];

function selectMealCategory(mealsPerDay: number): string[] {
  switch (mealsPerDay) {
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
}

// Função de seleção inteligente baseada no objetivo do usuário
function selectRecipeSmartly(
  recipes: any[],
  category: string,
  caloriesPerMeal: number,
  goal: string,
  currentCalories: number,
  targetCalories: number
): any | null {
  if (recipes.length === 0) return null;

  // Filtra receitas dentro da faixa calórica aceitável
  const inRangeRecipes = recipes.filter(r =>
    r.calories >= caloriesPerMeal * 0.7 && r.calories <= caloriesPerMeal * 1.3
  );

  let candidateRecipes = inRangeRecipes.length > 0 ? inRangeRecipes : recipes;

  // Para ganho de massa: prioriza receitas com maior teor de proteína
  if (goal === 'GANHO_MASSA') {
    candidateRecipes = candidateRecipes.sort((a, b) => b.protein - a.protein);
  }
  // Para emagrecimento: prioriza receitas com menos calorias e mais fibras
  else if (goal === 'EMAGRECIMENTO') {
    candidateRecipes = candidateRecipes.sort((a, b) => a.calories - b.calories);
  }
  // Para manutenção: equilíbrio entre proteína e calorias
  else {
    candidateRecipes = candidateRecipes.sort((a, b) => b.protein - a.protein);
  }

  // Seleciona a melhor receita que ainda mantém o total dentro do alvo
  let selectedIndex = 0;
  if (currentCalories + candidateRecipes[0].calories > targetCalories && candidateRecipes.length > 1) {
    // Se a primeira receita estouraria o alvo, tenta uma menor
    const affordableRecipes = candidateRecipes.filter(
      r => currentCalories + r.calories <= targetCalories + 100 // tolerância de 100 kcal
    );
    if (affordableRecipes.length > 0) {
      candidateRecipes = affordableRecipes;
    }
  }

  // Retorna a melhor receita (após ordenação)
  return candidateRecipes[0] || recipes[0];
}

export async function GET(request: NextRequest) {
  try {
    const mealPlans = await db.mealPlan.findMany({
      include: {
        items: {
          include: {
            recipe: true,
          },
          orderBy: { category: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(mealPlans);
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { isAutomatic, items, name } = body;

    let totalCalories = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalWater = 0;

    const mealPlanItems = [];

    if (isAutomatic) {
      const profiles = await db.userProfile.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      if (profiles.length === 0) {
        return NextResponse.json(
          { error: 'No user profile found. Please create a profile first.' },
          { status: 400 }
        );
      }

      const profile = profiles[0];
      const targetCalories = profile.targetCalories;
      const mealsPerDay = profile.mealsPerDay;
      const selectedCategories = selectMealCategory(mealsPerDay);
      const goal = profile.goal;
      const caloriesPerMeal = Math.round(targetCalories / mealsPerDay);

      for (const category of selectedCategories) {
        const recipes = await db.recipe.findMany({
          where: { category: category },
        });

        const selectedRecipe = selectRecipeSmartly(
          recipes,
          category,
          caloriesPerMeal,
          goal,
          totalCalories,
          targetCalories
        );

        if (selectedRecipe) {
          totalCalories += selectedRecipe.calories;
          totalCarbs += selectedRecipe.carbs;
          totalProtein += selectedRecipe.protein;
          totalFat += selectedRecipe.fat;
          totalFiber += selectedRecipe.fiber;
          totalWater += selectedRecipe.waterContent;

          mealPlanItems.push({
            category,
            recipeId: selectedRecipe.id,
          });
        }
      }
    } else {
      for (const item of items) {
        const recipe = await db.recipe.findUnique({
          where: { id: item.recipeId },
        });

        if (recipe) {
          totalCalories += recipe.calories;
          totalCarbs += recipe.carbs;
          totalProtein += recipe.protein;
          totalFat += recipe.fat;
          totalFiber += recipe.fiber;
          totalWater += recipe.waterContent;

          mealPlanItems.push({
            category: item.category,
            recipeId: item.recipeId,
          });
        }
      }
    }

    const mealPlan = await db.mealPlan.create({
      data: {
        name: name || 'Rotina',
        date: new Date(),
        totalCalories,
        totalCarbs,
        totalProtein,
        totalFat,
        totalFiber,
        totalWater,
        isAutomatic,
        items: {
          create: mealPlanItems,
        },
      },
      include: {
        items: {
          include: {
            recipe: true,
          },
        },
      },
    });

    return NextResponse.json(mealPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to create meal plan' },
      { status: 500 }
    );
  }
}

// Endpoint para atualizar o nome de uma rotina
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID and name are required' },
        { status: 400 }
      );
    }

    const mealPlan = await db.mealPlan.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error('Error updating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to update meal plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await db.mealPlan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete meal plan' },
      { status: 500 }
    );
  }
}
