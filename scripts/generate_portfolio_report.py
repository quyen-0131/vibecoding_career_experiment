from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    Image, KeepTogether, HRFlowable
)
from pypdf import PdfReader, PdfWriter

ROOT = Path(r"D:/Documents/ChatGPT/The Career Experiment Lab")
TMP = ROOT / "tmp" / "pdfs"
OUT = ROOT / "output" / "pdf"
ASSET = ROOT / "docs" / "assets" / "portfolio"
BASE = ROOT / "output" / "pdf" / "the-career-experiment-progress-report.pdf"
CURRENT = TMP / "current-portfolio-update.pdf"
FINAL = OUT / "the-career-experiment-portfolio-report.pdf"
OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = A4
GREEN = colors.HexColor("#165F49")
GREEN_DARK = colors.HexColor("#173C2F")
GREEN_SOFT = colors.HexColor("#E8F1EA")
GOLD = colors.HexColor("#A86F25")
GOLD_SOFT = colors.HexColor("#F8EEDC")
CREAM = colors.HexColor("#F8F6F0")
INK = colors.HexColor("#17261F")
MUTED = colors.HexColor("#53645B")
LINE = colors.HexColor("#D7DDD7")
WHITE = colors.white

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="ReportTitle", parent=styles["Title"], fontName="Times-Bold",
    fontSize=30, leading=34, textColor=INK, spaceAfter=12
))
styles.add(ParagraphStyle(
    name="H1x", parent=styles["Heading1"], fontName="Times-Bold",
    fontSize=21, leading=25, textColor=INK, spaceBefore=2, spaceAfter=12
))
styles.add(ParagraphStyle(
    name="H2x", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=12, leading=15, textColor=GREEN_DARK, spaceBefore=10, spaceAfter=6
))
styles.add(ParagraphStyle(
    name="Bodyx", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=9.2, leading=13.2, textColor=INK, spaceAfter=7
))
styles.add(ParagraphStyle(
    name="Smallx", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=7.6, leading=10.5, textColor=MUTED, spaceAfter=4
))
styles.add(ParagraphStyle(
    name="Captionx", parent=styles["BodyText"], fontName="Helvetica-Oblique",
    fontSize=7.2, leading=9.5, textColor=MUTED, spaceBefore=4, spaceAfter=8
))
styles.add(ParagraphStyle(
    name="Kicker", parent=styles["BodyText"], fontName="Helvetica-Bold",
    fontSize=7.5, leading=9, textColor=GREEN, tracking=1.1, spaceAfter=8
))
styles.add(ParagraphStyle(
    name="TableHead", parent=styles["BodyText"], fontName="Helvetica-Bold",
    fontSize=7.2, leading=9, textColor=WHITE
))
styles.add(ParagraphStyle(
    name="TableBody", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=7.1, leading=9.5, textColor=INK
))
styles.add(ParagraphStyle(
    name="CardTitle", parent=styles["BodyText"], fontName="Helvetica-Bold",
    fontSize=10.2, leading=12.5, textColor=GREEN_DARK
))
styles.add(ParagraphStyle(
    name="BigStat", parent=styles["BodyText"], fontName="Times-Bold",
    fontSize=22, leading=24, textColor=GREEN_DARK, alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    name="CenterSmall", parent=styles["Smallx"], alignment=TA_CENTER
))

def P(text, style="Bodyx"):
    return Paragraph(text, styles[style])

def bullets(items):
    rows = []
    for item in items:
        rows.append([P("•", "Bodyx"), P(item, "Bodyx")])
    t = Table(rows, colWidths=[10, 475])
    t.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 4),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 1),
    ]))
    return t

def info_box(title, body, tone="green"):
    bg = GREEN_SOFT if tone == "green" else GOLD_SOFT
    border = GREEN if tone == "green" else GOLD
    data = [[P(title, "CardTitle")], [P(body, "Bodyx")]]
    t = Table(data, colWidths=[500])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), bg),
        ("BOX", (0,0), (-1,-1), 0.8, border),
        ("LEFTPADDING", (0,0), (-1,-1), 12),
        ("RIGHTPADDING", (0,0), (-1,-1), 12),
        ("TOPPADDING", (0,0), (-1,0), 9),
        ("BOTTOMPADDING", (0,-1), (-1,-1), 10),
    ]))
    return t

