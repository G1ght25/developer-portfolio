/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, PromoCode, WarehouseIngredient, OperationalExpenses } from '../types';

export const MENU_CATEGORIES = [
  { id: 'sets', name: 'Сеты', icon: 'Sparkles' },
  { id: 'baked-rolls', name: 'Запеченные роллы', icon: 'Flame' },
  { id: 'classic-rolls', name: 'Классические роллы', icon: 'Fish' },
  { id: 'tempura-rolls', name: 'Темпура роллы', icon: 'Zap' },
  { id: 'sushi', name: 'Суши', icon: 'ChefHat' },
  { id: 'pizza', name: 'Пицца', icon: 'Pizza' },
  { id: 'desserts', name: 'Десерты', icon: 'CakeSlice' },
  { id: 'dopolnitelno', name: 'Дополнительно', icon: 'Soup' }
];

export const MENU_ITEMS: Product[] = [
  {
    "id": "item-akiro",
    "name": "Акиро",
    "description": "Аппетитный акиро по фирменному рецепту PandaBAR: Рис (160 г), Сыр сливочный (40 г), Огурец (20 г), Угорь (5 г), Лосось (5 г).",
    "ingredientsSummary": "Рис (160 г), Сыр сливочный (40 г), Огурец (20 г), Угорь (5 г), Лосось (5 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 40,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-eel",
        "name": "Угорь копченый Унаги",
        "amount": 5,
        "unit": "г",
        "costEstimate": 10
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 5,
        "unit": "г",
        "costEstimate": 9
      }
    ],
    "price": 565,
    "oldPrice": null,
    "weight": 300,
    "pieces": 8,
    "image": "/uploads/menu/akiro.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-asama",
    "name": "Асама",
    "description": "Аппетитный асама по фирменному рецепту PandaBAR: Рис (140 г), Сыр сливочный (10 г), Снежный краб (10 г), Огурец (10 г), Кунжут (10 г).",
    "ingredientsSummary": "Рис (140 г), Сыр сливочный (10 г), Снежный краб (10 г), Огурец (10 г), Кунжут (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 10,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 10,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-misc",
        "name": "Кунжут",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 370,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/asama.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-bali",
    "name": "Бали",
    "description": "Аппетитный бали по фирменному рецепту PandaBAR: Рис 160гр сливочный сыр (30 г).",
    "ingredientsSummary": "Рис 160гр сливочный сыр (30 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 30,
        "unit": "г",
        "costEstimate": 5
      }
    ],
    "price": 540,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/bali.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-bonita",
    "name": "Бонита",
    "description": "Аппетитный бонита по фирменному рецепту PandaBAR: Рис (140 г), Сыр сливочный (10 г), Жаренный лосось (20 г), Огурец (20 г), Стружка тунца (5 г).",
    "ingredientsSummary": "Рис (140 г), Сыр сливочный (10 г), Жаренный лосось (20 г), Огурец (20 г), Стружка тунца (5 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 10,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Стружка тунца",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      }
    ],
    "price": 510,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/bonita.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-dva-syra",
    "name": "Два Сыра",
    "description": "Аппетитный два сыра по фирменному рецепту PandaBAR: Рис (160 г), Сыр сливочный (20 г), Хохланд (10 г), Угорь (10 г), Лосось (10 г), Огурец (10 г), Панировочные сухари (10 г).",
    "ingredientsSummary": "Рис (160 г), Сыр сливочный (20 г), Хохланд (10 г), Угорь (10 г), Лосось (10 г), Огурец (10 г), Панировочные сухари (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-misc",
        "name": "Хохланд",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-eel",
        "name": "Угорь копченый Унаги",
        "amount": 10,
        "unit": "г",
        "costEstimate": 20
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 10,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-panko",
        "name": "Сухари Панко",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 605,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/dva_syra.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": true,
    "inStock": true
  },
  {
    "id": "item-zapechennye-midii-pod-krasnoj-shapochkoj-5-sht",
    "name": "Запеченные мидии под красной шапочкой (5 шт)",
    "description": "Аппетитный запеченные мидии под красной шапочкой (5 шт) по фирменному рецепту PandaBAR: Сыр гауда (50 г), Сыр пармезан (20 г), Соус кимчи (25 г), Икра Масаго (10 г), Майонез (10 г), Мидии (5 шт).",
    "ingredientsSummary": "Сыр гауда (50 г), Сыр пармезан (20 г), Соус кимчи (25 г), Икра Масаго (10 г), Майонез (10 г), Мидии (5 шт)",
    "ingredients": [
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр Гауда",
        "amount": 50,
        "unit": "г",
        "costEstimate": 32
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр Пармезан",
        "amount": 20,
        "unit": "г",
        "costEstimate": 22
      },
      {
        "id": "ing-sauces",
        "name": "Соус Кимчи",
        "amount": 25,
        "unit": "г",
        "costEstimate": 12
      },
      {
        "id": "ing-masago",
        "name": "Икра Масаго Orange",
        "amount": 10,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-misc",
        "name": "Майонез",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-mussels",
        "name": "Мидии гигант",
        "amount": 5,
        "unit": "шт",
        "costEstimate": 4
      }
    ],
    "price": 450,
    "oldPrice": null,
    "weight": 115,
    "pieces": 5,
    "image": "/uploads/menu/zapechennye-midii-pod-krasnoj-shapochkoj-5-sht.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-zapechennyj-roll-s-midiyami",
    "name": "Запеченный ролл с мидиями",
    "description": "Аппетитный запеченный ролл с мидиями по фирменному рецепту PandaBAR: Рис (140 г), Сыр сливочный (15 г), Лосось (15 г), шапочка из сыра, мидий, Майонеза и зеленого лука (20 г).",
    "ingredientsSummary": "Рис (140 г), Сыр сливочный (15 г), Лосось (15 г), шапочка из сыра, мидий, Майонеза и зеленого лука (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 15,
        "unit": "г",
        "costEstimate": 10
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 15,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-misc",
        "name": "Шапочка из сыра",
        "amount": 15,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-misc",
        "name": "Мидий",
        "amount": 15,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-misc",
        "name": "Майонеза и зеленого лука",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      }
    ],
    "price": 450,
    "oldPrice": null,
    "weight": 230,
    "pieces": 8,
    "image": "/uploads/menu/baked_roll_midii.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-zapechennyj-s-krevetkoj",
    "name": "Запеченный с Креветкой",
    "description": "Аппетитный запеченный с креветкой по фирменному рецепту PandaBAR: Рис (130 г), Сыр сливочный (20 г), Креветок (20 г).",
    "ingredientsSummary": "Рис (130 г), Сыр сливочный (20 г), Креветок (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 130,
        "unit": "г",
        "costEstimate": 23
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-misc",
        "name": "Креветок",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      }
    ],
    "price": 575,
    "oldPrice": null,
    "weight": 300,
    "pieces": 8,
    "image": "/uploads/menu/baked_shrimp.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-kabuki",
    "name": "Кабуки",
    "description": "Аппетитный кабуки по фирменному рецепту PandaBAR: Рис (150 г), Сыр сливочный (20 г), Лосось (10 г), Огурец (10 г), Сырно-запеченная шапка (20 г).",
    "ingredientsSummary": "Рис (150 г), Сыр сливочный (20 г), Лосось (10 г), Огурец (10 г), Сырно-запеченная шапка (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 10,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-misc",
        "name": "Сырно-запеченная шапка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      }
    ],
    "price": 475,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/kabuki.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-kaliforniya-s-krevetkoj",
    "name": "Калифорния с Креветкой",
    "description": "Аппетитный калифорния с креветкой по фирменному рецепту PandaBAR: Рис (140 г), Сыр сливочный (20 г), Креветка (20 г), Огурец (10 г), Икра Масаго (10 г).",
    "ingredientsSummary": "Рис (140 г), Сыр сливочный (20 г), Креветка (20 г), Огурец (10 г), Икра Масаго (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-masago",
        "name": "Икра Масаго Orange",
        "amount": 10,
        "unit": "г",
        "costEstimate": 14
      }
    ],
    "price": 529,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/california_shrimp.webp",
    "category": "classic-rolls",
    "tags": [
      "Хит"
    ],
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-kanadskij",
    "name": "Канадский",
    "description": "Аппетитный канадский по фирменному рецепту PandaBAR: Рис (150 г), Сыр сливочный (20 г), Лосось (10 г), Огурец (20 г), Угорь (10 г).",
    "ingredientsSummary": "Рис (150 г), Сыр сливочный (20 г), Лосось (10 г), Огурец (20 г), Угорь (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 10,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-eel",
        "name": "Угорь копченый Унаги",
        "amount": 10,
        "unit": "г",
        "costEstimate": 20
      }
    ],
    "price": 660,
    "oldPrice": null,
    "weight": 300,
    "pieces": 8,
    "image": "/uploads/menu/canadian.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-kani-maki",
    "name": "Кани Маки",
    "description": "Аппетитный кани маки по фирменному рецепту PandaBAR: Рис (140 г), Куриное филе (15 г), Снежный краб (15 г), Огурец (10 г), Томат (10 г), Шапочка из сыра и соуса спайс (10 г).",
    "ingredientsSummary": "Рис (140 г), Куриное филе (15 г), Снежный краб (15 г), Огурец (10 г), Томат (10 г), Шапочка из сыра и соуса спайс (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-chicken",
        "name": "Филе цыпленка",
        "amount": 15,
        "unit": "г",
        "costEstimate": 6
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 15,
        "unit": "г",
        "costEstimate": 13
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-misc",
        "name": "Томат",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Шапочка из сыра и соуса спайс",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 410,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/kani_maki.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-kappa-maki",
    "name": "Каппа Маки",
    "description": "Аппетитный каппа маки по фирменному рецепту PandaBAR: Рис (70 г), Огурец (20 г), Кунжут (10 г).",
    "ingredientsSummary": "Рис (70 г), Огурец (20 г), Кунжут (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 70,
        "unit": "г",
        "costEstimate": 13
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Кунжут",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 175,
    "oldPrice": null,
    "weight": 140,
    "pieces": 6,
    "image": "/uploads/menu/kapa_maki.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-karaj",
    "name": "Карай",
    "description": "Аппетитный карай по фирменному рецепту PandaBAR: Рис (150 г), Томат (20 г), Сыр сливочный (20 г), Шапочка из сыра и соуса спайс (20 г).",
    "ingredientsSummary": "Рис (150 г), Томат (20 г), Сыр сливочный (20 г), Шапочка из сыра и соуса спайс (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-misc",
        "name": "Томат",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-misc",
        "name": "Шапочка из сыра и соуса спайс",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      }
    ],
    "price": 350,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/karai.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-lava-maki",
    "name": "Лава Маки",
    "description": "Аппетитный лава маки по фирменному рецепту PandaBAR: Рис (160 г), Лосось (30 г), Огурец (20 г), Лава шапка (20 г).",
    "ingredientsSummary": "Рис (160 г), Лосось (30 г), Огурец (20 г), Лава шапка (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 30,
        "unit": "г",
        "costEstimate": 56
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Лава шапка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      }
    ],
    "price": 530,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/lava_maki.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-madzuki",
    "name": "Мадзуки",
    "description": "Аппетитный мадзуки по фирменному рецепту PandaBAR: Рис (160 г), Сыр сливочный (20 г), Снежный краб (20 г), Икра Масаго (10 г), Сырная шапочка (20 г).",
    "ingredientsSummary": "Рис (160 г), Сыр сливочный (20 г), Снежный краб (20 г), Икра Масаго (10 г), Сырная шапочка (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 20,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-masago",
        "name": "Икра Масаго Orange",
        "amount": 10,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-misc",
        "name": "Сырная шапочка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      }
    ],
    "price": 475,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/madzuki.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-makao",
    "name": "Макао",
    "description": "Аппетитный макао по фирменному рецепту PandaBAR: Рис (160 г), Креветка (20 г), Огурец (20 г), Крабовая шапка (20 г).",
    "ingredientsSummary": "Рис (160 г), Креветка (20 г), Огурец (20 г), Крабовая шапка (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 20,
        "unit": "г",
        "costEstimate": 17
      }
    ],
    "price": 430,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/makao.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-meksika",
    "name": "Мексика",
    "description": "Аппетитный мексика по фирменному рецепту PandaBAR: Рис (160 г), Сыр сливочный (10 г), Лосось (20 г), Огурец (20 г), Икра Масаго (10 г), Панировочные сухари (10 г).",
    "ingredientsSummary": "Рис (160 г), Сыр сливочный (10 г), Лосось (20 г), Огурец (20 г), Икра Масаго (10 г), Панировочные сухари (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 10,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-masago",
        "name": "Икра Масаго Orange",
        "amount": 10,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-panko",
        "name": "Сухари Панко",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 420,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/meksika.webp",
    "category": "tempura-rolls",
    "tags": [
      "Острое"
    ],
    "spicy": true,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-nagasaki",
    "name": "Нагасаки",
    "description": "Аппетитный нагасаки по фирменному рецепту PandaBAR: Рис (150 г), Сыр сливочный (10 г), Сыр хохланд (10 г), Лосось (15 г), Огурец (15 г), Панировочные сухари (10 г).",
    "ingredientsSummary": "Рис (150 г), Сыр сливочный (10 г), Сыр хохланд (10 г), Лосось (15 г), Огурец (15 г), Панировочные сухари (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 10,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр Hochland",
        "amount": 10,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 15,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      },
      {
        "id": "ing-panko",
        "name": "Сухари Панко",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 520,
    "oldPrice": null,
    "weight": 320,
    "pieces": 8,
    "image": "/uploads/menu/nagasaki.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-nebraska-surimi",
    "name": "Небраска Сурими",
    "description": "Аппетитный небраска сурими по фирменному рецепту PandaBAR: Рис (160 г), Снежный краб (20 г), Сыр 10 спайс (10 г).",
    "ingredientsSummary": "Рис (160 г), Снежный краб (20 г), Сыр 10 спайс (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 20,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-misc",
        "name": "Сыр 10 спайс",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 270,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/nebraska-surimi.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-nebraska-chiken",
    "name": "Небраска Чикен",
    "description": "Аппетитный небраска чикен по фирменному рецепту PandaBAR: Рис (150 г), Куриное филе (20 г), Сыр сливочный (10 г), Спайс (10 г).",
    "ingredientsSummary": "Рис (150 г), Куриное филе (20 г), Сыр сливочный (10 г), Спайс (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-chicken",
        "name": "Филе цыпленка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 10,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-misc",
        "name": "Спайс",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 255,
    "oldPrice": null,
    "weight": 230,
    "pieces": 8,
    "image": "/uploads/menu/nebraska-chiken.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-odari",
    "name": "Одари",
    "description": "Аппетитный одари по фирменному рецепту PandaBAR: Рис (150 г), Сыр сливочный (10 г), Креветка (10 г), Огурец (10 г), Лист салата (10 г).",
    "ingredientsSummary": "Рис (150 г), Сыр сливочный (10 г), Креветка (10 г), Огурец (10 г), Лист салата (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 10,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 10,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-misc",
        "name": "Лист салата",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 390,
    "oldPrice": null,
    "weight": 230,
    "pieces": 8,
    "image": "/uploads/menu/odari.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-okinava-syake",
    "name": "Окинава Сяке",
    "description": "Аппетитный окинава сяке по фирменному рецепту PandaBAR: Рис (150 г), Сыр сливочный (40 г), Огурец (10 г), Лосось (15 г), Соус спайс (5 г).",
    "ingredientsSummary": "Рис (150 г), Сыр сливочный (40 г), Огурец (10 г), Лосось (15 г), Соус спайс (5 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 40,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 15,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-sauces",
        "name": "Соус Спайси",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      }
    ],
    "price": 535,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/okinava-syake.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-onigara",
    "name": "Онигара",
    "description": "Аппетитный онигара по фирменному рецепту PandaBAR: Рис (140 г), Креветка (20 г), Лист салата (10 г), Кунжут (5 г), Соус кимчи (5 г).",
    "ingredientsSummary": "Рис (140 г), Креветка (20 г), Лист салата (10 г), Кунжут (5 г), Соус кимчи (5 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-misc",
        "name": "Лист салата",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Кунжут",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-sauces",
        "name": "Соус Кимчи",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      }
    ],
    "price": 380,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/onigara.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-ontario-chiken",
    "name": "Онтарио Чикен",
    "description": "Аппетитный онтарио чикен по фирменному рецепту PandaBAR: Рис (140 г), Сыр сливочный (10 г), Куриное филе (15 г), Огурец (20 г), Кунжут (15 г), Соус унаги (5 г).",
    "ingredientsSummary": "Рис (140 г), Сыр сливочный (10 г), Куриное филе (15 г), Огурец (20 г), Кунжут (15 г), Соус унаги (5 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 10,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-chicken",
        "name": "Филе цыпленка",
        "amount": 15,
        "unit": "г",
        "costEstimate": 6
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Кунжут",
        "amount": 15,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-sauces",
        "name": "Соус Унаги",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      }
    ],
    "price": 350,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/ontario_chiken.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-osaka",
    "name": "Осака",
    "description": "Аппетитный осака по фирменному рецепту PandaBAR: Рис (160 г), Креветка (20 г), Огурец (20 г), соус из сливочного сыра, икры Масаго, Чеснока и укропа (20 г).",
    "ingredientsSummary": "Рис (160 г), Креветка (20 г), Огурец (20 г), соус из сливочного сыра, икры Масаго, Чеснока и укропа (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Соус из сливочного сыра",
        "amount": 15,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-masago",
        "name": "Икра Масаго Orange",
        "amount": 10,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-misc",
        "name": "Чеснока и укропа",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      }
    ],
    "price": 510,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/osaka.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-ponika",
    "name": "Поника",
    "description": "Аппетитный поника по фирменному рецепту PandaBAR: Рис (140 г), Сыр сливочный (20 г), Угорь (20 г), Соус унаги (5 г), Панировочные сухари (5 г).",
    "ingredientsSummary": "Рис (140 г), Сыр сливочный (20 г), Угорь (20 г), Соус унаги (5 г), Панировочные сухари (5 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-eel",
        "name": "Угорь копченый Унаги",
        "amount": 20,
        "unit": "г",
        "costEstimate": 39
      },
      {
        "id": "ing-sauces",
        "name": "Соус Унаги",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-panko",
        "name": "Сухари Панко",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      }
    ],
    "price": 450,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/ponika.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-rio",
    "name": "Рио",
    "description": "Аппетитный рио по фирменному рецепту PandaBAR: Рис (150 г), Сыр сливочный (20 г), Креветка (20 г), Огурец (20 г), Киви (10 г).",
    "ingredientsSummary": "Рис (150 г), Сыр сливочный (20 г), Креветка (20 г), Огурец (20 г), Киви (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Киви",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 430,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/rio.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-salmon",
    "name": "Салмон",
    "description": "Аппетитный салмон по фирменному рецепту PandaBAR: Рис (140 г), Сыр сливочный (10 г), Огурец (10 г), Лосось (10 г), Кунжут (10 г).",
    "ingredientsSummary": "Рис (140 г), Сыр сливочный (10 г), Огурец (10 г), Лосось (10 г), Кунжут (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 10,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 10,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-misc",
        "name": "Кунжут",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 465,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/salmon.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-safari",
    "name": "Сафари",
    "description": "Аппетитный сафари по фирменному рецепту PandaBAR: Рис (150 г), Креветка (20 г), Огурец (20 г), Кунжут (10 г), Шапочка из сыра и майонеза (20 г).",
    "ingredientsSummary": "Рис (150 г), Креветка (20 г), Огурец (20 г), Кунжут (10 г), Шапочка из сыра и майонеза (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Кунжут",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Шапочка из сыра и майонеза",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      }
    ],
    "price": 440,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/safari.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sidnej",
    "name": "Сидней",
    "description": "Аппетитный сидней по фирменному рецепту PandaBAR: Рис (150 г), Жаренный лосось (20 г), Томат (10 г), Панировочные сухари (10 г).",
    "ingredientsSummary": "Рис (150 г), Жаренный лосось (20 г), Томат (10 г), Панировочные сухари (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-misc",
        "name": "Томат",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-panko",
        "name": "Сухари Панко",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 365,
    "oldPrice": null,
    "weight": 230,
    "pieces": 8,
    "image": "/uploads/menu/sidnej.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": false
  },
  {
    "id": "item-sumo",
    "name": "Сумо",
    "description": "Аппетитный сумо по фирменному рецепту PandaBAR: Рис (150 г), Жаренный лосось (20 г), Панировочные сухари (10 г).",
    "ingredientsSummary": "Рис (150 г), Жаренный лосось (20 г), Панировочные сухари (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-panko",
        "name": "Сухари Панко",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 335,
    "oldPrice": null,
    "weight": 220,
    "pieces": 8,
    "image": "/uploads/menu/sumo.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": false
  },
  {
    "id": "item-surimi-tempura",
    "name": "Сурими Темпура",
    "description": "Аппетитный сурими темпура по фирменному рецепту PandaBAR: Рис (140 г), Огурец (15 г), Снежный краб (15 г), Соус спайс (10 г), Панировочные сухари (10 г).",
    "ingredientsSummary": "Рис (140 г), Огурец (15 г), Снежный краб (15 г), Соус спайс (10 г), Панировочные сухари (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 15,
        "unit": "г",
        "costEstimate": 13
      },
      {
        "id": "ing-sauces",
        "name": "Соус Спайси",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-panko",
        "name": "Сухари Панко",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 295,
    "oldPrice": null,
    "weight": 230,
    "pieces": 8,
    "image": "/uploads/menu/surimi_tempura.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-syake-maki",
    "name": "Сяке Маки",
    "description": "Аппетитный сяке маки по фирменному рецепту PandaBAR: Рис (80 г), Лосось (20 г), Огурец (10 г).",
    "ingredientsSummary": "Рис (80 г), Лосось (20 г), Огурец (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 80,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      }
    ],
    "price": 220,
    "oldPrice": null,
    "weight": 150,
    "pieces": 6,
    "image": "/uploads/menu/syake_maki.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tajfun",
    "name": "Тайфун",
    "description": "Аппетитный тайфун по фирменному рецепту PandaBAR: Рис (120 г), Жареный лосось (20 г), Томат (20 г), Огурец (20 г).",
    "ingredientsSummary": "Рис (120 г), Жареный лосось (20 г), Томат (20 г), Огурец (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 120,
        "unit": "г",
        "costEstimate": 22
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-misc",
        "name": "Томат",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 340,
    "oldPrice": null,
    "weight": 220,
    "pieces": 8,
    "image": "/uploads/menu/tayfun.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tempura-maki",
    "name": "Темпура Маки",
    "description": "Аппетитный темпура маки по фирменному рецепту PandaBAR: Рис (160 г), Сыр сливочный (10 г), Угорь (20 г), Зеленый лук (10 г), Панировочные сухари (10 г).",
    "ingredientsSummary": "Рис (160 г), Сыр сливочный (10 г), Угорь (20 г), Зеленый лук (10 г), Панировочные сухари (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 10,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-eel",
        "name": "Угорь копченый Унаги",
        "amount": 20,
        "unit": "г",
        "costEstimate": 39
      },
      {
        "id": "ing-misc",
        "name": "Зеленый лук",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-panko",
        "name": "Сухари Панко",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 575,
    "oldPrice": null,
    "weight": 300,
    "pieces": 8,
    "image": "/uploads/menu/tempura_maki.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tempura-chiz",
    "name": "Темпура Чиз",
    "description": "Аппетитный темпура чиз по фирменному рецепту PandaBAR: Рис (140 г), Сыр сливочный (25 г), Сыр хохланд (10 г), Панировочные сухари (10 г).",
    "ingredientsSummary": "Рис (140 г), Сыр сливочный (25 г), Сыр хохланд (10 г), Панировочные сухари (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр Hochland",
        "amount": 10,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-panko",
        "name": "Сухари Панко",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 375,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/tempura_chiz.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tibo",
    "name": "Тибо",
    "description": "Аппетитный тибо по фирменному рецепту PandaBAR: Рис (140 г), Сыр сливочный (20 г), Огурец (20 г), Икра Масаго (10 г).",
    "ingredientsSummary": "Рис (140 г), Сыр сливочный (20 г), Огурец (20 г), Икра Масаго (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-masago",
        "name": "Икра Масаго Orange",
        "amount": 10,
        "unit": "г",
        "costEstimate": 14
      }
    ],
    "price": 370,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/tibo.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tomaga-tempura",
    "name": "Томага Темпура",
    "description": "Аппетитный томага темпура по фирменному рецепту PandaBAR: Рис (140 г), Соивочный сыр (10 г), Лосось (10 г), Омлет (20 г), Кляр (10 г).",
    "ingredientsSummary": "Рис (140 г), Соивочный сыр (10 г), Лосось (10 г), Омлет (20 г), Кляр (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-misc",
        "name": "Соивочный сыр",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 10,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-misc",
        "name": "Омлет",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-misc",
        "name": "Кляр",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 440,
    "oldPrice": null,
    "weight": 230,
    "pieces": 8,
    "image": "/uploads/menu/tomaga-tempura.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tori-tempura",
    "name": "Тори Темпура",
    "description": "Аппетитный тори темпура по фирменному рецепту PandaBAR: Рис (150 г), Куриное филе (15 г), Огурец (15 г), Панировочные сухари (10 г).",
    "ingredientsSummary": "Рис (150 г), Куриное филе (15 г), Огурец (15 г), Панировочные сухари (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-chicken",
        "name": "Филе цыпленка",
        "amount": 15,
        "unit": "г",
        "costEstimate": 6
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      },
      {
        "id": "ing-panko",
        "name": "Сухари Панко",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 270,
    "oldPrice": null,
    "weight": 230,
    "pieces": 8,
    "image": "/uploads/menu/tori-tempura.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tortilya-s-kuritsej",
    "name": "Тортилья с курицей",
    "description": "Аппетитный тортилья с курицей по фирменному рецепту PandaBAR: Тортилья (70 г), Сыр сливочный (30 г), Куриное филе (20 г), Огурец (20 г), Томат (20 г), Лист салата (20 г).",
    "ingredientsSummary": "Тортилья (70 г), Сыр сливочный (30 г), Куриное филе (20 г), Огурец (20 г), Томат (20 г), Лист салата (20 г)",
    "ingredients": [
      {
        "id": "ing-misc",
        "name": "Тортилья",
        "amount": 70,
        "unit": "г",
        "costEstimate": 24
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 30,
        "unit": "г",
        "costEstimate": 20
      },
      {
        "id": "ing-chicken",
        "name": "Филе цыпленка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Томат",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-misc",
        "name": "Лист салата",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      }
    ],
    "price": 415,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/tortilya-s-kuritsej.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tortilya-tsezar",
    "name": "Тортилья Цезарь",
    "description": "Аппетитный тортилья цезарь по фирменному рецепту PandaBAR: Тортилья (70 г), Сыр сливочный (30 г), Куриное филе (30 г), Томат (30 г), Соус цезарь (30 г), Панировочные сухари (10 г).",
    "ingredientsSummary": "Тортилья (70 г), Сыр сливочный (30 г), Куриное филе (30 г), Томат (30 г), Соус цезарь (30 г), Панировочные сухари (10 г)",
    "ingredients": [
      {
        "id": "ing-misc",
        "name": "Тортилья",
        "amount": 70,
        "unit": "г",
        "costEstimate": 24
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 30,
        "unit": "г",
        "costEstimate": 20
      },
      {
        "id": "ing-chicken",
        "name": "Филе цыпленка",
        "amount": 30,
        "unit": "г",
        "costEstimate": 13
      },
      {
        "id": "ing-misc",
        "name": "Томат",
        "amount": 30,
        "unit": "г",
        "costEstimate": 10
      },
      {
        "id": "ing-sauces",
        "name": "Соус Цезарь",
        "amount": 30,
        "unit": "г",
        "costEstimate": 11
      },
      {
        "id": "ing-panko",
        "name": "Сухари Панко",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 410,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/tortilya-tsezar.webp",
    "category": "tempura-rolls",
    "tags": [
      "Хит"
    ],
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-unagi-maki",
    "name": "Унаги Маки",
    "description": "Аппетитный унаги маки по фирменному рецепту PandaBAR: Рис (80 г), Угорь (20 г), Огурец (10 г), Кунжут (5 г).",
    "ingredientsSummary": "Рис (80 г), Угорь (20 г), Огурец (10 г), Кунжут (5 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 80,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-eel",
        "name": "Угорь копченый Унаги",
        "amount": 20,
        "unit": "г",
        "costEstimate": 39
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-misc",
        "name": "Кунжут",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      }
    ],
    "price": 270,
    "oldPrice": null,
    "weight": 150,
    "pieces": 6,
    "image": "/uploads/menu/unagi-maki.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-filadelfiya",
    "name": "Филадельфия",
    "description": "Аппетитный филадельфия по фирменному рецепту PandaBAR: Рис (160 г), Сыр сливочный (60 г), Лосось (20 г).",
    "ingredientsSummary": "Рис (160 г), Сыр сливочный (60 г), Лосось (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 60,
        "unit": "г",
        "costEstimate": 41
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 695,
    "oldPrice": null,
    "weight": 300,
    "pieces": 8,
    "image": "/uploads/menu/filadelfiya.webp",
    "category": "classic-rolls",
    "tags": [
      "Хит"
    ],
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-filadelfiya-lajt",
    "name": "Филадельфия Лайт",
    "description": "Аппетитный филадельфия лайт по фирменному рецепту PandaBAR: Рис (150 г), Сыр сливочный (30 г), Огурец (20 г), Лосось (10 г).",
    "ingredientsSummary": "Рис (150 г), Сыр сливочный (30 г), Огурец (20 г), Лосось (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 30,
        "unit": "г",
        "costEstimate": 20
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 10,
        "unit": "г",
        "costEstimate": 18
      }
    ],
    "price": 575,
    "oldPrice": null,
    "weight": 300,
    "pieces": 8,
    "image": "/uploads/menu/filadelfiya-lajt.webp",
    "category": "classic-rolls",
    "tags": [
      "Хит"
    ],
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-filadelfiya-pikantnaya",
    "name": "Филадельфия Пикантная",
    "description": "Аппетитный филадельфия пикантная по фирменному рецепту PandaBAR: Рис (160 г), Сыр сливочный (40 г), Лук (20 г), Лосось (20 г).",
    "ingredientsSummary": "Рис (160 г), Сыр сливочный (40 г), Лук (20 г), Лосось (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 40,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-misc",
        "name": "Лук",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 460,
    "oldPrice": null,
    "weight": 250,
    "pieces": 8,
    "image": "/uploads/menu/filadelfiya-pikantnaya.webp",
    "category": "classic-rolls",
    "tags": [
      "Хит",
      "Острое"
    ],
    "spicy": true,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-filadelfiya-s-avokado",
    "name": "Филадельфия с авокадо",
    "description": "Аппетитный филадельфия с авокадо по фирменному рецепту PandaBAR: Рис (160 г), Сыр сливочный (50 г), Лосось (15 г), Авокадо (15 г).",
    "ingredientsSummary": "Рис (160 г), Сыр сливочный (50 г), Лосось (15 г), Авокадо (15 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 50,
        "unit": "г",
        "costEstimate": 34
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 15,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-avocado",
        "name": "Авокадо Hass",
        "amount": 15,
        "unit": "г",
        "costEstimate": 13
      }
    ],
    "price": 620,
    "oldPrice": null,
    "weight": 280,
    "pieces": 8,
    "image": "/uploads/menu/filadelfiya-s-avokado.webp",
    "category": "classic-rolls",
    "tags": [
      "Хит"
    ],
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-filadelfiya-s-ogurtsom",
    "name": "Филадельфия с огурцом",
    "description": "Аппетитный филадельфия с огурцом по фирменному рецепту PandaBAR: Рис (160 г), Сыр сливочный (40 г), Огурец (20 г), Лосось (20 г).",
    "ingredientsSummary": "Рис (160 г), Сыр сливочный (40 г), Огурец (20 г), Лосось (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 40,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 620,
    "oldPrice": null,
    "weight": 280,
    "pieces": 8,
    "image": "/uploads/menu/filadelfiya-s-ogurtsom.webp",
    "category": "classic-rolls",
    "tags": [
      "Хит"
    ],
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-filadelfiya-tempura",
    "name": "Филадельфия Темпура",
    "description": "Аппетитный филадельфия темпура по фирменному рецепту PandaBAR: Рис (160 г), Сыр сливочный (50 г), Лосось (20 г), Панировочные сухари (10 г).",
    "ingredientsSummary": "Рис (160 г), Сыр сливочный (50 г), Лосось (20 г), Панировочные сухари (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 50,
        "unit": "г",
        "costEstimate": 34
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-panko",
        "name": "Сухари Панко",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 695,
    "oldPrice": null,
    "weight": 300,
    "pieces": 8,
    "image": "/uploads/menu/filadelfiya-tempura.webp",
    "category": "tempura-rolls",
    "tags": [
      "Хит"
    ],
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-fudzi-yama",
    "name": "Фудзи-Яма",
    "description": "Аппетитный фудзи-яма по фирменному рецепту PandaBAR: Рис (140 г), Сыр сливочный (20 г), Лосось (20 г), Крабовая шапочка (20 г).",
    "ingredientsSummary": "Рис (140 г), Сыр сливочный (20 г), Лосось (20 г), Крабовая шапочка (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 20,
        "unit": "г",
        "costEstimate": 17
      }
    ],
    "price": 530,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/fudzi-yama.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-khigumi",
    "name": "Хигуми",
    "description": "Аппетитный хигуми по фирменному рецепту PandaBAR: Рис (140 г), Сыр сливочный (20 г), Креветка (20 г), Огурец (10 г), Угорь (10 г).",
    "ingredientsSummary": "Рис (140 г), Сыр сливочный (20 г), Креветка (20 г), Огурец (10 г), Угорь (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-eel",
        "name": "Угорь копченый Унаги",
        "amount": 10,
        "unit": "г",
        "costEstimate": 20
      }
    ],
    "price": 620,
    "oldPrice": null,
    "weight": 300,
    "pieces": 8,
    "image": "/uploads/menu/khigumi.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-khokku",
    "name": "Хокку",
    "description": "Аппетитный хокку по фирменному рецепту PandaBAR: Рис (150 г), Куриное филе (20 г), Лист салата (20 г), Сыр сливочный (10 г), Шапочка из сыра и майонеза (20 г).",
    "ingredientsSummary": "Рис (150 г), Куриное филе (20 г), Лист салата (20 г), Сыр сливочный (10 г), Шапочка из сыра и майонеза (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-chicken",
        "name": "Филе цыпленка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-misc",
        "name": "Лист салата",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 10,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-misc",
        "name": "Шапочка из сыра и майонеза",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      }
    ],
    "price": 410,
    "oldPrice": null,
    "weight": 260,
    "pieces": 8,
    "image": "/uploads/menu/khokku.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tsezar",
    "name": "Цезарь",
    "description": "Аппетитный цезарь по фирменному рецепту PandaBAR: Рис (160 г), Куриное филе (20 г), Огурец (20 г), Томат (20 г), Болгар перец (20 г), Лист салата (5 г), Соус цезарь (5 г).",
    "ingredientsSummary": "Рис (160 г), Куриное филе (20 г), Огурец (20 г), Томат (20 г), Болгар перец (20 г), Лист салата (5 г), Соус цезарь (5 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-chicken",
        "name": "Филе цыпленка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Томат",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-misc",
        "name": "Болгар перец",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-misc",
        "name": "Лист салата",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-sauces",
        "name": "Соус Цезарь",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      }
    ],
    "price": 420,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/tsezar.webp",
    "category": "classic-rolls",
    "tags": [
      "Хит"
    ],
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-shef-roll",
    "name": "Шеф Ролл",
    "description": "Аппетитный шеф ролл по фирменному рецепту PandaBAR: Рис (160 г), Креветка (20 г), Огурец (20 г), Икра Масаго (10 г), Снежный краб (20 г).",
    "ingredientsSummary": "Рис (160 г), Креветка (20 г), Огурец (20 г), Икра Масаго (10 г), Снежный краб (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-masago",
        "name": "Икра Масаго Orange",
        "amount": 10,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 20,
        "unit": "г",
        "costEstimate": 17
      }
    ],
    "price": 485,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/shef-roll.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-shitake-zapechennyj",
    "name": "Шитаке запеченный",
    "description": "Аппетитный шитаке запеченный по фирменному рецепту PandaBAR: .",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 450,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/shitake-zapechennyj.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-ebi",
    "name": "Эби",
    "description": "Аппетитный эби по фирменному рецепту PandaBAR: Рис (150 г), Креветка (20 г), Сыр сливочный (20 г), Икра Масаго (10 г).",
    "ingredientsSummary": "Рис (150 г), Креветка (20 г), Сыр сливочный (20 г), Икра Масаго (10 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-masago",
        "name": "Икра Масаго Orange",
        "amount": 10,
        "unit": "г",
        "costEstimate": 14
      }
    ],
    "price": 420,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/ebi.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-yamato",
    "name": "Ямато",
    "description": "Аппетитный ямато по фирменному рецепту PandaBAR: Рис (160 г), Креветка жаренная (20 г), Огурец (20 г), Икра Масаго (10 г), Шапочка из сыра и соуса спайс (20 г).",
    "ingredientsSummary": "Рис (160 г), Креветка жаренная (20 г), Огурец (20 г), Икра Масаго (10 г), Шапочка из сыра и соуса спайс (20 г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-masago",
        "name": "Икра Масаго Orange",
        "amount": 10,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-misc",
        "name": "Шапочка из сыра и соуса спайс",
        "amount": 20,
        "unit": "г",
        "costEstimate": 7
      }
    ],
    "price": 475,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/yamato.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-barbekyu-25-sm",
    "name": "Барбекю 25 см",
    "description": "Тесто 400 гр., Соус барбекю 40 гр., Охотничьи колбаски 20 гр., Курица 25 гр., Сыр моцарелла 75 гр., Шампиньоны 15 гр",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Бекон и ветчина (50г), Куриное филе (40г), Соус Барбекю (40г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-bacon",
        "name": "Бекон и ветчина",
        "amount": 50,
        "unit": "г",
        "costEstimate": 45
      },
      {
        "id": "ing-chicken",
        "name": "Куриное филе",
        "amount": 40,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-bbq-sauce",
        "name": "Соус Барбекю",
        "amount": 40,
        "unit": "г",
        "costEstimate": 16
      }
    ],
    "price": 480,
    "oldPrice": null,
    "weight": 450,
    "pieces": 8,
    "image": "/uploads/menu/pizza-barbekyu-25-sm.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-gavajskaya-25-sm-krasnyj-sous",
    "name": "гавайская 25 см (красный соус)",
    "description": "Тесто 400 гр., Соус красный 40 гр., Моцарелла 80 гр., Ветчина 60 гр., Ананасы 50 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Куриное филе запеченное (60г), Ананасы консервированные (50г), Томатный соус (40г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-chicken",
        "name": "Куриное филе запеченное",
        "amount": 60,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-pineapple",
        "name": "Ананасы консервированные",
        "amount": 50,
        "unit": "г",
        "costEstimate": 20
      },
      {
        "id": "ing-tomato-sauce",
        "name": "Томатный соус",
        "amount": 40,
        "unit": "г",
        "costEstimate": 12
      }
    ],
    "price": 520,
    "oldPrice": null,
    "weight": 470,
    "pieces": 8,
    "image": "/uploads/menu/pizza-gavajskaya-25-sm-krasnyj-sous.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-gavajskaya-25-smbelyj-sous",
    "name": "гавайская 25 см(белый соус)",
    "description": "Тесто 400 гр., Соус белый 60 гр., Моцарелла 80 гр., Ветчина 60 гр., Ананасы 50 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Куриное филе запеченное (60г), Ананасы консервированные (50г), Томатный соус (40г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-chicken",
        "name": "Куриное филе запеченное",
        "amount": 60,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-pineapple",
        "name": "Ананасы консервированные",
        "amount": 50,
        "unit": "г",
        "costEstimate": 20
      },
      {
        "id": "ing-tomato-sauce",
        "name": "Томатный соус",
        "amount": 40,
        "unit": "г",
        "costEstimate": 12
      }
    ],
    "price": 520,
    "oldPrice": null,
    "weight": 470,
    "pieces": 8,
    "image": "/uploads/menu/pizza-gavajskaya-25-smbelyj-sous.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-detskaya-25-sm",
    "name": "Детская 25 см",
    "description": "Тесто 400 гр., Соус белый 40 гр., Сыр моцарелла 75 гр., Ветчина 40 гр., Сыр креметта 60 гр",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Фирменный соус для пиццы (50г), Томаты свежие (40г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-tomato-sauce",
        "name": "Фирменный соус для пиццы",
        "amount": 50,
        "unit": "г",
        "costEstimate": 15
      },
      {
        "id": "ing-tomato",
        "name": "Томаты свежие",
        "amount": 40,
        "unit": "г",
        "costEstimate": 12
      }
    ],
    "price": 400,
    "oldPrice": null,
    "weight": 410,
    "pieces": 8,
    "image": "/uploads/menu/pizza-detskaya-25-sm.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-karbonara-25-smbelyj-sous",
    "name": "карбонара 25 см(белый соус)",
    "description": "Тесто 200 гр., Соус белый 60 гр., Моцарелла 80 гр., Бекон 45 гр., Ветчина 40 гр., Пармезан 8 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Бекон в/к (60г), Сливочный соус Ранч (50г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-bacon",
        "name": "Бекон в/к",
        "amount": 60,
        "unit": "г",
        "costEstimate": 50
      },
      {
        "id": "ing-cream-sauce",
        "name": "Сливочный соус Ранч",
        "amount": 50,
        "unit": "г",
        "costEstimate": 18
      }
    ],
    "price": 520,
    "oldPrice": null,
    "weight": 430,
    "pieces": 8,
    "image": "/uploads/menu/pizza-karbonara-25-smbelyj-sous.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-karbonara-25-smkrasnyj-sous",
    "name": "карбонара 25 см(красный соус)",
    "description": "Тесто 200 гр., Соус красный 40 гр., Моцарелла 80 гр., Бекон 45 гр., Ветчина 40 гр., Пармезан 8 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Бекон в/к (60г), Сливочный соус Ранч (50г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-bacon",
        "name": "Бекон в/к",
        "amount": 60,
        "unit": "г",
        "costEstimate": 50
      },
      {
        "id": "ing-cream-sauce",
        "name": "Сливочный соус Ранч",
        "amount": 50,
        "unit": "г",
        "costEstimate": 18
      }
    ],
    "price": 520,
    "oldPrice": null,
    "weight": 430,
    "pieces": 8,
    "image": "/uploads/menu/pizza-karbonara-25-smkrasnyj-sous.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-meksikanskaya-25sm",
    "name": "Мексиканская 25см",
    "description": "Тесто 400 гр., Соус 35 гр., Сыр моцарелла 75 гр., Охотничьи колбаски 20 гр., Пепперони 10 гр., Лук красный 15 гр., Курица жареная 20 гр., Огурцы корнишоны 10 гр., Халапеньо 10 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Фирменный соус для пиццы (50г), Томаты свежие (40г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-tomato-sauce",
        "name": "Фирменный соус для пиццы",
        "amount": 50,
        "unit": "г",
        "costEstimate": 15
      },
      {
        "id": "ing-tomato",
        "name": "Томаты свежие",
        "amount": 40,
        "unit": "г",
        "costEstimate": 12
      }
    ],
    "price": 420,
    "oldPrice": null,
    "weight": 250,
    "pieces": 8,
    "image": "https://pandabar.su/uploads/posts/2026-03/1772714752_meksikanskaja.png",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-myasnaya-25-smbelyj-sous",
    "name": "мясная 25 см(белый соус)",
    "description": "Тесто 400 гр., Соус белый 60 гр., Моцарелла 80 гр., Бекон 30 гр., Ветчина 30 гр., Пепперони 25 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Бекон и ветчина (50г), Куриное филе (40г), Соус Барбекю (40г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-bacon",
        "name": "Бекон и ветчина",
        "amount": 50,
        "unit": "г",
        "costEstimate": 45
      },
      {
        "id": "ing-chicken",
        "name": "Куриное филе",
        "amount": 40,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-bbq-sauce",
        "name": "Соус Барбекю",
        "amount": 40,
        "unit": "г",
        "costEstimate": 16
      }
    ],
    "price": 630,
    "oldPrice": null,
    "weight": 450,
    "pieces": 8,
    "image": "/uploads/menu/pizza-myasnaya-25-smbelyj-sous.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-myasnaya-25-smkrasnyj-sous",
    "name": "мясная 25 см(красный соус)",
    "description": "Тесто 400 гр., Соус красный 40 гр., Моцарелла 80 гр., Бекон 30 гр., Ветчина 30 гр., Пепперони 25 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Бекон и ветчина (50г), Куриное филе (40г), Соус Барбекю (40г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-bacon",
        "name": "Бекон и ветчина",
        "amount": 50,
        "unit": "г",
        "costEstimate": 45
      },
      {
        "id": "ing-chicken",
        "name": "Куриное филе",
        "amount": 40,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-bbq-sauce",
        "name": "Соус Барбекю",
        "amount": 40,
        "unit": "г",
        "costEstimate": 16
      }
    ],
    "price": 630,
    "oldPrice": null,
    "weight": 450,
    "pieces": 8,
    "image": "/uploads/menu/pizza-myasnaya-25-smkrasnyj-sous.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-pepperoni-25-smkrasnyj-sous",
    "name": "пепперони 25 см(красный соус)",
    "description": "Тесто 400 гр., Соус красный 40 гр., Моцарелла 80 гр., Пепперони 40 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Колбаски Пепперони с/к (60г), Томатный соус Mutti (50г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-pepperoni",
        "name": "Колбаски Пепперони с/к",
        "amount": 60,
        "unit": "г",
        "costEstimate": 55
      },
      {
        "id": "ing-tomato-sauce",
        "name": "Томатный соус Mutti",
        "amount": 50,
        "unit": "г",
        "costEstimate": 15
      }
    ],
    "price": 480,
    "oldPrice": null,
    "weight": 430,
    "pieces": 8,
    "image": "/uploads/menu/pizza-pepperoni-25-smkrasnyj-sous.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-pepperoni-25-smbelyj-sous",
    "name": "пепперони 25 см(белый соус)",
    "description": "Тесто 400 гр., Соус белый 60 гр., Моцарелла 80 гр., Пепперони 40 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Колбаски Пепперони с/к (60г), Томатный соус Mutti (50г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-pepperoni",
        "name": "Колбаски Пепперони с/к",
        "amount": 60,
        "unit": "г",
        "costEstimate": 55
      },
      {
        "id": "ing-tomato-sauce",
        "name": "Томатный соус Mutti",
        "amount": 50,
        "unit": "г",
        "costEstimate": 15
      }
    ],
    "price": 480,
    "oldPrice": null,
    "weight": 430,
    "pieces": 8,
    "image": "/uploads/menu/pizza-pepperoni-25-smbelyj-sous.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-tom-yam-35-sm",
    "name": "том ям 35 см",
    "description": "Тесто 600 гр., Моцарелла 130 гр., Кокос. молоко 40 гр., Паста том-ям 40 гр., Креветка вар. 50 гр., Черри 40 гр., Шампиньоны 35 гр., Кальмар 35 гр., Шрирача 25 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Фирменный соус для пиццы (50г), Томаты свежие (40г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-tomato-sauce",
        "name": "Фирменный соус для пиццы",
        "amount": 50,
        "unit": "г",
        "costEstimate": 15
      },
      {
        "id": "ing-tomato",
        "name": "Томаты свежие",
        "amount": 40,
        "unit": "г",
        "costEstimate": 12
      }
    ],
    "price": 780,
    "oldPrice": null,
    "weight": 410,
    "pieces": 8,
    "image": "/uploads/menu/pizza-tom-yam-35-sm.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-tsezar-25-smbelyj-sous",
    "name": "цезарь 25 см(белый соус)",
    "description": "Тесто 400 гр., Соус белый 60 гр., Моцарелла 80 гр., Курица 40 гр., Черри 20 гр., Салат 15 гр., Соус Цезарь 15 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Куриное филе гриль (60г), Томаты Черри (40г), Соус Цезарь (40г), Листья Айсберг (20г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-chicken",
        "name": "Куриное филе гриль",
        "amount": 60,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-tomato",
        "name": "Томаты Черри",
        "amount": 40,
        "unit": "г",
        "costEstimate": 15
      },
      {
        "id": "ing-caesar-sauce",
        "name": "Соус Цезарь",
        "amount": 40,
        "unit": "г",
        "costEstimate": 16
      },
      {
        "id": "ing-salad",
        "name": "Листья Айсберг",
        "amount": 20,
        "unit": "г",
        "costEstimate": 8
      }
    ],
    "price": 420,
    "oldPrice": null,
    "weight": 200,
    "pieces": 8,
    "image": "https://pandabar.su/uploads/posts/2025-12/1765267073_cezar.png",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-chetyre-syra-25-smbelyj-sous",
    "name": "четыре сыра 25 см(белый соус)",
    "description": "Тесто 400 гр., Соус белый 60 гр., Моцарелла 60 гр., Гауда 20 гр., Дор-блю 10 гр., Пармезан 20 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Сыр Пармезан & Дор Блю (50г), Сыр Гауда (40г), Сливочный соус (40г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр Пармезан & Дор Блю",
        "amount": 50,
        "unit": "г",
        "costEstimate": 65
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр Гауда",
        "amount": 40,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-cream-sauce",
        "name": "Сливочный соус",
        "amount": 40,
        "unit": "г",
        "costEstimate": 15
      }
    ],
    "price": 500,
    "oldPrice": null,
    "weight": 450,
    "pieces": 8,
    "image": "/uploads/menu/pizza-chetyre-syra-25-smbelyj-sous.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-pizza-chetyre-syra-25-smkrasnyj-sous",
    "name": "четыре сыра 25 см(красный соус)",
    "description": "Тесто 400 гр., Соус красный 40 гр., Моцарелла 60 гр., Гауда 20 гр., Дор-блю 10 гр., Пармезан 20 гр.",
    "ingredientsSummary": "Тесто для пиццы 25/30см (220г), Сыр Моцарелла для пиццы (100г), Сыр Пармезан & Дор Блю (50г), Сыр Гауда (40г), Сливочный соус (40г)",
    "ingredients": [
      {
        "id": "ing-flour",
        "name": "Тесто для пиццы 25/30см",
        "amount": 220,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-mozzarella",
        "name": "Сыр Моцарелла для пиццы",
        "amount": 100,
        "unit": "г",
        "costEstimate": 70
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр Пармезан & Дор Блю",
        "amount": 50,
        "unit": "г",
        "costEstimate": 65
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр Гауда",
        "amount": 40,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-cream-sauce",
        "name": "Сливочный соус",
        "amount": 40,
        "unit": "г",
        "costEstimate": 15
      }
    ],
    "price": 500,
    "oldPrice": null,
    "weight": 450,
    "pieces": 8,
    "image": "/uploads/menu/pizza-chetyre-syra-25-smkrasnyj-sous.webp",
    "category": "pizza",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sets-set-pikantnyj-new",
    "name": "сет пикантный NEW",
    "description": "небраска сурими, ямато, осака",
    "ingredientsSummary": "Рис Shinaki (480г), Креветка тигровая (40г), Огурец свежий (40г), Сырный соус с масаго (50г), Икра Масаго (10г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 480,
        "unit": "г",
        "costEstimate": 87
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 40,
        "unit": "г",
        "costEstimate": 54
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 40,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сырный соус с масаго",
        "amount": 50,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-masago-orange",
        "name": "Икра Масаго",
        "amount": 10,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 20,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-spicy",
        "name": "Соус Спайси",
        "amount": 10,
        "unit": "г",
        "costEstimate": 6
      }
    ],
    "price": 1000,
    "oldPrice": null,
    "weight": 660,
    "pieces": 32,
    "image": "/uploads/menu/sets-set-pikantnyj-new.webp",
    "category": "sets",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sets-set-tempuro",
    "name": "сет темпуро",
    "description": "сумо, сурими темпура, нагасаки, осака, омуро",
    "ingredientsSummary": "Рис Shinaki (600г), Лосось охл. Мурманск (35г), Панировочные сухари Panko (30г), Сыр сливочный Cremette (40г), Огурец свежий (50г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 600,
        "unit": "г",
        "costEstimate": 108
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 35,
        "unit": "г",
        "costEstimate": 65
      },
      {
        "id": "ing-tempura",
        "name": "Панировочные сухари Panko",
        "amount": 30,
        "unit": "г",
        "costEstimate": 12
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 40,
        "unit": "г",
        "costEstimate": 31
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 50,
        "unit": "г",
        "costEstimate": 10
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 15,
        "unit": "г",
        "costEstimate": 13
      },
      {
        "id": "ing-spicy",
        "name": "Соус Спайси",
        "amount": 10,
        "unit": "г",
        "costEstimate": 6
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      }
    ],
    "price": 1550,
    "oldPrice": null,
    "weight": 1000,
    "pieces": 32,
    "image": "/uploads/menu/sets-set-tempuro.webp",
    "category": "sets",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sets-set-premium",
    "name": "сет премиум",
    "description": "онигара, калифорния, филадельфия с угрем, филадельфия лайт, темпура чиз",
    "ingredientsSummary": "Рис Shinaki (750г), Сыр сливочный Cremette (150г), Лосось охл. Мурманск (30г), Огурец свежий (30г), Угорь копченый Унаги (25г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 750,
        "unit": "г",
        "costEstimate": 135
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 150,
        "unit": "г",
        "costEstimate": 102
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 30,
        "unit": "г",
        "costEstimate": 56
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 30,
        "unit": "г",
        "costEstimate": 6
      },
      {
        "id": "ing-eel",
        "name": "Угорь копченый Унаги",
        "amount": 25,
        "unit": "г",
        "costEstimate": 49
      },
      {
        "id": "ing-unagi",
        "name": "Соус Унаги",
        "amount": 10,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-sesame",
        "name": "Кунжут белый",
        "amount": 10,
        "unit": "г",
        "costEstimate": 6
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 20,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-masago-orange",
        "name": "Икра Масаго оранжевая",
        "amount": 10,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-shrimp",
        "name": "Жаренная креветка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-salad",
        "name": "Лист салата",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-kimchi",
        "name": "Соус Кимчи",
        "amount": 5,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 1850,
    "oldPrice": null,
    "weight": 1000,
    "pieces": 32,
    "image": "/uploads/menu/sets-set-premium.webp",
    "category": "sets",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sets-set-trio",
    "name": "сет трио",
    "description": "каппа маки, лава маки, филадельфия",
    "ingredientsSummary": "Рис Shinaki (390г), Сыр сливочный Cremette (60г), Лосось охл. Мурманск (50г), Огурец свежий (40г), Соус Лава фирменный (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 390,
        "unit": "г",
        "costEstimate": 71
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 60,
        "unit": "г",
        "costEstimate": 41
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 50,
        "unit": "г",
        "costEstimate": 92
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 40,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-mayo",
        "name": "Соус Лава фирменный",
        "amount": 20,
        "unit": "г",
        "costEstimate": 12
      },
      {
        "id": "ing-sesame",
        "name": "Кунжут белый",
        "amount": 10,
        "unit": "г",
        "costEstimate": 6
      }
    ],
    "price": 1050,
    "oldPrice": null,
    "weight": 550,
    "pieces": 32,
    "image": "/uploads/menu/sets-set-trio.webp",
    "category": "sets",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sets-girlyanda-set",
    "name": "Гирлянда сет",
    "description": "филадельфия лайт, тибо, салмон, бонита, мексика, сумо, асама, сидней, тайфун",
    "ingredientsSummary": "Рис Shinaki (1190г), Сыр сливочный Cremette (140г), Лосось охл. Мурманск (120г), Огурец свежий (90г), Стружка тунца (5г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 1190,
        "unit": "г",
        "costEstimate": 214
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 140,
        "unit": "г",
        "costEstimate": 96
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 120,
        "unit": "г",
        "costEstimate": 223
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 90,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-misc",
        "name": "Стружка тунца",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-masago-orange",
        "name": "Икра Масаго оранжевая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 36
      },
      {
        "id": "ing-tempura",
        "name": "Панировочные сухари Panko",
        "amount": 30,
        "unit": "г",
        "costEstimate": 12
      },
      {
        "id": "ing-sesame",
        "name": "Кунжут",
        "amount": 10,
        "unit": "г",
        "costEstimate": 6
      },
      {
        "id": "ing-tomato",
        "name": "Томат свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      }
    ],
    "price": 2850,
    "oldPrice": null,
    "weight": 1700,
    "pieces": 32,
    "image": "/uploads/menu/sets-girlyanda-set.webp",
    "category": "sets",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sets-set-prazdnichnyj",
    "name": "сет праздничный",
    "description": "акиро, филадельфия с огурцом, мексика, калифорния, канадский, ясай, макао, фудзи-яма, асама , авокадо сан, онигара, онтарио чикен",
    "ingredientsSummary": "Рис Shinaki (920г), Сыр сливочный Cremette (170г), Лосось охл. Мурманск (65г), Огурец свежий (70г), Снежный краб (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 920,
        "unit": "г",
        "costEstimate": 166
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 170,
        "unit": "г",
        "costEstimate": 116
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 65,
        "unit": "г",
        "costEstimate": 120
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 70,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 20,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-masago-orange",
        "name": "Икра Масаго оранжевая",
        "amount": 20,
        "unit": "г",
        "costEstimate": 36
      },
      {
        "id": "ing-tempura",
        "name": "Панировочные сухари Panko",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-eel",
        "name": "Угорь копченый Унаги",
        "amount": 5,
        "unit": "г",
        "costEstimate": 10
      },
      {
        "id": "ing-shrimp",
        "name": "Жаренная креветка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-salad",
        "name": "Лист салата",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-sesame",
        "name": "Кунжут",
        "amount": 5,
        "unit": "г",
        "costEstimate": 3
      },
      {
        "id": "ing-kimchi",
        "name": "Соус Кимчи",
        "amount": 5,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 3950,
    "oldPrice": null,
    "weight": 2200,
    "pieces": 32,
    "image": "/uploads/menu/sets-set-prazdnichnyj.webp",
    "category": "sets",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sets-chiken-set",
    "name": "чикен сет",
    "description": "чикен спайс, сезам, хокку, небраска чикен",
    "ingredientsSummary": "Рис Shinaki (580г), Филе куриное су-вид (70г), Сыр сливочный (40г), Соус Спайси (25г), Лист салата (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 580,
        "unit": "г",
        "costEstimate": 104
      },
      {
        "id": "ing-chicken",
        "name": "Филе куриное су-вид",
        "amount": 70,
        "unit": "г",
        "costEstimate": 32
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный",
        "amount": 40,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-spicy",
        "name": "Соус Спайси",
        "amount": 25,
        "unit": "г",
        "costEstimate": 15
      },
      {
        "id": "ing-salad",
        "name": "Лист салата",
        "amount": 20,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-mayo",
        "name": "Сырно-майонезная шапочка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 10
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 35,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл.",
        "amount": 15,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-sesame",
        "name": "Кунжут белый и черный",
        "amount": 10,
        "unit": "г",
        "costEstimate": 6
      }
    ],
    "price": 900,
    "oldPrice": null,
    "weight": 750,
    "pieces": 32,
    "image": "https://pandabar.su/uploads/posts/2025-03/medium/1743426210_chiken-set.jpg",
    "category": "sets",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sets-banzaj-set",
    "name": "банзай сет",
    "description": "филадельфия лайт, сяке маки, сафари, фута",
    "ingredientsSummary": "Рис Shinaki (690г), Сыр сливочный Cremette (110г), Лосось охл. Мурманск (50г), Огурец свежий (50г), Креветка тигровая (45г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 690,
        "unit": "г",
        "costEstimate": 124
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 110,
        "unit": "г",
        "costEstimate": 75
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 50,
        "unit": "г",
        "costEstimate": 93
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 50,
        "unit": "г",
        "costEstimate": 10
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 45,
        "unit": "г",
        "costEstimate": 61
      },
      {
        "id": "ing-sesame",
        "name": "Кунжут",
        "amount": 10,
        "unit": "г",
        "costEstimate": 6
      },
      {
        "id": "ing-mayo",
        "name": "Сырно-майонезная шапочка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 10
      },
      {
        "id": "ing-tempura",
        "name": "Кляр темпура",
        "amount": 15,
        "unit": "г",
        "costEstimate": 6
      }
    ],
    "price": 1200,
    "oldPrice": null,
    "weight": 740,
    "pieces": 32,
    "image": "/uploads/menu/sets-banzaj-set.webp",
    "category": "sets",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sets-set-santori",
    "name": "Сет Сантори",
    "description": "Филадельфия Лайт, Филадельфия с угрем, Томаго Темпура, Запеченный с креветками, Чераси, Запеченный с мидиями, Томаго Лава",
    "ingredientsSummary": "Рис Shinaki (740г), Сыр сливочный Cremette (140г), Лосось охл. Мурманск (40г), Огурец свежий (40г), Угорь копченый Унаги (25г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 740,
        "unit": "г",
        "costEstimate": 133
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 140,
        "unit": "г",
        "costEstimate": 95
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 40,
        "unit": "г",
        "costEstimate": 75
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 40,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-eel",
        "name": "Угорь копченый Унаги",
        "amount": 25,
        "unit": "г",
        "costEstimate": 49
      },
      {
        "id": "ing-unagi",
        "name": "Соус Унаги",
        "amount": 10,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-sesame",
        "name": "Кунжут белый",
        "amount": 5,
        "unit": "г",
        "costEstimate": 3
      },
      {
        "id": "ing-tamago",
        "name": "Японский омлет Тамаго",
        "amount": 40,
        "unit": "г",
        "costEstimate": 24
      },
      {
        "id": "ing-tomato",
        "name": "Томаты свежие",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-mayo",
        "name": "Шапка Лава фирменная",
        "amount": 20,
        "unit": "г",
        "costEstimate": 12
      },
      {
        "id": "ing-tempura",
        "name": "Кляр и панировка Panko",
        "amount": 10,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 2880,
    "oldPrice": null,
    "weight": 1090,
    "pieces": 32,
    "image": "https://pandabar.su/uploads/posts/2026-03/1772717408_set-santori.png",
    "category": "sets",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sets-zapechyonnyj-ebi-set",
    "name": "Запечённый эби сет",
    "description": "Эби ролл, Гункан запеченый с креветкой, Гункан запеченый с креветкой острый",
    "ingredientsSummary": "Рис Shinaki (290г), Сыр сливочный Cremette (50г), Огурец свежий (30г), Лосось охл. Мурманск (10г), Снежный краб (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 290,
        "unit": "г",
        "costEstimate": 52
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 50,
        "unit": "г",
        "costEstimate": 34
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 30,
        "unit": "г",
        "costEstimate": 6
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 10,
        "unit": "г",
        "costEstimate": 19
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 20,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-masago-orange",
        "name": "Икра Масаго оранжевая",
        "amount": 10,
        "unit": "г",
        "costEstimate": 18
      }
    ],
    "price": 810,
    "oldPrice": null,
    "weight": 420,
    "pieces": 32,
    "image": "/uploads/menu/sets-zapechyonnyj-ebi-set.webp",
    "category": "sets",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sets-agato-set",
    "name": "агато сет",
    "description": "филадельфия лайт 2шт, гурман, тануки, хокку",
    "ingredientsSummary": "Рис Shinaki (760г), Сыр сливочный Cremette (145г), Лосось охл. Мурманск (55г), Огурец свежий (50г), Курица маринованная (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 760,
        "unit": "г",
        "costEstimate": 137
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 145,
        "unit": "г",
        "costEstimate": 99
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 55,
        "unit": "г",
        "costEstimate": 102
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 50,
        "unit": "г",
        "costEstimate": 10
      },
      {
        "id": "ing-chicken",
        "name": "Курица маринованная",
        "amount": 20,
        "unit": "г",
        "costEstimate": 9
      },
      {
        "id": "ing-salad",
        "name": "Лист салата",
        "amount": 20,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-mayo",
        "name": "Сырно-майонезная шапочка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 10
      },
      {
        "id": "ing-eel",
        "name": "Угорь копченый",
        "amount": 20,
        "unit": "г",
        "costEstimate": 39
      },
      {
        "id": "ing-unagi",
        "name": "Соус Унаги",
        "amount": 10,
        "unit": "г",
        "costEstimate": 8
      }
    ],
    "price": 1750,
    "oldPrice": null,
    "weight": 1000,
    "pieces": 2,
    "image": "/uploads/menu/sets-agato-set.webp",
    "category": "sets",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sets-fejerverk-set",
    "name": "фейерверк сет",
    "description": "филадельфия с огурцом, бонита, лава маки, сумо, сидней",
    "ingredientsSummary": "Рис Shinaki (920г), Сыр сливочный Cremette (110г), Лосось охл. Мурманск (130г), Огурец свежий (60г), Стружка тунца (5г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 920,
        "unit": "г",
        "costEstimate": 166
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 110,
        "unit": "г",
        "costEstimate": 75
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 130,
        "unit": "г",
        "costEstimate": 240
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 60,
        "unit": "г",
        "costEstimate": 12
      },
      {
        "id": "ing-misc",
        "name": "Стружка тунца",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-mayo",
        "name": "Соус Лава фирменный",
        "amount": 20,
        "unit": "г",
        "costEstimate": 12
      },
      {
        "id": "ing-tempura",
        "name": "Панировочные сухари Panko",
        "amount": 20,
        "unit": "г",
        "costEstimate": 8
      },
      {
        "id": "ing-tomato",
        "name": "Томат свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      }
    ],
    "price": 1750,
    "oldPrice": null,
    "weight": 1030,
    "pieces": 32,
    "image": "/uploads/menu/sets-fejerverk-set.webp",
    "category": "sets",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-tajskie-gnyozda",
    "name": "Тайские гнёзда",
    "description": "Креветки 5 гр, Сыр Гауда 5 гр, Кремета 5гр, Краб 5гр, Огурец 5гр, Панировка 10гр, соус Унаги",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 585,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-tajskie-gnyozda.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-chukka-maki",
    "name": "чукка маки",
    "description": "маринованные водоросли *хияши вакаме*",
    "ingredientsSummary": "Рис Shinaki (80г), Салат Чука (30г), Ореховый соус (10г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 80,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-chuka",
        "name": "Салат Чука",
        "amount": 30,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-nut-sauce",
        "name": "Ореховый соус",
        "amount": 10,
        "unit": "г",
        "costEstimate": 9
      }
    ],
    "price": 175,
    "oldPrice": null,
    "weight": 160,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-chukka-maki.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-chiken-spajs",
    "name": "чикен спайс",
    "description": "маринованная курица, соус спайс",
    "ingredientsSummary": "Рис Shinaki (140г), Курица сочная су-вид (30г), Огурец свежий (20г), Соус Спайси (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-chicken",
        "name": "Курица сочная су-вид",
        "amount": 30,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-spicy",
        "name": "Соус Спайси",
        "amount": 15,
        "unit": "г",
        "costEstimate": 9
      }
    ],
    "price": 190,
    "oldPrice": null,
    "weight": 245,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-chiken-spajs.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-surimi-spajs",
    "name": "сурими спайс",
    "description": "краб-сурими, острый соус спайс",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 195,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-surimi-spajs.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-avokado-maki",
    "name": "авокадо маки",
    "description": "авокадо",
    "ingredientsSummary": "Рис Shinaki (80г), Авокадо Hass (30г), Кунжут (5г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 80,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-avocado",
        "name": "Авокадо Hass",
        "amount": 30,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-sesame",
        "name": "Кунжут",
        "amount": 5,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 200,
    "oldPrice": null,
    "weight": 155,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-avokado-maki.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-tomato-maki",
    "name": "томато маки",
    "description": "сыр фетаки, помидор",
    "ingredientsSummary": "Рис Shinaki (80г), Сыр Фетаки (30г), Помидор свежий (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 80,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-cheese-fetaki",
        "name": "Сыр Фетаки",
        "amount": 30,
        "unit": "г",
        "costEstimate": 18
      },
      {
        "id": "ing-tomato",
        "name": "Помидор свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      }
    ],
    "price": 215,
    "oldPrice": null,
    "weight": 170,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-tomato-maki.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-fetaki-roll",
    "name": "фетаки ролл",
    "description": "сыр фетаки, огурец, томат, укроп.",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 565,
    "oldPrice": null,
    "weight": 300,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-fetaki-roll.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-sezam",
    "name": "сезам",
    "description": "огурец, маринованная курица, кунжут белый",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный (20г), Лосось охл. (15г), Огурец (15г), Кунжут белый и черный (10г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл.",
        "amount": 15,
        "unit": "г",
        "costEstimate": 28
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      },
      {
        "id": "ing-sesame",
        "name": "Кунжут белый и черный",
        "amount": 10,
        "unit": "г",
        "costEstimate": 6
      }
    ],
    "price": 220,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-sezam.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-syake-kunsej-maki",
    "name": "сяке кунсей маки",
    "description": "копченный лосось",
    "ingredientsSummary": "Рис Shinaki (80г), Огурец / Начинка (20г), Кунжут (10г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 80,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 6
      },
      {
        "id": "ing-sesame",
        "name": "Кунжут",
        "amount": 10,
        "unit": "г",
        "costEstimate": 6
      }
    ],
    "price": 230,
    "oldPrice": null,
    "weight": 150,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-syake-kunsej-maki.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-yasaj",
    "name": "ясай",
    "description": "овощной ролл из томатов, огурца, болгарского перца, листа салата и сыра фетаки",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 320,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-yasaj.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-kaliforniya",
    "name": "калифорния",
    "description": "краб-сурими, огурец, авокадо, майонез, икра масаго",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (20г), Снежный краб (20г), Огурец свежий (10г), Икра Масаго оранжевая (10г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-crab",
        "name": "Снежный краб",
        "amount": 20,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 10,
        "unit": "г",
        "costEstimate": 2
      },
      {
        "id": "ing-masago-orange",
        "name": "Икра Масаго оранжевая",
        "amount": 10,
        "unit": "г",
        "costEstimate": 18
      }
    ],
    "price": 459,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "https://pandabar.su/uploads/posts/2025-03/medium/1742383836_kalifornija-1.jpg",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-tomago-lava",
    "name": "Томаго лава",
    "description": "130 гр риса., омлет 20гр., томаты 20 гр., огурец 20 гр., шапка лава",
    "ingredientsSummary": "Рис Shinaki (130г), Японский омлет Тамаго (20г), Томаты свежие (20г), Огурец свежий (20г), Шапка Лава фирменная (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 130,
        "unit": "г",
        "costEstimate": 23
      },
      {
        "id": "ing-tamago",
        "name": "Японский омлет Тамаго",
        "amount": 20,
        "unit": "г",
        "costEstimate": 12
      },
      {
        "id": "ing-tomato",
        "name": "Томаты свежие",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-mayo",
        "name": "Шапка Лава фирменная",
        "amount": 20,
        "unit": "г",
        "costEstimate": 12
      }
    ],
    "price": 370,
    "oldPrice": null,
    "weight": 250,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-tomago-lava.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-ovapa",
    "name": "овapa",
    "description": "копченый лосось, огурец, сливочный сыр, обсыпан кунжутом",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 370,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-ovapa.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-bonita-chiken",
    "name": "бонита чикен",
    "description": "маринованная курица, бекон, сливочный сыр, зелёный лук; в стружке тунца",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (10г), Лосось охл. Мурманск (20г), Огурец свежий (20г), Стружка тунца (5г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 10,
        "unit": "г",
        "costEstimate": 7
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-misc",
        "name": "Стружка тунца",
        "amount": 5,
        "unit": "г",
        "costEstimate": 2
      }
    ],
    "price": 430,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "https://pandabar.su/uploads/posts/2025-03/medium/1742367130_bonita-chiken.jpeg",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-amaj",
    "name": "амай",
    "description": "копченая семга, сыр фета, помидор, ролл завернут в блинчик томаго",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 360,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-amaj.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-zapechyonnye-s-midiyami",
    "name": "Запечённые с мидиями",
    "description": "рис 130гр ., лосось 20 гр ., сыр 20гр",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 370,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "https://pandabar.su/uploads/posts/2026-03/1772726503_zapechennyj-s-midijami.png",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-gurman",
    "name": "гурман",
    "description": "копченый лосось, сливочный сыр, огурец, икра масаго",
    "ingredientsSummary": "Рис Shinaki (150г), Лосось охл. (25г), Сливочный сыр (25г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл.",
        "amount": 25,
        "unit": "г",
        "costEstimate": 46
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сливочный сыр",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 390,
    "oldPrice": null,
    "weight": 255,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-gurman.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-shitaki-zapechennyj",
    "name": "Шитаки запеченный",
    "description": "130гр рис, 1 лист нори, 20 гр сыр, 20 гр курица, 10 гр помидор, 5 гр лист салата, 25 гр- грибы Шитаки, 40 гр сырная шапка белая. Сверху поливается унаги соусом",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 330,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-shitaki-zapechennyj.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": false
  },
  {
    "id": "item-classic-rolls-avokado-san",
    "name": "авокадо сан",
    "description": "лосось, авокадо, сливочный сыр, кунжут",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 390,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-avokado-san.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-tori-botakon",
    "name": "тори ботакон",
    "description": "В беконе; маринованная курица, сливочный сыр, огурец, соус спайси(острый)",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 360,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-tori-botakon.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-tortilya-s-lososem",
    "name": "тортилья с лососем",
    "description": "Тортилья, копчёный лосось, сливочный сыр, огурец, томат, лист салата",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 380,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-tortilya-s-lososem.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-tanuki",
    "name": "тануки",
    "description": "лосось, свежий огурец, икра масаго, болгарский перец",
    "ingredientsSummary": "Рис Shinaki (150г), Угорь копченый (20г), Сыр сливочный (20г), Огурец (15г), Соус Унаги (10г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-eel",
        "name": "Угорь копченый",
        "amount": 20,
        "unit": "г",
        "costEstimate": 39
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      },
      {
        "id": "ing-unagi",
        "name": "Соус Унаги",
        "amount": 10,
        "unit": "г",
        "costEstimate": 8
      }
    ],
    "price": 380,
    "oldPrice": null,
    "weight": 255,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-tanuki.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-in-yan",
    "name": "инь-ян",
    "description": "свежий огурец, лосось",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 360,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-in-yan.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-shakhmaty",
    "name": "шахматы",
    "description": "креветка, сливочный сыр, огурец, икра масаго, кунжут черный",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 390,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-shakhmaty.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-khitoshi",
    "name": "хитоши",
    "description": "жареный лосось,сливочный сыр, соус спайс(острый)",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 480,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-khitoshi.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-sakuro",
    "name": "сакуро",
    "description": "ЗАПЕЧЁННЫЙ. Жаренный лосось, зеленый лук, шапочка из сыра и майонеза, полит соусом унаги",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 390,
    "oldPrice": null,
    "weight": 255,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-sakuro.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-zapechyonnyj-bekon",
    "name": "запечённый бекон",
    "description": "ЗАПЕЧЁННЫЙ. В беконе, под нежной сырной шапочкой с соусом унаги; маринованная курица, сливочный сыр, зеленый лук",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 390,
    "oldPrice": null,
    "weight": 260,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-zapechyonnyj-bekon.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-lava-maki",
    "name": "лава маки",
    "description": "лосось, огурец, сверху соус из сливочного сыра, икры масаго",
    "ingredientsSummary": "Рис Shinaki (160г), Лосось охл. Мурманск (30г), Огурец свежий (20г), Соус Лава фирменный (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 30,
        "unit": "г",
        "costEstimate": 55
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец свежий",
        "amount": 20,
        "unit": "г",
        "costEstimate": 4
      },
      {
        "id": "ing-mayo",
        "name": "Соус Лава фирменный",
        "amount": 20,
        "unit": "г",
        "costEstimate": 12
      }
    ],
    "price": 530,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "https://pandabar.su/uploads/posts/2025-03/medium/1742046726_lava-maki.jpeg",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-kranch-roll",
    "name": "Кранч ролл",
    "description": "рис 140., 2 шт жареных креветки ., помидоры 20гр ., сыр творожный ., в кранч луке",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 480,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-kranch-roll.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-tamaga-tempura",
    "name": "Тамага темпура",
    "description": "рис 130 ., 20гр сыра ., 20 лосося ., 20 омлета",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 370,
    "oldPrice": null,
    "weight": 255,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-tamaga-tempura.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-okinava-unagi",
    "name": "окинава унаги",
    "description": "сливочный сыр, огурец; сверху угорь в соусе спайси(острый); полит соусом унаги",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 440,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-okinava-unagi.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-filadelfiya-tempuro-make",
    "name": "филадельфия темпуро маке",
    "description": "ЖАРЕНЫЙ. Лосось, сыр",
    "ingredientsSummary": "Рис Shinaki (160г), Сыр сливочный Cremette (60г), Лосось охл. Мурманск (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 60,
        "unit": "г",
        "costEstimate": 41
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 615,
    "oldPrice": null,
    "weight": 280,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-filadelfiya-tempuro-make.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-ikigaj",
    "name": "икигай",
    "description": "Лосось, огурец; шапочка - сливочный сыр и капли соуса унаги",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 430,
    "oldPrice": null,
    "weight": 260,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-ikigaj.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-filadelfiya-s-ugrem",
    "name": "филадельфия с угрем",
    "description": "угорь, сливочный сыр, сверху соус унадон, белый кунжут",
    "ingredientsSummary": "Рис Shinaki (160г), Сыр сливочный Cremette (60г), Лосось охл. Мурманск (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 160,
        "unit": "г",
        "costEstimate": 29
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 60,
        "unit": "г",
        "costEstimate": 41
      },
      {
        "id": "ing-salmon",
        "name": "Лосось охл. Мурманск",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 655,
    "oldPrice": null,
    "weight": 280,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-filadelfiya-s-ugrem.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-classic-rolls-panda",
    "name": "панда",
    "description": "Обёрнут угрём; внутри - креветка, лосось, сливочный сыр; сверху - майонез(5 гр), соус терияки(5 гр), лепестки миндаля",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 450,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/classic-rolls-panda.webp",
    "category": "classic-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tempura-rolls-kaigan",
    "name": "каиган",
    "description": "лосось, креветка, огурец, острый соус спайс",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 430,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/tempura-rolls-kaigan.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tempura-rolls-omuro",
    "name": "омуро",
    "description": "жаренный, угорь, огурец,соус унаги",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 420,
    "oldPrice": null,
    "weight": 290,
    "pieces": 8,
    "image": "/uploads/menu/tempura-rolls-omuro.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tempura-rolls-gold",
    "name": "голд",
    "description": "лосось, креветка, острый соус спайс, огурец, обернут в блинчик томаго",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 475,
    "oldPrice": null,
    "weight": 300,
    "pieces": 8,
    "image": "/uploads/menu/tempura-rolls-gold.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tempura-rolls-sansi",
    "name": "санси",
    "description": "сливочный сыр, лосось, водоросли чука",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 415,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/tempura-rolls-sansi.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tempura-rolls-futa",
    "name": "фута",
    "description": "маринованная курица,томат",
    "ingredientsSummary": "Рис Shinaki (150г), Креветка тигровая (25г), Сливочный сыр (20г), Кляр темпура (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 150,
        "unit": "г",
        "costEstimate": 27
      },
      {
        "id": "ing-shrimp",
        "name": "Креветка тигровая",
        "amount": 25,
        "unit": "г",
        "costEstimate": 34
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сливочный сыр",
        "amount": 20,
        "unit": "г",
        "costEstimate": 14
      },
      {
        "id": "ing-tempura",
        "name": "Кляр темпура",
        "amount": 15,
        "unit": "г",
        "costEstimate": 6
      }
    ],
    "price": 295,
    "oldPrice": null,
    "weight": 230,
    "pieces": 8,
    "image": "/uploads/menu/tempura-rolls-futa.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tempura-rolls-verona",
    "name": "верона",
    "description": "блин, томат, лист салата, перец болгарский",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 240,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/tempura-rolls-verona.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tempura-rolls-kapa-tempura",
    "name": "капа темпура",
    "description": "огурец,кунжут,сыр.",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 225,
    "oldPrice": null,
    "weight": 240,
    "pieces": 8,
    "image": "/uploads/menu/tempura-rolls-kapa-tempura.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tempura-rolls-khokkajdo",
    "name": "хоккайдо",
    "description": "сливочный сыр,огурец, икра масаго",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 295,
    "oldPrice": null,
    "weight": 230,
    "pieces": 8,
    "image": "/uploads/menu/tempura-rolls-khokkajdo.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-tempura-rolls-ginga",
    "name": "гинга",
    "description": "копченый лосось, помидор, огурец",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 390,
    "oldPrice": null,
    "weight": 260,
    "pieces": 8,
    "image": "/uploads/menu/tempura-rolls-ginga.webp",
    "category": "tempura-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sushi-masago",
    "name": "масаго",
    "description": "икра масаго",
    "ingredientsSummary": "Рис Shinaki (30г), Лосось / Начинка гункана (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 30,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка гункана",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 90,
    "oldPrice": null,
    "weight": 50,
    "pieces": null,
    "image": "/uploads/menu/sushi-masago.webp",
    "category": "sushi",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sushi-syake-spajs",
    "name": "сяке-спайс",
    "description": "лосось с острым соусом спайс",
    "ingredientsSummary": "Рис Shinaki (30г), Лосось / Начинка гункана (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 30,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка гункана",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 120,
    "oldPrice": null,
    "weight": 50,
    "pieces": null,
    "image": "/uploads/menu/sushi-syake-spajs.webp",
    "category": "sushi",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sushi-unagi-spajs",
    "name": "унаги-спайс",
    "description": "угорь с острым соусом спайс",
    "ingredientsSummary": "Рис Shinaki (30г), Лосось / Начинка гункана (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 30,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка гункана",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 145,
    "oldPrice": null,
    "weight": 50,
    "pieces": null,
    "image": "/uploads/menu/sushi-unagi-spajs.webp",
    "category": "sushi",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sushi-chuka",
    "name": "чука",
    "description": "водоросли чука",
    "ingredientsSummary": "Рис Shinaki (30г), Лосось / Начинка гункана (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 30,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка гункана",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 50,
    "oldPrice": null,
    "weight": 50,
    "pieces": null,
    "image": "/uploads/menu/sushi-chuka.webp",
    "category": "sushi",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sushi-ebi-spajs",
    "name": "эби-спайс",
    "description": "креветки с острым соусом спайс",
    "ingredientsSummary": "Рис Shinaki (30г), Лосось / Начинка гункана (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 30,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка гункана",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 95,
    "oldPrice": null,
    "weight": 50,
    "pieces": null,
    "image": "/uploads/menu/sushi-ebi-spajs.webp",
    "category": "sushi",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sushi-syake",
    "name": "сяке",
    "description": "лосось",
    "ingredientsSummary": "Рис Shinaki (30г), Лосось / Начинка гункана (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 30,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка гункана",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 110,
    "oldPrice": null,
    "weight": 50,
    "pieces": null,
    "image": "https://pandabar.su/uploads/posts/2025-03/medium/1743427125_sjake-sushi.jpg",
    "category": "sushi",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sushi-unagi",
    "name": "унаги",
    "description": "угорь, соус унаги, кунжут",
    "ingredientsSummary": "Рис Shinaki (30г), Лосось / Начинка гункана (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 30,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка гункана",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 440,
    "oldPrice": null,
    "weight": 200,
    "pieces": null,
    "image": "https://pandabar.su/uploads/posts/2019-04/medium/unagi.jpg",
    "category": "sushi",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sushi-ebi",
    "name": "эби",
    "description": "креветка",
    "ingredientsSummary": "Рис Shinaki (30г), Лосось / Начинка гункана (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 30,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка гункана",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 110,
    "oldPrice": null,
    "weight": 50,
    "pieces": null,
    "image": "https://pandabar.su/uploads/posts/2019-04/medium/jebi.jpg",
    "category": "sushi",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-sushi-zapechyonnye-midii",
    "name": "Запечённые мидии",
    "description": "Под белой шапкой., Мидии 5 шт., Сыр Гауда 50 гр., Сыр Пармезан 20 гр., Майонез 50 гр., Лук запечённый 5 гр",
    "ingredientsSummary": "Рис Shinaki (30г), Лосось / Начинка гункана (20г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 30,
        "unit": "г",
        "costEstimate": 5
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка гункана",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      }
    ],
    "price": 430,
    "oldPrice": null,
    "weight": 50,
    "pieces": null,
    "image": "/uploads/menu/sushi-zapechyonnye-midii.webp",
    "category": "baked-rolls",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-desserts-chizkejk-new-york",
    "name": "чизкейк NEW-YORK",
    "description": "Малиновый топпинг",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 190,
    "oldPrice": null,
    "weight": 200,
    "pieces": null,
    "image": "/uploads/menu/desserts-chizkejk-new-york.webp",
    "category": "desserts",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-dopolnitelno-kartofel-fristandart",
    "name": "картофель фри(стандарт)",
    "description": "картофель фри(стандарт) — фирменное блюдо доставки PandaBAR.",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 120,
    "oldPrice": null,
    "weight": 200,
    "pieces": null,
    "image": "/uploads/menu/dopolnitelno-kartofel-fristandart.webp",
    "category": "dopolnitelno",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-dopolnitelno-sous-quotspajsiquot",
    "name": "соус &quot;Спайси&quot;",
    "description": "соус &quot;Спайси&quot; — фирменное блюдо доставки PandaBAR.",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 35,
    "oldPrice": null,
    "weight": 200,
    "pieces": null,
    "image": "/uploads/menu/dopolnitelno-sous-quotspajsiquot.webp",
    "category": "dopolnitelno",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-dopolnitelno-sous-quottsezarquot",
    "name": "соус «Цезарь»",
    "description": "соус «Цезарь» — фирменное блюдо доставки PandaBAR.",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 420,
    "oldPrice": null,
    "weight": 200,
    "pieces": null,
    "image": "/uploads/menu/dopolnitelno-sous-quottsezarquot.webp",
    "category": "dopolnitelno",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  },
  {
    "id": "item-dopolnitelno-tri-sousa",
    "name": "Три соуса",
    "description": "Цезарь , спайс и кисло-сладкий",
    "ingredientsSummary": "Рис Shinaki (140г), Сыр сливочный Cremette (25г), Лосось / Начинка (20г), Огурец (15г)",
    "ingredients": [
      {
        "id": "ing-rice",
        "name": "Рис Shinaki",
        "amount": 140,
        "unit": "г",
        "costEstimate": 25
      },
      {
        "id": "ing-cheese-cremette",
        "name": "Сыр сливочный Cremette",
        "amount": 25,
        "unit": "г",
        "costEstimate": 17
      },
      {
        "id": "ing-salmon",
        "name": "Лосось / Начинка",
        "amount": 20,
        "unit": "г",
        "costEstimate": 37
      },
      {
        "id": "ing-cucumber",
        "name": "Огурец",
        "amount": 15,
        "unit": "г",
        "costEstimate": 3
      }
    ],
    "price": 105,
    "oldPrice": null,
    "weight": 200,
    "pieces": null,
    "image": "/uploads/menu/dopolnitelno-tri-sousa.webp",
    "category": "dopolnitelno",
    "tags": null,
    "spicy": false,
    "vegetarian": false,
    "inStock": true
  }
];

