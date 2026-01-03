import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const initialRecipes = [
  // CAFÉ DA MANHÃ
  {
    name: "Ovos Mexidos com Tomate e Orégano",
    category: "CAFE_DA_MANHA",
    imageUrl: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500",
    ingredients: JSON.stringify([
      "3 ovos",
      "1 tomate picado",
      "1 colher de chá de orégano",
      "Sal a gosto",
      "1 fio de azeite"
    ]),
    preparation: "1. Bata os ovos em uma tigela.\n2. Aqueça o azeite em uma frigideira.\n3. Adicione o tomate picado e refogue por 1 minuto.\n4. Adicione os ovos batidos e tempere com sal e orégano.\n5. Mexa até ficar firme e sirva.",
    calories: 280,
    carbs: 3,
    protein: 22,
    fat: 20,
    fiber: 1,
    servings: 1
  },
  {
    name: "Tapioca com Queijo Minas",
    category: "CAFE_DA_MANHA",
    imageUrl: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=500",
    ingredients: JSON.stringify([
      "50g de goma de tapioca",
      "50g de queijo minas ralado",
      "Orégano a gosto"
    ]),
    preparation: "1. Aqueça uma frigideira antiaderente.\n2. Espalhe a goma de tapioca formando um círculo.\n3. Quando desgrudar do fundo, vire.\n4. Adicione o queijo e orégano.\n5. Dobre ao meio e sirva.",
    calories: 320,
    carbs: 35,
    protein: 12,
    fat: 15,
    fiber: 2,
    servings: 1
  },
  {
    name: "Vitamina de Banana com Aveia",
    category: "CAFE_DA_MANHA",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
    ingredients: JSON.stringify([
      "1 banana",
      "200ml de leite desnatado",
      "30g de aveia",
      "Canela a gosto"
    ]),
    preparation: "1. Bata todos os ingredientes no liquidificador.\n2. Sirva imediatamente.",
    calories: 250,
    carbs: 42,
    protein: 12,
    fat: 4,
    fiber: 6,
    waterContent: 200,
    servings: 1
  },
  {
    name: "Iogurte com Granola e Frutas",
    category: "CAFE_DA_MANHA",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
    ingredients: JSON.stringify([
      "200g de iogurte natural",
      "40g de granola sem açúcar",
      "1/2 mamão papaia",
      "5 morangos"
    ]),
    preparation: "1. Coloque o iogurte em uma tigela.\n2. Adicione a granola.\n3. Adicione o mamão e os morangos cortados.",
    calories: 290,
    carbs: 45,
    protein: 14,
    fat: 7,
    fiber: 8,
    waterContent: 150,
    servings: 1
  },
  {
    name: "Pão Integral com Ovos e Ricota",
    category: "CAFE_DA_MANHA",
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500",
    ingredients: JSON.stringify([
      "2 fatias de pão integral",
      "2 ovos",
      "50g de ricota",
      "Tomate cereja",
      "Sal e pimenta a gosto"
    ]),
    preparation: "1. Toste o pão.\n2. Prepare os ovos mexidos ou cozidos.\n3. Espalhe a ricota no pão.\n4. Adicione os ovos e tomates cereja.\n5. Tempere com sal e pimenta.",
    calories: 350,
    carbs: 28,
    protein: 24,
    fat: 16,
    fiber: 5,
    servings: 1
  },
  {
    name: "Panqueca de Aveia com Banana",
    category: "CAFE_DA_MANHA",
    imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500",
    ingredients: JSON.stringify([
      "30g de aveia",
      "1 ovo",
      "1 banana",
      "Canela",
      "Iogurte para acompanhar"
    ]),
    preparation: "1. Amasse a banana.\n2. Misture com ovo e aveia.\n3. Cozinhe em frigideira antiaderente.\n4. Polvilhe canela e sirva com iogurte.",
    calories: 300,
    carbs: 40,
    protein: 15,
    fat: 8,
    fiber: 6,
    servings: 1
  },
  {
    name: "Smoothie Verde Energético",
    category: "CAFE_DA_MANHA",
    imageUrl: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=500",
    ingredients: JSON.stringify([
      "1 xícara de espinafre",
      "1 banana",
      "1 maçã",
      "200ml de água de coco",
      "Gengibre a gosto"
    ]),
    preparation: "1. Bata tudo no liquidificador.\n2. Sirva imediatamente.",
    calories: 220,
    carbs: 45,
    protein: 6,
    fat: 2,
    fiber: 8,
    waterContent: 250,
    servings: 1
  },
  {
    name: "Overnight Oats com Frutas",
    category: "CAFE_DA_MANHA",
    imageUrl: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500",
    ingredients: JSON.stringify([
      "50g de aveia",
      "150ml de leite desnatado",
      "1 colher de chia",
      "Morangos e mirtilos",
      "Mel opcional"
    ]),
    preparation: "1. Misture aveia, leite e chia.\n2. Deixe na geladeira durante a noite.\n3. Adicione frutas e mel na hora de servir.",
    calories: 280,
    carbs: 40,
    protein: 14,
    fat: 6,
    fiber: 8,
    waterContent: 150,
    servings: 1
  },
  
  // LANCHE DA MANHÃ
  {
    name: "Banana com Pasta de Amendoim",
    category: "LANCHE_DA_MANHA",
    imageUrl: "https://images.unsplash.com/photo-1601004196042-0df0c2227a22?w=500",
    ingredients: JSON.stringify([
      "1 banana",
      "15g de pasta de amendoim sem açúcar",
      "Canela a gosto"
    ]),
    preparation: "1. Corte a banana em rodelas.\n2. Sirva com a pasta de amendoim.\n3. Polvilhe canela.",
    calories: 200,
    carbs: 28,
    protein: 6,
    fat: 8,
    fiber: 4,
    servings: 1
  },
  {
    name: "Castanhas e Frutas Secas",
    category: "LANCHE_DA_MANHA",
    imageUrl: "https://images.unsplash.com/photo-1563296681-f86d798a429f?w=500",
    ingredients: JSON.stringify([
      "10 castanhas do pará",
      "5 damascos secos",
      "5 ameixas secas"
    ]),
    preparation: "1. Misture as castanhas e frutas secas.\n2. Consuma como lanche.",
    calories: 280,
    carbs: 30,
    protein: 8,
    fat: 14,
    fiber: 6,
    servings: 1
  },
  {
    name: "Iogurte com Mel e Nozes",
    category: "LANCHE_DA_MANHA",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
    ingredients: JSON.stringify([
      "150g de iogurte grego",
      "1 colher de sopa de mel",
      "15g de nozes picadas"
    ]),
    preparation: "1. Misture o iogurte com o mel.\n2. Adicione as nozes picadas.",
    calories: 220,
    carbs: 18,
    protein: 14,
    fat: 12,
    fiber: 2,
    servings: 1
  },
  {
    name: "Maçã com Queijo Cottage",
    category: "LANCHE_DA_MANHA",
    imageUrl: "https://images.unsplash.com/photo-1579631549679-65a5d434c492?w=500",
    ingredients: JSON.stringify([
      "1 maçã",
      "100g de queijo cottage",
      "Canela"
    ]),
    preparation: "1. Corte a maçã em fatias.\n2. Sirva com queijo cottage e canela.",
    calories: 180,
    carbs: 22,
    protein: 12,
    fat: 4,
    fiber: 5,
    servings: 1
  },
  
  // ALMOÇO
  {
    name: "Frango Grelhado com Batata Doce",
    category: "ALMOCO",
    imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500",
    ingredients: JSON.stringify([
      "200g de peito de frango",
      "1 batata doce média",
      "Sal, pimenta e azeite",
      "Ervas finas a gosto"
    ]),
    preparation: "1. Tempere o frango com sal, pimenta e ervas.\n2. Grelhe o frango em fio de azeite.\n3. Cozinhe a batata doce cozida ou assada.\n4. Sirva com salada verde.",
    calories: 380,
    carbs: 35,
    protein: 42,
    fat: 10,
    fiber: 5,
    servings: 1
  },
  {
    name: "Arroz Integral com Feijão e Carne",
    category: "ALMOCO",
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500",
    ingredients: JSON.stringify([
      "100g de arroz integral cozido",
      "50g de feijão preto",
      "150g de carne magra (patinho ou alcatra)",
      "Salada de alface e tomate"
    ]),
    preparation: "1. Cozinhe o arroz integral.\n2. Prepare o feijão temperado.\n3. Grelhe a carne com temperos leves.\n4. Monte o prato com salada verde.",
    calories: 520,
    carbs: 50,
    protein: 45,
    fat: 14,
    fiber: 12,
    servings: 1
  },
  {
    name: "Salada de Frango com Quinoa",
    category: "ALMOCO",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
    ingredients: JSON.stringify([
      "150g de peito de frango desfiado",
      "50g de quinoa cozida",
      "Alface, tomate, pepino",
      "Azeite de oliva",
      "Limão e sal a gosto"
    ]),
    preparation: "1. Cozinhe e desfie o frango.\n2. Cozinhe a quinoa.\n3. Lave e corte os vegetais.\n4. Misture tudo e tempere com azeite, limão e sal.",
    calories: 400,
    carbs: 30,
    protein: 45,
    fat: 12,
    fiber: 8,
    servings: 1
  },
  {
    name: "Filé de Peixe com Purê de Mandioca",
    category: "ALMOCO",
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500",
    ingredients: JSON.stringify([
      "180g de filé de tilápia",
      "100g de mandioca",
      "Limão, alho e azeite",
      "Couve refogada"
    ]),
    preparation: "1. Tempere o peixe com limão, alho e sal.\n2. Grelhe o peixe.\n3. Cozinhe a mandioca e faça purê.\n4. Refogue a couve com alho.\n5. Sirva tudo.",
    calories: 420,
    carbs: 38,
    protein: 40,
    fat: 12,
    fiber: 6,
    servings: 1
  },
  {
    name: "Peito de Peru com Salada",
    category: "ALMOCO",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
    ingredients: JSON.stringify([
      "150g de peito de peru",
      "Mix de folhas verdes",
      "Tomate, cenoura ralada",
      "Azeite e vinagre"
    ]),
    preparation: "1. Corte o peito de peru em fatias.\n2. Lave e prepare os vegetais.\n3. Monte a salada com todos os ingredientes.\n4. Tempere com azeite e vinagre.",
    calories: 280,
    carbs: 10,
    protein: 38,
    fat: 10,
    fiber: 5,
    servings: 1
  },
  {
    name: "Brócolis com Frango e Arroz",
    category: "ALMOCO",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500",
    ingredients: JSON.stringify([
      "180g de frango em cubos",
      "80g de arroz integral",
      "150g de brócolis",
      "Alho, azeite e sal"
    ]),
    preparation: "1. Refogue o frango com alho e azeite.\n2. Cozinhe o arroz integral.\n3. Cozinhe o brócolis no vapor.\n4. Monte o prato.",
    calories: 450,
    carbs: 40,
    protein: 45,
    fat: 12,
    fiber: 8,
    servings: 1
  },
  {
    name: "Bife de Alcatra com Legumes",
    category: "ALMOCO",
    imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500",
    ingredients: JSON.stringify([
      "200g de alcatra",
      "1 batata doce",
      "Abobrinha, cenoura",
      "Temperos naturais"
    ]),
    preparation: "1. Tempere o bife e grelhe.\n2. Asse os legumes.\n3. Sirva com salada.",
    calories: 480,
    carbs: 38,
    protein: 50,
    fat: 15,
    fiber: 8,
    servings: 1
  },
  {
    name: "Moqueca de Peixe Light",
    category: "ALMOCO",
    imageUrl: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=500",
    ingredients: JSON.stringify([
      "200g de filé de peixe",
      "1 tomate",
      "1/2 cebola",
      "Leite de coco light",
      "Coentro"
    ]),
    preparation: "1. Monte camadas de peixe e vegetais.\n2. Adicione leite de coco.\n3. Cozinhe em fogo baixo.\n4. Finalize com coentro.",
    calories: 380,
    carbs: 18,
    protein: 48,
    fat: 14,
    fiber: 4,
    servings: 1
  },
  {
    name: "Strogonoff de Frango Light",
    category: "ALMOCO",
    imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500",
    ingredients: JSON.stringify([
      "150g de frango",
      "1 colher de creme de leite light",
      "Champignon",
      "Arroz integral"
    ]),
    preparation: "1. Refogue o frango.\n2. Adicione o champignon.\n3. Finalize com creme de leite.\n4. Sirva com arroz integral.",
    calories: 450,
    carbs: 48,
    protein: 38,
    fat: 12,
    fiber: 4,
    servings: 1
  },
  
  // LANCHE DA TARDE
  {
    name: "Suco de Laranja com Torradas",
    category: "LANCHE_DA_TARDE",
    imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500",
    ingredients: JSON.stringify([
      "250ml de suco de laranja natural",
      "2 torradas integrais",
      "Ricota ou requeijão light"
    ]),
    preparation: "1. Esprema as laranjas para fazer o suco.\n2. Espalhe a ricota nas torradas.\n3. Sirva com o suco.",
    calories: 280,
    carbs: 45,
    protein: 10,
    fat: 6,
    fiber: 4,
    waterContent: 230,
    servings: 1
  },
  {
    name: "Crepioca com Frango",
    category: "LANCHE_DA_TARDE",
    imageUrl: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=500",
    ingredients: JSON.stringify([
      "2 ovos",
      "2 colheres de tapioca",
      "80g de frango desfiado",
      "Cream cheese light"
    ]),
    preparation: "1. Misture ovos e tapioca.\n2. Frite a massa como panqueca.\n3. Recheie com frango desfiado e cream cheese.\n4. Sirva.",
    calories: 320,
    carbs: 18,
    protein: 32,
    fat: 14,
    fiber: 2,
    servings: 1
  },
  {
    name: "Mamão com Granola",
    category: "LANCHE_DA_TARDE",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
    ingredients: JSON.stringify([
      "1/2 mamão papaia",
      "30g de granola sem açúcar",
      "Iogurte natural"
    ]),
    preparation: "1. Corte o mamão em cubos.\n2. Adicione a granola.\n3. Sirva com iogurte natural.",
    calories: 230,
    carbs: 38,
    protein: 8,
    fat: 5,
    fiber: 7,
    waterContent: 100,
    servings: 1
  },
  {
    name: "Salada de Frutas com Coco",
    category: "LANCHE_DA_TARDE",
    imageUrl: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=500",
    ingredients: JSON.stringify([
      "Melancia, melão, abacaxi",
      "Coco ralado",
      "Hortelã",
      "Mel (opcional)"
    ]),
    preparation: "1. Corte todas as frutas em cubos.\n2. Misture em uma tigela.\n3. Adicione coco ralado e hortelã.\n4. Se desejar, adicione um pouco de mel.",
    calories: 180,
    carbs: 40,
    protein: 2,
    fat: 4,
    fiber: 5,
    waterContent: 150,
    servings: 1
  },
  {
    name: "Wrap de Peru e Queijo",
    category: "LANCHE_DA_TARDE",
    imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500",
    ingredients: JSON.stringify([
      "1 wrap integral",
      "80g de peito de peru",
      "30g de queijo prato",
      "Alface e tomate"
    ]),
    preparation: "1. Monte o wrap com todos os ingredientes.\n2. Enrole bem.\n3. Corte ao meio e sirva.",
    calories: 320,
    carbs: 28,
    protein: 28,
    fat: 12,
    fiber: 4,
    servings: 1
  },
  {
    name: "Sanduíche Natural de Atum",
    category: "LANCHE_DA_TARDE",
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500",
    ingredients: JSON.stringify([
      "2 fatias de pão integral",
      "1 lata de atum em água",
      "Iogurte natural",
      "Milho e ervilha",
      "Cenoura ralada"
    ]),
    preparation: "1. Misture o atum com iogurte.\n2. Adicione milho, ervilha e cenoura.\n3. Monte o sanduíche.",
    calories: 350,
    carbs: 35,
    protein: 32,
    fat: 8,
    fiber: 6,
    servings: 1
  },
  
  // JANTAR
  {
    name: "Omelete de Legumes",
    category: "JANTAR",
    imageUrl: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=500",
    ingredients: JSON.stringify([
      "3 ovos",
      "Tomate, pimentão, cebola",
      "Queijo minas",
      "Orégano e azeite"
    ]),
    preparation: "1. Pique todos os legumes.\n2. Refogue levemente no azeite.\n3. Bata os ovos e adicione aos legumes.\n4. Finalize com queijo e orégano.\n5. Sirva com salada.",
    calories: 320,
    carbs: 12,
    protein: 24,
    fat: 20,
    fiber: 4,
    servings: 1
  },
  {
    name: "Sopa de Legumes com Frango",
    category: "JANTAR",
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500",
    ingredients: JSON.stringify([
      "100g de frango",
      "Batata, cenoura, abobrinha",
      "Mandioca ou macarrão integral",
      "Temperos naturais"
    ]),
    preparation: "1. Cozinhe o frango e desfie.\n2. Corte todos os legumes.\n3. Cozinhe tudo em uma panela com água.\n4. Tempere com ervas e sal.\n5. Sirva quente.",
    calories: 280,
    carbs: 35,
    protein: 25,
    fat: 6,
    fiber: 6,
    waterContent: 300,
    servings: 1
  },
  {
    name: "Salada Completa com Atum",
    category: "JANTAR",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
    ingredients: JSON.stringify([
      "1 lata de atum em água",
      "Mix de folhas",
      "Tomate, pepino, cebola roxa",
      "Ovo cozido",
      "Azeite e limão"
    ]),
    preparation: "1. Lave e prepare os vegetais.\n2. Adicione o atum escorrido.\n3. Corte o ovo cozido em rodelas.\n4. Tempere com azeite e limão.",
    calories: 340,
    carbs: 15,
    protein: 35,
    fat: 14,
    fiber: 7,
    servings: 1
  },
  {
    name: "Frango Assado com Legumes",
    category: "JANTAR",
    imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500",
    ingredients: JSON.stringify([
      "180g de frango (sobrecoxa ou peito)",
      "Batata, cenoura, brócolis",
      "Azeite, alecrim, alho",
      "Sal e pimenta"
    ]),
    preparation: "1. Tempere o frango com azeite, alho e ervas.\n2. Corte os legumes.\n3. Coloque tudo em uma assadeira.\n4. Asse a 200°C por 30 minutos.\n5. Sirva.",
    calories: 420,
    carbs: 38,
    protein: 40,
    fat: 12,
    fiber: 8,
    servings: 1
  },
  {
    name: "Peixe Assado com Legumes",
    category: "JANTAR",
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500",
    ingredients: JSON.stringify([
      "200g de filé de peixe",
      "Abobrinha, berinjela, pimentão",
      "Limão, alho, azeite",
      "Tomilho"
    ]),
    preparation: "1. Tempere o peixe com limão, alho e azeite.\n2. Corte os legumes em fatias.\n3. Coloque em uma assadeira.\n4. Asse por 25-30 minutos a 200°C.",
    calories: 350,
    carbs: 18,
    protein: 45,
    fat: 12,
    fiber: 6,
    servings: 1
  },
  {
    name: "Lasanha de Berinjela",
    category: "JANTAR",
    imageUrl: "https://images.unsplash.com/photo-1574868236634-31a649be4d7a?w=500",
    ingredients: JSON.stringify([
      "2 berinjelas fatiadas",
      "300g de carne moída magra",
      "Molho de tomate",
      "Queijo minas light",
      "Manjericão"
    ]),
    preparation: "1. Grelhe as berinjelas.\n2. Prepare o molho de carne.\n3. Monte camadas.\n4. Asse por 30 minutos.",
    calories: 380,
    carbs: 22,
    protein: 35,
    fat: 18,
    fiber: 8,
    servings: 1
  },
  {
    name: "Frango Xadrez com Legumes",
    category: "JANTAR",
    imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500",
    ingredients: JSON.stringify([
      "180g de frango em cubos",
      "Cenoura, pimentão, brócolis",
      "Shoyu light",
      "Gengibre e alho",
      "Arroz integral"
    ]),
    preparation: "1. Refogue o frango.\n2. Adicione os legumes.\n3. Tempere com shoyu.\n4. Sirva com arroz integral.",
    calories: 450,
    carbs: 42,
    protein: 40,
    fat: 10,
    fiber: 7,
    servings: 1
  },
  
  // CEIA
  {
    name: "Pudim de Claras",
    category: "CEIA",
    imageUrl: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500",
    ingredients: JSON.stringify([
      "6 claras de ovos",
      "6 colheres de sopa de coco ralado",
      "Canela",
      "Edulcorante a gosto"
    ]),
    preparation: "1. Bata as claras em neve.\n2. Adicione o coco e misture delicadamente.\n3. Coloque em forma untada.\n4. Leve ao forno por 15 minutos.\n5. Polvilhe canela.",
    calories: 120,
    carbs: 8,
    protein: 15,
    fat: 4,
    fiber: 2,
    servings: 2
  },
  {
    name: "Chia com Iogurte",
    category: "CEIA",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
    ingredients: JSON.stringify([
      "150g de iogurte desnatado",
      "1 colher de sopa de chia",
      "Canela"
    ]),
    preparation: "1. Misture a chia no iogurte.\n2. Deixe descansar por 10 minutos.\n3. Polvilhe canela e sirva.",
    calories: 140,
    carbs: 12,
    protein: 12,
    fat: 4,
    fiber: 8,
    waterContent: 130,
    servings: 1
  },
  {
    name: "Morangos com Creme de Ricota",
    category: "CEIA",
    imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500",
    ingredients: JSON.stringify([
      "100g de ricota",
      "10 morangos",
      "Edulcorante",
      "Gotas de essência de baunilha"
    ]),
    preparation: "1. Amasse a ricota e misture com a baunilha.\n2. Lave e corte os morangos.\n3. Sirva os morangos com o creme de ricota.",
    calories: 150,
    carbs: 15,
    protein: 12,
    fat: 6,
    fiber: 3,
    servings: 1
  },
  {
    name: "Brigadeiro Fitness",
    category: "CEIA",
    imageUrl: "https://images.unsplash.com/photo-1579372786545-d24235daf37c2?w=500",
    ingredients: JSON.stringify([
      "100g de leite em pó desnatado",
      "1 colher de sopa de cacau em pó",
      "3 colheres de água",
      "Coco ralado para enrolar"
    ]),
    preparation: "1. Misture todos os ingredientes em uma panela.\n2. Cozinhe até engrossar.\n3. Deixe esfriar.\n4. Enrole e passe no coco ralado.",
    calories: 180,
    carbs: 25,
    protein: 12,
    fat: 4,
    fiber: 3,
    servings: 4
  },
  {
    name: "Banana Assada com Canela",
    category: "CEIA",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
    ingredients: JSON.stringify([
      "1 banana nanica",
      "Canela",
      "Coco ralado (opcional)"
    ]),
    preparation: "1. Corte a banana ao meio no sentido do comprimento.\n2. Polvilhe canela.\n3. Asse por 10 minutos a 180°C.\n4. Sirva quente com coco ralado.",
    calories: 120,
    carbs: 30,
    protein: 1,
    fat: 0,
    fiber: 4,
    servings: 1
  },
  {
    name: "Gelatina com Frutas",
    category: "CEIA",
    imageUrl: "https://images.unsplash.com/photo-1560244913-0cdb06f607aca?w=500",
    ingredients: JSON.stringify([
      "1 caixinha de gelatina zero açúcar",
      "1/2 xícara de morangos",
      "1/2 xícara de uvas",
      "Iogurte natural (opcional)"
    ]),
    preparation: "1. Prepare a gelatina.\n2. Adicione as frutas picadas.\n3. Leve à geladeira.\n4. Sirva com iogurte se desejar.",
    calories: 90,
    carbs: 12,
    protein: 8,
    fat: 0,
    fiber: 3,
    waterContent: 200,
    servings: 1
  },
  {
    name: "Mousse de Chocolate Fitness",
    category: "CEIA",
    imageUrl: "https://images.unsplash.com/photo-1579372786545-d24236bec5f8?w=500",
    ingredients: JSON.stringify([
      "200g de iogurte grego",
      "1 colher de cacau em pó",
      "2 colheres de edulcorante",
      "Chocolate 70% picado"
    ]),
    preparation: "1. Bata tudo no liquidificador.\n2. Leve à geladeira por 2 horas.\n3. Sirva com chocolate picado.",
    calories: 180,
    carbs: 15,
    protein: 18,
    fat: 6,
    fiber: 3,
    servings: 2
  }
];

export async function POST() {
  try {
    const existingRecipes = await db.recipe.findMany();
    if (existingRecipes.length > 0) {
      return NextResponse.json({ message: 'Database already seeded' });
    }

    for (const recipe of initialRecipes) {
      await db.recipe.create({
        data: recipe,
      });
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      count: initialRecipes.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
