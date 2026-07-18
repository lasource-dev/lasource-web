---
title: "LangChain vs LlamaIndex : quel framework choisir en 2026 ?"
library: langchain
version: "1.3.13"
tags: [langchain, llamaindex, comparatif, rag, agent, framework]
lang: fr
updated: 2026-07-17
status: draft
libraries_compared: [langchain, llama_index]
recommendation: "Pour un RAG simple, choisissez LlamaIndex ; pour des agents ou pipelines multi-étapes, LangChain offre plus de flexibilité ; les deux se combinent très bien."
---

# LangChain vs LlamaIndex : quel framework choisir ?

## Deux philosophies différentes

LangChain et LlamaIndex sont les deux frameworks Python dominants pour construire des applications autour des LLM. Ils sont souvent présentés comme des concurrents directs, mais leurs philosophies divergent fondamentalement.

**LangChain** est un framework généraliste d'orchestration LLM. Son objectif : fournir les briques pour construire n'importe quelle application LLM — chatbots, agents, pipelines de traitement, workflows multi-étapes. LCEL (LangChain Expression Language) est le ciment qui relie ces briques.

**LlamaIndex** est un framework spécialisé dans l'indexation et l'interrogation de données. Son objectif initial : connecter un LLM à vos propres données (documents, bases de données, APIs). Il a depuis élargi son périmètre aux agents et aux workflows, mais le RAG reste son cœur.

## Comparaison par dimension

### RAG (Retrieval-Augmented Generation)

C'est le terrain de prédilection de LlamaIndex. Le framework propose des abstractions dédiées — `VectorStoreIndex`, `DocumentSummaryIndex`, `KnowledgeGraphIndex` — qui encapsulent toute la chaîne : chargement des documents, découpage, embedding, indexation, et retrieval.

```python
# LlamaIndex — RAG en 5 lignes
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("./docs").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
response = query_engine.query("Quel est le chiffre d'affaires 2025 ?")
```

LangChain gère aussi le RAG, mais avec plus de code — vous assemblez vous-même le loader, le splitter, le vector store, le retriever, et le prompt :

```python
# LangChain — RAG équivalent
from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Charger et découper
loader = DirectoryLoader("./docs")
docs = loader.load()
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = splitter.split_documents(docs)

# Indexer
vectorstore = Chroma.from_documents(splits, OpenAIEmbeddings())
retriever = vectorstore.as_retriever()

# Chaîne RAG
prompt = ChatPromptTemplate.from_template(
    "Contexte : {context}\n\nQuestion : {question}"
)
model = ChatOpenAI(model="gpt-4o-mini")

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
response = chain.invoke("Quel est le chiffre d'affaires 2025 ?")
```

**Verdict RAG :** LlamaIndex gagne en rapidité de mise en place et en options d'indexation avancées (index hiérarchiques, graphes de connaissances). LangChain offre plus de contrôle sur chaque étape mais demande plus de code.

### Agents

La situation s'inverse pour les agents. LangChain propose un écosystème d'agents mature avec LangGraph (machine à états pour les agents complexes), des outils préfabriqués (recherche web, exécution de code, appels API), et une intégration profonde avec le function calling des modèles.

LlamaIndex a introduit ses propres agents, mais l'écosystème est plus jeune et moins flexible pour les workflows multi-agents ou les machines à états complexes.

**Verdict agents :** LangChain a l'avantage, surtout pour les agents complexes avec LangGraph.

### Écosystème et intégrations

Les deux frameworks supportent les principaux fournisseurs de modèles (OpenAI, Anthropic, Google, Mistral, Ollama) et les principaux vector stores (Chroma, Pinecone, Weaviate, Qdrant, pgvector).

LangChain a un écosystème d'intégrations plus large grâce à `langchain-community` — plus de 700 intégrations référencées. LlamaIndex a un système de "hubs" (`llama-hub`) avec environ 300 connecteurs de données.

### Courbe d'apprentissage

LlamaIndex est plus accessible pour un premier projet RAG. Les abstractions de haut niveau (`VectorStoreIndex.from_documents`) cachent la complexité. On obtient un résultat fonctionnel en quelques minutes.

LangChain demande de comprendre LCEL, les Runnables, la composition de chaînes. La courbe est plus raide, mais la maîtrise d'LCEL donne accès à des compositions très flexibles.

### Performance et scalabilité

La performance dépend davantage des choix d'infrastructure (vector store, modèle, stratégie de chunking) que du framework lui-même. Les deux ajoutent un overhead marginal.

LlamaIndex propose des optimisations spécifiques au RAG (re-ranking, post-processing, filtrage de nœuds) qui peuvent améliorer la qualité des réponses sur de grands corpus.

## Tableau récapitulatif

| Dimension | LangChain | LlamaIndex |
|---|---|---|
| **Spécialité** | Orchestration LLM généraliste | Indexation et RAG |
| **RAG** | Flexible mais verbose | Excellent, abstractions natives |
| **Agents** | Mature, LangGraph | En développement |
| **Intégrations** | ~700+ | ~300+ |
| **Courbe d'apprentissage** | Moyenne à raide | Douce pour le RAG |
| **Documentation FR** | Aucune (d'où LaSource.dev) | Aucune |
| **Licence** | MIT | MIT |
| **Stars GitHub** | ~141k | ~40k |

## Les combiner : une option viable

Les deux frameworks ne sont pas mutuellement exclusifs. Un pattern courant :

- **LlamaIndex pour l'indexation** — exploiter ses abstractions d'index avancées.
- **LangChain pour l'orchestration** — utiliser LCEL pour composer le pipeline global, intégrer le retriever LlamaIndex comme un composant de la chaîne.

```python
# Utiliser un index LlamaIndex comme retriever dans une chaîne LangChain
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

# Indexation avec LlamaIndex
documents = SimpleDirectoryReader("./docs").load_data()
index = VectorStoreIndex.from_documents(documents)

# Convertir en retriever compatible LangChain
retriever = index.as_retriever()
langchain_retriever = retriever.as_langchain_retriever()

# Utiliser dans une chaîne LCEL
chain = (
    {"context": langchain_retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

## Recommandation

**Choisissez LlamaIndex si** votre projet est principalement du RAG — interroger des documents, construire un moteur de recherche interne, indexer une base de connaissances. Vous irez plus vite et les abstractions sont plus adaptées.

**Choisissez LangChain si** votre projet est un agent, un pipeline multi-étapes, ou une application conversationnelle complexe. L'écosystème est plus large et LCEL offre plus de flexibilité pour la composition.

**Choisissez les deux si** vous avez un projet RAG ambitieux avec des agents — LlamaIndex pour l'indexation, LangChain/LangGraph pour l'orchestration.

**Dans tous les cas**, commencez par un prototype minimal avant de vous engager. Les deux frameworks évoluent rapidement, et le meilleur choix dépend toujours du cas d'usage concret.