def make_table(headers, rows, widths, font=7.1):
    head = [P(h, "TableHead") for h in headers]
    body = [[P(str(cell), "TableBody") for cell in row] for row in rows]
    t = Table([head] + body, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), GREEN),
        ("GRID", (0,0), (-1,-1), 0.45, LINE),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, CREAM]),
        ("LEFTPADDING", (0,0), (-1,-1), 7),
        ("RIGHTPADDING", (0,0), (-1,-1), 7),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    return t

def scaled_image(path, max_w=500, max_h=310):
    from PIL import Image as PILImage
    im = PILImage.open(path)
    w, h = im.size
    scale = min(max_w / w, max_h / h)
    return Image(str(path), width=w*scale, height=h*scale)

def phase_cards():
    rows = [[
        P("<b>1. Find existing evidence</b><br/>Resume -> experiences -> canonical activities", "Smallx"),
        P("<b>2. Find uncertainty</b><br/>Activity groups -> preference -> coverage and gaps", "Smallx"),
        P("<b>3. Test one question</b><br/>Supported work trial -> new evidence", "Smallx"),
    ]]
    t = Table(rows, colWidths=[166, 166, 166])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), GREEN_SOFT),
        ("BOX", (0,0), (-1,-1), 0.7, GREEN),
        ("INNERGRID", (0,0), (-1,-1), 0.45, LINE),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING", (0,0), (-1,-1), 11),
        ("BOTTOMPADDING", (0,0), (-1,-1), 11),
    ]))
    return t

def coverage_card(title, percent, count_text, preference=None, note=None):
    pref = f"<font color='#165F49'><b>Preference: {preference}</b></font>" if preference else "<font color='#67736D'><b>No preference evidence</b></font>"
    bar_w = 320
    fill_w = max(1, bar_w * percent / 100)
    bar = Table([["", ""]], colWidths=[fill_w, bar_w-fill_w if bar_w-fill_w > 0 else 0.1], rowHeights=[7])
    bar.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,0), GREEN),
        ("BACKGROUND", (1,0), (1,0), colors.HexColor("#E4E8E2")),
        ("BOX", (0,0), (-1,-1), 0, WHITE),
    ]))
    content = [
        [P(title, "CardTitle"), P(pref, "Smallx"), P(f"<b>{percent}% resume activity coverage</b>", "Smallx")],
        [P(count_text, "Smallx"), "", ""],
        [bar, "", ""],
    ]
    if note:
        content.append([P(note, "Captionx"), "", ""])
    t = Table(content, colWidths=[330, 95, 105])
    t.setStyle(TableStyle([
        ("SPAN", (0,1), (-1,1)),
        ("SPAN", (0,2), (-1,2)),
        ("SPAN", (0,3), (-1,3)) if note else ("LINEBELOW", (0,2), (-1,2), 0, WHITE),
        ("BACKGROUND", (0,0), (-1,-1), WHITE),
        ("BOX", (0,0), (-1,-1), 0.7, LINE),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING", (0,0), (-1,-1), 12),
        ("RIGHTPADDING", (0,0), (-1,-1), 12),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("ALIGN", (1,0), (-1,0), "RIGHT"),
    ]))
    return t

def on_page(canvas, doc):
    canvas.saveState()
    if doc.page == 1:
        canvas.setFillColor(GREEN)
        canvas.rect(0, PAGE_H-34*mm, PAGE_W, 34*mm, fill=1, stroke=0)
    else:
        canvas.setFillColor(GREEN)
        canvas.rect(18*mm, PAGE_H-15*mm, PAGE_W-36*mm, 4*mm, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 6.5)
    canvas.drawString(18*mm, 11*mm, "THE CAREER EXPERIMENT - CURRENT PORTFOLIO UPDATE")
    canvas.drawRightString(PAGE_W-18*mm, 11*mm, str(doc.page))
    canvas.restoreState()

doc = SimpleDocTemplate(
    str(CURRENT), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm,
    topMargin=24*mm, bottomMargin=18*mm, title="The Career Experiment - Current Portfolio Report",
    author="OpenAI Codex"
)
story = []

