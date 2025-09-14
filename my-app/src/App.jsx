import React, { useEffect, useState } from 'react';
import { ChevronLeft, MapPin, Camera, Heart, Thermometer, Wind, AlertTriangle, Maximize2, Phone, Radio, Eye, Users, Battery, Gauge } from 'lucide-react';

export default function FirefighterDashboard() {
  const [selectedView, setSelectedView] = useState(null); // null, 'firefighters', 'map', 'cameras'
  const [selectedFirefighter, setSelectedFirefighter] = useState(null);
  const [firefighters, setFirefighters] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [center, setCenter] = useState([42.3601, -71.0589]);

  // Fetch real data from backend instead of generating mock data
  useEffect(() => {
    const fetchFirefighters = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/firefighters');
        const data = await response.json();
        setFirefighters(data);
      } catch (error) {
        console.error('Error fetching firefighters:', error);
        // Keep existing data on error
      }
    };

    const fetchMedia = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/media');
        const data = await response.json();
        setMediaFiles(data);
      } catch (error) {
        console.error('Error fetching media:', error);
      }
    };

    // Initial fetch
    fetchFirefighters();
    fetchMedia();
    
    // Set up polling for real-time updates
    const firefighterInterval = setInterval(fetchFirefighters, 500); // Every 500 ms
    const mediaInterval = setInterval(fetchMedia, 500); // Every 500 ms

    return () => {
      clearInterval(firefighterInterval);
      clearInterval(mediaInterval);
    };
  }, []);

  // Individual firefighter components
  const FF1Component = ({ data, isExpanded, onSelect }) => (
    <div className="flex-1 border-b border-red-100">
      <div className="h-full p-4 bg-red-50 border-l-4 border-red-500 flex flex-col">
        <h3 className="font-bold text-red-800 mb-3">FF1</h3>
        {data ? (
          <div 
            className={`flex-1 cursor-pointer transition-all duration-300 hover:bg-red-100 p-3 rounded-lg ${
              selectedFirefighter === data.id ? 'bg-red-100' : ''
            }`}
            onClick={() => onSelect(data.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div 
                  className={`w-4 h-4 rounded-full ${
                    data.status === 'ALERT' ? 'bg-red-500 animate-pulse' : 
                    data.status === 'WARNING' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                />
                <span className="font-bold text-lg text-gray-800">{data.name || data.id}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                data.status === 'ALERT' ? 'bg-red-200 text-red-900' : 
                data.status === 'WARNING' ? 'bg-yellow-200 text-yellow-900' : 'bg-green-200 text-green-900'
              }`}>
                {data.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white p-2 rounded flex items-center gap-2">
                <Heart size={16} className="text-red-600" />
                <div>
                  <div className="font-bold">{data.hr || 'N/A'}</div>
                  <div className="text-xs text-gray-600">bpm</div>
                </div>
              </div>
              
              <div className="bg-white p-2 rounded flex items-center gap-2">
                <Thermometer size={16} className="text-orange-600" />
                <div>
                  <div className="font-bold">{data.tempC ? `${data.tempC}°C` : 'N/A'}</div>
                  <div className="text-xs text-gray-600">Temp</div>
                </div>
              </div>
              
              <div className="bg-white p-2 rounded flex items-center gap-2">
                <Wind size={16} className="text-blue-600" />
                <div>
                  <div className="font-bold">{data.o2pct ? `${data.o2pct}%` : 'N/A'}</div>
                  <div className="text-xs text-gray-600">O₂</div>
                </div>
              </div>
              
              <div className="bg-white p-2 rounded flex items-center gap-2">
                <Battery size={16} className="text-gray-600" />
                <div>
                  <div className="font-bold">{data.batteryLevel ? `${data.batteryLevel}%` : 'N/A'}</div>
                  <div className="text-xs text-gray-600">Battery</div>
                </div>
              </div>
            </div>

            {isExpanded && selectedFirefighter === data.id && (
              <div className="mt-3 p-3 bg-white rounded-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Gauge size={16} />
                  Detailed Vitals
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Air Tank:</span>
                    <span className="font-semibold">{data.airTankPressure || 'N/A'} PSI</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CO₂:</span>
                    <span className="font-semibold">{data.co2ppm || 'N/A'} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-semibold">
                      {data.lat && data.lng ? `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Update:</span>
                    <span className="font-semibold">
                      {data.lastUpdate ? new Date(data.lastUpdate).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                    <Phone size={12} /> Call
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                    <Radio size={12} /> Radio
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Users size={32} className="mb-2 opacity-50" />
            <p className="text-sm">FF1 - Awaiting Connection</p>
            <p className="text-xs mt-1">No data received yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const FF2Component = ({ data, isExpanded, onSelect }) => (
    <div className="flex-1 border-b border-blue-100">
      <div className="h-full p-4 bg-blue-50 border-l-4 border-blue-500 flex flex-col">
        <h3 className="font-bold text-blue-800 mb-3">FF2</h3>
        {data ? (
          <div 
            className={`flex-1 cursor-pointer transition-all duration-300 hover:bg-blue-100 p-3 rounded-lg ${
              selectedFirefighter === data.id ? 'bg-blue-100' : ''
            }`}
            onClick={() => onSelect(data.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div 
                  className={`w-4 h-4 rounded-full ${
                    data.status === 'ALERT' ? 'bg-red-500 animate-pulse' : 
                    data.status === 'WARNING' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                />
                <span className="font-bold text-lg text-gray-800">{data.name || data.id}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                data.status === 'ALERT' ? 'bg-red-200 text-red-900' : 
                data.status === 'WARNING' ? 'bg-yellow-200 text-yellow-900' : 'bg-green-200 text-green-900'
              }`}>
                {data.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white p-2 rounded flex items-center gap-2">
                <Heart size={16} className="text-red-600" />
                <div>
                  <div className="font-bold">{data.hr || 'N/A'}</div>
                  <div className="text-xs text-gray-600">bpm</div>
                </div>
              </div>
              
              <div className="bg-white p-2 rounded flex items-center gap-2">
                <Thermometer size={16} className="text-orange-600" />
                <div>
                  <div className="font-bold">{data.tempC ? `${data.tempC}°C` : 'N/A'}</div>
                  <div className="text-xs text-gray-600">Temp</div>
                </div>
              </div>
              
              <div className="bg-white p-2 rounded flex items-center gap-2">
                <Wind size={16} className="text-blue-600" />
                <div>
                  <div className="font-bold">{data.o2pct ? `${data.o2pct}%` : 'N/A'}</div>
                  <div className="text-xs text-gray-600">O₂</div>
                </div>
              </div>
              
              <div className="bg-white p-2 rounded flex items-center gap-2">
                <Battery size={16} className="text-gray-600" />
                <div>
                  <div className="font-bold">{data.batteryLevel ? `${data.batteryLevel}%` : 'N/A'}</div>
                  <div className="text-xs text-gray-600">Battery</div>
                </div>
              </div>
            </div>

            {isExpanded && selectedFirefighter === data.id && (
              <div className="mt-3 p-3 bg-white rounded-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Gauge size={16} />
                  Detailed Vitals
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Air Tank:</span>
                    <span className="font-semibold">{data.airTankPressure || 'N/A'} PSI</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CO₂:</span>
                    <span className="font-semibold">{data.co2ppm || 'N/A'} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-semibold">
                      {data.lat && data.lng ? `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Update:</span>
                    <span className="font-semibold">
                      {data.lastUpdate ? new Date(data.lastUpdate).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                    <Phone size={12} /> Call
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                    <Radio size={12} /> Radio
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Users size={32} className="mb-2 opacity-50" />
            <p className="text-sm">FF2 - Awaiting Connection</p>
            <p className="text-xs mt-1">No data received yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const FirefighterList = ({ isExpanded = false }) => {
    // Find specific firefighter data
    const ff1Data = firefighters.find(f => f.id === 'FF1') || null;
    const ff2Data = firefighters.find(f => f.id === 'FF2') || null;

    return (
      <div className={`${isExpanded ? 'h-screen' : 'h-full'} flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden`}>
        <div className="px-6 py-4 bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-between">
          {isExpanded && (
            <button 
              onClick={() => setSelectedView(null)} 
              className="p-2 hover:bg-red-700 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-3">
            <Users size={22} />
            <h2 className="text-xl font-bold">Firefighter Units</h2>
          </div>
          {!isExpanded && (
            <button 
              onClick={() => setSelectedView('firefighters')} 
              className="p-2 hover:bg-red-700 rounded-xl transition-colors"
            >
              <Maximize2 size={18} />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto flex flex-col">
          <FF1Component 
            data={ff1Data} 
            isExpanded={isExpanded}
            onSelect={(id) => setSelectedFirefighter(selectedFirefighter === id ? null : id)}
          />
          
          <FF2Component 
            data={ff2Data} 
            isExpanded={isExpanded}
            onSelect={(id) => setSelectedFirefighter(selectedFirefighter === id ? null : id)}
          />
        </div>
      </div>
    );
  };

  const MapView = ({ isExpanded = false }) => (
    <div className={`${isExpanded ? 'h-screen' : 'h-full'} flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden`}>
      <div className="px-6 py-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-between">
        {isExpanded && (
          <button 
            onClick={() => setSelectedView(null)} 
            className="p-2 hover:bg-blue-700 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex items-center gap-3">
          <MapPin size={22} />
          <h2 className="text-xl font-bold">Live Tracking Map</h2>
        </div>
        {!isExpanded && (
          <button 
            onClick={() => setSelectedView('map')} 
            className="p-2 hover:bg-blue-700 rounded-xl transition-colors"
          >
            <Maximize2 size={18} />
          </button>
        )}
      </div>
      
      <div className="flex-1 relative">
        {/* Map Info Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border">
            <div className="font-bold text-blue-800 mb-1">MIT Johnson Building - Emergency Response Zone</div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live positions • Updated every 5 seconds
            </div>
            <div className="text-xs text-gray-500 mt-1">Cambridge, MA 02139 • Coordinates: 42.3595, -71.0925</div>
          </div>
        </div>
        
        {/* Custom Map Background with MIT Layout */}
        <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
          {/* Simulated Campus Roads */}
          <div className="absolute inset-0">
            {/* Main Street */}
            <div className="absolute bg-gray-300 h-2" style={{ top: '30%', left: '10%', width: '80%' }}></div>
            <div className="absolute bg-gray-300 w-2" style={{ left: '25%', top: '20%', height: '60%' }}></div>
            <div className="absolute bg-gray-300 w-2" style={{ left: '60%', top: '15%', height: '70%' }}></div>
            
            {/* Buildings */}
            <div className="absolute bg-red-200 border-2 border-red-400 rounded" 
                 style={{ top: '35%', left: '15%', width: '15%', height: '25%' }}>
              <div className="text-xs p-1 text-red-800 font-semibold">Johnson Building</div>
            </div>
            
            <div className="absolute bg-gray-200 border border-gray-400 rounded" 
                 style={{ top: '20%', left: '30%', width: '20%', height: '15%' }}>
              <div className="text-xs p-1 text-gray-600">Building 32</div>
            </div>
            
            <div className="absolute bg-gray-200 border border-gray-400 rounded" 
                 style={{ top: '65%', left: '40%', width: '25%', height: '20%' }}>
              <div className="text-xs p-1 text-gray-600">Athletic Center</div>
            </div>
            
            {/* Emergency Vehicles */}
            <div className="absolute bg-red-600 rounded border-2 border-white shadow-lg flex items-center justify-center"
                 style={{ top: '25%', left: '12%', width: '3%', height: '4%' }}>
              <div className="text-xs text-white">🚒</div>
            </div>
            
            <div className="absolute bg-red-600 rounded border-2 border-white shadow-lg flex items-center justify-center"
                 style={{ top: '45%', left: '8%', width: '3%', height: '4%' }}>
              <div className="text-xs text-white">🚑</div>
            </div>
          </div>
        
          {/* Firefighter Position Dots */}
          <div className="absolute inset-0">
            {firefighters.map((ff, index) => (
              <div
                key={ff.id}
                className={`absolute rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${
                  ff.status === 'ALERT' ? 'bg-red-500 animate-ping' : 
                  ff.status === 'WARNING' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{
                  width: '24px',
                  height: '24px',
                  left: `${20 + (index * 8) % 40}%`,
                  top: `${40 + (index * 12) % 35}%`,
                  animationDuration: ff.status === 'ALERT' ? '2s' : undefined,
                  zIndex: 20
                }}
                title={`${ff.name || ff.id} - ${ff.status}`}
              >
                <div className="text-xs text-white font-bold">{ff.id.slice(-1)}</div>
              </div>
            ))}
          </div>
          
          {/* Compass */}
          <div className="absolute top-4 right-4 bg-white/90 rounded-full p-3 shadow-lg">
            <div className="text-sm font-bold text-gray-700">N</div>
          </div>
          
          {/* Scale */}
          <div className="absolute bottom-4 left-4 bg-white/90 rounded p-2 shadow-lg">
            <div className="text-xs text-gray-600 mb-1">Scale</div>
            <div className="border-b-2 border-gray-400 w-12"></div>
            <div className="text-xs text-gray-600">100m</div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="absolute bottom-4 left-4 right-4 z-30">
            <div className="bg-white rounded-xl shadow-lg p-6 border">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Emergency Response Command Center</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-blue-800">Incident Location</h4>
                    <p className="text-sm text-gray-600">MIT Johnson Building<br/>32 Vassar Street<br/>Cambridge, MA 02139</p>
                    <p className="text-xs text-blue-600 mt-1">Emergency Response Active</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">Track All Units</button>
                    <button className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm">Zoom to Alerts</button>
                    <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">View Exits</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm text-gray-700">Active Units:</span>
                    <span className="font-bold text-xl text-blue-600">{firefighters.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm text-gray-700">Critical Alerts:</span>
                    <span className="font-bold text-xl text-red-600">{firefighters.filter(f => f.status === 'ALERT').length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span className="text-sm text-gray-700">Warnings:</span>
                    <span className="font-bold text-xl text-yellow-600">{firefighters.filter(f => f.status === 'WARNING').length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm text-gray-700">All Clear:</span>
                    <span className="font-bold text-xl text-green-600">{firefighters.filter(f => f.status === 'OK').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const CamerasView = ({ isExpanded = false }) => {
    // Filter media by firefighter ID
    const ff1Media = mediaFiles.filter(m => m.firefighterId === 'FF1');
    const ff2Media = mediaFiles.filter(m => m.firefighterId === 'FF2');
    
    // Get latest media for each firefighter
    const latestFF1 = ff1Media.length > 0 ? ff1Media[0] : null;
    const latestFF2 = ff2Media.length > 0 ? ff2Media[0] : null;

    if (isExpanded) {
      return (
        <div className="h-screen flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-br from-purple-600 to-purple-700 text-white flex items-center justify-between">
            <button 
              onClick={() => setSelectedView(null)} 
              className="p-2 hover:bg-purple-700 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <Eye size={22} />
              <h2 className="text-xl font-bold">All Media Files</h2>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-3 gap-4">
              {mediaFiles.map(media => (
                <div key={media.id} className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square">
                  <div className="absolute top-2 left-2 bg-black/75 text-white px-2 py-1 rounded text-xs z-10">
                    {media.firefighterId} • {new Date(media.timestamp).toLocaleTimeString()}
                  </div>
                  
                  <img 
                    src={`http://localhost:4000${media.path}`}
                    alt={`From ${media.firefighterId}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            {mediaFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Camera size={64} className="mb-4 opacity-50" />
                <p className="text-center">No media received yet</p>
                <p className="text-sm text-center mt-2">Images from Mantra glasses will appear here</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-br from-purple-600 to-purple-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye size={22} />
            <h2 className="text-xl font-bold">Live Camera Feeds</h2>
          </div>
          <button 
            onClick={() => setSelectedView('cameras')} 
            className="p-2 hover:bg-purple-700 rounded-xl transition-colors"
          >
            <Maximize2 size={18} />
          </button>
        </div>
        
        <div className="flex-1 p-4 flex flex-col gap-3">
          {/* FF1 Feed - Top Half */}
          <div 
            className="flex-1 relative rounded-xl overflow-hidden bg-gradient-to-br from-red-800 to-red-900 cursor-pointer hover:from-red-700 hover:to-red-800 transition-colors"
            onClick={() => ff1Media.length > 0 && setSelectedView('cameras')}
          >
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm text-white px-3 py-2 rounded-lg z-10">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${latestFF1 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-xs font-semibold">FF1 CAMERA - {latestFF1 ? 'LIVE' : 'OFFLINE'}</span>
              </div>
            </div>
            
            {latestFF1 && (
              <div className="absolute bottom-3 left-3 text-white z-10">
                <div className="font-semibold">FF1 View</div>
                <div className="text-xs opacity-75">{new Date(latestFF1.timestamp).toLocaleTimeString()}</div>
                {ff1Media.length > 1 && (
                  <div className="text-xs bg-blue-600 px-2 py-1 rounded mt-1">
                    +{ff1Media.length - 1} more photos
                  </div>
                )}
              </div>
            )}
            
            {latestFF1 ? (
              <img 
                src={`http://localhost:4000${latestFF1.path}`}
                alt="FF1 Camera Feed"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/60">
                <div className="text-center">
                  <Camera size={32} className="mx-auto mb-2" />
                  <div className="text-sm">FF1 - Waiting for feed...</div>
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center text-white/60" style={{display: 'none'}}>
              <Camera size={32} />
            </div>
          </div>

          {/* FF2 Feed - Bottom Half */}
          <div 
            className="flex-1 relative rounded-xl overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-900 cursor-pointer hover:from-emerald-700 hover:to-emerald-800 transition-colors"
            onClick={() => ff2Media.length > 0 && setSelectedView('cameras')}
          >
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm text-white px-3 py-2 rounded-lg z-10">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${latestFF2 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-xs font-semibold">FF2 CAMERA - {latestFF2 ? 'LIVE' : 'OFFLINE'}</span>
              </div>
            </div>
            
            {latestFF2 && (
              <div className="absolute bottom-3 left-3 text-white z-10">
                <div className="font-semibold">FF2 View</div>
                <div className="text-xs opacity-75">{new Date(latestFF2.timestamp).toLocaleTimeString()}</div>
                {ff2Media.length > 1 && (
                  <div className="text-xs bg-blue-600 px-2 py-1 rounded mt-1">
                    +{ff2Media.length - 1} more photos
                  </div>
                )}
              </div>
            )}
            
            {latestFF2 ? (
              <img 
                src={`http://localhost:4000${latestFF2.path}`}
                alt="FF2 Camera Feed"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/60">
                <div className="text-center">
                  <Camera size={32} className="mx-auto mb-2" />
                  <div className="text-sm">FF2 - Waiting for feed...</div>
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center text-white/60" style={{display: 'none'}}>
              <Camera size={32} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render expanded view
  if (selectedView === 'firefighters') {
    return <FirefighterList isExpanded={true} />;
  }
  
  if (selectedView === 'map') {
    return <MapView isExpanded={true} />;
  }
  
  if (selectedView === 'cameras') {
    return <CamerasView isExpanded={true} />;
  }

  // Default horizontal layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="grid grid-cols-3 gap-6 h-screen max-h-screen">
        {/* Firefighters - Left third */}
        <div className="col-span-1">
          <FirefighterList />
        </div>
        
        {/* Map - Middle third */}
        <div className="col-span-1">
          <MapView />
        </div>
        
        {/* Cameras/Media - Right third */}
        <div className="col-span-1">
          <CamerasView />
        </div>
      </div>
    </div>
  );
}