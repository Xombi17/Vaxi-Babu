"""
WellSync Voice Agent Demo
--------------------------
Streamlit UI for testing Vapi voice agent with live conversation.
Supports multiple languages for voice interaction.
"""

import streamlit as st
import requests

st.set_page_config(page_title="WellSync Voice Agent", page_icon="🎙️")

st.title("🎙️ WellSync Voice Agent")
st.markdown("Test the voice agent with live conversation in different languages")

# Language selection
LANGUAGES = {
    "English": "en",
    "Hindi": "hi",
    "Marathi": "mr",
    "Tamil": "ta",
    "Telugu": "te",
    "Bengali": "bn",
    "Gujarati": "gu",
    "Kannada": "kn",
    "Malayalam": "ml",
    "Punjabi": "pa",
}

selected_language = st.selectbox("🌐 Select Language", list(LANGUAGES.keys()))
language_code = LANGUAGES[selected_language]

st.markdown("---")

# Vapi configuration
VAPI_CONFIG = {
    "en": "Welcome to WellSync! How can I help you today?",
    "hi": "नमस्ते! WellSync में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूं?",
    "mr": "नमस्कार! WellSync मध्ये आपले स्वागत आहे. मी आपली कशी मदत करू शकतो?",
    "ta": "வணக்கம்! WellSync க்கு வரவேற்கிறோம். உங்களுக்கு எப்படி உதவ முடியும்?",
    "te": "నమస్కారం! WellSyncకు స్వాగతం. మీకు ఎలా సహాయం చేయగలను?",
    "bn": "নমস্কার! WellSync এ আপনাকে স্বাগতম। আমি কীভাবে আপনাকে সাহায্য করতে পারি?",
    "gu": "નમસ્તે! WellSync માં આપનું સ્વાગત છે. હું તમને કેવી રીતે મદદ કરી શકું?",
    "kn": "ನಮಸ್ಕಾರ! WellSync ಗೆ ಸ್ವಾಗತ. ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    "ml": "നമസ്കാരം! WellSync-ലേക്ക് സ്വാഗതം. എങ്ങനെ സഹായിക്കാനാകും?",
    "pa": "ਨਮਸਤੇ! WellSync ਵਿੱਚ ਤੁਹਾਦਾ ਸਵਾਗਤ ਹੈ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
}

# Instructions
with st.expander("ℹ️ How to use"):
    st.markdown("""
    ### Setup Required:
    1. Configure Vapi credentials in `.env` file:
       - `VAPI_API_KEY` - Your Vapi API key
       - `VAPI_WEBHOOK_SECRET` - Your webhook secret
    
    2. Update the backend URL below if needed
    
    3. Start the backend: `uvicorn app.main:app --reload`
    
    ### How it works:
    - Click "Start Voice Call" to begin
    - The voice agent will greet you in your selected language
    - Ask questions about:
      - Vaccination schedules
      - Upcoming health events
      - Medicine safety
      - General health tips
    - Say "goodbye" to end the call
    """)

BACKEND_URL = st.text_input("Backend URL", value="http://localhost:8000")

# Voice call button
st.markdown("### 🎤 Start Voice Call")

if st.button("📞 Start Voice Call", type="primary", use_container_width=True):
    st.info(f"🔊 Language: {selected_language}")
    st.info("⚠️ Note: This requires Vapi credentials to be configured. Check the instructions above.")

    # Show call status
    st.markdown("### Call Status")
    status_placeholder = st.empty()
    status_placeholder.info("📞 Connecting to voice agent...")

    # Try to get assistant config from backend
    try:
        # Note: In production, you would use Vapi's client library
        # This is a simplified demo
        response = requests.post(
            f"{BACKEND_URL}/api/v1/voice/webhook",
            json={"message": {"type": "assistant-request", "sessionId": "demo-session"}},
            timeout=5,
        )

        if response.status_code == 401:
            status_placeholder.error("❌ Invalid webhook signature - check VAPI_WEBHOOK_SECRET")
        else:
            status_placeholder.success("✅ Connected! (Demo mode - real call requires Vapi setup)")

    except requests.exceptions.RequestException as e:
        status_placeholder.error(f"❌ Connection failed: {str(e)}")

# Manual test section
st.markdown("---")
st.markdown("### 🧪 Test Voice Functions")

col1, col2 = st.columns(2)

with col1:
    st.markdown("#### Ask about vaccination")
    if st.button("What's due next?"):
        st.info("This would trigger a voice response via Vapi")

with col2:
    st.markdown("#### Check medicine")
    if st.button("Is Crocin safe?"):
        # Test the medicine endpoint
        try:
            response = requests.post(f"{BACKEND_URL}/api/v1/medicine/check-name", json={"medicine_name": "Crocin"})
            if response.status_code == 200:
                result = response.json()
                st.success(f"✅ {result['bucket']}: {result['why_caution'][:100]}...")
            else:
                st.error(f"Error: {response.status_code}")
        except Exception as e:
            st.error(f"Failed: {e}")

# Display conversation log (demo)
st.markdown("---")
st.markdown("### 💬 Conversation Log")

if "conversation" not in st.session_state:
    st.session_state.conversation = []

# Demo conversation display
for msg in st.session_state.conversation:
    if msg["role"] == "user":
        st.chat_message("user").write(msg["content"])
    else:
        st.chat_message("assistant").write(msg["content"])

# Quick questions
st.markdown("### ⚡ Quick Questions")
questions = [
    "When is the next vaccine due?",
    "Is this medicine safe?",
    "What vitamins does my child need?",
]

cols = st.columns(3)
for i, q in enumerate(questions):
    if cols[i % 3].button(q, key=f"q_{i}"):
        st.info(f"You asked: {q}")

# Footer
st.markdown("---")
st.caption("""
💡 **Tips for voice conversation:**
- Speak clearly and at normal pace
- Ask about vaccinations: "What's due next?"
- Ask about medicine safety: "Is [medicine name] safe?"
- Ask for reminders: "Remind me about next vaccine"
- Say "stop" or "goodbye" to end the call
""")
