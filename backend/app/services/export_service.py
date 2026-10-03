import json
from typing import Any, Dict

def export_as_markdown(analysis: Dict[str, Any]) -> str:
    """Generate a markdown report from analysis results."""
    md = f"# Voice Coach Analysis Report\n\n"
    md += f"**Overall Score:** {analysis.get('overall_score', 'N/A')}/100\n\n"
    
    md += "## Dimensions\n"
    for dim in analysis.get('dimensions', []):
        md += f"- **{dim.get('dimension')}**: {dim.get('score')}/100 - {dim.get('feedback')}\n"
    
    md += "\n## Strengths\n"
    for s in analysis.get('strengths', []):
        md += f"- {s}\n"
        
    md += "\n## Priorities for Improvement\n"
    for p in analysis.get('priorities', []):
        md += f"- {p}\n"
        
    md += "\n## Practice Plan\n"
    for plan in analysis.get('practice_plan', []):
        md += f"- {plan}\n"
        
    md += f"\n## Transcript\n> {analysis.get('transcript', 'No transcript available.')}\n"
    return md

def export_as_json(analysis: Dict[str, Any]) -> dict:
    """Export analysis as JSON dict."""
    return analysis
