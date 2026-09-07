export type RoadmapDay = {
  day: number;
  week: number;
  weekTitle: string;
  topic: string;
  miniTask: string;
  seniorNote: string;
};

export const WEEKS: { week: number; title: string; range: string; checkpoint: string }[] = [
  {
    week: 1,
    title: "Python + AI Foundations",
    range: "Days 1-7",
    checkpoint:
      "If you can write a script that reads a file, transforms data, and calls an API without help — move on. If not, repeat Days 2-7 with new data.",
  },
  {
    week: 2,
    title: "Data, ML & Deep Learning",
    range: "Days 8-14",
    checkpoint: "Can you explain why a model overfits and how to fix it? If yes, proceed to LLMs.",
  },
  {
    week: 3,
    title: "Generative AI, LLMs & RAG",
    range: "Days 15-23",
    checkpoint:
      "Can you explain, unaided, everything that happens between a user question and the final RAG answer?",
  },
  {
    week: 4,
    title: "Agents, Backend & Deployment",
    range: "Days 24-30",
    checkpoint: "Ship the Capstone: AI Career Copilot — a real-time, production-style AI application.",
  },
];

export const ROADMAP: RoadmapDay[] = [
  { day: 1, week: 1, weekTitle: "Python + AI Foundations", topic: "Setup: Python, VSCode, pip, venv, Git/GitHub basics", miniTask: "Push a 'hello world' repo", seniorNote: "Seniors treat environment setup as part of the job — reproducibility matters. Always commit a requirements.txt/venv from Day 1." },
  { day: 2, week: 1, weekTitle: "Python + AI Foundations", topic: "Variables, data types, operators, strings", miniTask: "String utilities script", seniorNote: "Write small, testable functions from the start — seniors rarely write throwaway scripts without at least one test case." },
  { day: 3, week: 1, weekTitle: "Python + AI Foundations", topic: "Lists, tuples, sets, dicts", miniTask: "Contact book (dict-based)", seniorNote: "Practice choosing the right data structure for the job — this is a real interview signal, not academic trivia." },
  { day: 4, week: 1, weekTitle: "Python + AI Foundations", topic: "Conditionals & loops", miniTask: "Number-guessing game", seniorNote: "Refactor your first working version at least once — seniors always do a 'second pass' for readability." },
  { day: 5, week: 1, weekTitle: "Python + AI Foundations", topic: "Functions, scope, *args/**kwargs", miniTask: "Calculator with functions", seniorNote: "Add docstrings and type hints even in throwaway code — it becomes a habit that pays off in team codebases." },
  { day: 6, week: 1, weekTitle: "Python + AI Foundations", topic: "OOP: classes, objects, inheritance", miniTask: "Simple BankAccount class", seniorNote: "Think in terms of 'single responsibility' — a class should do one thing well, mirroring real production code." },
  { day: 7, week: 1, weekTitle: "Python + AI Foundations", topic: "Exceptions, file I/O, JSON, calling a REST API with requests", miniTask: "Weather-fetcher CLI", seniorNote: "Always handle failure paths (timeouts, bad JSON, rate limits) — this is exactly what separates junior from production-ready code." },

  { day: 8, week: 2, weekTitle: "Data, ML & Deep Learning", topic: "NumPy arrays, vectorized operations", miniTask: "Array math drills", seniorNote: "Seniors avoid Python loops over data when a vectorized NumPy op exists — performance habit worth building early." },
  { day: 9, week: 2, weekTitle: "Data, ML & Deep Learning", topic: "Pandas: DataFrames, filtering, groupby", miniTask: "Clean a messy CSV", seniorNote: "Real-world data is messy 90% of the time — treat data cleaning as a first-class skill, not a chore." },
  { day: 10, week: 2, weekTitle: "Data, ML & Deep Learning", topic: "Data visualization (matplotlib/seaborn)", miniTask: "Plot dataset trends", seniorNote: "A senior always visualizes data before modeling — it catches bugs and bad assumptions early." },
  { day: 11, week: 2, weekTitle: "Data, ML & Deep Learning", topic: "ML concepts: supervised/unsupervised, train/test split, features/labels", miniTask: "Explain in your own words", seniorNote: "Being able to explain a concept simply to a non-technical stakeholder is a real senior-level skill — practice it." },
  { day: 12, week: 2, weekTitle: "Data, ML & Deep Learning", topic: "Regression with Scikit-learn", miniTask: "House price predictor", seniorNote: "Baseline first, then improve — seniors always start with the simplest model before reaching for complexity." },
  { day: 13, week: 2, weekTitle: "Data, ML & Deep Learning", topic: "Classification + evaluation metrics, overfitting/underfitting", miniTask: "Project 1: Titanic-style classifier", seniorNote: "Choosing the right metric (precision vs recall) for the business problem is a senior-level judgment call, not just code." },
  { day: 14, week: 2, weekTitle: "Data, ML & Deep Learning", topic: "Neural network basics, PyTorch tensors, simple feedforward net", miniTask: "Project 2: Digit classifier (MNIST)", seniorNote: "Log your experiments (params, results) even for small projects — this habit scales directly to real ML engineering work." },

  { day: 15, week: 3, weekTitle: "Generative AI, LLMs & RAG", topic: "LLM basics: tokens, context window, temperature, roles", miniTask: "Experiment in API playground", seniorNote: "Seniors budget for token costs and context limits from day one — treat tokens like a real resource, not an abstraction." },
  { day: 16, week: 3, weekTitle: "Generative AI, LLMs & RAG", topic: "Prompt engineering: zero/few-shot, structured outputs", miniTask: "Prompt template library", seniorNote: "Version and store your prompts like code (in files, with git history) — this is standard practice in production LLM teams." },
  { day: 17, week: 3, weekTitle: "Generative AI, LLMs & RAG", topic: "Calling LLM APIs from Python, streaming responses", miniTask: "CLI chatbot skeleton", seniorNote: "Add retries/backoff for API calls immediately — flaky network handling is a top production concern for LLM apps." },
  { day: 18, week: 3, weekTitle: "Generative AI, LLMs & RAG", topic: "Function/tool calling basics", miniTask: "Chatbot that calls a 'get_weather' tool", seniorNote: "Validate tool inputs/outputs strictly — a senior never trusts LLM-generated function arguments blindly." },
  { day: 19, week: 3, weekTitle: "Generative AI, LLMs & RAG", topic: "Embeddings & semantic search", miniTask: "Similarity search over a text list", seniorNote: "Understand embedding dimensionality and cost trade-offs — production teams pick embedding models based on latency/cost, not just accuracy." },
  { day: 20, week: 3, weekTitle: "Generative AI, LLMs & RAG", topic: "Vector databases (ChromaDB), pgvector basics", miniTask: "Store & query embeddings", seniorNote: "Think about indexing strategy and metadata filtering early — this is what makes RAG scale beyond a toy demo." },
  { day: 21, week: 3, weekTitle: "Generative AI, LLMs & RAG", topic: "RAG architecture: chunking, retrieval, context injection, eval", miniTask: "Project 3 (Part A): Chatbot", seniorNote: "Always design an evaluation loop alongside the pipeline — 'does it work' is not enough; seniors measure retrieval quality." },
  { day: 22, week: 3, weekTitle: "Generative AI, LLMs & RAG", topic: "Finish RAG Document Chatbot end-to-end", miniTask: "Project 3: RAG Document Chatbot", seniorNote: "Write a README that explains trade-offs (chunk size, top-k) — this is exactly what a tech lead reviews in a real PR." },
  { day: 23, week: 3, weekTitle: "Generative AI, LLMs & RAG", topic: "Finish RAG Document Chatbot end-to-end", miniTask: "Project 3: RAG Document Chatbot", seniorNote: "Write a README that explains trade-offs (chunk size, top-k) — this is exactly what a tech lead reviews in a real PR." },

  { day: 24, week: 4, weekTitle: "Agents, Backend & Deployment", topic: "AI agent architecture: tools, memory, planning, multi-step loops", miniTask: "Simple agent with 2 tools", seniorNote: "Cap the number of agent steps and add timeouts — infinite loops are a real production risk seniors guard against." },
  { day: 25, week: 4, weekTitle: "Agents, Backend & Deployment", topic: "FastAPI basics: routes, request/response models, docs", miniTask: "Wrap chatbot in an API", seniorNote: "Use Pydantic models for every request/response — strict typing at the API boundary is standard senior practice." },
  { day: 26, week: 4, weekTitle: "Agents, Backend & Deployment", topic: "PostgreSQL basics + integrating DB with FastAPI", miniTask: "Store chat history in Postgres", seniorNote: "Think about schema design before writing code — migrations and indexes matter even in a small app." },
  { day: 27, week: 4, weekTitle: "Agents, Backend & Deployment", topic: "Docker basics: Dockerfile, containerizing the API", miniTask: "Containerize the chatbot API", seniorNote: "A senior makes sure the app runs identically on any machine — 'it works on my machine' is not acceptable in production." },
  { day: 28, week: 4, weekTitle: "Agents, Backend & Deployment", topic: "Deployment basics (Render/Railway/Fly.io), environment variables, secrets", miniTask: "Deploy the containerized API", seniorNote: "Never hardcode secrets — environment variables and a proper .env strategy are non-negotiable before shipping." },
  { day: 29, week: 4, weekTitle: "Agents, Backend & Deployment", topic: "Capstone build: walking skeleton, LLM comparison layer, RAG resume Q&A", miniTask: "Capstone: AI Career Copilot (core layers)", seniorNote: "Build the walking skeleton first, then layer in intelligence — incremental delivery beats a big-bang release." },
  { day: 30, week: 4, weekTitle: "Agents, Backend & Deployment", topic: "Capstone finish: job-search agent/tool layer, Postgres, Docker, deploy, logging & tests", miniTask: "Capstone: AI Career Copilot (ship it)", seniorNote: "Ship the smallest working version first, then iterate — that mindset matters more than any single technology." },
];

export const TOTAL_DAYS = ROADMAP.length;
