---
title: "Chains et LCEL dans LangChain : comprendre le chaînage de composants"
library: langchain
version: "1.3.13"
python_min: "3.10"
tags: [langchain, lcel, chains, runnable, pipe]
lang: fr
updated: 2026-07-17
status: draft
category: concept
explanation: "LCEL (LangChain Expression Language) remplace les anciennes classes Chain par une interface Runnable unifiée. L'opérateur pipe | compose les étapes, avec streaming, batch et async intégrés."
gotcha: "Les Runnables sont immuables : composer prompt | model crée un nouvel objet, les composants originaux ne sont pas modifiés."
see_also: [langchain-prompt-templates, langchain-output-parsers]
---

# Chains et LCEL dans LangChain

## Le problème que LCEL résout

Avant LCEL, LangChain proposait des classes comme `LLMChain`, `SequentialChain` ou `TransformChain` pour enchaîner des étapes. Chaque type de chaîne avait sa propre API, ses propres paramètres, et sa propre logique d'exécution. Ajouter du streaming, du batch ou de l'exécution asynchrone demandait du code spécifique à chaque chaîne.

LCEL (LangChain Expression Language) remplace tout cela par une interface unique : le **Runnable**. Chaque composant LangChain — prompt, modèle, parseur, retriever — implémente l'interface `Runnable`, ce qui signifie qu'ils partagent tous les mêmes méthodes : `invoke`, `stream`, `batch`, `ainvoke`, `astream`, `abatch`.

## Syntaxe de base : l'opérateur pipe

LCEL utilise l'opérateur `|` (pipe) de Python pour composer des chaînes. La sortie d'un composant devient l'entrée du suivant.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

# Définir les composants
prompt = ChatPromptTemplate.from_template(
    "Explique le concept de {concept} en 3 phrases simples."
)
model = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
parser = StrOutputParser()

# Composer la chaîne avec l'opérateur pipe
chain = prompt | model | parser

# Exécuter
result = chain.invoke({"concept": "embeddings"})
print(result)
```

Ce code crée une chaîne en trois étapes : le prompt formate la question, le modèle génère la réponse, le parseur extrait le texte brut. La même chaîne supporte automatiquement le streaming et le batch sans code supplémentaire.

## Streaming natif

L'un des avantages majeurs de LCEL : le streaming fonctionne d'emblée sur toute chaîne composée avec `|`.

```python
# Streaming token par token — même chaîne, méthode différente
for chunk in chain.stream({"concept": "RAG"}):
    print(chunk, end="", flush=True)
```

Avec les anciennes `LLMChain`, obtenir du streaming nécessitait un callback handler personnalisé. Avec LCEL, c'est un appel de méthode.

## Batch : traitement par lots

```python
# Traiter plusieurs entrées en parallèle
concepts = [
    {"concept": "fine-tuning"},
    {"concept": "quantization"},
    {"concept": "prompt engineering"},
]
results = chain.batch(concepts, config={"max_concurrency": 3})
```

La méthode `batch` exécute les appels en parallèle avec un contrôle de concurrence. Utile pour le traitement de masse sans écrire de code asyncio.

## Exécution asynchrone

```python
import asyncio

async def main():
    # Version asynchrone — même chaîne
    result = await chain.ainvoke({"concept": "attention mechanism"})
    print(result)

    # Streaming asynchrone
    async for chunk in chain.astream({"concept": "tokenization"}):
        print(chunk, end="", flush=True)

asyncio.run(main())
```

Chaque méthode synchrone a son équivalent asynchrone préfixé par `a`. L'interface est cohérente d'un bout à l'autre.

## Composition avancée : RunnablePassthrough et RunnableParallel

Pour des chaînes plus complexes, LCEL fournit des utilitaires de composition :

```python
from langchain_core.runnables import RunnablePassthrough, RunnableParallel

# RunnableParallel : exécuter plusieurs branches en parallèle
chain_avec_contexte = RunnableParallel(
    reponse=prompt | model | parser,
    concept_original=RunnablePassthrough()
)

result = chain_avec_contexte.invoke({"concept": "RLHF"})
print(result["reponse"])           # L'explication générée
print(result["concept_original"])  # {"concept": "RLHF"} — passé tel quel
```

`RunnablePassthrough` transmet l'entrée sans modification — utile quand une branche de la chaîne doit conserver l'entrée originale pendant qu'une autre la transforme.

## Migration depuis les anciennes Chains

Si vous avez du code existant utilisant `LLMChain` :

```python
# ❌ Ancien style (déprécié depuis LangChain 0.2)
from langchain.chains import LLMChain

chain = LLMChain(llm=model, prompt=prompt)
result = chain.run(concept="embeddings")

# ✅ Équivalent LCEL
chain = prompt | model | parser
result = chain.invoke({"concept": "embeddings"})
```

Les classes `LLMChain`, `SequentialChain`, `SimpleSequentialChain` et `TransformChain` sont dépréciées. Le code fonctionne encore mais n'est plus maintenu. Toute la documentation officielle LangChain utilise LCEL depuis la version 0.3.

## Points d'attention

**L'ordre des composants compte.** Chaque composant attend un type d'entrée spécifique. Un `ChatPromptTemplate` attend un dictionnaire, un `ChatModel` attend des messages, un `StrOutputParser` attend un `AIMessage`. Si les types ne correspondent pas, l'erreur sera explicite.

**Le débogage se fait avec `chain.get_graph().print_ascii()`.** Cette méthode affiche la structure de la chaîne sous forme d'arbre ASCII — indispensable pour les chaînes complexes avec des branches parallèles.

```python
chain.get_graph().print_ascii()
```

**Les Runnables sont immuables.** Composer `prompt | model` crée un nouvel objet `RunnableSequence`. Les composants originaux ne sont pas modifiés. Vous pouvez réutiliser le même prompt dans plusieurs chaînes.
