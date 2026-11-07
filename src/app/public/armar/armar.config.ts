export type ArmarPortion = {
  id: string;
  label: string;
  multiplier: number;
};

export type ArmarOption = {
  id: string;
  name: string;
  price: number;
  separated?: boolean;
};

export type ArmarGroup = {
  id: string;
  title: string;
  hint?: string;
  selection: 'single' | 'multiple';
  portions?: ArmarPortion[];
  options: ArmarOption[];
};

export type ArmarConfig = {
  title: string;
  subtitle: string;
  themeClass: string;
  groups: ArmarGroup[];
};

const PORTIONS_100_200: ArmarPortion[] = [
  { id: '100', label: '100 g', multiplier: 1 },
  { id: '200', label: '200 g', multiplier: 2 },
];

// Precios transcriptos de la planilla "Tu sándwich, tus reglas" (Las Cañitas).
// 200 g duplica el precio de 100 g.
const GRANPASO: ArmarConfig = {
  title: 'Tu sándwich, tus reglas',
  subtitle: 'Elegí, combiná, disfrutá.',
  themeClass: 'armar-theme-granpaso',
  groups: [
    {
      id: 'panes',
      title: 'Panes',
      hint: 'Tamaño 22,5 cm, salvo focaccia y croissant.',
      selection: 'single',
      options: [
        { id: 'pan-frances', name: 'Pan francés', price: 990 },
        { id: 'pan-integral', name: 'Pan integral', price: 1990 },
        { id: 'brioche', name: 'Brioche', price: 2990 },
        { id: 'masa-madre', name: 'Masa madre', price: 2990 },
        { id: 'focaccia', name: 'Focaccia 10 × 8 cm', price: 1990, separated: true },
        { id: 'croissant', name: 'Croissant', price: 2990 },
      ],
    },
    {
      id: 'fiambres',
      title: 'Fiambres x100 g',
      hint: 'Súper 100 g. Súper mega 200 g.',
      selection: 'multiple',
      portions: PORTIONS_100_200,
      options: [
        { id: 'jamon-cocido', name: 'Jamón cocido (Casona)', price: 2990 },
        { id: 'jamon-natural', name: 'Jamón natural (Casona)', price: 2990 },
        { id: 'jamon-crudo', name: 'Jamón crudo (Lario)', price: 4490 },
        { id: 'mortadela', name: 'Mortadela (Paladini)', price: 1990 },
        { id: 'mortadela-pistacho', name: 'Mortadela con pistacho (Campo Austral)', price: 2490 },
        { id: 'milan', name: 'Milán (Casona)', price: 2990 },
        { id: 'salame', name: 'Salame (Regionales)', price: 2990 },
        { id: 'bondiola', name: 'Bondiola (Lario)', price: 3990 },
        { id: 'lomo', name: 'Lomo a las finas hierbas (Lario)', price: 4490 },
      ],
    },
    {
      id: 'quesos',
      title: 'Quesos x100 g',
      hint: 'Misma porción: 100 g o 200 g.',
      selection: 'multiple',
      portions: PORTIONS_100_200,
      options: [
        { id: 'tybo', name: 'Tybo (Ilolay)', price: 2990 },
        { id: 'gruyere', name: 'Gruyere (Ricolact)', price: 2990 },
        { id: 'morbier', name: 'Morbier (Ricolact)', price: 2990 },
        { id: 'pategras', name: 'Pategrás (Ricolact)', price: 2990 },
        { id: 'barra-ahumado', name: 'Barra ahumado (Don Ángel)', price: 3990 },
      ],
    },
    {
      id: 'topping',
      title: 'Topping',
      selection: 'multiple',
      options: [
        { id: 'lechuga', name: 'Lechuga', price: 490 },
        { id: 'tomate', name: 'Tomate', price: 490 },
        { id: 'zanahoria', name: 'Zanahoria', price: 490 },
        { id: 'rucula', name: 'Rúcula', price: 990 },
        { id: 'tomate-desecado', name: 'Tomate desecado', price: 990 },
        { id: 'pepinillo', name: 'Pepinillo', price: 1990 },
        { id: 'pimientos', name: 'Pimientos', price: 1990 },
        { id: 'hongos', name: 'Hongos', price: 1990 },
      ],
    },
    {
      id: 'aderezos',
      title: 'Aderezos',
      selection: 'multiple',
      options: [
        { id: 'manteca', name: 'Manteca', price: 0 },
        { id: 'mayonesa', name: 'Mayonesa', price: 0 },
        { id: 'ketchup', name: 'Ketchup', price: 0 },
        { id: 'mostaza', name: 'Mostaza', price: 0 },
        { id: 'oliva', name: 'Oliva', price: 490 },
        { id: 'hummus', name: 'Hummus', price: 1990 },
      ],
    },
  ],
};

const ARMAR_CONFIGS: Record<string, ArmarConfig> = {
  granpaso: GRANPASO,
};

export function getArmarConfig(database: string): ArmarConfig | null {
  return ARMAR_CONFIGS[(database || '').toLowerCase()] ?? null;
}
