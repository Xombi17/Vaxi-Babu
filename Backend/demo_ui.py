
import requests
import streamlit as st

# Configure page
st.set_page_config(page_title="WellSync AI Demo", page_icon="💉", layout="wide")
API_URL = "http://localhost:8000/api/v1"

st.title("🩺 WellSync AI — Backend Demo UI")
st.markdown("Use this Streamlit UI as a fallback demonstration to verify that your FastAPI backend endpoints are working flawlessly.")

# ──────────────────────────────────────────────────────────────────────────────
# Check API Connection Status
# ──────────────────────────────────────────────────────────────────────────────
@st.cache_data(ttl=5)
def check_api_status():
    try:
        response = requests.get("http://localhost:8000/health", timeout=2)
        return response.status_code == 200
    except requests.RequestException:
        return False

api_online = check_api_status()
if api_online:
    st.success("✅ **FastAPI Backend is Online** (http://localhost:8000)")
else:
    st.error("🚨 **FastAPI Backend is Offline**. Please run `uvicorn app.main:app --reload` in your Backend folder before using this demo.")
    st.stop()


# ──────────────────────────────────────────────────────────────────────────────
# Sidebar: Setup Household & Dependent
# ──────────────────────────────────────────────────────────────────────────────
st.sidebar.header("🏠 1. Household Context")

# Household section
if 'household_id' not in st.session_state:
    st.sidebar.subheader("Create Household")
    contact_name = st.sidebar.text_input("Parent's Name", "Jane Doe")
    contact_phone = st.sidebar.text_input("Phone Number", "+919876543210")
    if st.sidebar.button("Create Household"):
        resp = requests.post(
            f"{API_URL}/households",
            json={"primary_contact_name": contact_name, "primary_contact_phone": contact_phone}
        )
        if resp.status_code == 201:
            st.session_state.household_id = resp.json()["id"]
            st.sidebar.success("Household Created!")
            st.rerun()
else:
    st.sidebar.success(f"Household Active: `{st.session_state.household_id[:8]}...`")
    if st.sidebar.button("Reset Context"):
        for key in ['household_id', 'dependent_id']:
            if key in st.session_state:
                del st.session_state[key]
        st.rerun()

# Dependent section
if 'household_id' in st.session_state and 'dependent_id' not in st.session_state:
    st.sidebar.subheader("Add Child/Dependent")
    dep_name = st.sidebar.text_input("Child's Name", "Baby Max")
    dob = st.sidebar.date_input("Date of Birth")
    gender = st.sidebar.selectbox("Gender", ["Male", "Female", "Other"])
    
    if st.sidebar.button("Add & Generate Schedule"):
        with st.spinner("Generating Deterministic Schedule..."):
            resp = requests.post(
                f"{API_URL}/dependents",
                json={
                    "household_id": st.session_state.household_id,
                    "name": dep_name,
                    "date_of_birth": dob.strftime("%Y-%m-%d"),
                    "gender": gender,
                    "relationship": "Child"
                }
            )
            if resp.status_code == 201:
                st.session_state.dependent_id = resp.json()["id"]
                st.sidebar.success("Generated Timeline!")
                st.rerun()
            else:
                st.sidebar.error(f"Error: {resp.text}")

if 'dependent_id' in st.session_state:
    st.sidebar.success(f"Tracking: {dep_name if 'dep_name' in locals() else 'Child'}")

# ──────────────────────────────────────────────────────────────────────────────
# Main Tabs
# ──────────────────────────────────────────────────────────────────────────────
tab1, tab2 = st.tabs(["📅 Vaccination Timeline & Explanations", "💊 Medicine Safety Scanner"])

