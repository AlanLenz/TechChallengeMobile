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
  {
    // Dependency Rule (docs/architecture/clean-architecture.md): domain e application só
    // dependem de si mesmos e de libs puras — nunca de UI, infraestrutura ou frameworks.
    // Repetimos o padrão do Firebase porque "no-restricted-imports" não mescla entre blocos.
    files: ['src/modules/*/domain/**/*.{ts,tsx}', 'src/modules/*/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['/firebase', '/firebase/*'], message: 'Domínio/aplicação não conhecem o SDK do Firebase.' },
            {
              group: [
                '**/infrastructure/**',
                '**/presentation/**',
                '**/container',
                '**/constants',
                '@/firebase/*',
                '@/contexts/*',
                '@/components/*',
                '@/layouts/*',
                '@/lib/*',
                '@/services/*',
                'react',
                'react-native*',
                'expo*',
                '@expo/*',
                '@tanstack/*',
                'nativewind',
              ],
              message: 'Domínio/aplicação não podem depender de presentation, infraestrutura ou frameworks.',
            },
          ],
        },
      ],
    },
  },
  {
    // Presentation fala com o domínio/aplicação; a implementação concreta entra via container.ts.
    files: ['src/modules/*/presentation/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['/firebase', '/firebase/*'], message: 'Importe o SDK do Firebase só dentro de src/firebase/*.' },
            {
              group: ['@/firebase/*', '**/infrastructure/**'],
              message: 'Presentation não acessa infraestrutura diretamente — use o container do module.',
            },
          ],
        },
      ],
    },
  },
]);
