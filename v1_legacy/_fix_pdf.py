"""Temporary script to fix the _build_pdf function in app.py."""
import pathlib

app_path = pathlib.Path(__file__).parent / "app.py"
content = app_path.read_text(encoding="utf-8")

# Find and replace the old cleaning block
old_markers = (
    "                # Strip markdown formatting then force to ASCII",
    "            return pdf.output()",
)

start = content.find(old_markers[0])
end = content.find(old_markers[1]) + len(old_markers[1])

if start == -1 or end == -1:
    print("ERROR: Could not find the target block in app.py")
    exit(1)

new_block = '''                # Strip markdown formatting then force to pure ASCII
                clean = body.replace("**", "").replace("```", "").replace("`", "")
                clean = _sanitize(clean)

                for line in clean.split("\\n"):
                    if not line.strip():
                        pdf.ln(3)
                        continue
                    try:
                        pdf.multi_cell(0, 6, line)
                    except Exception:
                        # Skip any line that still causes rendering issues
                        pass
                pdf.ln(4)

            return pdf.output()'''

new_content = content[:start] + new_block + content[end:]
app_path.write_text(new_content, encoding="utf-8")
print("SUCCESS: app.py has been updated!")
