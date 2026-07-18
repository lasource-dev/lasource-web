---
title: "Prompt Templates dans LangChain : structurer vos prompts"
library: langchain
version: "1.3.13"
python_min: "3.10"
tags: [langchain, prompt, template, chat, few-shot]
lang: fr
updated: 2026-07-17
status: draft
category: concept
explanation: "Les Prompt Templates sont des objets structurés qui génèrent des prompts formatés à partir de variables. ChatPromptTemplate produit des listes de messages (système, humain, assistant) compatibles LCEL."
gotcha: "Les doubles accolades {{ }} échappent le formatage. Si votre prompt contient du JSON, utilisez {{ et }} pour les accolades littérales."
see_also: [langchain-chains-lcel, langchain-output-parsers]
---

# Prompt Templates dans LangChain

## Pourquoi ne pas envoyer des strings directement

On peut techniquement envoyer une chaîne de caractères brute à un modèle. Mais dès qu'on veut injecter des variables, gérer un message système, ajouter des exemples few-shot ou réutiliser le même format dans plusieurs chaînes, les strings deviennent ingérables.

Les Prompt Templates de LangChain résolvent ce problème : ce sont des objets structurés qui génèrent des prompts formatés à partir de variables. Ils s'intègrent nativement dans les chaînes LCEL via l'opérateur `|`.

## ChatPromptTemplate : le template standard

La grande majorité des cas d'usage passent par `ChatPromptTemplate`. Il produit une liste de messages (système, humain, assistant) prêts à être envoyés à un modèle de chat.

```python
from langchain_core.prompts import ChatPromptTemplate

# Template avec message système + message utilisateur
prompt = ChatPromptTemplate.from_messages([
    ("system", "Tu es un expert en {domaine}. Réponds en français."),
    ("human", "{question}"),
])

# Formater avec des variables
messages = prompt.invoke({
    "domaine": "machine learning",
    "question": "Qu'est-ce qu'un embedding ?"
})
print(messages)
```

Les variables entre accolades `{domaine}` et `{question}` sont remplacées à l'exécution. Le template vérifie que toutes les variables sont fournies — une variable manquante lève une `KeyError` explicite.

## Raccourci from_template

Pour un prompt simple sans message système :

```python
prompt = ChatPromptTemplate.from_template(
    "Traduis ce texte en {langue} : {texte}"
)

# Équivalent à :
prompt = ChatPromptTemplate.from_messages([
    ("human", "Traduis ce texte en {langue} : {texte}")
])
```

`from_template` crée un template avec un seul message humain. Pratique pour les cas simples, mais `from_messages` est plus lisible dès qu'on ajoute un message système.

## Messages système : donner un rôle au modèle

Le message système définit le comportement du modèle. C'est l'endroit pour spécifier le ton, la langue, les contraintes de format, ou le domaine d'expertise.

```python
prompt = ChatPromptTemplate.from_messages([
    ("system", """Tu es un assistant technique pour développeurs Python.
Règles :
- Réponds toujours en français
- Inclus un exemple de code quand c'est pertinent
- Signale les pièges courants avec ⚠️"""),
    ("human", "{question}"),
])
```

Le message système n'est pas une garantie — le modèle peut s'en écarter — mais c'est le mécanisme le plus fiable pour orienter le comportement.

## Variables partielles

Quand certaines variables sont connues à l'avance et d'autres à l'exécution :

```python
# Fixer la langue à l'avance
prompt_fr = prompt.partial(langue="français")

# Plus tard, fournir seulement le texte
result = prompt_fr.invoke({"texte": "Hello, how are you?"})
```

Utile quand un même template est utilisé dans plusieurs contextes avec des valeurs par défaut différentes.

## Few-shot : apprendre par l'exemple

Le few-shot prompting consiste à montrer des exemples d'entrée/sortie au modèle avant de poser la vraie question. LangChain propose `FewShotChatMessagePromptTemplate` pour structurer cela.

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)

# Définir le format d'un exemple
example_prompt = ChatPromptTemplate.from_messages([
    ("human", "{input}"),
    ("ai", "{output}"),
])

# Les exemples
examples = [
    {"input": "2+2", "output": "4"},
    {"input": "la capitale du Japon", "output": "Tokyo"},
]

# Le template few-shot
few_shot = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

# Assembler le prompt final
prompt = ChatPromptTemplate.from_messages([
    ("system", "Réponds de manière concise, en un seul mot ou chiffre."),
    few_shot,
    ("human", "{question}"),
])

messages = prompt.invoke({"question": "la couleur du ciel"})
```

Le modèle voit les exemples comme des échanges précédents et reproduit le même format. C'est plus fiable qu'une instruction textuelle pour contrôler le format de sortie.

## Composition dans une chaîne LCEL

Les templates sont des `Runnable` — ils se composent directement avec `|` :

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o-mini")

# Le prompt est le premier maillon de la chaîne
chain = prompt | model | StrOutputParser()
result = chain.invoke({"question": "3 * 7"})
```

Le template reçoit un dictionnaire, produit des messages, que le modèle consomme directement. Le typage est vérifié automatiquement : si le dictionnaire ne contient pas toutes les variables attendues, l'erreur est immédiate.

## MessagesPlaceholder : injecter un historique de conversation

Pour les chatbots ou les agents qui maintiennent un historique :

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "Tu es un assistant utile."),
    MessagesPlaceholder(variable_name="historique"),
    ("human", "{question}"),
])

from langchain_core.messages import HumanMessage, AIMessage

messages = prompt.invoke({
    "historique": [
        HumanMessage(content="Salut !"),
        AIMessage(content="Bonjour ! Comment puis-je t'aider ?"),
    ],
    "question": "Rappelle-moi ce que j'ai dit."
})
```

`MessagesPlaceholder` insère une liste de messages à l'endroit voulu dans le template. Indispensable pour les applications conversationnelles.

## Points d'attention

**Les doubles accolades échappent le formatage.** Si votre prompt contient du JSON ou du code avec des accolades, utilisez `{{` et `}}` pour les accolades littérales, sinon LangChain les interprètera comme des variables.

```python
# ❌ Erreur : LangChain cherche une variable "key"
prompt = ChatPromptTemplate.from_template('Génère du JSON : {"key": "value"}')

# ✅ Correct : accolades échappées
prompt = ChatPromptTemplate.from_template('Génère du JSON : {{"key": "value"}}')
```

**`PromptTemplate` (sans Chat) est pour les modèles de complétion**, pas les modèles de chat. Avec les modèles actuels (GPT-4, Claude, Gemini), utilisez toujours `ChatPromptTemplate`.

**L'ordre des messages compte.** Le message système doit être en premier. Les exemples few-shot avant le message utilisateur. L'historique de conversation après le message système et avant la question.