export const PROMO_CODES: PromoCode[] = [
  { code: 'PANDA10', discountType: 'percent', discountValue: 10, minOrderAmount: 1000, description: 'Скидка 10% на заказы от 1000 ₽' },
  { code: 'PANDA15', discountType: 'percent', discountValue: 15, minOrderAmount: 2000, description: 'Скидка 15% на заказы от 2000 ₽' },
  { code: 'WELCOME', discountType: 'fixed', discountValue: 200, minOrderAmount: 1200, description: 'Скидка 200 ₽ на первый заказ от 1200 ₽' },
  { code: 'PARTY', discountType: 'fixed', discountValue: 500, minOrderAmount: 3500, description: 'Скидка 500 ₽ на праздничный заказ от 3500 ₽' },
  { code: 'ROLL', discountType: 'percent', discountValue: 20, minOrderAmount: 2500, description: 'Скидка 20% на большие заказы от 2500 ₽' }
];

export const DEFAULT_WAREHOUSE_STOCK: WarehouseIngredient[] = [
  { id: 'ing-salmon', name: 'Лосось охл. Мурманск', stock: 25000, currentStock: 25000, minThreshold: 5000, unit: 'г', costPerUnit: 1.85, category: 'fish', categoryLabel: 'Рыба и морепродукты', supplier: 'СеверРыбТорг', lastRestocked: Date.now() - 86400000 },
  { id: 'ing-rice', name: 'Рис Shinaki премиум', stock: 80000, currentStock: 80000, minThreshold: 15000, unit: 'г', costPerUnit: 0.18, category: 'groceries', categoryLabel: 'Крупы и бакалея', supplier: 'АзияФуд Импорт', lastRestocked: Date.now() - 172800000 },
  { id: 'ing-cheese-cremette', name: 'Сыр сливочный Cremette', stock: 18000, currentStock: 18000, minThreshold: 4000, unit: 'г', costPerUnit: 0.68, category: 'dairy', categoryLabel: 'Молочная продукция', supplier: 'Хорека Центр', lastRestocked: Date.now() - 86400000 },
  { id: 'ing-nori', name: 'Водоросли Нори Gold', stock: 500, currentStock: 500, minThreshold: 100, unit: 'лист', costPerUnit: 4.50, category: 'groceries', categoryLabel: 'Крупы и бакалея', supplier: 'АзияФуд Импорт', lastRestocked: Date.now() - 259200000 },
  { id: 'ing-cucumber', name: 'Огурцы свежие корнишоны', stock: 12000, currentStock: 12000, minThreshold: 3000, unit: 'г', costPerUnit: 0.20, category: 'vegetables', categoryLabel: 'Овощи и зелень', supplier: 'АгроОвощ', lastRestocked: Date.now() - 43200000 },
  { id: 'ing-eel', name: 'Угорь копченый Унаги', stock: 8000, currentStock: 8000, minThreshold: 2000, unit: 'г', costPerUnit: 1.95, category: 'fish', categoryLabel: 'Рыба и морепродукты', supplier: 'СеверРыбТорг', lastRestocked: Date.now() - 172800000 },
  { id: 'ing-shrimp', name: 'Креветка тигровая 21/25', stock: 10000, currentStock: 10000, minThreshold: 2500, unit: 'г', costPerUnit: 1.35, category: 'fish', categoryLabel: 'Рыба и морепродукты', supplier: 'СеверРыбТорг', lastRestocked: Date.now() - 86400000 },
  { id: 'ing-crab', name: 'Снежный краб (сурими премиум)', stock: 14000, currentStock: 14000, minThreshold: 3000, unit: 'г', costPerUnit: 0.85, category: 'fish', categoryLabel: 'Рыба и морепродукты', supplier: 'Хорека Центр', lastRestocked: Date.now() - 172800000 },
  { id: 'ing-avocado', name: 'Авокадо Hass', stock: 6000, currentStock: 6000, minThreshold: 1500, unit: 'г', costPerUnit: 0.95, category: 'vegetables', categoryLabel: 'Овощи и зелень', supplier: 'АгроОвощ', lastRestocked: Date.now() - 43200000 },
  { id: 'ing-masago-orange', name: 'Икра Масаго оранжевая', stock: 4000, currentStock: 4000, minThreshold: 1000, unit: 'г', costPerUnit: 1.80, category: 'fish', categoryLabel: 'Рыба и морепродукты', supplier: 'Хорека Центр', lastRestocked: Date.now() - 259200000 },
  { id: 'ing-flour', name: 'Тесто для пиццы 25/30см', stock: 45000, currentStock: 45000, minThreshold: 10000, unit: 'г', costPerUnit: 0.12, category: 'groceries', categoryLabel: 'Крупы и бакалея', supplier: 'Хорека Центр', lastRestocked: Date.now() - 86400000 },
  { id: 'ing-mozzarella', name: 'Сыр Моцарелла для пиццы', stock: 22000, currentStock: 22000, minThreshold: 5000, unit: 'г', costPerUnit: 0.70, category: 'dairy', categoryLabel: 'Молочная продукция', supplier: 'Хорека Центр', lastRestocked: Date.now() - 86400000 }
];

export const DEFAULT_OPEX: OperationalExpenses = {
  rentMonthly: 65000,
  salariesMonthly: 220000,
  utilitiesMonthly: 25000,
  marketingMonthly: 35000,
  otherMonthly: 10000,
  rentPerMonth: 65000,
  salariesPerMonth: 220000,
  utilitiesPerMonth: 25000,
  marketingPerMonth: 35000,
  packagingPerOrder: 45,
  acquiringFeePercent: 1.8,
  deliveryCostPerOrder: 150
};


