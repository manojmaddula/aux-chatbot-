import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

prs = pptx.Presentation("C:/Users/maddu/Downloads/AUX_Break_Management_backup.pptx")

# Slide 1: Add ZEL App Name and Tagline
slide1 = prs.slides[0]
for sh in slide1.shapes:
    if sh.name == "Text 0":
        # Adjust Title font size slightly so subtitle breathes comfortably
        p1 = sh.text_frame.paragraphs[0]
        p1.text = "Problem Statement"
        p1.font.size = Pt(32)
        p1.font.bold = True
        
        # Add Tagline paragraph right beneath Title
        p2 = sh.text_frame.add_paragraph()
        p2.space_before = Pt(4)
        
        run_name = p2.add_run()
        run_name.text = "ZEL"
        run_name.font.bold = True
        run_name.font.size = Pt(14)
        
        run_sep = p2.add_run()
        run_sep.text = " \u2014 " # em-dash
        run_sep.font.size = Pt(14)
        
        run_tag = p2.add_run()
        run_tag.text = '"Zero wait to pause, Zero lag to serve"'
        run_tag.font.italic = True
        run_tag.font.size = Pt(13)

# Save to both Downloads and scratch repo
out_paths = [
    "C:/Users/maddu/Downloads/AUX_Break_Management.pptx",
    "C:/Users/maddu/.gemini/antigravity/scratch/aux-chatbot-/AUX_Break_Management.pptx"
]

for p in out_paths:
    prs.save(p)
    print("Saved to:", p)