# ─── TAB 1: Timeline & AI Explanations ───
with tab1:
    if 'dependent_id' not in st.session_state:
        st.info("👈 Please create a Household and Add a Child in the sidebar to view their timeline.")
    else:
        st.header("Vaccination & Checkup Timeline")
        
        # Fetch the timeline
        resp = requests.get(f"{API_URL}/timeline/{st.session_state.dependent_id}")
        if resp.status_code == 200:
            timeline_data = resp.json()
            events = timeline_data.get("events", [])
            
            # Show Next Due Callout
            next_due = timeline_data.get("next_due")
            if next_due:
                st.warning(f"🔔 **Next Appointment Due:** {next_due['name']} at {next_due['due_date']}")

            # Filter controls
            status_filter = st.radio("Filter Status", ["All", "upcoming", "due", "overdue", "completed"], horizontal=True)

            # Display Events
            for event in events:
                if status_filter != "All" and event["status"] != status_filter:
                    continue
                
                with st.expander(f"{'✅' if event['status'] == 'completed' else '🗓️'} {event['name']} — Due: {event['due_date']} ({event['status'].upper()})"):
                    col_info, col_ai = st.columns([1, 1])
                    
                    with col_info:
                        st.write(f"**Category:** {event['category']}")
                        if event.get("description"):
                            st.write(f"**Description:** {event['description']}")
                        st.write(f"**Window:** {event['window_start']} to {event['window_end']}")
                        
                        if event["status"] != "completed":
                            if st.button("Mark as Completed", key=f"btn_{event['id']}"):
                                mark_resp = requests.patch(
                                    f"{API_URL}/timeline/{st.session_state.dependent_id}/events/{event['id']}/complete",
                                    json={"completed_by": "Demo UI"}
                                )
                                if mark_resp.status_code == 200:
                                    st.success("Completed!")
                                    st.rerun()
                    
                    with col_ai:
                        # Call Groq AI API endpoint for plain language explanation
                        if st.button("✨ Explain using AI", key=f"ai_{event['id']}"):
                            with st.spinner("Asking Groq via Backend..."):
                                ai_resp = requests.post(f"{API_URL}/ai/explain-event", json={"event_id": event["id"]})
                                if ai_resp.status_code == 200:
                                    explanation = ai_resp.json().get("explanation", "")
                                    st.info(f"**Plain Language Translation:**\n\n{explanation}")
                                else:
                                    st.error("AI service error.")
        else:
            st.error("Failed to load timeline.")

# ─── TAB 2: Medicine Safety Scanner ───
with tab2:
    st.header("📸 Medicine Scanner")
    st.markdown("Upload a photo of a medicine box/prescription, or type the name directly. The backend OCR will extract the text, and the deterministic safety engine will categorize the risk.")

    scancol1, scancol2 = st.columns(2)
    
    with scancol1:
        st.subheader("Upload Image (OCR)")
        uploaded_file = st.file_uploader("Upload Image (Requires Ollama running)", type=["jpg", "png", "jpeg"])
        concern_image = st.text_input("Special Concern (e.g., 'pregnancy', 'children')", key="ci")
        
        if st.button("Scan Image") and uploaded_file:
            with st.spinner("Extracting text via Gemma 4 / Llama 3.2 Vision & running safety rules..."):
                files = {"file": (uploaded_file.name, uploaded_file, uploaded_file.type)}
                data = {"concern": concern_image} if concern_image else {}
                resp = requests.post(f"{API_URL}/medicine/check-image", files=files, data=data)
                
                if resp.status_code == 200:
                    result = resp.json()
                    st.write(f"🔍 **OCR Extracted:** `{result['detected_medicine']}` (Model: {result.get('ocr_model_used', 'N/A')})")
                    if result["bucket"] == "consult_doctor_urgently":
                        st.error(f"🚨 **HIGH RISK**\n\n**Why:** {result['why_caution']}\n\n**Next Steps:** {result['next_step']}")
                    elif result["bucket"] == "use_with_caution":
                        st.warning(f"⚠️ **CAUTION**\n\n**Why:** {result['why_caution']}")
                    elif result["bucket"] == "insufficient_info":
                        st.info(f"❓ **UNKNOWN**\n\n{result['why_caution']}")
                    else:
                        st.success(f"✅ **SAFE**\n\n**Why:** {result['why_caution']}")
                else:
                    st.error(f"Error ({resp.status_code}): {resp.text}")

    with scancol2:
        st.subheader("Text-Based Check")
        med_name = st.text_input("Medicine Name (e.g., 'Warfarin', 'Paracetamol')")
        concern_text = st.text_input("Special Concern", key="ct")
        
        if st.button("Check Drug Name") and med_name:
            with st.spinner("Running deterministic safety rules..."):
                resp = requests.post(f"{API_URL}/medicine/check-name", json={"medicine_name": med_name, "concern": concern_text})
                
                if resp.status_code == 200:
                    result = resp.json()
                    if result["bucket"] == "consult_doctor_urgently":
                        st.error(f"🚨 **HIGH RISK**\n\n**Why:** {result['why_caution']}\n\n**Next Steps:** {result['next_step']}")
                    elif result["bucket"] == "use_with_caution":
                        st.warning(f"⚠️ **CAUTION**\n\n**Why:** {result['why_caution']}")
                    elif result["bucket"] == "insufficient_info":
                        st.info(f"❓ **UNKNOWN**\n\n{result['why_caution']}")
                    else:
                        st.success(f"✅ **SAFE**\n\n**Why:** {result['why_caution']}")
                else:
                    st.error(f"Error ({resp.status_code}): {resp.text}")

st.markdown("---")
st.markdown("<small>Powered by Streamlit — WellSync AI Backend Demo</small>", unsafe_allow_html=True)
