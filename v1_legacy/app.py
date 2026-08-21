"""
app.py — Streamlit UI for the AI Auto Project Generator.

Run with:  streamlit run app.py
"""

from __future__ import annotations

import pathlib

import streamlit as st

from generator import SECTION_KEYS, SECTION_ICONS, TOGGLEABLE_SECTIONS

GENERATION_ENABLED = False
GENERATION_DISABLED_MESSAGE = "All generation features are currently disabled."

# ---------------------------------------------------------------------------
# Page config (must be the first Streamlit call)
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="AI Auto Project Generator",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------------------------------------------------------------------------
# Load & inject custom CSS
# ---------------------------------------------------------------------------
_CSS_PATH = pathlib.Path(__file__).parent / "styles.css"

if _CSS_PATH.exists():
    st.markdown(f"<style>{_CSS_PATH.read_text()}</style>", unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# Sidebar — User Inputs
# ---------------------------------------------------------------------------
with st.sidebar:
    st.markdown("## ⚙️ Project Parameters")

    # --- Custom Project Input ---
    with st.expander("📝 Custom Project Idea", expanded=False):
        custom_idea = st.text_area(
            "Describe your project idea",
            placeholder='e.g. "AI-powered sports analytics for cricket" or "Blockchain-based voting system"',
            height=100,
            key="custom_idea_input",
        )
        st.caption("Leave empty to let AI pick an idea based on your domain and preferences.")

    st.markdown("---")

    # --- Domain ---
    domain = st.selectbox(
        "🏷️ Domain",
        [
            "Artificial Intelligence",
            "Machine Learning",
            "Data Science",
            "Healthcare",
            "Finance / FinTech",
            "Cybersecurity",
            "Education / EdTech",
            "E-Commerce",
            "IoT / Smart Systems",
            "Natural Language Processing",
            "Computer Vision",
            "Blockchain",
            "Cloud Computing",
            "Other",
        ],
        index=0,
    )

    if domain == "Other":
        domain = st.text_input("Enter your domain", value="")

    # --- Smart Suggestions ---
    if domain and domain != "Other":
        with st.expander("💡 Smart Suggestions", expanded=False):
            if st.button(
                "🔮 Get AI Project Ideas",
                key="smart_suggest_btn",
                use_container_width=True,
                disabled=not GENERATION_ENABLED,
            ):
                with st.spinner("Thinking…"):
                    try:
                        from agent import get_smart_suggestions
                        suggestions = get_smart_suggestions(domain, "Intermediate")
                        st.session_state["smart_suggestions"] = suggestions
                    except Exception as e:
                        st.error(f"Could not get suggestions: {e}")

            if "smart_suggestions" in st.session_state:
                st.markdown(st.session_state["smart_suggestions"])
                st.caption("Click an idea and paste it into the Custom Project Idea field above!")

    # --- Skill Level ---
    skill_level = st.radio(
        "📈 Skill Level",
        ["Beginner", "Intermediate", "Advanced"],
        index=1,
    )

    # --- Technologies ---
    technologies = st.multiselect(
        "🛠️ Preferred Technologies",
        [
            "Python",
            "Machine Learning",
            "Deep Learning",
            "Flask / Django",
            "React / Next.js",
            "Streamlit",
            "TensorFlow / PyTorch",
            "SQL / NoSQL",
            "Docker / Kubernetes",
            "OpenCV",
            "LangChain",
            "REST APIs",
        ],
        default=["Python", "Machine Learning"],
    )

    # --- Complexity ---
    complexity = st.radio(
        "📊 Project Complexity",
        ["Mini Project", "Major Project", "Research-Level"],
        index=1,
    )

    st.markdown("---")

    # --- Section Toggles ---
    with st.expander("📋 Section Control", expanded=False):
        st.caption("Select which sections to include in the blueprint:")
        selected_sections = []
        for key in SECTION_KEYS:
            if key in TOGGLEABLE_SECTIONS:
                if st.checkbox(
                    f"{SECTION_ICONS.get(key, '📌')} {key}",
                    value=True,
                    key=f"toggle_{key}",
                ):
                    selected_sections.append(key)
            else:
                selected_sections.append(key)  # always include non-toggleable

    st.markdown("---")

    # --- Agent Mode ---
    with st.expander("🤖 Agent Mode", expanded=False):
        agent_mode = st.radio(
            "Select mode",
            ["Single Agent", "Multi-Agent"],
            index=0,
            key="agent_mode",
            help="Multi-Agent uses Planner → Generator → Reviewer pipeline",
        )
        if agent_mode == "Multi-Agent":
            st.info("🔄 Planner → Content Generator → Reviewer")

    st.markdown("---")

    # --- Chat Mode Toggle ---
    chat_mode = st.toggle("💬 Chat Mode", value=False, key="chat_mode_toggle")

    st.markdown("---")

    # --- Example Prompts ---
    with st.expander("💡 Example Prompts", expanded=False):
        example_configs = [
            {
                "label": "🩺 Healthcare AI (Beginner)",
                "domain": "Healthcare",
                "skill": "Beginner",
                "tech": ["Python", "Machine Learning", "Streamlit"],
                "complexity": "Mini Project",
            },
            {
                "label": "💰 FinTech ML (Advanced)",
                "domain": "Finance / FinTech",
                "skill": "Advanced",
                "tech": ["Python", "Deep Learning", "REST APIs", "Docker / Kubernetes"],
                "complexity": "Research-Level",
            },
            {
                "label": "📚 EdTech NLP (Intermediate)",
                "domain": "Education / EdTech",
                "skill": "Intermediate",
                "tech": ["Python", "LangChain", "Flask / Django", "SQL / NoSQL"],
                "complexity": "Major Project",
            },
        ]

        for cfg in example_configs:
            if st.button(
                cfg["label"],
                use_container_width=True,
                key=f"ex_{cfg['label']}",
                disabled=not GENERATION_ENABLED,
            ):
                st.session_state["_ex_domain"] = cfg["domain"]
                st.session_state["_ex_skill"] = cfg["skill"]
                st.session_state["_ex_tech"] = cfg["tech"]
                st.session_state["_ex_complexity"] = cfg["complexity"]
                st.rerun()

    # Apply example if set
    if "_ex_domain" in st.session_state:
        domain = st.session_state.pop("_ex_domain")
        skill_level = st.session_state.pop("_ex_skill")
        technologies = st.session_state.pop("_ex_tech")
        complexity = st.session_state.pop("_ex_complexity")


# =====================================================================
# Main Layout — Center Content with Margins
# =====================================================================
_, main_col, _ = st.columns([1, 8, 1])

with main_col:
    # ---------------------------------------------------------------------------
    # Header
    # ---------------------------------------------------------------------------
    st.markdown(
        """
        <div class="main-header">
            <div class="brand-badge">ProjectMind AI</div>
            <h1>🤖 AI Auto Project Generator</h1>
            <p>Instantly generate complete academic project blueprints powered by local AI</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.info(GENERATION_DISABLED_MESSAGE)

    # =====================================================================
    # CHAT MODE
    # =====================================================================
    if chat_mode:
        st.markdown("---")
        st.markdown(
            "<h2 style='text-align:center; color:#a855f7;'>💬 Chat with AI Assistant</h2>",
            unsafe_allow_html=True,
        )

        # Init chat history
        if "chat_history" not in st.session_state:
            st.session_state["chat_history"] = []

        # Display chat history
        for msg in st.session_state["chat_history"]:
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])

        # Chat input
        if not GENERATION_ENABLED:
            st.caption("Chat generation is also disabled for now.")
            user_msg = None
        else:
            user_msg = st.chat_input("Ask anything about your project…")
        if user_msg:
            # Show user message
            st.session_state["chat_history"].append({"role": "user", "content": user_msg})
            with st.chat_message("user"):
                st.markdown(user_msg)

            # Generate response
            with st.chat_message("assistant"):
                with st.spinner("AI is thinking…"):
                    try:
                        from agent import chat_with_ai

                        # Build context from generated sections if available
                        context = ""
                        if "generated_sections" in st.session_state:
                            secs = st.session_state["generated_sections"]
                            context = "\n".join(
                                f"**{k}:** {v[:200]}" for k, v in secs.items()
                            )

                        response = chat_with_ai(user_msg, context)
                        st.markdown(response)
                        st.session_state["chat_history"].append(
                            {"role": "assistant", "content": response}
                        )
                    except Exception as exc:
                        st.error(f"Error: {exc}")

    else:
        # =====================================================================
        # STANDARD MODE — Generate button
        # =====================================================================
        st.markdown("---")

        btn_col1, btn_col2, btn_col3 = st.columns([1, 2, 1])
        with btn_col2:
            generate_clicked = st.button(
                "🚀  Generate Project Blueprint",
                type="primary",
                use_container_width=True,
                key="gen_btn",
                disabled=not GENERATION_ENABLED,
            )

        # ---------------------------------------------------------------------------
        # Generation logic
        # ---------------------------------------------------------------------------
        if generate_clicked:
            if not domain:
                st.warning("Please enter a domain first.")
                st.stop()

            if not technologies:
                st.warning("Please select at least one preferred technology.")
                st.stop()

            tech_str = ", ".join(technologies)
            is_multi = agent_mode == "Multi-Agent"

            # Progress indicator
            progress_steps = [
                "🔍 Analyzing input…",
                "🧠 Planner Agent brainstorming…",
                "📐 Generating content…",
            ]
            if is_multi:
                progress_steps.append("🔍 Reviewer Agent improving…")
            progress_steps.append("✅ Finalizing blueprint…")

            progress_bar = st.progress(0)
            status_text = st.empty()

            step_count = [0]
            total_steps = len(progress_steps)

            def _on_status(msg: str) -> None:
                idx = min(step_count[0], total_steps - 1)
                progress_bar.progress((idx + 1) / total_steps)
                status_text.info(f"**Step {idx + 1}/{total_steps}:** {msg}")
                step_count[0] += 1

            with st.spinner("⏳ Generating your project…"):
                try:
                    from agent import generate_project

                    sections = generate_project(
                        domain=domain,
                        skill_level=skill_level,
                        technologies=tech_str,
                        complexity=complexity,
                        custom_idea=custom_idea if custom_idea else "",
                        selected_sections=selected_sections,
                        multi_agent=is_multi,
                        on_status=_on_status,
                    )

                    progress_bar.progress(1.0)
                    status_text.success("✅ Blueprint generated successfully!")
                    st.session_state["generated_sections"] = sections
                    st.session_state["gen_domain"] = domain
                    st.session_state["gen_complexity"] = complexity
                    st.session_state["gen_skill"] = skill_level

                except ConnectionError as exc:
                    progress_bar.empty()
                    status_text.empty()
                    st.error(
                        f"**Cloud API Connection Error:**\n\n"
                        f"```text\n{exc}\n```\n\n"
                        f"Please verify your API key or internet connection."
                    )
                    st.stop()
                except Exception as exc:  # noqa: BLE001
                    progress_bar.empty()
                    status_text.empty()
                    st.error(f"An unexpected error occurred:\n\n```\n{exc}\n```")
                    st.stop()


        # =====================================================================
        # Display generated sections
        # =====================================================================
        if "generated_sections" in st.session_state:
            sections: dict[str, str] = st.session_state["generated_sections"]

            st.markdown("---")
            st.markdown(
                "<h2 style='text-align:center; color:#a855f7;'>📋 Your Project Blueprint</h2>",
                unsafe_allow_html=True,
            )

            # --- "Make it Unique" button ---
            uniq_col1, uniq_col2, uniq_col3 = st.columns([1, 2, 1])
            with uniq_col2:
                if st.button(
                    "✨ Make it Unique",
                    type="primary",
                    use_container_width=True,
                    key="make_unique_btn",
                    disabled=not GENERATION_ENABLED,
                ):
                    with st.spinner("Generating your project…"):
                        try:
                            from agent import make_unique
                            blueprint_text = "\n\n".join(
                                f"## {k}\n{v}" for k, v in sections.items()
                            )
                            new_sections = make_unique(blueprint_text)
                            if new_sections:
                                st.session_state["generated_sections"] = new_sections
                                st.rerun()
                        except Exception as exc:
                            st.error(f"Error: {exc}")

            st.markdown("<br/>", unsafe_allow_html=True)

            def browser_copy_button(text: str) -> None:
                import json
                import streamlit.components.v1 as components
                text_safe = json.dumps(text).replace("</script>", "<\\/script>")
                html_code = f'''
                <style>
                body {{ margin: 0; padding: 0; background-color: transparent; font-family: "Inter", sans-serif; }}
                button {{
                    background-color: #1e293b;
                    color: #f8fafc;
                    border: 1px solid #475569;
                    border-radius: 8px;
                    padding: 0.55rem 1.2rem;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    box-sizing: border-box;
                    transition: all 0.2s ease;
                }}
                button:hover {{ background-color: #334155; border-color: #94a3b8; }}
                button:active {{ transform: scale(0.98); }}
                </style>
                <script>
                const textToCopy = {text_safe};
                function doCopy(btn) {{
                    navigator.clipboard.writeText(textToCopy).then(() => {{
                        btn.innerText = '✅ Copied!';
                        setTimeout(() => btn.innerText = '📋 Copy', 2000);
                    }});
                }}
                </script>
                <button onclick="doCopy(this)">📋 Copy</button>
                '''
                components.html(html_code, height=45)

            # --- Render each section neatly ---
            def _render_section(title: str, content: str) -> None:
                """Render a clean card with a text area and side-by-side buttons."""
                icon = SECTION_ICONS.get(title, "📌")
                
                with st.container():
                    st.markdown(f"<div class='section-card'>", unsafe_allow_html=True)
                    st.markdown(f"### {icon} {title}")
                    
                    # Native scrollable container to render Markdown nicely
                    with st.container(height=280, border=True):
                        st.markdown(content)

                    # Buttons aligned neatly side-by-side
                    act_col1, act_col2, act_col3 = st.columns([1, 1, 4])
                    
                    with act_col1:
                        browser_copy_button(content)
                    
                    with act_col2:
                        if st.button(
                            f"🔄 Regenerate",
                            key=f"regen_{title}",
                            disabled=not GENERATION_ENABLED,
                        ):
                            with st.spinner(f"Generating your project…"):
                                try:
                                    from agent import regenerate_section
                                    proj_title = sections.get("Project Title", "Untitled")
                                    gen_domain = st.session_state.get("gen_domain", "")
                                    new_content = regenerate_section(
                                        section_name=title,
                                        title=proj_title,
                                        domain=gen_domain,
                                        existing_content=content,
                                    )
                                    st.session_state["generated_sections"][title] = new_content
                                    st.rerun()
                                except Exception as exc:
                                    st.error(f"Error: {exc}")
                    
                    st.markdown("</div><br/>", unsafe_allow_html=True)

            # Render sections in canonical order first, then any extras
            rendered = set()
            for key in SECTION_KEYS:
                if key in sections:
                    _render_section(key, sections[key])
                    rendered.add(key)

            for key, content in sections.items():
                if key not in rendered:
                    _render_section(str(key), content)

            # =====================================================================
            # Extra Feature Buttons
            # =====================================================================
            st.markdown("---")
            st.markdown(
                "<h3 style='text-align:center; color:#a855f7;'>🔧 Additional Tools</h3>",
                unsafe_allow_html=True,
            )

            proj_title = sections.get("Project Title", "Untitled Project")
            proj_overview = "\n".join(
                f"{k}: {v[:150]}" for k, v in list(sections.items())[:5]
            )
            tech_stack_str = sections.get("Technology Stack", "Python, Machine Learning")

            tool_cols = st.columns(3)

            # --- Viva Questions ---
            with tool_cols[0]:
                if st.button("🎓 Viva Questions", use_container_width=True, key="viva_btn", disabled=not GENERATION_ENABLED):
                    with st.spinner("Generating your project…"):
                        try:
                            from agent import generate_viva_questions
                            result = generate_viva_questions(proj_title, proj_overview)
                            st.session_state["viva_questions"] = result
                        except Exception as exc:
                            st.error(f"Error: {exc}")

            # --- Project Timeline ---
            with tool_cols[1]:
                if st.button("📅 Project Timeline", use_container_width=True, key="timeline_btn", disabled=not GENERATION_ENABLED):
                    with st.spinner("Generating your project…"):
                        try:
                            from agent import generate_timeline
                            gen_complexity = st.session_state.get("gen_complexity", complexity)
                            result = generate_timeline(proj_title, gen_complexity, proj_overview)
                            st.session_state["project_timeline"] = result
                        except Exception as exc:
                            st.error(f"Error: {exc}")

            # --- Tech Stack Recommendation ---
            with tool_cols[2]:
                if st.button("🛠️ Tech Stack Advice", use_container_width=True, key="techstack_btn", disabled=not GENERATION_ENABLED):
                    with st.spinner("Generating your project…"):
                        try:
                            from agent import generate_tech_stack
                            gen_domain = st.session_state.get("gen_domain", domain)
                            gen_skill = st.session_state.get("gen_skill", skill_level)
                            result = generate_tech_stack(
                                proj_title, gen_domain, gen_skill, proj_overview
                            )
                            st.session_state["tech_recommendation"] = result
                        except Exception as exc:
                            st.error(f"Error: {exc}")

            tool_cols2 = st.columns(3)

            # --- Architecture Overview ---
            with tool_cols2[0]:
                if st.button("🏗️ Architecture", use_container_width=True, key="arch_btn", disabled=not GENERATION_ENABLED):
                    with st.spinner("Generating your project…"):
                        try:
                            from agent import generate_architecture
                            result = generate_architecture(
                                proj_title, tech_stack_str, proj_overview
                            )
                            st.session_state["architecture_overview"] = result
                        except Exception as exc:
                            st.error(f"Error: {exc}")

            # --- Starter Code ---
            with tool_cols2[1]:
                if st.button("💻 Starter Code", use_container_width=True, key="code_btn", disabled=not GENERATION_ENABLED):
                    with st.spinner("Generating your project…"):
                        try:
                            from agent import generate_starter_code
                            result = generate_starter_code(
                                proj_title, tech_stack_str, proj_overview
                            )
                            st.session_state["starter_code"] = result
                        except Exception as exc:
                            st.error(f"Error: {exc}")

            # --- References ---
            with tool_cols2[2]:
                if st.button("🔗 References", use_container_width=True, key="refs_btn", disabled=not GENERATION_ENABLED):
                    with st.spinner("Generating your project…"):
                        try:
                            from agent import generate_references
                            gen_domain = st.session_state.get("gen_domain", domain)
                            result = generate_references(
                                proj_title, gen_domain, proj_overview
                            )
                            st.session_state["generated_references"] = result
                        except Exception as exc:
                            st.error(f"Error: {exc}")

            # --- Display extra tool outputs cleanly ---
            _extra_sections = [
                ("viva_questions", "🎓 Viva Questions & Answers"),
                ("project_timeline", "📅 Project Timeline"),
                ("tech_recommendation", "🛠️ Tech Stack Recommendation"),
                ("architecture_overview", "🏗️ Architecture Overview"),
                ("starter_code", "💻 Starter Code"),
                ("generated_references", "🔗 References & Research Papers"),
            ]

            for skey, stitle in _extra_sections:
                if skey in st.session_state:
                    with st.container():
                        st.markdown(f"<div class='section-card'>", unsafe_allow_html=True)
                        st.markdown(f"### {stitle}")
                        content = st.session_state[skey]
                        
                        with st.container(height=300, border=True):
                            st.markdown(content)
                        
                        cnt_col1, cnt_col2 = st.columns([1, 4])
                        with cnt_col1:
                            browser_copy_button(content)
                                    
                        st.markdown("</div><br/>", unsafe_allow_html=True)

            # =====================================================================
            # Export / Download Section
            # =====================================================================
            st.markdown("---")
            st.markdown(
                "<h3 style='text-align:center; color:#a855f7;'>📥 Export Blueprint</h3>",
                unsafe_allow_html=True,
            )

            # Download buttons
            dl_cols = st.columns(4)

            with dl_cols[0]:
                try:
                    from exports import build_pdf
                    pdf_bytes = build_pdf(sections)
                    st.download_button(
                        label="📥 PDF",
                        data=pdf_bytes,
                        file_name="project_blueprint.pdf",
                        mime="application/pdf",
                        use_container_width=True,
                        key="dl_pdf",
                    )
                except ImportError:
                    st.download_button(
                        label="📥 PDF",
                        data=b"",
                        disabled=True,
                        help="Please install fpdf2 via pip to enable PDF export",
                        use_container_width=True,
                        key="dl_pdf_disabled",
                    )

            with dl_cols[1]:
                try:
                    from exports import build_docx
                    docx_bytes = build_docx(sections)
                    st.download_button(
                        label="📥 DOCX",
                        data=docx_bytes,
                        file_name="project_blueprint.docx",
                        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        use_container_width=True,
                        key="dl_docx",
                    )
                except ImportError:
                    st.download_button(
                        label="📥 DOCX",
                        data=b"",
                        disabled=True,
                        help="Please install python-docx via pip to enable DOCX export",
                        use_container_width=True,
                        key="dl_docx_disabled",
                    )

            with dl_cols[2]:
                try:
                    from exports import build_pptx
                    pptx_bytes = build_pptx(sections)
                    st.download_button(
                        label="📥 PPT",
                        data=pptx_bytes,
                        file_name="project_blueprint.pptx",
                        mime="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        use_container_width=True,
                        key="dl_pptx",
                    )
                except ImportError:
                    st.download_button(
                        label="📥 PPT",
                        data=b"",
                        disabled=True,
                        help="Please install python-pptx via pip to enable PPT export",
                        use_container_width=True,
                        key="dl_pptx_disabled",
                    )

            with dl_cols[3]:
                from exports import build_markdown as bm
                md_str = bm(sections)
                st.download_button(
                    label="📥 Markdown",
                    data=md_str,
                    file_name="project_blueprint.md",
                    mime="text/markdown",
                    use_container_width=True,
                    key="dl_md",
                )

# ---------------------------------------------------------------------------
# Footer
# ---------------------------------------------------------------------------
with main_col:
    st.markdown(
        """
        <div class="footer">
            ⚡ Powered by ProjectMind AI · Built with ❤️ using Streamlit + Ollama<br/>
        </div>
        """,
        unsafe_allow_html=True,
    )