# Page 1 - Cover
story += [
    Spacer(1, 33*mm),
    P("THE CAREER EXPERIMENT", "Kicker"),
    P("Portfolio product discovery report", "ReportTitle"),
    P("An evidence-based career-decision prototype that turns past work into testable uncertainty - without a career-fit score.", "Bodyx"),
    Spacer(1, 8*mm),
    info_box("Current checkpoint - 24 August 2026",
             "The latest prototype reviews related activities in groups, shows resume activity coverage separately for each career, explains when preference evidence is unavailable, and preserves the supported career work trial."),
    Spacer(1, 8*mm),
    phase_cards(),
    Spacer(1, 8*mm),
    P("<b>Portfolio promise</b>", "H2x"),
    P("Do not choose a career from a quiz. Test it.", "H1x"),
    P("The application helps a user understand what their past already tells them, what remains unknown, and which bounded question could produce useful new evidence.", "Bodyx"),
    PageBreak(),
]

# Page 2 - Current snapshot
story += [
    P("CURRENT PRODUCT", "Kicker"),
    P("1. Executive snapshot", "H1x"),
    make_table(
        ["Area", "Current implementation"],
        [
            ["Career comparison", "Two selected roles, with local career profiles and role-specific activity explanations."],
            ["Resume evidence", "Local PDF and Word extraction, structured experiences, canonical activities, provenance and duplicate merging."],
            ["Preference review", "At most 10 informative activities, reviewed in activity groups with one More / About the same / Less response per group."],
            ["Evidence map", "Per-career resume activity coverage, matching group preference, and important work still untested."],
            ["Career experiment", "Shared scenario, primer, first attempt, qualitative review, focused revision, response to feedback and reflection."],
            ["Safety boundary", "No generic career-fit score. Missing evidence is untested, not incapable."],
        ],
        [115, 385],
    ),
    Spacer(1, 7*mm),
    info_box("Current verification",
             "69 domain tests pass. ESLint, TypeScript and the production build pass. The local prototype remains available at http://localhost:3000."),
    Spacer(1, 6*mm),
    P("What changed since the attached 32-page checkpoint", "H2x"),
    bullets([
        "Preference moved from individual activity cards to grouped review.",
        "The evidence map now shows resume activity coverage with a visible numerator and denominator.",
        "A neutral no-preference state explains when a career group has no matching past evidence.",
        "Transfer mappings now use a broader local taxonomy and O*NET-derived reference data.",
        "Consumer-facing debug labels and duplicate evidence sections were removed.",
    ]),
    PageBreak(),
]

# Page 3 - Journey
story += [
    P("THE CURRENT MECHANISM", "Kicker"),
    P("2. From past work to one useful test", "H1x"),
    phase_cards(),
    Spacer(1, 7*mm),
    make_table(
        ["Stage", "Input", "Rule", "Output"],
        [
            ["Document", "PDF or Word resume", "Read locally and reconstruct usable text", "Raw text in the current session"],
            ["Experience", "Resume text", "Find roles and supported activity lines", "Structured experiences"],
            ["Activity", "Detailed source wording", "Infer canonical work while preserving provenance", "Stable activity labels"],
            ["Attention", "All canonical activities", "Rank for relevance, contrast and evidence breadth", "At most 10 activities"],
            ["Preference", "Selected activities", "Group related work and ask once", "One response per group"],
            ["Evidence map", "Career profiles plus reviewed evidence", "Count represented Core and Important activities", "Coverage, preference and gaps"],
            ["Experiment", "User-selected unknown", "Provide supported role work", "New preference and reasoning evidence"],
        ],
        [65, 115, 175, 145],
    ),
    Spacer(1, 7*mm),
    info_box("Four evidence states stay separate",
             "<b>Confirmed experience:</b> the user reviewed this activity. <b>User preference:</b> More, About the same or Less for the group. <b>Career relevance:</b> the local model's interpretation. <b>Unknown:</b> insufficient firsthand evidence."),
    Spacer(1, 7*mm),
    P("The product never converts these dimensions into one career score.", "Bodyx"),
    PageBreak(),
]

