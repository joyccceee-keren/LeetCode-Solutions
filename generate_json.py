import os
import re
import json
import glob

def parse_main_readme(repo_path):
    """
    Parses the main README.md to map problem folder names to their topics.
    """
    readme_path = os.path.join(repo_path, "README.md")
    if not os.path.exists(readme_path):
        print(f"Warning: Main README.md not found at {readme_path}")
        return {}

    with open(readme_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find all topics and their problem links
    # Format of topic: ## Topic Name
    # Format of link: [0001-two-sum](https://...)
    topic_mapping = {}
    current_topic = None

    lines = content.splitlines()
    for line in lines:
        # Check for topic header
        topic_header_match = re.match(r"^##\s+(.+)$", line)
        if topic_header_match:
            header = topic_header_match.group(1).strip()
            # Ignore headers that aren't problem topics
            if header not in ["LeetCode Topics", "Difficulty"]:
                current_topic = header
            continue

        if current_topic:
            # Find folder name inside the markdown link: [folder-name](...)
            # Folders look like 0001-two-sum or 3498-reverse-degree-of-a-string
            links = re.findall(r"\[(\d{4}-[a-zA-Z0-9-]+)\]", line)
            for folder in links:
                if folder not in topic_mapping:
                    topic_mapping[folder] = set()
                topic_mapping[folder].add(current_topic)

    # Convert sets to sorted lists for JSON serialization
    return {k: sorted(list(v)) for k, v in topic_mapping.items()}

def parse_problem_readme(readme_path):
    """
    Parses the problem-specific README.md to extract metadata.
    """
    if not os.path.exists(readme_path):
        return None

    with open(readme_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract Title and URL from <h2><a href="URL">Title</a></h2>
    title_match = re.search(r"<h2><a href=\"([^\"]+)\">([^<]+)</a></h2>", content)
    url = ""
    title = ""
    number = None

    if title_match:
        url = title_match.group(1).strip()
        raw_title = title_match.group(2).strip()
        # Parse title format, e.g., "1. Two Sum" -> "Two Sum" and number 1
        num_title_match = re.match(r"^(\d+)\.\s*(.+)$", raw_title)
        if num_title_match:
            number = int(num_title_match.group(1))
            title = num_title_match.group(2).strip()
        else:
            title = raw_title

    # Extract Difficulty from <h3>Difficulty</h3>
    difficulty_match = re.search(r"<h3>(Easy|Medium|Hard)</h3>", content)
    difficulty = difficulty_match.group(1).strip() if difficulty_match else "Unknown"

    # Extract Description: Everything after <hr>
    description = ""
    hr_index = content.find("<hr>")
    if hr_index != -1:
        description = content[hr_index + 4:].strip()
    else:
        # Fallback if no <hr>: take everything after the <h3> tag if it exists
        h3_match = re.search(r"</h3>", content)
        if h3_match:
            description = content[h3_match.end():].strip()
        else:
            description = content.strip()

    return {
        "title": title,
        "number": number,
        "url": url,
        "difficulty": difficulty,
        "description": description
    }

def generate_index():
    repo_path = os.path.dirname(os.path.abspath(__file__))
    
    # Parse main README for topics
    folder_topics = parse_main_readme(repo_path)
    
    problems = []

    # Iterate over all folders in the repository
    for item in os.listdir(repo_path):
        item_path = os.path.join(repo_path, item)
        # Check if it is a directory and matches problem folder pattern (e.g. 0001-two-sum)
        if os.path.isdir(item_path) and re.match(r"^\d{4}-[a-zA-Z0-9-]+$", item):
            folder_name = item
            
            # Paths to README and code files
            readme_file = os.path.join(item_path, "README.md")
            
            # Find python solution (or other code file if present)
            code_files = glob.glob(os.path.join(item_path, "*.py"))
            code = ""
            language = "python"
            
            if code_files:
                # Use the first python file found
                with open(code_files[0], "r", encoding="utf-8") as cf:
                    code = cf.read()
            
            # Parse folder metadata
            meta = parse_problem_readme(readme_file)
            if not meta:
                # If no specific README, construct basic metadata from folder name
                parts = folder_name.split("-", 1)
                num = int(parts[0]) if parts[0].isdigit() else None
                name = parts[1].replace("-", " ").title() if len(parts) > 1 else folder_name
                meta = {
                    "title": name,
                    "number": num,
                    "url": f"https://leetcode.com/problems/{parts[1]}" if len(parts) > 1 else "",
                    "difficulty": "Unknown",
                    "description": ""
                }
            
            # Add topics
            meta["topics"] = folder_topics.get(folder_name, [])
            meta["id"] = folder_name
            meta["code"] = code
            meta["language"] = language
            
            problems.append(meta)

    # Sort problems by number
    problems.sort(key=lambda x: x["number"] if x["number"] is not None else 99999)

    # Write out solutions.json
    output_path = os.path.join(repo_path, "solutions.json")
    with open(output_path, "w", encoding="utf-8") as out:
        json.dump(problems, out, indent=2, ensure_ascii=False)
        
    print(f"Successfully indexed {len(problems)} problems into {output_path}")

if __name__ == "__main__":
    generate_index()
