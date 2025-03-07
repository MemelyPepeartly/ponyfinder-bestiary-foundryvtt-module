import os
import json

# Directory containing the feat JSON files
FEATS_DIR = "../../packs/ponyfinder-bestiary-feats.db"

def fix_feat_json(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    modified = False

    # Ensure "traits" exists and remove "toggles" if present
    if "traits" in data["system"] and "toggles" in data["system"]["traits"]:
        del data["system"]["traits"]["toggles"]
        modified = True

    # Ensure "level.value" is correctly formatted and preserves original level
    if isinstance(data["system"].get("level"), dict) and "value" in data["system"]["level"]:
        level_value = data["system"]["level"].get("value", 1)  # Preserve original level
        data["system"]["level"] = {"value": level_value}
        modified = True

    # Ensure "slug" exists and is not null
    if data["system"].get("slug") is None:
        data["system"]["slug"] = data["name"].lower().replace(" ", "-")
        modified = True

    # Ensure "_migration" has the latest version
    if "_migration" in data["system"]:
        data["system"]["_migration"] = {
            "version": 0.935,
            "previous": None
        }
        modified = True

    # Update system version
    if "_stats" in data and "systemVersion" in data["_stats"]:
        data["_stats"]["systemVersion"] = "6.10.0"
        modified = True

    # Save only if modifications were made
    if modified:
        with open(file_path, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=2, ensure_ascii=False)
        print(f"Fixed: {file_path}")

# Process all JSON files in the feats directory
for filename in os.listdir(FEATS_DIR):
    if filename.endswith(".json"):
        fix_feat_json(os.path.join(FEATS_DIR, filename))

print("Batch update completed!")