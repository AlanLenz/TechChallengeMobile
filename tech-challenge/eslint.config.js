// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const boundaries = require('eslint-plugin-boundaries');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Reforça as regras de acoplamento de docs/architecture.md: um module só é importável
    // através do seu index.tsx (API pública); ninguém fora de src/firebase pode falar com o
    // SDK do Firebase diretamente.
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src/**/*.{ts,tsx}'],
      // Modo "folder" (padrão, por isso omitido): cada pasta casada pelo pattern é UMA
      // instância de elemento — arquivos dentro dela podem se importar livremente entre si
      // (relação "internal"), só quem está fora precisa respeitar o entry-point.
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'module', pattern: 'src/modules/*', capture: ['moduleName'] },
        { type: 'firebase', pattern: 'src/firebase' },
        { type: 'other', pattern: 'src/*' },
      ],
    },
    rules: {
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          policies: [
            { target: ['module'], allow: 'index.{ts,tsx}' },
            // Só "module" tem entry-point restrito — os demais tipos continuam livres.
            { target: ['app', 'firebase', 'other'], allow: '**/*' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/firebase/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // As barras iniciais ancoram o padrão (sintaxe .gitignore via pacote "ignore") —
              // sem elas, "firebase/*" também bateria com "@/firebase/auth", nosso próprio
              // wrapper, que é exatamente o que este import deve poder usar.
              group: ['/firebase', '/firebase/*'],
              message: 'Importe o SDK do Firebase só dentro de src/firebase/*.',
            },
          ],
        },
      ],
    },
  },
  // Regra de dependência (Clean Architecture): domain <- application <- infrastructure/presentation.
  // Cada bloco REDEFINE `no-restricted-imports` (flat config substitui, não mescla), por isso
  // repete o padrão do SDK do Firebase.
  {
    files: ['src/modules/*/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['/firebase', '/firebase/*', '@/firebase', '@/firebase/*'], message: 'Domain não conhece infraestrutura.' },
            { group: ['**/infrastructure/**', '**/application/**', '**/presentation/**', '**/container'], message: 'Domain só depende de si mesmo.' },
            { group: ['react', 'react-native', 'expo', 'expo-*', '@/components/*', '@/contexts/*', '@/hooks/*'], message: 'Domain não depende de framework/UI.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/modules/*/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['/firebase', '/firebase/*', '@/firebase', '@/firebase/*'], message: 'Application depende de ports, não do Firebase.' },
            { group: ['**/infrastructure/**', '**/presentation/**', '**/container'], message: 'Application só depende do domain (ports e entidades).' },
            { group: ['react', 'react-native', 'expo', 'expo-*', '@/components/*', '@/contexts/*', '@/hooks/*'], message: 'Application não depende de framework/UI.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/modules/*/presentation/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['/firebase', '/firebase/*', '@/firebase', '@/firebase/*'], message: 'Presentation fala com use cases, não com o Firebase.' },
            { group: ['**/infrastructure/**'], message: 'Presentation acessa a infraestrutura só via container (use cases).' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/contexts/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['/firebase', '/firebase/*', '@/firebase', '@/firebase/*'], message: 'Contexts usam use cases dos modules, não o Firebase.' },
          ],
        },
      ],
    },
  },
]);
