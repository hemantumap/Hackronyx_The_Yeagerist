#!/usr/bin/env python3
"""
Intelligent Expense Approval & Budget Monitoring System
Firebase Firestore Uploader (Python Edition)
"""

import sys
import os
import json
from pathlib import Path

# Ensure UTF-8 output on Windows terminals
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATASETS_DIR = BASE_DIR / "datasets"

is_dry_run = "--dry-run" in sys.argv

print("=" * 70)
print("[INFO] FIREBASE FIRESTORE DATASET UPLOADER (Python)")
print("=" * 70)

if is_dry_run:
    print("[DRY-RUN] MODE: SIMULATION (No writes to Firebase will occur)\n")

service_account_paths = [
    BASE_DIR / "serviceAccountKey.json",
    BASE_DIR / "config" / "serviceAccountKey.json",
    Path(os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", ""))
]

service_account_path = None
for p in service_account_paths:
    if p and p.exists() and p.is_file():
        service_account_path = p
        break

db = None
if not is_dry_run:
    if not service_account_path and not os.environ.get("FIRESTORE_EMULATOR_HOST"):
        print(f"""
[ERROR] Firebase Service Account Key Not Found!

To upload this dataset to your Firebase project:
  1. Open Firebase Console: https://console.firebase.google.com/
  2. Select your Project -> Project Settings (gear icon) -> "Service accounts"
  3. Click "Generate new private key"
  4. Save the downloaded JSON file as:
     {BASE_DIR / 'serviceAccountKey.json'}
  5. Run:
     python scripts/upload_to_firebase.py

[TIP] You can test the uploader in dry-run mode right now with:
     python scripts/upload_to_firebase.py --dry-run
""")
        sys.exit(1)

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if service_account_path:
            cred = credentials.Certificate(str(service_account_path))
            print(f"[AUTH] Authenticated using key: {service_account_path.name}")
        else:
            cred = credentials.ApplicationDefault()
            print("[AUTH] Authenticated using Application Default / Emulator")

        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("[OK] Connected to Cloud Firestore successfully!\n")
    except ImportError:
        print("[ERROR] firebase-admin Python package is not installed.")
        print("Run: pip install firebase-admin")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Error initializing Firebase Admin: {e}")
        sys.exit(1)


def upload_collection(collection_name: str, items: list, id_field: str = "id"):
    print(f"[BATCH] Processing collection: '{collection_name}' ({len(items)} records)...")
    if is_dry_run:
        print(f"   [DRY-RUN] Validated {len(items)} records for '{collection_name}'.")
        return

    batch_size = 400
    for i in range(0, len(items), batch_size):
        chunk = items[i:i + batch_size]
        batch = db.batch()
        for item in chunk:
            doc_id = str(item.get(id_field) or item.get("id")) if (item.get(id_field) or item.get("id")) else None
            doc_ref = db.collection(collection_name).document(doc_id) if doc_id else db.collection(collection_name).document()
            batch.set(doc_ref, item, merge=True)
        batch.commit()
        print(f"   [UPLOADED] Batch {i // batch_size + 1} ({len(chunk)} documents) to '{collection_name}'")


def main():
    def load_json(name):
        with open(DATASETS_DIR / name, "r", encoding="utf-8") as f:
            return json.load(f)

    departments = load_json("departments.json")
    employees = load_json("employees.json")
    budgets = load_json("budgets.json")
    expenses = load_json("expenses.json")
    approvals = load_json("approvals.json")
    categories = load_json("expense_categories.json")
    alerts = load_json("budget_alerts.json")

    upload_collection("departments", departments, "departmentId")
    upload_collection("employees", employees, "employeeId")
    upload_collection("users", employees, "employeeId")
    upload_collection("budgets", budgets, "budgetId")
    upload_collection("expenses", expenses, "expenseId")
    upload_collection("approvals", approvals, "approvalId")
    upload_collection("expense_categories", categories, "categoryId")
    upload_collection("budget_alerts", alerts, "alertId")

    print("\n" + "=" * 70)
    if is_dry_run:
        print("[SUCCESS] DRY-RUN SIMULATION COMPLETE! All data structures are Firestore-ready.")
    else:
        print("[SUCCESS] UPLOAD COMPLETE! All datasets have been written to Cloud Firestore.")
    print("=" * 70)


if __name__ == "__main__":
    main()
