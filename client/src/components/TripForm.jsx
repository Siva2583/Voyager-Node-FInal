import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from './voyager-logo.png'; 

function TripForm() {
    const navigate = useNavigate();
    
    const [location, setLocation] = useState("");
    const [days, setDays] = useState(5);
    const [budgetDisplay, setBudgetDisplay] = useState(40000);
    const [budgetTier, setBudgetTier] = useState("Standard");
    const [travelers, setTravelers] = useState(1);
    const [travelersType, setTravelersType] = useState("Solo");
    const [selectedVibes, setSelectedVibes] = useState([]);
    const [customVibe, setCustomVibe] = useState("");
    const [showPlanner, setShowPlanner] = useState(false);
    const [loading, setLoad] = useState(false);

    const predefinedVibes = ["Chill", "Adventure", "Nature", "Luxury", "Party", "Culture"];

    const toggleVibe = (vibe) => {
        if (selectedVibes.includes(vibe)) {
            setSelectedVibes(selectedVibes.filter(v => v !== vibe));
        } else {
            setSelectedVibes([...selectedVibes, vibe]);
        }
    };

    const addCustomVibe = () => {
        const trimmed = customVibe.trim();
        if (trimmed && !selectedVibes.includes(trimmed)) {
            setSelectedVibes([...selectedVibes, trimmed]);
            setCustomVibe("");
        }
    };

    const handleBudgetTier = (tier) => {
        setBudgetTier(tier);
        if (tier === "Low Budget") setBudgetDisplay(15000);
        if (tier === "Standard") setBudgetDisplay(40000);
        if (tier === "Luxury") setBudgetDisplay(100000);
    };

    const handleTravelerPreset = (type) => {
        setTravelersType(type);
        if (type === "Solo") setTravelers(1);
        if (type === "Couple") setTravelers(2);
        if (type === "Friends") setTravelers(4);
        if (type === "Family") setTravelers(4);
    };

    const handleSubmit = async () => {
        const tripdata = {
            location: location,
            days: days,
            budget_tier: budgetTier,
            people: travelers,
            vibe: selectedVibes,
            total_budget: budgetDisplay 
        };

        try {
            setLoad(true);
            navigate('/loading', { replace: true });
            
            const response = await axios.post("/api/generate", tripdata, {
                timeout: 100000 
            });
            
            setLoad(false);
            navigate('/result', {
                replace: true,
                state: {
                    trip: response.data,
                    locationName: location,
                    people: travelers,
                    totalBudget: budgetDisplay
                }
            });
        } catch (e) {
            setLoad(false);
            console.error("Full Error Info:", e);
            alert("Trip generation failed: " + (e.response?.data?.error || "Server timed out. Please try again."));
            navigate('/'); 
        }
    };

    return (
        <div style={{ fontFamily: "'Poppins', sans-serif", margin: 0, padding: 0, overflow: "hidden" }}>
            <style>
    {`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap');
    * { box-sizing: border-box; }
    
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .brand-gradient {
        background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    .home {
        height: 100vh;
        background: linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.8)), url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop");
        background-size: cover; background-position: center;
        display: ${showPlanner ? 'none' : 'flex'};
        align-items: center; justify-content: center;
    }

    .home-content-wrapper {
        display: flex; flex-direction: column; align-items: center;
        animation: fadeInUp 0.8s ease-out;
        width: 100%; padding: 20px;
    }

    .hero-row {
        display: flex; flex-direction: row; align-items: center; gap: 20px;
    }

    .home-text-group {
        display: flex; flex-direction: column; align-items: flex-start; text-align: left;
    }

    .home-logo-img {
        width: 420px; height: 390px; object-fit: contain;
    }

    .home-title {
        font-size: 80px; font-weight: 700; margin: 0; line-height: 1;
        letter-spacing: -1px; text-transform: uppercase;
        color: #f1f5f9; 
    }

    .home-subtitle {
        font-size: 18px; color: #94a3b8; font-weight: 400; letter-spacing: 2px;
        margin-top: 10px; text-transform: uppercase; margin-left: 5px;
    }

    .start-btn {
        margin-top: 50px; padding: 18px 60px; border-radius: 50px;
        border: none;
        background: #3b82f6; color: white; font-size: 1.1rem; font-weight: 600; cursor: pointer;
        transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 1px;
    }
    .start-btn:hover { background: #2563eb; transform: translateY(-2px); }

    .planner {
        min-height: 100vh; background: #0f172a;
        display: ${showPlanner ? 'flex' : 'none'};
        justify-content: center; align-items: flex-start;
        padding: 40px; color: #e2e8f0;
    }
    .planner-layout {
        width: 100%; max-width: 1200px; display: grid; grid-template-columns: 1fr 1.5fr; gap: 60px;
        animation: fadeInUp 0.6s ease-out;
    }

    .planner-left { 
        display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;
        border-right: 1px solid #334155; padding-right: 40px; padding-top: 10px;
    }
    
    .sidebar-title { font-size: 56px; font-weight: 700; margin: 0 0 10px 0; line-height: 1; letter-spacing: -1px; color: #f1f5f9; }
    .sidebar-desc { color: #94a3b8; font-size: 1.1rem; line-height: 1.6; max-width: 400px; }

    .preview-card {
        margin-top: 40px; padding: 30px; border-radius: 16px;
        background: #1e293b; border: 1px solid #334155;
        color: #cbd5e1; font-style: italic; line-height: 1.8;
        position: relative; overflow: hidden; width: 100%;
    }
    .preview-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #3b82f6; }
    .preview-highlight { color: #60a5fa; font-weight: 600; font-style: normal; }

    .planner-right {
        background: #1e293b; padding: 40px; border-radius: 20px; border: 1px solid #334155;
    }

    .form-card { margin-bottom: 25px; }
    .form-card h3 { margin-bottom: 12px; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

    input[type="text"], input[type="number"] {
        width: 100%; padding: 15px; border-radius: 10px; border: 1px solid #475569;
        font-size: 16px; background: #0f172a; color: #f1f5f9; transition: 0.2s;
    }
    input[type="text"]:focus, input[type="number"]:focus { outline: none; border-color: #3b82f6; }

    input[type="range"] { width: 100%; accent-color: #3b82f6; cursor: pointer; height: 6px; background: #334155; border-radius: 5px; margin-top: 10px; }
    
    .value-pill {
        margin-top: 10px; display: inline-block; padding: 5px 14px;
        border-radius: 20px; background: #334155; color: #60a5fa; font-size: 13px; font-weight: 600;
    }

    .budget-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .budget-option {
        padding: 14px; border-radius: 10px; border: 1px solid #475569; background: #0f172a; text-align: center; cursor: pointer; transition: all 0.2s; font-size: 14px; color: #94a3b8;
    }
    .budget-option.active { background: #3b82f6; color: white; border-color: #3b82f6; font-weight: 600; }

    .chip-grid { display: flex; flex-wrap: wrap; gap: 10px; }
    .chip {
        padding: 10px 20px; border-radius: 25px; background: #0f172a; cursor: pointer; transition: all 0.2s; font-size: 14px; color: #cbd5e1; border: 1px solid #475569;
    }
    .chip.active { background: #3b82f6; color: white; border-color: #3b82f6; font-weight: 600; }
    
    .add-vibe-row { display: flex; gap: 10px; margin-top: 15px; }
    .btn-add { padding: 0 20px; border-radius: 10px; border: none; background: #334155; color: white; font-weight: 600; cursor: pointer; transition: 0.2s; }

    .traveler-row { display: grid; grid-template-columns: 1fr 100px; gap: 20px; align-items: start; }

    .submit-btn {
        width: 100%; margin-top: 30px; padding: 18px; border-radius: 12px; border: none;
        background: #3b82f6; color: white; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; transition: transform 0.2s; text-transform: uppercase;
    }
    @media (max-width: 900px) {
        .planner-layout { grid-template-columns: 1fr; }
        .planner-left { display: none; }
        .planner { padding: 15px; }
        .hero-row { flex-direction: column; text-align: center; gap: 10px; }
        .home-text-group { align-items: center; text-align: center; }
        .home-title { font-size: 48px; }
        .home-logo-img { width: 200px; height: 200px; }
        .home-subtitle { font-size: 16px; letter-spacing: 1px; }
        .start-btn { margin-top: 30px; padding: 15px 40px; }

        /* Form Mobile */
        .planner-right { padding: 20px; }
        .budget-grid { grid-template-columns: 1fr; }
        .traveler-row { grid-template-columns: 1fr; gap: 15px; }
    }
    `}
</style>

            <section className="home">
                <div className="home-content-wrapper">
                    <div className="hero-row">
                        <img src={logo} alt="Voyager Logo" className="home-logo-img" />
                        <div className="home-text-group">
                            <h1 className="home-title">VOYAGER</h1>
                            <p className="home-subtitle">Your AI-Powered Personal Trip Planner</p>
                        </div>
                    </div>
                    <button className="start-btn" onClick={() => setShowPlanner(true)}>Start Journey 🚀</button>
                </div>
            </section>

            <section className="planner">
                <div className="planner-layout">
                    <div className="planner-left">
                        <h1 className="sidebar-title">VOYAGER</h1>
                        <p className="sidebar-desc">Tell us your dream, we'll map the reality.</p>
                        <div className="preview-card">
                            {location ? (
                                <>
                                    <strong style={{fontSize: '1.3rem', color:'#f8fafc', display:'block', marginBottom:'15px'}}>
                                        Trip to <span className="preview-highlight">{location}</span>
                                    </strong>
                                    <div style={{marginBottom:'8px'}}>
                                        💰 Total Trip Budget: <span className="preview-highlight">{budgetTier}</span> 
                                        <span style={{fontSize:'0.9em', opacity:0.7}}> (₹{Number(budgetDisplay).toLocaleString("en-IN")})</span>
                                    </div>
                                    <div style={{marginBottom:'8px'}}>
                                        📅 Duration: <span className="preview-highlight">{days} Days</span>
                                    </div>
                                    <div style={{marginBottom:'8px'}}>
                                        👥 Travelers: <span className="preview-highlight">{travelers}</span>
                                    </div>
                                    <div>
                                        ✨ Vibes: <span className="preview-highlight">{selectedVibes.length > 0 ? selectedVibes.join(", ") : "Any"}</span>
                                    </div>
                                </>
                            ) : (
                                <div style={{textAlign:'center', padding:'20px 0'}}>
                                    <span style={{fontSize:'2rem'}}>🌍</span>
                                    <br/><br/>
                                    "The world is a book and those who do not travel read only one page."
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="planner-right">
                        <div className="form-card">
                            <h3>Where to?</h3>
                            <input type="text" placeholder="e.g. Kyoto, Paris, Goa" value={location} onChange={(e) => setLocation(e.target.value)} />
                        </div>

                        <div className="form-card">
                            <h3>Total Trip Budget & Style</h3>
                            <div className="budget-grid">
                                {["Low Budget", "Standard", "Luxury"].map((tier) => (
                                    <div key={tier} className={`budget-option ${budgetTier === tier ? 'active' : ''}`} onClick={() => handleBudgetTier(tier)}>
                                        {tier}
                                    </div>
                                ))}
                            </div>
                            <input type="range" min="1000" max="100000" step="500" value={budgetDisplay} onChange={(e) => setBudgetDisplay(e.target.value)} />
                            <div className="value-pill">₹{Number(budgetDisplay).toLocaleString("en-IN")}</div>
                        </div>

                        <div className="form-card">
                            <h3>Duration</h3>
                            <input type="range" min="1" max="15" value={days} onChange={(e) => setDays(e.target.value)} />
                            <div className="value-pill">{days} days</div>
                        </div>

                        <div className="form-card">
                            <h3>Trip Vibe</h3>
                            <div className="chip-grid">
                                {predefinedVibes.map((v) => (
                                    <span key={v} className={`chip ${selectedVibes.includes(v) ? 'active' : ''}`} onClick={() => toggleVibe(v)}>
                                        {v}
                                    </span>
                                ))}
                                {selectedVibes.filter(v => !predefinedVibes.includes(v)).map((v) => (
                                    <span key={v} className="chip active" onClick={() => toggleVibe(v)}>
                                        {v} ✕
                                    </span>
                                ))}
                            </div>
                            <div className="add-vibe-row">
                                <input type="text" placeholder="+ Add custom vibe" value={customVibe} onChange={(e) => setCustomVibe(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addCustomVibe()} style={{fontSize: '14px', padding: '12px'}} />
                                <button className="btn-add" onClick={addCustomVibe}>Add</button>
                            </div>
                        </div>

                        <div className="form-card">
                            <h3>Who's Going?</h3>
                            <div className="traveler-row">
                                <div className="chip-grid">
                                    {["Solo", "Couple", "Friends", "Family"].map((t) => (
                                        <span key={t} className={`chip ${travelersType === t ? 'active' : ''}`} onClick={() => handleTravelerPreset(t)}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <div>
                                    <input type="number" min="1" max="50" value={travelers} onChange={(e) => setTravelers(e.target.value)} placeholder="#" style={{textAlign:'center', fontWeight:'bold'}} />
                                </div>
                            </div>
                        </div>

                        <button className="submit-btn" onClick={handleSubmit}>
                            {loading ? "Planning..." : "Build My Journey 🚀"}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default TripForm;

