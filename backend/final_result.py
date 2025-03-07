import os
import json
import glob
from typing import Dict, Any

def analyze_ratings() -> Dict[str, Any]:
    """
    Analyze the ratings from the raw_content directory and determine consensus.
    
    Returns:
        Dict[str, Any]: A dictionary containing the consensus and supporting information
    """
    # Get all JSON files in the raw_content directory
    raw_files = glob.glob("raw_content/*.txt")
    
    if not raw_files:
        return {
            "consensus": "Insufficient data",
            "scientific_evidence": "No data available",
            "counter_claim": "No data available"
        }
    
    all_ratings = []
    supporting_evidence = []
    counter_claims = []
    
    # Process each file
    for file_path in raw_files:
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                data = json.loads(file.read())
                
                # Handle list structure - extract the first item
                if isinstance(data, list) and len(data) > 0:
                    data = data[0]
                
                # Skip entries with errors
                if data.get("error", False):
                    continue
                
                rating = data.get("rating")
                
                # Skip -1 ratings (irrelevant content)
                if rating == -1:
                    continue
                    
                all_ratings.append(rating)
                
                # Collect supporting evidence from ratings >= 5
                if rating >= 5:
                    evidence = data.get("scientific_evidence", "")
                    if evidence:
                        supporting_evidence.append(evidence)
                else:
                    # Collect counter claims from ratings < 5
                    counter = data.get("counter_claim", "")
                    if counter:
                        counter_claims.append(counter)
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    # Determine consensus
    if not all_ratings:
        return {
            "consensus": "Insufficient data",
            "scientific_evidence": "No data available",
            "counter_claim": "No data available"
        }
    
    supporting_count = sum(1 for r in all_ratings if r >= 5)
    opposing_count = sum(1 for r in all_ratings if r < 5)
    
    if supporting_count > opposing_count:
        consensus = "True"
        combined_evidence = "\n\n".join(supporting_evidence) if supporting_evidence else "No supporting evidence provided"
        combined_counter = "N/A"
    elif opposing_count > supporting_count:
        consensus = "False"
        combined_evidence = "N/A"
        combined_counter = "\n\n".join(counter_claims) if counter_claims else "No counter claims provided"
    else:
        consensus = "Neutral"
        combined_evidence = "\n\n".join(supporting_evidence) if supporting_evidence else "No supporting evidence provided"
        combined_counter = "\n\n".join(counter_claims) if counter_claims else "No counter claims provided"
    
    result = {
        "consensus": consensus,
        "scientific_evidence": combined_evidence,
        "counter_claim": combined_counter,
        "supporting_count": supporting_count,
        "opposing_count": opposing_count,
        "total_valid_ratings": len(all_ratings)
    }
    
    # Save results to a JSON file
    with open("final_result.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=4)
    
    print(f"Analysis complete. Consensus: {result['consensus']}")
    print(f"Total valid ratings: {result.get('total_valid_ratings', 0)}")
    print(f"Supporting: {result.get('supporting_count', 0)}, Opposing: {result.get('opposing_count', 0)}")
    print("Results saved to final_result.json")
    
    return result