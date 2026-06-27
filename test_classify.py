import urllib.request, json
import sys

# Force standard output to support UTF-8 (prevents crashes on Windows when printing emojis)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

tests = [
    ("Analyze Zoho Stock", "Finance"),
    ("Audit my Solidity contract", "Code Audit / Security"),
    ("Compare OpenAI and Anthropic", "Technology / Comparison"),
    ("Research EV Market", "Finance"),
    ("Latest AI news today", "News Summary"),
    ("Explain quantum computing", None),  # General / LLM routed
]

for q, expected in tests:
    r = urllib.request.urlopen(urllib.request.Request(
        "http://localhost:8000/api/a2a/classify",
        data=json.dumps({"query": q}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST"
    ))
    d = json.loads(r.read().decode())
    if expected:
        status = "PASS" if d["domain"] == expected else "FAIL"
    else:
        status = "LLM"
    print(f'[{status}] "{q}"')
    print(f'       domain={d["domain"]} | agents={d["selected_agents"]} | cost={d["estimated_cost"]} CROO | time={d["estimated_time"]}s')
    if d.get("explanation"):
        print(f'       note: {d["explanation"]}')
    print()
