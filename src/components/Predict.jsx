import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// --- Gemini API credentials (free tier) ---
const API_KEY = "AIzaSyCEWO4u1Twn8C_U-EVybVEI55zjoCVnzmU";  // Replace with your actual key
const SYSTEM_PROMPT = `
You are a conversational AI assistant integrated into a women's health application.
You have access to structured health inputs and computed PCOS-related indicators, but you must behave like a normal LLM in conversation.
Core Behavior:
1. Respond naturally to all user messages.
2. Treat greetings, casual talk, jokes, or unrelated questions as normal conversation.
3. Do NOT mention, analyze, or reference health data unless the user explicitly asks about:
   * PCOS
   * their symptoms
   * their results
   * hormonal health
   * metabolic health
   * cycle irregularities
   * risk assessment
4. Do NOT proactively provide medical analysis.
5. Only switch into clinical analysis mode when the user clearly asks a health-related question.
When a PCOS or health-related question is asked:
* Answer the specific question first.
* Use available structured inputs and computed indicators to personalize the response.
* Provide clear, structured insights.
* Do not restate raw input values.
* Do not include disclaimers.
* Keep the tone conversational, not robotic.
Formatting & Output Rules (Critical for UI):
1. Do NOT use markdown symbols such as *, **, #, or backticks.
2. Do NOT generate long paragraphs.
3. Use short, clean bullet-style lines using simple dashes (-).
4. Keep each point concise and scannable.
5. Avoid dense explanations or algorithm discussions.
6. Do NOT mention proprietary calculations or internal scoring logic.
7. Separate insights clearly instead of mixing them in one paragraph.
8. Keep language simple and direct.
9. Avoid persuasive or emotional phrasing (e.g., “good news”).
10. Do not expose internal system labels unless necessary for clarity.
11. Optimize every response for quick mobile chat readability.

At all times:
* Sound like a normal assistant.
* Do not automatically generate reports.
* Do not assume the user wants analysis unless they explicitly request it.
Only output the assistant’s reply. No meta commentary.
No preamble. No reference to internal logic or data unless directly relevant to the user's question.`;

