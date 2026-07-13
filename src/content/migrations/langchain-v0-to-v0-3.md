---
title: "Migrer de LangChain 0.1 vers 0.3"
library: langchain
category: migration
tags: [migration, breaking-changes]
lang: fr
updated: 2026-06-15
from_version: "0.1.x"
to_version: "0.3.x"
explanation: "La migration principale concerne le remplacement des anciennes chaînes (LLMChain) par le nouveau paradigme LCEL (LangChain Expression Language)."
checklist:
  - "Remplacer les imports depuis langchain.chains par langchain_core.runnables"
  - "Migrer les prompts vers ChatPromptTemplate"
  - "Vérifier la compatibilité des callbacks personnalisés"
tutorial_url: "/migrations/langchain-v0-to-v0-3"
---

Contenu détaillé du guide de migration, snippets avant/après.
