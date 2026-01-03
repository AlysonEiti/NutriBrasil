import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function calculateBMR(gender: string, weight: number, height: number, age: number): number {
  if (gender === 'MASCULINO') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  }
}

function calculateTargetCalories(bmr: number, activityLevel: number, goal: string): number {
  const dailyNeed = Math.round(bmr * activityLevel);

  switch (goal) {
    case 'EMAGRECIMENTO':
      return Math.round(dailyNeed - 500);
    case 'GANHO_MASSA':
      return Math.round(dailyNeed + 300);
    case 'MANUTENCAO':
    default:
      return dailyNeed;
  }
}

export async function GET(request: NextRequest) {
  try {
    const profiles = await db.userProfile.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (profiles.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(profiles[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const bmr = body.manualBMR ? parseFloat(body.manualBMR) : calculateBMR(body.gender, body.weight, body.height, body.age);
    const targetCalories = calculateTargetCalories(bmr, body.activityLevel, body.goal);
    const dailyCalorieNeed = Math.round(bmr * body.activityLevel);

    const profile = await db.userProfile.create({
      data: {
        name: body.name,
        gender: body.gender,
        height: parseFloat(body.height),
        weight: parseFloat(body.weight),
        age: parseInt(body.age),
        goal: body.goal,
        mealsPerDay: parseInt(body.mealsPerDay) || 3,
        activityLevel: parseFloat(body.activityLevel) || 1.2,
        basalMetabolicRate: bmr,
        dailyCalorieNeed,
        targetCalories,
        manualBMR: body.manualBMR ? parseFloat(body.manualBMR) : null,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to create user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const profiles = await db.userProfile.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (profiles.length === 0) {
      return NextResponse.json(
        { error: 'No profile found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    const bmr = body.manualBMR ? parseFloat(body.manualBMR) : calculateBMR(body.gender, body.weight, body.height, body.age);
    const targetCalories = calculateTargetCalories(bmr, body.activityLevel, body.goal);
    const dailyCalorieNeed = Math.round(bmr * body.activityLevel);

    const profile = await db.userProfile.update({
      where: { id: profiles[0].id },
      data: {
        name: body.name,
        gender: body.gender,
        height: parseFloat(body.height),
        weight: parseFloat(body.weight),
        age: parseInt(body.age),
        goal: body.goal,
        mealsPerDay: parseInt(body.mealsPerDay) || 3,
        activityLevel: parseFloat(body.activityLevel) || 1.2,
        basalMetabolicRate: bmr,
        dailyCalorieNeed,
        targetCalories,
        manualBMR: body.manualBMR ? parseFloat(body.manualBMR) : null,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