# Page 4 - Grouped review
story += [
    P("REDUCING COGNITIVE LOAD", "Kicker"),
    P("3. The review unit changed", "H1x"),
    P("The earlier flow asked similar preference questions for each activity. Dogfooding showed that this repeated the same decision across closely related work.", "Bodyx"),
    make_table(
        ["Earlier flow", "Current flow"],
        [
            ["Maximum 10 individual cards", "Maximum 10 canonical activities organised into up to six groups"],
            ["One preference per activity", "One preference for the group overall"],
            ["Career context repeated on every card", "The group page lists all included activities and both career interpretations"],
            ["More detailed but tiring", "Lower effort, with activity detail still visible"],
        ],
        [245, 255],
    ),
    Spacer(1, 7*mm),
    P("Example - Analysis", "H2x"),
    make_table(
        ["Activities reviewed together", "Source evidence"],
        [
            ["Quantitative data analysis", "Decision Lab, Trulioo"],
            ["Behavioural analysis", "Decision Lab"],
            ["Metrics and performance analysis", "Trulioo"],
            ["Programming and data tooling", "Trulioo"],
        ],
        [270, 230],
    ),
    Spacer(1, 6*mm),
    info_box("The product hypothesis to validate",
             "One group-level answer is easier to complete and still accurate enough to guide what should be tested next.", tone="gold"),
    Spacer(1, 6*mm),
    P("<b>Trade-off:</b> Grouping reduces fatigue but may hide differences between activities inside the same group. This is a user-research question, not a solved fact.", "Bodyx"),
    P("<b>Main code:</b> lib/evidence/selectTopEvidenceActivities.ts and components/screens/EvidenceTunnelScreen.tsx", "Smallx"),
    PageBreak(),
]

# Page 5 - Coverage
story += [
    P("DESCRIPTIVE COVERAGE, NOT A SCORE", "Kicker"),
    P("4. What the percentage means", "H1x"),
    P("For each career and activity group, the prototype counts only the Core and Important activities defined in that local career profile.", "Bodyx"),
    info_box("Coverage formula",
             "represented Core and Important activities / total Core and Important activities in the career group", tone="green"),
    Spacer(1, 7*mm),
    coverage_card("Strategy and decisions", 14, "1 of 7 important activities found in reviewed resume evidence", "More"),
    Spacer(1, 5*mm),
    coverage_card("Execution and collaboration", 0, "0 of 2 important activities found in reviewed resume evidence", None,
                  "No preference is shown because none of these career activities appeared in the reviewed resume evidence."),
    Spacer(1, 7*mm),
    make_table(
        ["Coverage can say", "Coverage cannot say"],
        [
            ["This work appeared in the reviewed past", "The user is skilled or unskilled"],
            ["One of seven defined activities is represented", "The user is 14% suited to the career"],
            ["Important work remains untested", "The career is a poor fit"],
        ],
        [250, 250],
    ),
    Spacer(1, 7*mm),
    P("<b>Main code:</b> lib/evidence/buildStartingEvidence.ts", "Smallx"),
    PageBreak(),
]

# Page 6 - Preference absence
story += [
    P("CLARIFYING A MISMATCH", "Kicker"),
    P("5. Why preference can be missing", "H1x"),
    P("Dogfooding found a confusing case: the user had execution evidence for Product Management through working with engineers, but Management Consulting defined different execution activities such as programme design and process design.", "Bodyx"),
    scaled_image(ASSET / "missing-preference-state.png", max_w=500, max_h=225),
    P("Usability observation: the empty preference area could look like a skipped question.", "Captionx"),
    info_box("Current correction",
             "<b>No preference evidence</b><br/>No preference is shown because none of these career activities appeared in your reviewed resume evidence."),
    Spacer(1, 6*mm),
    make_table(
        ["What happened", "Correct interpretation"],
        [
            ["The user reviewed working with engineering", "This can inform Product Management execution preference"],
            ["Management Consulting execution contains programme and process design", "Those activities were not present in the reviewed resume"],
            ["No Management Consulting group preference appears", "This is absence of matching evidence, not dislike and not a skipped answer"],
        ],
        [245, 255],
    ),
    Spacer(1, 6*mm),
    P("<b>Product lesson:</b> A shared category does not make activities interchangeable. Preference should follow the actual work that produced it.", "Bodyx"),
    PageBreak(),
]

