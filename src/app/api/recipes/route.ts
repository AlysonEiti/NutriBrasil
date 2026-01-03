import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isCustom = searchParams.get('isCustom');

    let where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isCustom !== null) {
      where.isCustom = isCustom === 'true';
    }

    const recipes = await db.recipe.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const recipe = await db.recipe.create({
      data: {
        name: body.name,
        category: body.category,
        ingredients: JSON.stringify(body.ingredients),
        preparation: body.preparation,
        calories: body.calories,
        carbs: body.carbs,
        protein: body.protein,
        fat: body.fat,
        fiber: body.fiber || 0,
        waterContent: body.waterContent || 0,
        servings: body.servings || 1,
        isCustom: body.isCustom || false,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}
