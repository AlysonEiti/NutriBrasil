import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Deletar todos os MealPlanItems
    await db.mealPlanItem.deleteMany({});
    
    // Deletar todos os MealPlans
    await db.mealPlan.deleteMany({});
    
    // Deletar todas as Recipes
    await db.recipe.deleteMany({});
    
    // Deletar todos os UserProfiles
    await db.userProfile.deleteMany({});

    return NextResponse.json({ 
      success: true, 
      message: 'Banco de dados limpo com sucesso!' 
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { error: 'Falha ao limpar banco de dados' },
      { status: 500 }
    );
  }
}
