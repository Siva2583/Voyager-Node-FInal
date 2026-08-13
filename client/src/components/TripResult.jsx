import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './load.css';
const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [35, 55], iconAnchor: [17, 55], popupAnchor: [1, -34], shadowSize: [55, 55]
});

function MapController({ selectedCoords, activities }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCoords) {
      map.flyTo(selectedCoords, 16, { duration: 1.5 });
    } else if (activities.length > 0) {
      const bounds = L.latLngBounds(activities.map(a => a.coords));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [selectedCoords, activities, map]);
  return null;
}

function TripResult() {
  const locationHook = useLocation();
  const navigate = useNavigate();
  const { trip: rawTrip, locationName, people, totalBudget } = locationHook.state || {};
  const [trip, setTrip] = useState(() => typeof rawTrip === 'string' ? JSON.parse(rawTrip) : rawTrip);
  const travelers = Number(people) || 1;
  const [activeDay, setActiveDay] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showReplanModal, setShowReplanModal] = useState(false);
  const [replanOption, setReplanOption] = useState('time');
  useEffect(() => { if (!trip) navigate('/'); }, [trip, navigate]);
  if (!trip) return null;
  const currentDayData = trip.itinerary.find(d => d.day === activeDay);
  const validActivities = currentDayData 
    ? currentDayData.activities.filter(a => a.status !== 'removed' && a.coords && (a.coords[0] !== 0 || a.coords[1] !== 0))
    : [];

  const FALLBACK_IMG = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop";

  const handleReplan = () => {
    const newTrip = { ...trip };
    const dayIndex = newTrip.itinerary.findIndex(d => d.day === activeDay);
    const dayActivities = newTrip.itinerary[dayIndex].activities;
    dayActivities.forEach(a => a.status = 'kept');

    if (replanOption === 'time') {
      let timeSpent = 0; const TIME_LIMIT = 360; 
      dayActivities.sort((a, b) => {
        const p = { high: 3, medium: 2, low: 1 };
        return p[b.priority] - p[a.priority];
      });
      dayActivities.forEach(activity => {
        if (timeSpent + (activity.duration || 60) <= TIME_LIMIT) {
          activity.status = 'kept'; timeSpent += (activity.duration || 60);
        } else {
          activity.status = 'removed'; activity.reason = 'Not enough time';
        }
      });
    } else if (replanOption === 'budget') {
      dayActivities.forEach(activity => {
        const cost = activity.cost * travelers;
        if ((activity.priority === 'low' && cost > 500) || (activity.priority === 'medium' && cost > 2000)) {
           activity.status = 'removed'; activity.reason = 'Budget saving';
        } else { activity.status = 'kept'; }
      });
    } else if (replanOption === 'energy') {
      dayActivities.forEach(activity => {
        if (activity.energy === 'high') { activity.status = 'removed'; activity.reason = 'Too tiring'; }
        else { activity.status = 'kept'; }
      });
    }
    setTrip(newTrip); setShowReplanModal(false);
  };
