---
title: "5 erreurs fréquentes avec LangChain et comment les résoudre"
library: langchain
version: "1.3.13"
python_min: "3.10"
tags: [langchain, erreurs, debug, migration, dépannage]
lang: fr
updated: 2026-07-17
status: draft
category: error_fix
explanation: "Les 5 erreurs les plus fréquentes : imports déplacés, types incompatibles dans LCEL, clés API manquantes, confusion invoke/run, et versions de packages incompatibles."
gotcha: "Mettez toujours à jour tous les packages LangChain en même temps (langchain, langchain-core, langchain-community, langchain-openai) pour éviter les erreurs de sérialisation Pydantic."
see_also: [langchain-chains-lcel]
---

# 5 erreurs fréquentes avec LangChain

## 1. ImportError sur les imports déplacés

**Le symptôme :**

```
ImportError: cannot import name 'LLMChain' from 'langchain'
```

ou

```
LangChainDeprecationWarning: Importing ChatOpenAI from langchain.chat_models
is deprecated. Please import from langchain_openai instead.
```

**Pourquoi ça arrive :**

Depuis LangChain 0.2 (et renforcé en 0.3), les intégrations tierces ont été déplacées dans des packages séparés. `ChatOpenAI` n'est plus dans `langchain` mais dans `langchain-openai`. `ChatAnthropic` est dans `langchain-anthropic`. Et ainsi de suite.

La plupart des tutoriels et réponses StackOverflow qu'on trouve en ligne utilisent encore les anciens imports.

**La solution :**

```python
# ❌ Ancien import (ne fonctionne plus ou affiche un warning)
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings

# ✅ Nouvel import
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

**Règle générale :** si la classe est liée à un fournisseur (OpenAI, Anthropic, Google, Cohere, etc.), elle est dans `langchain-<fournisseur>`. Installer le package séparé :

```bash
pip install langchain-openai
# ou
pip install langchain-anthropic
```

Les classes du cœur du framework restent dans `langchain-core` :

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
```

## 2. TypeError dans les chaînes LCEL : types incompatibles

**Le symptôme :**

```
TypeError: Expected mapping type as input to ChatPromptTemplate.
Received: <class 'str'>
```

ou

```
TypeError: Expected a Runnable, callable or mapping.
```

**Pourquoi ça arrive :**

Chaque composant LCEL attend un type d'entrée spécifique. Un `ChatPromptTemplate` attend un dictionnaire `{"variable": "valeur"}`. Si vous lui envoyez une string, il échoue.

**La solution :**

Vérifiez la signature d'entrée/sortie de chaque composant de la chaîne :

```python
# ❌ Erreur : invoke attend un dict, pas une string
chain = prompt | model | StrOutputParser()
result = chain.invoke("ma question")

# ✅ Correct : passer un dictionnaire
result = chain.invoke({"question": "ma question"})
```

Pour déboguer une chaîne complexe, inspectez le graphe :

```python
# Afficher la structure et les types attendus
chain.get_graph().print_ascii()

# Voir les schémas d'entrée/sortie
print(chain.input_schema.model_json_schema())
print(chain.output_schema.model_json_schema())
```

## 3. Clé API manquante ou mal configurée

**Le symptôme :**

```
openai.AuthenticationError: Error code: 401 - Incorrect API key provided
```

ou

```
anthropic.AuthenticationError: Could not resolve authentication method.
```

**Pourquoi ça arrive :**

Les packages d'intégration cherchent la clé API dans des variables d'environnement spécifiques. Si la variable n'existe pas ou a le mauvais nom, l'erreur est souvent cryptique.

**La solution :**

Chaque fournisseur attend une variable précise :

```bash
# OpenAI
export OPENAI_API_KEY="sk-..."

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."

# Google (Gemini)
export GOOGLE_API_KEY="AI..."
```

Ou passez la clé directement (déconseillé en production, utile pour le debug) :

