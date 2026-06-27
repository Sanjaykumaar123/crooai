import urllib.request
import json
import time
import sys

# Force standard output to support UTF-8 (prevents crashes on Windows when printing emojis)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

query = "Compare OpenAI and Anthropic models"
wallet = "0x6c8fF565C3c61437B1aFD00af1A94AE36ee97482"

print(f"Triggering Swarm Execution for: '{query}'...")

# 1. Post to execute endpoint
try:
    req = urllib.request.Request(
        "http://localhost:8000/api/a2a/execute",
        data=json.dumps({"query": query, "wallet": wallet, "protocol_mode": "custom"}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode())
        execution_id = res["execution_id"]
        print(f"Started Swarm. Execution ID: {execution_id}\n")
except Exception as e:
    print(f"Failed to trigger execution: {e}")
    exit(1)

# 2. Poll status
seen_logs = set()
completed = False

while not completed:
    try:
        status_url = f"http://localhost:8000/api/a2a/status/{execution_id}"
        with urllib.request.urlopen(status_url) as response:
            status_data = json.loads(response.read().decode())
            
            progress = status_data.get("progress", 0)
            current_agent = status_data.get("current_agent", "Unknown")
            console_logs = status_data.get("console_logs", [])
            
            # Print new logs
            for log in console_logs:
                text = log.get("text", "")
                if text not in seen_logs:
                    print(f"[{log.get('timestamp')}] {text}")
                    seen_logs.add(text)
            
            if progress >= 100:
                completed = True
                print(f"\nSwarm execution complete! (Progress: {progress}%)")
                break
                
            time.sleep(1.5)
    except Exception as e:
        print(f"Error polling status: {e}")
        time.sleep(2)

# 3. Fetch report
print("\nFetching final compiled report...")
try:
    report_url = f"http://localhost:8000/api/a2a/report/{execution_id}"
    with urllib.request.urlopen(report_url) as response:
        report_data = json.loads(response.read().decode())
        print("\n=================== Executive Swarm Report ===================")
        print(report_data.get("report", "No report generated."))
        print("==============================================================")
        
        print("\nBlockchain Settlement Transactions:")
        for tx in report_data.get("transactions", []):
            print(f"- {tx.get('type')}: {tx.get('tx_hash')} | Gas: {tx.get('gas')} | Status: {tx.get('status')}")
except Exception as e:
    print(f"Failed to fetch report: {e}")