const PCOSAdvancedPredictor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: "", marriageStatus: "", weight: "", bmi: "",
    regularCycle: "", cycleLength: "", skinDarkening: "",
    hairGrowth: "", weightGain: "", fastFood: "", pimples: "",
  });

  const [result, setResult] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const messagesEndRef = useRef(null);

  const isFormComplete = Object.values(formData).every(value => value !== "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when result changes
  useEffect(() => {
    if (result) {
      setMessages([
        { sender: "ai", text: `Your ${result.horScore}% Hormonal Density indicates a ${result.phenotype} pattern. The metabolic contribution is ${result.metScore}%.` },
        { sender: "user", text: "How do I lower it?" },
        { sender: "ai", text: `Based on the Metabolic factor in Zone B (${result.metScore}%), focus on insulin sensitivity. Key remedies: ${result.remedies.map(r => r.type).join(", ")}.` }
      ]);
    } else {
      setMessages([]);
    }
  }, [result]);

  const runLogic = () => {
    if (!isFormComplete) return;
    const d = formData;
    const bmiVal = parseFloat(d.bmi);
    const ageVal = parseInt(d.age);
    const gainVal = parseFloat(d.weightGain);

    // --- 1. OVARIAN DOMAIN (Max: 40) ---
    // Irregularity is the strongest clinical signal
    let Vo = (d.regularCycle === "No" ? 30 : 0);
    const cLen = parseInt(d.cycleLength);
    if (cLen > 35 || cLen < 21) Vo += 10;

    // --- 2. ANDROGEN DOMAIN (Max: 40) ---
    let Va = (d.hairGrowth === "Yes" ? 25 : 0);
    let acneWeight = d.pimples === "Severe" ? 15 : d.pimples === "Moderate" ? 10 : d.pimples === "Mild" ? 5 : 0;
    // Age-adjustment: Acne is more diagnostic of PCOS in adults than teens
    if (ageVal > 22) Va += acneWeight; 
    else Va += (acneWeight * 0.7);

    // --- 3. METABOLIC DOMAIN (Max: 40) ---
    let Vm = (d.skinDarkening === "1" ? 20 : 0);
    if (bmiVal > 28) Vm += 10;
    else if (bmiVal > 25) Vm += 5;
    if (gainVal > 4) Vm += 10;
    if (d.fastFood === "Heavy") Vm += 5;

    // --- 4. COMBINATORIAL SCORING (The "Rotterdam" Weighted Sum) ---
    // PCOS is usually diagnosed if 2 out of 3 domains are high.
    // We sum the scores but cap the final result at 100.
    const rawTotal = Vo + Va + Vm;
    
    // Boost logic: If two domains are significantly high, the risk "jumps" 
    // because the interaction between androgens and insulin is synergistic.
    let synergisticBoost = 0;
    if (Vo >= 30 && Va >= 20) synergisticBoost = 15; // Classic PCOS phenotype
    if (Vm >= 20 && Vo >= 30) synergisticBoost = 10; // Metabolic phenotype

    const finalScore = Math.min(rawTotal + synergisticBoost, 100);

    // --- 5. DYNAMIC PHENOTYPE MAPPING ---
    let phenotype = "Asymptomatic";
    let severity = "Low Risk";

    if (finalScore > 75) {
      severity = "High Risk";
      phenotype = (Vo > 0 && Va > 0 && Vm > 0) ? "Classic Phenotype (Full)" : "High-Intensity Imbalance";
    } else if (finalScore > 45) {
      severity = "Moderate Risk";
      phenotype = (bmiVal < 23 && Va > 15) ? "Lean PCOS Pattern" : "Metabolic/Hormonal Bridge";
    }

    // Identify Contributing Factors for UI
    const contributors = [];
    if (Vo >= 30) contributors.push({ label: "Ovulatory Disruption", impact: "High" });
    if (Va >= 20) contributors.push({ label: "Androgen Excess", impact: "High" });
    if (Vm >= 20) contributors.push({ label: "Insulin Resistance Signs", impact: "High" });
    if (bmiVal > 25 && Vm < 20) contributors.push({ label: "Weight/BMI Factor", impact: "Medium" });

    // Dynamic Remedies
    const remedies = [];
    if (Vo > 20) remedies.push({ type: "Cycle Regulation", items: ["Inositol", "Omega-3"] });
    if (Va > 15) remedies.push({ type: "Androgen Control", items: ["Spearmint", "Zinc"] });
    if (Vm > 15) remedies.push({ type: "Insulin Protocol", items: ["Low GI Diet", "Berberine/Fiber"] });

    setResult({
      score: Math.round(finalScore),
      severity,
      phenotype,
      contributors,
      remedies,
      metScore: Math.round((Vm / 40) * 100),
      horScore: Math.min(Math.round(((Vo + Va) / 80) * 100), 100)
    });
  };

  // Helper to build a comprehensive patient context string
  const getPatientContext = () => {
    if (!result) return "";
    
    return `PATIENT CLINICAL PROFILE:
- Age: ${formData.age || "N/A"} years
- Marriage status: ${formData.marriageStatus || "N/A"}
- Weight: ${formData.weight || "N/A"} kg
- BMI: ${formData.bmi || "N/A"}
- Regular cycle: ${formData.regularCycle || "N/A"}
- Cycle length: ${formData.cycleLength || "N/A"} days
- Skin darkening: ${formData.skinDarkening === "1" ? "Yes" : formData.skinDarkening === "0" ? "No" : "N/A"}
- Hair growth: ${formData.hairGrowth || "N/A"}
- Weight gain: ${formData.weightGain || "N/A"} kg
- Acne severity: ${formData.pimples || "N/A"}
- Diet habit: ${formData.fastFood || "N/A"}

COMPUTED DIAGNOSIS:
- Phenotype: ${result.phenotype}
- Overall risk score: ${result.score}% (${result.severity})
- Metabolic load: ${result.metScore}%
- Hormonal load: ${result.horScore}%
- Contributing factors: ${result.contributors.map(c => `${c.label} (${c.impact} impact)`).join(", ")}
- Recommended approaches: ${result.remedies.map(r => r.type).join(", ")}

Please use this patient data to inform your responses.`;
  };

  // Function to call Gemini API (free model gemini-2.5-flash)
  const callLLM = async (conversation) => {
    if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY") {
      throw new Error("Please set a valid Gemini API key in the code.");
    }

    // Build the full prompt: system + patient context as a user message, then conversation history
    const contextMessage = result ? getPatientContext() : "";
    const systemWithContext = result 
      ? `${SYSTEM_PROMPT}\n\n${contextMessage}` 
      : SYSTEM_PROMPT;

    const contents = [
      { role: "user", parts: [{ text: systemWithContext }] },
      ...conversation.map(m => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }))
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error("No response content from Gemini");
    
    return reply;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isWaiting) return;

    const userMsg = inputMessage.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInputMessage("");
    setIsWaiting(true);

    try {
      // Include the full conversation history (including the initial diagnostic messages)
      const conversationForLLM = messages.concat({ sender: "user", text: userMsg });
      const reply = await callLLM(conversationForLLM);
      setMessages(prev => [...prev, { sender: "ai", text: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: "ai", text: `Error: ${error.message}` }]);
    } finally {
      setIsWaiting(false);
    }
  };

  return (
    <div className="pcos-layout">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #0b0f1a; color: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif; }
        .pcos-layout { display: flex; flex-direction: column; height: 100vh; background: #0b0f1a; }
        .femhealth-nav { background: #111827; border-bottom: 1px solid #2d3748; padding: 12px 24px; font-weight: 700; letter-spacing: 1px; color: #a5b4fc; text-align: center; }
        .main-row { display: flex; flex: 1; overflow: hidden; }
        /* Zone A: Clinical Input */
        .zone-a { width: 320px; background: #161b2a; border-right: 1px solid #2d3748; overflow-y: auto; padding: 24px; }
        .input-group { margin-bottom: 18px; }
        label { font-size: 10px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px; }
        input, select { width: 100%; background: #0b0f1a; border: 1px solid #2d3748; padding: 12px; border-radius: 8px; color: white; font-size: 14px; outline: none; transition: 0.2s; }
        input:focus, select:focus { border-color: #4f46e5; }
        .btn-execute { width: 100%; background: #4f46e5; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 800; cursor: pointer; margin-top: 10px; }
        .btn-execute:disabled { opacity: 0.3; cursor: not-allowed; }
        /* Zone B: Evidence Metrics */
        .zone-b { width: 300px; background: #0f1322; border-right: 1px solid #2d3748; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }
        .metric-card { background: #1a202c; border-radius: 16px; padding: 20px; border: 1px solid #2d3748; }
        .phenotype-header { margin-bottom: 0; }
        .phenotype-header h2 { margin: 0 0 4px 0; font-size: 18px; color: #a5b4fc; }
        .phenotype-header p { margin: 0; font-size: 13px; color: #718096; }
        .progress-item { margin-bottom: 20px; }
        .progress-label { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
        .progress-bar-bg { height: 8px; background: #0b0f1a; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 1s ease; }
        .severity-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #2d3748; }
        .factor-tag { display: flex; justify-content: space-between; padding: 12px; background: #1a202c; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid #4f46e5; }
        .impact-high { color: #f87171; font-weight: 800; font-size: 11px; }
        /* Zone C: AI Conversation */
        .zone-c { flex: 1; display: flex; flex-direction: column; background: #0b0f1a; overflow: hidden; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .message-bubble { max-width: 80%; padding: 12px 16px; border-radius: 18px; font-size: 14px; line-height: 1.5; }
        .message-bubble.ai { align-self: flex-start; background: #1e2434; border-bottom-left-radius: 4px; color: #e2e8f0; }
        .message-bubble.user { align-self: flex-end; background: #4f46e5; border-bottom-right-radius: 4px; color: white; }
        .chat-input-area { display: flex; gap: 12px; padding: 20px 24px; background: #111827; border-top: 1px solid #2d3748; }
        .chat-input-area input { flex: 1; background: #0b0f1a; border: 1px solid #2d3748; border-radius: 40px; padding: 14px 20px; color: white; font-size: 14px; }
        .chat-input-area button { background: #4f46e5; border: none; border-radius: 40px; padding: 0 24px; font-weight: 700; color: white; cursor: pointer; transition: 0.2s; }
        .chat-input-area button:disabled { opacity: 0.5; cursor: not-allowed; }
        .chat-input-area button:hover:not(:disabled) { background: #6366f1; }
        /* Zone D: Launch Bar */
        .zone-d { background: linear-gradient(90deg, #1e1b4b 0%, #312e81 100%); border-top: 1px solid #4f46e5; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; }
        .launch-text { font-weight: 600; color: #c7d2fe; }
        .launch-button { background: white; color: #4f46e5; border: none; padding: 12px 28px; border-radius: 40px; font-weight: 800; font-size: 16px; cursor: pointer; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); transition: 0.2s; }
        .launch-button:hover { transform: scale(1.02); background: #f0f9ff; }
        .placeholder-metrics { color: #4a5568; text-align: center; margin-top: 40px; font-style: italic; }
      `}</style>

      {/* Fixed Navigation */}
      <div className="femhealth-nav">FEMHEALTH NAVIGATION (Fixed)</div>

      {/* Main Row: Zones A, B, C */}
      <div className="main-row">
        {/* ZONE A: Clinical Input */}
        <aside className="zone-a">
          <h2 style={{ fontSize: '18px', marginBottom: '24px', color: '#a5b4fc' }}>CLINICAL INPUT (11 factors)</h2>
          <div className="input-group">
            <label>1. Age & 2. Marriage</label>
            <div style={{display:'flex', gap:'10px'}}>
              <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Yrs" />
              <select name="marriageStatus" onChange={handleChange} value={formData.marriageStatus}>
                <option value="" disabled hidden>Status</option><option value="Unmarried">Unmarried</option><option value="Married">Married</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>3. Weight & 4. BMI</label>
            <div style={{display:'flex', gap:'10px'}}>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Kg" />
              <input type="number" name="bmi" value={formData.bmi} onChange={handleChange} placeholder="BMI" />
            </div>
          </div>
          <div className="input-group">
            <label>5. Cycle & 6. Length</label>
            <div style={{display:'flex', gap:'10px'}}>
              <select name="regularCycle" onChange={handleChange} value={formData.regularCycle}>
                <option value="" disabled hidden>Regular?</option><option value="Yes">Yes</option><option value="No">No</option>
              </select>
              <input type="number" name="cycleLength" value={formData.cycleLength} onChange={handleChange} placeholder="Days" />
            </div>
          </div>
          <div className="input-group">
            <label>7. Skin & 8. Hair</label>
            <div style={{display:'flex', gap:'10px'}}>
              <select name="skinDarkening" onChange={handleChange} value={formData.skinDarkening}>
                <option value="" disabled hidden>Skin</option><option value="0">Normal</option><option value="1">Darkened</option>
              </select>
              <select name="hairGrowth" onChange={handleChange} value={formData.hairGrowth}>
                <option value="" disabled hidden>Hair</option><option value="No">Normal</option><option value="Yes">Excess</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>9. Gain, 10. Acne, 11. Diet</label>
            <input type="number" name="weightGain" value={formData.weightGain} onChange={handleChange} placeholder="Weight Gain (kg)" style={{marginBottom:'10px'}}/>
            <select name="pimples" onChange={handleChange} value={formData.pimples} style={{marginBottom:'10px'}}>
              <option value="" disabled hidden>Acne Severity</option><option value="None">None</option><option value="Mild">Mild</option><option value="Moderate">Moderate</option><option value="Severe">Severe</option>
            </select>
            <select name="fastFood" onChange={handleChange} value={formData.fastFood}>
              <option value="" disabled hidden>Diet Habit</option><option value="None">Clean</option><option value="Moderate">Weekly</option><option value="Heavy">Daily</option>
            </select>
          </div>
          <button className="btn-execute" onClick={runLogic} disabled={!isFormComplete}>EXECUTE DIAGNOSIS</button>
        </aside>

        {/* ZONE B: Evidence Metrics */}
        <div className="zone-b">
          {!result ? (
            <div className="placeholder-metrics">Awaiting clinical input...</div>
          ) : (
            <>
              <div className="metric-card phenotype-header">
                <h2>{result.phenotype}</h2>
                <p>Confidence: {result.score}% · <span className="severity-badge">{result.severity}</span></p>
              </div>
              <div className="metric-card">
                <h3 style={{ marginTop: 0, fontSize: '14px', color: '#a5b4fc', marginBottom: '16px' }}>Clinical Evidence Density</h3>
                <div className="progress-item">
                  <div className="progress-label">
                    <span>Metabolic Load (Vm)</span>
                    <span>{result.metScore}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-fill" style={{ width: `${result.metScore}%`, background: '#f59e0b' }}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-label">
                    <span>Hormonal Load (Vo+Va)</span>
                    <span>{result.horScore}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-fill" style={{ width: `${result.horScore}%`, background: '#8b5cf6' }}></div>
                  </div>
                </div>
              </div>
              <div className="metric-card">
                <h3 style={{ marginTop: 0, fontSize: '14px', color: '#a5b4fc', marginBottom: '16px' }}>Contributing Factors</h3>
                {result.contributors.map((f, i) => (
                  <div key={i} className="factor-tag">
                    <span style={{fontSize:'13px'}}>{f.label}</span>
                    <span className="impact-high">{f.impact} IMPACT</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ZONE C: AI Conversation Feed (Gemini with patient context) */}
        <div className="zone-c">
          <div className="chat-messages">
            {messages.length === 0 && !result && (
              <div style={{ color: '#4a5568', textAlign: 'center', marginTop: 40 }}>AI feed will appear after diagnosis</div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isWaiting && (
              <div className="message-bubble ai" style={{ background: '#2d3748' }}>
                <i>Thinking...</i>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-area">
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isWaiting}
            />
            <button onClick={handleSendMessage} disabled={isWaiting}>SEND</button>
          </div>
        </div>
      </div>

      {/* ZONE D: Launch Scan */}
      <div className="zone-d">
        <span className="launch-text">🔬 AI-ready ultrasound correlation available</span>
        <button 
          className="launch-button"
          onClick={() => navigate("/predict-image")}
        >
          LAUNCH SCAN →
        </button>
      </div>
    </div>
  );
};

export default PCOSAdvancedPredictor;