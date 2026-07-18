---
title: "Output Parsers dans LangChain : structurer les réponses du LLM"
library: langchain
version: "1.3.13"
python_min: "3.10"
tags: [langchain, output-parser, pydantic, json, structured-output]
lang: fr
updated: 2026-07-17
status: draft
category: concept
explanation: "Les Output Parsers transforment le texte brut du LLM en données structurées. Depuis LangChain 0.3, with_structured_output est la méthode recommandée — elle utilise le function calling natif du modèle."
gotcha: "Ne pas mélanger with_structured_output et StrOutputParser dans la même chaîne : le premier renvoie un objet Pydantic, le second attend un AIMessage."
see_also: [langchain-chains-lcel, langchain-prompt-templates]
---

# Output Parsers dans LangChain

## Le problème

Un LLM renvoie du texte. Votre application a besoin de données structurées — un objet Python, un dictionnaire, une liste. Le parseur de sortie transforme le texte brut du modèle en structure exploitable.

LangChain propose plusieurs parseurs, du plus simple au plus robuste. Depuis LangChain 0.3, la méthode recommandée pour la plupart des cas est `with_structured_output`, mais les parseurs classiques restent utiles dans certains contextes.

## StrOutputParser : extraire le texte brut

Le parseur le plus simple. Il extrait la chaîne de caractères du message de réponse.

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("Résume en une phrase : {texte}")
model = ChatOpenAI(model="gpt-4o-mini")
parser = StrOutputParser()

chain = prompt | model | parser
result = chain.invoke({"texte": "LangChain est un framework..."})
# result est une str, pas un AIMessage
print(type(result))  # <class 'str'>
```

Sans `StrOutputParser`, la chaîne renvoie un objet `AIMessage`. Avec, elle renvoie directement le contenu texte. Presque toutes les chaînes LCEL l'utilisent en dernier maillon.

## JsonOutputParser : extraire du JSON

Quand le modèle doit renvoyer un objet JSON :

```python
from langchain_core.output_parsers import JsonOutputParser

parser = JsonOutputParser()

prompt = ChatPromptTemplate.from_template(
    """Extrais les informations suivantes du texte.
Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour.

Champs attendus : nom, age, ville

Texte : {texte}

{format_instructions}"""
)

# Injecter les instructions de format dans le prompt
prompt_with_format = prompt.partial(
    format_instructions=parser.get_format_instructions()
)

chain = prompt_with_format | model | parser
result = chain.invoke({"texte": "Marie, 28 ans, habite à Lyon."})
print(result)  # {"nom": "Marie", "age": 28, "ville": "Lyon"}
print(type(result))  # <class 'dict'>
```

`get_format_instructions()` génère un texte qui indique au modèle le format attendu. Le parseur tente ensuite d'extraire le JSON de la réponse, même si le modèle ajoute du texte autour.

## PydanticOutputParser : validation avec un schéma

Pour une validation stricte avec un modèle Pydantic :

```python
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class PersonneInfo(BaseModel):
    nom: str = Field(description="Le nom complet de la personne")
    age: int = Field(description="L'âge en années")
    ville: str = Field(description="La ville de résidence")

parser = PydanticOutputParser(pydantic_object=PersonneInfo)

prompt = ChatPromptTemplate.from_template(
    """Extrais les informations de la personne mentionnée dans le texte.

{format_instructions}

Texte : {texte}"""
)

chain = prompt.partial(
    format_instructions=parser.get_format_instructions()
) | model | parser

result = chain.invoke({"texte": "Pierre Dupont, 35 ans, vit à Bordeaux."})
print(result.nom)   # Pierre Dupont
print(result.age)   # 35
print(type(result)) # <class 'PersonneInfo'>
```

Avantage par rapport au `JsonOutputParser` : Pydantic valide les types (un `age` qui n'est pas un entier lève une erreur), fournit des valeurs par défaut, et documente le schéma via les descriptions de champs.

## with_structured_output : la méthode recommandée

Depuis LangChain 0.3, la méthode `with_structured_output` sur les modèles de chat est le moyen recommandé pour obtenir des sorties structurées. Elle utilise les fonctionnalités natives du modèle (function calling, tool use) au lieu de demander au LLM de formater du JSON dans sa réponse textuelle.

```python
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI

class Analyse(BaseModel):
    sentiment: str = Field(description="positif, négatif ou neutre")
    score: float = Field(description="Score de confiance entre 0 et 1")
    mots_cles: list[str] = Field(description="3 mots-clés principaux")

model = ChatOpenAI(model="gpt-4o-mini")
model_structure = model.with_structured_output(Analyse)

prompt = ChatPromptTemplate.from_template(
    "Analyse le sentiment de ce texte : {texte}"
)

chain = prompt | model_structure
result = chain.invoke({"texte": "Ce produit est excellent, je le recommande !"})
print(result.sentiment)  # positif
print(result.score)      # 0.95
print(result.mots_cles)  # ["excellent", "recommande", "produit"]
```

Pourquoi préférer `with_structured_output` :

- **Plus fiable** — le modèle utilise son mécanisme natif de function calling, pas du formatage texte.
- **Pas besoin de format_instructions** — le schéma Pydantic est transmis directement au modèle.
- **Pas de parseur séparé** — le modèle renvoie directement l'objet Pydantic.
- **Streaming supporté** — les champs arrivent au fur et à mesure.

## Quand utiliser quoi

| Situation | Outil recommandé |
|---|---|
| Texte brut en sortie | `StrOutputParser` |
| JSON structuré, modèle récent (GPT-4, Claude, Gemini) | `with_structured_output` |
| JSON structuré, modèle sans function calling | `PydanticOutputParser` |
| JSON sans schéma strict | `JsonOutputParser` |
| Listes simples | `CommaSeparatedListOutputParser` |

## Gestion des erreurs de parsing

Les modèles ne produisent pas toujours un JSON valide. `OutputFixingParser` tente de corriger les erreurs en renvoyant la sortie malformée au modèle :

```python
from langchain.output_parsers import OutputFixingParser

# Encapsule un parseur existant avec auto-correction
fixing_parser = OutputFixingParser.from_llm(
    parser=PydanticOutputParser(pydantic_object=PersonneInfo),
    llm=model
)

# Si le premier parsing échoue, le modèle est rappelé
# avec le JSON malformé + l'erreur pour correction
chain = prompt | model | fixing_parser
```

Le coût : un appel LLM supplémentaire en cas d'échec. En production, surveillez le taux de corrections — s'il est élevé, améliorez le prompt plutôt que de compter sur le fixing.

## Points d'attention

**`with_structured_output` ne fonctionne pas avec tous les modèles.** Il nécessite le support du function calling ou tool use. Les modèles OpenAI (GPT-4, GPT-4o), Anthropic (Claude 3+), et Google (Gemini) le supportent. Les modèles locaux via Ollama ne le supportent pas toujours — vérifiez avec `model.with_structured_output` et gérez le `NotImplementedError`.

**Ne pas mélanger `with_structured_output` et `StrOutputParser`.** Le premier renvoie un objet Pydantic, le second attend un `AIMessage`. Les deux dans la même chaîne lèvent une erreur de type.

**Les descriptions des champs Pydantic comptent.** Le modèle les utilise pour comprendre quoi extraire. `score: float` est ambigu. `score: float = Field(description="Score de confiance entre 0 et 1")` est clair.
