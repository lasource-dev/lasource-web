---
title: "Créer un agent ReAct avec LangChain"
library: langchain
version: "0.3.x"
python_min: "3.10"
category: snippet
tags: [agent, react, tool-calling]
lang: fr
updated: 2026-07-01
explanation: "Un agent ReAct alterne raisonnement et action via des appels d'outils. Ce pattern est le plus simple pour démarrer avec les agents LangChain."
gotcha: "Le modèle doit supporter le tool-calling natif, sinon le parsing du format ReAct devient fragile."
tutorial_url: "/tutoriels/agents-langchain-guide-complet"
---

```python
from langchain.agents import create_react_agent
from langchain.tools import tool

@tool
def get_weather(city: str) -> str:
    """Retourne la météo pour une ville donnée."""
    return f"Il fait beau à {city}"

agent = create_react_agent(model, tools=[get_weather])
```
