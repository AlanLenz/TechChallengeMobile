# Tech Challenge Mobile

Aplicação mobile desenvolvida como parte do Tech Challenge da pós-graduação em Engenharia Front-End da FIAP.

O projeto consiste em uma aplicação de controle financeiro pessoal, permitindo que o usuário acompanhe seu saldo, visualize entradas e saídas, consulte estatísticas e gráficos financeiros e gerencie suas transações.

---

## 📱 Tecnologias

O projeto foi desenvolvido utilizando:

* **React Native**
* **Expo**
* **Expo Router**
* **TypeScript**
* **React**
* **NativeWind**
* **Firebase Authentication**
* **Cloud Firestore**
* **React Native Gifted Charts**
* **React Native Animated API**

### Versões principais

* Node.js: `20.20.2`
* Expo: `57.0.18`
* React Native: `0.86.3`
* React: `19.2.3`
* React Native Reanimated: `4.5.1`
* NativeWind: `4.2.6`

---

## 📂 Estrutura do projeto

A aplicação mobile está localizada dentro da pasta `tech-challenge`.

```text
tech-challenge/
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   ├── (modals)/
│   │   └── ...
│   │
│   ├── components/
│   │   ├── feedback/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── constants/
│   │
│   ├── contexts/
│   │
│   ├── modules/
│   │   └── home/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── ...
│   │
│   ├── services/
│   │
│   ├── theme/
│   │
│   └── utils/
│
├── assets/
├── package.json
├── app.json
├── babel.config.js
├── metro.config.js
├── nativewind-env.d.ts
└── tsconfig.json
```

A organização busca separar responsabilidades entre telas, componentes reutilizáveis, módulos de negócio, hooks, contextos, serviços e utilitários.

---

## 🚀 Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

* Node.js
* npm
* Expo CLI / Expo
* Android Studio, caso seja utilizado um emulador Android

Também é possível executar a aplicação utilizando o **Expo Go**, quando compatível com a configuração atual do projeto.

---

## ⚙️ Instalação

Clone o repositório:

```bash
git clone https://github.com/AlanLenz/TechChallengeMobile.git
```

Acesse a pasta do projeto mobile:

```bash
cd TechChallengeMobile/tech-challenge
```

Instale as dependências:

```bash
npm install
```

---

## ▶️ Executando o projeto

Inicie o servidor do Expo:

```bash
npx expo start
```

---

# 🔐 Autenticação

A autenticação da aplicação é realizada utilizando o **Firebase Authentication**.

O fluxo contempla:

* Login do usuário;
* Cadastro de usuário;
* Manutenção da sessão autenticada;
* Encerramento da sessão;
* Proteção das áreas que dependem de autenticação.

O contexto de autenticação centraliza o acesso às informações do usuário e permite que as telas consultem o estado atual da sessão.

---

# 🧭 Navegação

A navegação da aplicação utiliza **Expo Router**.

A estrutura de rotas é organizada por grupos de navegação, incluindo:

* `(tabs)` para as principais áreas da aplicação;
* `(modals)` para fluxos apresentados como modais;
* Rotas específicas para os diferentes fluxos da aplicação.

As rotas utilizadas pela aplicação são centralizadas em constantes para evitar a utilização de strings espalhadas pelo código.

---

# 🏠 Dashboard

A tela principal apresenta um resumo financeiro do usuário.

O Dashboard possui:

* Saldo total;
* Card principal com identificação do usuário;
* Total de entradas;
* Total de saídas;
* Maior despesa;
* Quantidade de transações;
* Gráfico de entradas e despesas;
* Gráfico de distribuição por categoria;
* Lista de transações recentes;
* Botão de ação para adicionar uma nova transação.

A estrutura principal do Dashboard está localizada em:

```text
src/modules/home/
```

---

## 📊 Gráficos

Os gráficos financeiros são apresentados utilizando a biblioteca:

```text
react-native-gifted-charts
```

São utilizados gráficos para representar:

* Comparação entre entradas e despesas;
* Distribuição das despesas por categoria.

A biblioteca também fornece animações próprias para a apresentação dos gráficos.

---

# ✨ Animações

Foram implementadas animações no Dashboard utilizando a API `Animated` do React Native.

As animações foram aplicadas principalmente à entrada dos elementos na tela.

### Hero Card

O card principal utiliza:

* Fade-in;
* Movimento vertical suave.

### Cards de estatísticas

Os cards de:

* Entradas;
* Saídas;
* Maior despesa;
* Transações;

também utilizam uma combinação de:

* Fade-in;
* Movimento vertical suave.

Exemplo da estrutura utilizada:

```tsx
Animated.parallel([
  Animated.timing(opacity, {
    toValue: 1,
    duration: 400,
    useNativeDriver: true,
  }),
  Animated.timing(translateY, {
    toValue: 0,
    duration: 400,
    useNativeDriver: true,
  }),
]).start();
```

A implementação utiliza o `Animated` do próprio React Native, mantendo a animação leve e utilizando o driver nativo quando possível.

---

# 💰 Transações

A aplicação possui fluxo para gerenciamento das transações financeiras do usuário.

O usuário pode acessar o fluxo de criação de uma nova transação através do botão de ação disponível no Dashboard.

O fluxo é apresentado utilizando uma rota modal:

```text
src/app/(modals)/
```

As informações das transações são utilizadas para alimentar os dados apresentados no Dashboard, incluindo:

* Saldo;
* Entradas;
* Despesas;
* Maior despesa;
* Quantidade de transações;
* Gráficos;
* Transações recentes.

---

# 🧩 Componentes reutilizáveis

A aplicação possui componentes reutilizáveis para manter a consistência visual e facilitar a manutenção.

Entre eles estão componentes relacionados a:

* Cards;
* Tipografia;
* Loading;
* Estados vazios;
* Containers;
* Floating Action Button;
* Componentes de interface.

Eles estão organizados principalmente em:

```text
src/components/
```

---

# 🎨 Estilização

A estilização utiliza **NativeWind**, permitindo utilizar classes semelhantes às do Tailwind CSS diretamente nos componentes React Native.

Exemplo:

```tsx
<View className="flex-row gap-3">
  ...
</View>
```

A aplicação também possui uma estrutura de tema para centralizar valores utilizados pela interface.

---

# 🔄 Carregamento e estados

O Dashboard possui tratamento para diferentes estados da requisição dos dados.

### Carregamento

Enquanto os dados estão sendo carregados, é apresentado o componente:

```text
Loading
```

### Dados carregados

Quando os dados são carregados corretamente, o Dashboard apresenta os cards, gráficos e transações recentes.

---

# 🧠 Gerenciamento de dados

A aplicação utiliza hooks específicos para separar a busca e tratamento dos dados utilizados pelas telas.

No Dashboard, o hook responsável pelos dados principais está localizado em:

```text
src/modules/home/hooks/use-home-dashboard.ts
```

Essa separação permite que a tela fique responsável principalmente pela composição da interface, enquanto a lógica de obtenção dos dados permanece isolada.

---

# 🛠️ Utilitários

Funções reutilizáveis ficam organizadas na pasta:

```text
src/utils/
```

Entre os utilitários utilizados pela aplicação estão funções para formatação de valores financeiros e outras regras auxiliares.

Exemplo:

```text
format-currency
```

A utilização desses utilitários evita duplicação de lógica dentro dos componentes.

---

# 📱 Responsividade

A interface foi desenvolvida considerando o uso em dispositivos móveis, utilizando os recursos de layout do React Native e classes do NativeWind.

Os componentes são estruturados utilizando:

* `View`;
* `ScrollView`;
* Flexbox;
* Espaçamentos responsivos;
* Componentes reutilizáveis.

---

# 🧪 Desenvolvimento

Durante o desenvolvimento, a aplicação foi estruturada buscando separar:

```text
Tela
 ↓
Módulo
 ↓
Componentes
 ↓
Hooks / Contextos
 ↓
Serviços
```

Essa organização facilita a manutenção e permite que componentes e regras de negócio sejam reutilizados em diferentes partes da aplicação.

---

# 📦 Principais comandos

Instalar dependências:

```bash
npm install
```

Iniciar o projeto:

```bash
npx expo start
```

Verificar o projeto:

```bash
npx expo doctor
```

---

# 📌 Funcionalidades principais

Atualmente, a aplicação mobile contempla os principais fluxos de:

* [x] Cadastro de usuário
* [x] Login
* [x] Encerramento de sessão
* [x] Dashboard financeiro
* [x] Visualização do saldo
* [x] Visualização de entradas e despesas
* [x] Estatísticas financeiras
* [x] Gráficos financeiros
* [x] Visualização de transações recentes
* [x] Criação de nova transação
* [x] Navegação por tabs

---

# 👥 Projeto


- [@AlanLenz](https://github.com/AlanLenz)
- [@amandaSribeiro](https://github.com/amandaSribeiro)
- [@victorgodoi](https://github.com/victorgodoi)


Projeto desenvolvido como parte do **Tech Challenge — FIAP Pós Tech**, com foco no desenvolvimento de uma aplicação mobile utilizando React Native e Expo.