```python
from langchain_openai import ChatOpenAI

# Clé explicite — pour le debug uniquement
model = ChatOpenAI(model="gpt-4o-mini", api_key="sk-...")
```

**Piège courant :** créer un fichier `.env` sans utiliser `python-dotenv` pour le charger :

```python
# Le fichier .env ne se charge pas tout seul
from dotenv import load_dotenv
load_dotenv()  # Charge les variables de .env dans os.environ

from langchain_openai import ChatOpenAI
model = ChatOpenAI(model="gpt-4o-mini")  # Maintenant ça marche
```

## 4. Confusion entre invoke, run, call et predict

**Le symptôme :**

```
AttributeError: 'RunnableSequence' object has no attribute 'run'
```

ou un `DeprecationWarning` sur `.predict()` ou `.__call__()`.

**Pourquoi ça arrive :**

LangChain a changé son API principale entre les versions 0.1, 0.2 et 0.3. Les anciennes méthodes (`run`, `predict`, `__call__`) sont dépréciées ou supprimées. Les tutoriels pré-0.3 utilisent encore ces méthodes.

**La solution :**

Depuis LangChain 0.3, il n'y a qu'une seule API — l'interface Runnable :

```python
# ❌ Anciennes méthodes (dépréciées)
chain.run("ma question")
chain.predict(question="ma question")
chain("ma question")
model.predict("ma question")

# ✅ Méthodes Runnable (actuelles)
chain.invoke({"question": "ma question"})   # Synchrone, une entrée
chain.batch([{"question": "q1"}, ...])      # Synchrone, plusieurs entrées
chain.stream({"question": "ma question"})   # Streaming
await chain.ainvoke({"question": "..."})    # Asynchrone
```

**Tableau de correspondance :**

| Ancien | Nouveau |
|---|---|
| `chain.run(input)` | `chain.invoke(input)` |
| `chain.predict(**kwargs)` | `chain.invoke(kwargs)` |
| `chain(input)` | `chain.invoke(input)` |
| `model.predict(text)` | `model.invoke(text)` |
| `model.apredict(text)` | `await model.ainvoke(text)` |

## 5. Versions incompatibles entre packages LangChain

**Le symptôme :**

```
pydantic.errors.PydanticSchemaGenerationError: Unable to generate
pydantic-core schema for <class 'langchain_core...'>
```

ou des erreurs mystérieuses de sérialisation, de validation, ou de types.

**Pourquoi ça arrive :**

L'écosystème LangChain est distribué sur plusieurs packages (`langchain`, `langchain-core`, `langchain-community`, `langchain-openai`, etc.). Si ces packages ne sont pas à des versions compatibles, les modèles Pydantic internes divergent et provoquent des erreurs de sérialisation.

**La solution :**

Vérifiez les versions installées :

```bash
pip list | grep langchain
```

Résultat attendu (juillet 2026) :

```
langchain              1.3.13
langchain-core         1.4.8
langchain-community    0.6.x
langchain-openai       0.5.x
```

**Règle :** mettez à jour tous les packages LangChain en même temps :

```bash
pip install --upgrade langchain langchain-core langchain-community langchain-openai
```

**Ne jamais fixer manuellement** `langchain-core` à une version différente de celle attendue par `langchain`. Laissez pip résoudre les dépendances.

Si le problème persiste, repartez d'un environnement propre :

```bash
python -m venv .venv
source .venv/bin/activate
pip install langchain langchain-openai
```

## Bonus : activer les logs de debug

Quand l'erreur n'est pas claire, activez les logs détaillés de LangChain :

```python
import langchain
langchain.debug = True

# Ou pour plus de granularité
import logging
logging.getLogger("langchain").setLevel(logging.DEBUG)
```

Avec `debug = True`, chaque étape de la chaîne affiche son entrée et sa sortie dans la console. C'est le premier réflexe quand une chaîne se comporte de manière inattendue.