# Page 7 - Transfer mapping
story += [
    P("A TRANSFERABLE-WORK LENS", "Kicker"),
    P("6. Broader role mapping without word-for-word matching", "H1x"),
    P("The current model keeps one canonical activity label, then explains how that work functions in each selected career.", "Bodyx"),
    make_table(
        ["Canonical activity", "Product Manager", "Management Consultant"],
        [
            ["User and customer research", "Defines user problems and product opportunities", "Diagnoses client, customer or market problems"],
            ["Strategic recommendations", "Turns evidence into a product direction and trade-offs", "Turns evidence into a defensible client course of action"],
            ["Metrics and performance analysis", "Understands product behaviour and outcomes", "Diagnoses organisational performance and evaluates recommendations"],
            ["Client presentations", "Aligns internal or external stakeholders around decisions", "Communicates evidence and persuades client decision-makers"],
            ["Stakeholder communication", "Aligns design, engineering and business partners", "Gathers evidence and aligns client stakeholders"],
            ["Programming and data tooling", "Supports technical understanding and analytical collaboration", "Supports analysis, automation and evidence-based recommendations"],
        ],
        [120, 190, 190],
    ),
    Spacer(1, 7*mm),
    info_box("How O*NET reference data is used",
             "The user-provided O*NET spreadsheets are transformed into local role, task and skill reference files. They broaden the deterministic vocabulary. The app does not call O*NET or another service at runtime."),
    Spacer(1, 6*mm),
    P("<b>Interpretation boundary:</b> A transfer mapping is a local model inference. It does not prove that the user performed the role or has objective ability.", "Bodyx"),
    P("<b>Main code:</b> data/careers.ts, data/skillTaxonomy.ts, data/generated, lib/skills and lib/evidence/semanticActivityMapping.ts", "Smallx"),
    PageBreak(),
]

# Page 8 - Simplification
story += [
    P("THE CONSUMER UI SHOULD NOT EXPOSE THE DEBUGGER", "Kicker"),
    P("7. What was removed", "H1x"),
    P("Earlier screens exposed low/high semantic confidence, matched action and object, and technical inference explanations. These were useful for debugging but made the product harder to understand.", "Bodyx"),
    scaled_image(ASSET / "earlier-semantic-debug-ui.png", max_w=470, max_h=270),
    P("Earlier development UI: technically explainable, but too complex for the decision the user needed to make.", "Captionx"),
    make_table(
        ["Removed or reduced", "What remains visible"],
        [
            ["Low/high semantic confidence", "The canonical activity label"],
            ["Matched action and object", "Original resume wording on demand"],
            ["Duplicate evidence lists", "One grouped career-work view"],
            ["Repeated activity-level preference labels", "One group preference where evidence exists"],
            ["Generic repeated role copy", "Role-specific transfer explanations"],
        ],
        [245, 255],
    ),
    Spacer(1, 6*mm),
    info_box("Product lesson",
             "Explainability should support trust, but implementation detail should not compete with the user's main decision.", tone="gold"),
    PageBreak(),
]

# Page 9 - Backend map
story += [
    P("FOR A PRODUCT MANAGER READING THE CODE", "Kicker"),
    P("8. The current algorithm map", "H1x"),
    make_table(
        ["Question", "Main location", "Plain-language responsibility"],
        [
            ["What experience text was found?", "lib/extraction", "Build roles and attach supported activity lines"],
            ["What type of work is this?", "data/activityCatalog.ts; data/skillTaxonomy.ts", "Provide stable activity identities and categories"],
            ["How do sources merge?", "lib/evidence/normalizeActivities.ts", "Deduplicate without losing original wording or provenance"],
            ["Which evidence deserves attention?", "lib/evidence/selectTopEvidenceActivities.ts", "Rank at most 10 and organise them into groups"],
            ["How does work transfer?", "data/careers.ts; semanticActivityMapping.ts", "Attach career importance and role-specific explanations"],
            ["How is coverage calculated?", "lib/evidence/buildStartingEvidence.ts", "Count represented Core and Important career activities by group"],
            ["How is the result shown?", "StartingEvidenceMapScreen.tsx", "Keep coverage, preference and unknowns visually separate"],
            ["How is new evidence created?", "data/roleTrials; lib/experiments", "Run a supported work trial around a user-selected question"],
        ],
        [110, 155, 235],
    ),
    Spacer(1, 7*mm),
    P("A simple trace", "H2x"),
    info_box("Source sentence -> result",
             "Created recommendations from customer research -> User and customer research + Strategic recommendations -> Research + Strategy and planning -> group preference -> separate career coverage -> important unknown -> supported experiment question."),
    Spacer(1, 7*mm),
    P("Questions to ask at every step", "H2x"),
    bullets([
        "What information enters?",
        "What rule is applied?",
        "What result comes out?",
        "What is confirmed by the user and what is inferred by the product?",
        "What can fail, and what assumption should be tested?",
    ]),
    PageBreak(),
]