const mobileStyles = `
  @media (max-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr !important;
      height: auto !important;
      overflow: visible !important;
    }
    
    .map-column-sticky {
      position: relative !important;
      height: 350px !important; 
      width: 100% !important;
      order: -1;
    }

    .app-header {
      flex-direction: column;
      text-align: center;
      gap: 15px;
      padding: 15px !important;
    }

    .header-left {
      flex-direction: column;
      gap: 10px;
    }

    .trip-meta h1 { font-size: 1.5rem; }
    
    .tabs-container {
      overflow-x: auto; 
      justify-content: flex-start;
      padding-bottom: 10px;
    }
    
    .tab-btn { flex: 0 0 auto; }
  }
`;
return (
    <div className="result-page">
      <style>{mobileStyles}</style> 
      <header className="app-header no-print">
        <div className="header-left">
          <button onClick={() => navigate('/')} className="back-btn">← Back</button>
          <div className="trip-meta">
            <h1>Trip : {trip.trip_name}</h1>
            <span className="badge-vibe">✨ {travelers} Travelers</span>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-save" onClick={() => window.print()}>Download PDF</button>
        </div>
      </header>

      <div className="tabs-container no-print">
        {trip.itinerary.map(day => (
          <button 
            key={day.day}
            className={`tab-btn ${activeDay === day.day ? 'active' : ''}`}
            onClick={() => { setActiveDay(day.day); setSelectedPlace(null); }}
          >
            Day {day.day}
          </button>
        ))}
      </div>

      <div className="replan-bar no-print" style={{background: '#0f172a', borderBottom:'1px solid #334155'}}>
        <button className="btn-replan" onClick={() => setShowReplanModal(true)}>⚡ Replan Day {activeDay}</button>
      </div>

      <div className="dashboard-grid no-print">
        <div className="feed-column">
          <div className="feed-header">
            <h2>Itinerary for Day {activeDay}</h2>
          </div>

          <div className="cards-list">
            {currentDayData?.activities.map((activity, idx) => {
               const isSelected = selectedPlace?.place === activity.place;
               return (
                <div 
                  key={idx} 
                  className={`smart-card ${isSelected ? 'selected' : ''} ${activity.status === 'removed' ? 'card-removed' : ''}`}
                  onClick={() => activity.status !== 'removed' && setSelectedPlace(isSelected ? null : activity)} 
                >
                  <div className="card-content-wrapper">
                    <div className="card-image-wrapper">
                      <img src={activity.image || FALLBACK_IMG} alt={activity.place} loading="lazy" />
                      {activity.status === 'removed' && <span className="status-badge removed">❌ Removed</span>}
                    </div>
                    
                    <div className="card-details">
                      <div className="card-top">
                        <span className="time-pill">{activity.time}</span>
                        <span className="cost-pill">₹{(activity.cost * travelers).toLocaleString()}</span>
                      </div>
                      <h3>{activity.place}</h3>
                      {!isSelected && (
                         <p style={{fontSize:'0.85rem', color:'#64748b', margin:0}}>
                           Click to expand details...
                         </p>
                      )}
                    </div>
                  </div>

                  <div className="expandable-desc">
                    <p>{activity.desc}</p>
                    <div className="tags-row" style={{marginTop:'10px'}}>
                      <span className={`tag-priority ${activity.priority}`}>{activity.priority} priority</span>
                      <span className={`tag-energy ${activity.energy}`}>⚡ {activity.energy} energy</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div> 
        <div className="map-column-sticky">
          {validActivities.length > 0 ? (
            <MapContainer center={validActivities[0].coords} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', background:'#0f172a' }}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController selectedCoords={selectedPlace?.coords} activities={validActivities} />
              {validActivities.map((act, idx) => (
                <Marker 
                  key={idx} 
                  position={act.coords} 
                  icon={selectedPlace?.place === act.place ? activeIcon : defaultIcon}
                  eventHandlers={{ click: () => setSelectedPlace(act) }}
                  zIndexOffset={selectedPlace?.place === act.place ? 1000 : 0}
                >
                  <Popup>
                    <div style={{color:'black'}}>
                      <strong>{act.place}</strong><br/>₹{act.cost * travelers}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : ( <div className="empty-map" style={{color:'white', display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>No map data</div> )}
        </div>
      </div>

      {showReplanModal && (
        <div className="modal-overlay no-print">
          <div className="modal-content">
            <h3>Adjust Day {activeDay} Plan</h3>
            <div className="radio-group">
              <label className={`radio-card ${replanOption === 'time' ? 'selected' : ''}`}>
                <input type="radio" name="replan" value="time" checked={replanOption === 'time'} onChange={() => setReplanOption('time')} />
                <div className="radio-info"><strong>⏱ Less Time</strong><span>Shorten the day to ~6 hours</span></div>
              </label>
              <label className={`radio-card ${replanOption === 'budget' ? 'selected' : ''}`}>
                <input type="radio" name="replan" value="budget" checked={replanOption === 'budget'} onChange={() => setReplanOption('budget')} />
                <div className="radio-info"><strong>💰 Lower Budget</strong><span>Remove expensive items</span></div>
              </label>
              <label className={`radio-card ${replanOption === 'energy' ? 'selected' : ''}`}>
                <input type="radio" name="replan" value="energy" checked={replanOption === 'energy'} onChange={() => setReplanOption('energy')} />
                <div className="radio-info"><strong>😴 Low Energy</strong><span>Remove hiking/walking</span></div>
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowReplanModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleReplan}>Apply</button>
            </div>
          </div>
        </div>
      )}
      <div className="print-only-container">
        <div className="print-header">
          <h1>Travel Itinerary: {locationName}</h1>
          <p>Prepared for {travelers} travelers • Total Trip Budget: ₹{Number(totalBudget || 0).toLocaleString('en-IN')}</p>
        </div>
        
        
        {trip.itinerary.map((day) => (
          <div key={day.day} className="print-day-block">
            <h2 className="print-day-title">Day {day.day}</h2>
            {day.activities.filter(a => a.status !== 'removed').map((act, i) => (
               <div key={i} className="print-activity-item">
                  <div className="print-time">{act.time}</div>
                  <div className="print-details">
                    <h3>{act.place}</h3>
                    <p style={{margin:'5px 0', fontSize:'10pt', color:'#444'}}>{act.desc}</p>
                    <span className="print-cost">Est. Cost: ₹{(act.cost * travelers).toLocaleString()}</span>
                  </div>
               </div>
            ))}
          </div>
        ))}

        <div className="print-footer">
          <p>Generated by Voyager AI</p>
        </div>
      </div>
    </div>
  );
}

export default TripResult;
