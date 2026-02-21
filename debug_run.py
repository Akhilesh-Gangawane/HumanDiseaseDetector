from symptom_relationships import analyze_symptoms
import sys
import traceback

if __name__ == "__main__":
    try:
        # Use a smaller chunk and smaller dataset for initial debugging
        analyze_symptoms(chunk_size=10000)
        print("DEBUG: Script finished successfully")
    except Exception as e:
        print(f"DEBUG: Caught error: {e}")
        traceback.print_exc()
        sys.exit(1)