# Page 10 - Decision rationale
story += [
    P("PRODUCT RATIONALE", "Kicker"),
    P("9. Design decision -> mechanism -> behaviour -> measure", "H1x"),
    make_table(
        ["Decision", "Mechanism", "Expected behaviour", "Proposed measure"],
        [
            ["Group related activities", "Reduces repetitive decision fatigue", "More users complete preference review", "Group-review completion"],
            ["Keep at most 10 activities", "Limits attention demand", "Users review the most informative evidence", "Review completion and perceived relevance"],
            ["Show count plus percentage", "Makes the denominator visible", "Users interpret coverage as past exposure", "Comprehension interview"],
            ["Explain no preference evidence", "Prevents skipped-answer confusion", "Users understand why a label is absent", "Interpretation task"],
            ["Preserve original wording", "Supports recognition and trust", "Users can verify the inference", "Edit and backtrack rate"],
            ["Use a transferable lens", "Avoids literal keyword failure", "More credible role comparisons", "Mapping disagreement rate"],
            ["Primer before work trial", "Reduces knowledge confounding", "More meaningful attempts", "Trial completion"],
            ["No fit score", "Avoids false precision", "Users treat output as evidence", "Trust interview"],
        ],
        [120, 130, 140, 110],
    ),
    Spacer(1, 8*mm),
    info_box("Current discovery priority",
             "Validate whether the groups feel coherent and whether users understand resume activity coverage without reading it as skill or fit.", tone="gold"),
    PageBreak(),
]

# Page 11 - Validation
story += [
    P("PORTFOLIO READINESS", "Kicker"),
    P("10. Current quality gate and open questions", "H1x"),
    make_table(
        ["Check", "Current result"],
        [
            ["Domain tests", "69 passing"],
            ["ESLint", "Pass"],
            ["TypeScript", "Pass"],
            ["Production build", "Pass"],
            ["Guided demo", "Fictional data and sample evaluation; no API credit required"],
            ["Full local path", "PDF / Word upload and optional live qualitative evaluation"],
        ],
        [170, 330],
    ),
    Spacer(1, 7*mm),
    P("What remains uncertain", "H2x"),
    bullets([
        "Whether the five main activity groups match how users naturally think about work.",
        "Whether one group preference hides important activity-level differences.",
        "Whether users interpret coverage correctly without thinking it is skill.",
        "Whether the local career profiles and transfer descriptions feel credible across more resumes.",
        "Whether the chosen unknown leads to a useful supported work trial.",
        "Whether one short trial changes a decision in a meaningful, lasting way.",
    ]),
    Spacer(1, 6*mm),
    P("Recommended portfolio package", "H2x"),
    bullets([
        "A live guided demo using fictional data.",
        "A concise case-study page.",
        "A three-minute walkthrough video.",
        "A public GitHub repository with the plain-language algorithm guide and limitations.",
    ]),
    Spacer(1, 7*mm),
    info_box("Positioning statement",
             "An evidence-based career-decision prototype that separates experience, preference, career-model inference and unknowns before helping the user test one important question."),
    PageBreak(),
]

# Page 12 - Historical appendix separator
story += [
    Spacer(1, 35*mm),
    P("HISTORICAL APPENDIX", "Kicker"),
    P("The original discovery checkpoint", "ReportTitle"),
    P("The following 32 pages are preserved from the attached illustrated progress report. They document earlier mistakes, prompt directions, screenshots, code changes and product lessons.", "Bodyx"),
    Spacer(1, 8*mm),
    info_box("How to read the appendix",
             "Some screens and test counts describe the earlier checkpoint rather than the current interface. The first 11 pages of this report are the authoritative current summary; the appendix preserves the design history."),
    Spacer(1, 8*mm),
    P("Why keep it", "H2x"),
    bullets([
        "It shows how dogfooding changed the product.",
        "It records failures instead of presenting the final interface as inevitable.",
        "It makes the relationship between user feedback, product decisions and code visible.",
        "It is useful supporting material for a portfolio interview, but not the first thing a reviewer must read.",
    ]),
]

doc.build(story, onFirstPage=on_page, onLaterPages=on_page)

# Merge the current report with the preserved historical checkpoint.
writer = PdfWriter()
for page in PdfReader(str(CURRENT)).pages:
    writer.add_page(page)
for page in PdfReader(str(BASE)).pages:
    writer.add_page(page)
writer.add_metadata({
    "/Title": "The Career Experiment - Portfolio Product Discovery Report",
    "/Subject": "Current case study, algorithm update, product rationale, screenshots, and historical discovery record",
    "/Author": "OpenAI Codex",
})
with FINAL.open("wb") as f:
    writer.write(f)

print(FINAL)
