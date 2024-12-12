
import { useState } from "react";
import { HDSLogo, HDSNavBarSide, HDSVerticalNavigation } from "@here/hds-react-components";
import { HDSInput } from "@here/hds-react-components/Input";
import SelectVehicle from "./SelectVehicle";
import {HDSButton} from '@here/hds-react-components/Button';

const API_KEY = "18I6Z4D0vtembHHD7PiPnrRb8o7P-8Vu-Hot2FoSHaQ";

// Utility function for API requests
const fetchFromAPI = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};

// Fetch suggestions for autocomplete
const fetchSuggestions = async (query) => {
  if (!query) return [];
  const url = `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${query}&apiKey=${API_KEY}`;
  const data = await fetchFromAPI(url);
  return data?.items?.map((item) => item.address.label) || [];
};

// Fetch coordinates for a selected location
const fetchCoordinates = async (location) => {
  const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(location)}&apiKey=${API_KEY}`;
  const data = await fetchFromAPI(url);
  return data?.items?.[0]?.position || null; // Return coordinates (lat, lng) or null`
};

// Fetch polyline using HERE Routing API
const fetchPolyline = async (fromCoords, toCoords) => {
  if (!fromCoords || !toCoords) return null;
  const url = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${fromCoords.lat},${fromCoords.lng}&destination=${toCoords.lat},${toCoords.lng}&return=polyline&apiKey=${API_KEY}`;
  const data = await fetchFromAPI(url);
  return data?.routes?.[0]?.sections?.[0]?.polyline || null; // Polyline
};

// Fetch toll costs using HERE Toll Cost API
const fetchTollCost = async (fromCoords, toCoords, vehicleType) => {
  if (!fromCoords || !toCoords) return null;
  const url = `https://tce.api.here.com/2/calculateroute.json?waypoint0=geo!${fromCoords.lat},${fromCoords.lng}&waypoint1=geo!${toCoords.lat},${toCoords.lng}&mode=fastest;car&cost_optimize=1&tollVehicleType=${vehicleType}&apiKey=${API_KEY}`;
  const data = await fetchFromAPI(url);
  console.log("data==>",data)
  return data?.response?.route[0] || null; // Returns toll cost details
};

const SideBar1 = ({ onPolylineFetched ,settingTollLoader,settingTollCost}) => {
  const [fromQuery, setFromQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [fromCoordinates, setFromCoordinates] = useState(null);

  const [toQuery, setToQuery] = useState("");
  const [toSuggestions, setToSuggestions] = useState([]);
  const [toCoordinates, setToCoordinates] = useState(null);
  const [tollCost,setTollCost] = useState({});
  // const [tollLoader,setTollLoader] = useState(false)

  const [vehicleList, setVehicleList] = useState([{vehicle:'Motorcycle'},{vehicle:'Car'},{vehicle:'Truck'}])
  const [selectedVehicleIndex,setSelectedVehicleIndex] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState('');

  const changeSelection = (selection) => {
      // Use the index directly from the selection parameter
      const selectedIndex = selection.index;
      setSelectedVehicleIndex(selectedIndex + 1)

      // Find the vehicle name using the index
      const selectedVehicleName = vehicleList[selectedIndex].vehicle;

      // Update the selected vehicle state
      setSelectedVehicle(selectedVehicleName);
      console.log(`Selected Index: ${selectedVehicleIndex}`);
      console.log(`Selected Vehicle: ${selectedVehicleName}`);
  };


  const handleInputChange = async (query, setQuery, setSuggestions) => {
    setQuery(query);
    if (query.length > 1) {
      const suggestions = await fetchSuggestions(query);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = async (setQuery, setSuggestions, suggestion, setCoordinates) => {
    setQuery(suggestion);
    setSuggestions([]);
    const coordinates = await fetchCoordinates(suggestion);
    setCoordinates(coordinates);
  };

  const handleFetchRouteDetails = async () => {
    // setTollLoader(true);
    settingTollLoader(true);
    if (fromCoordinates && toCoordinates) {
      try {
        // Fetch polyline
        const polyline = await fetchPolyline(fromCoordinates, toCoordinates);
        
        if (polyline) {
          if (onPolylineFetched) {
            onPolylineFetched(polyline);
          }
        }

        // Fetch toll costs
        const tollCosts = await fetchTollCost(fromCoordinates, toCoordinates,selectedVehicleIndex);
        console.log("tollcosts===>",tollCosts)
        if (tollCosts) {
          // setTollLoader(false)
          settingTollLoader(false)
          settingTollCost(tollCosts)
          // setTollCost(tollCosts)
          // alert(`Estimated Toll Cost: ${tollCosts.currency} ${tollCosts.totalCost}`);
        } else {
          console.error("No toll cost details available.");
        }
      } catch (error) {
        console.error("Error fetching route details:", error);
      }
    } else {
      console.error("Both 'From' and 'To' locations are required.");
    }
  };

  return (
    <div className="container">
      <HDSNavBarSide
        logo={<HDSLogo size="extra-small" />}
        title="HERE Toll-Cost System"
        main={
          <HDSVerticalNavigation>
            <div className="side-panel-content">
              {/* From Input */}
              <HDSInput
                label="From"
                placeholder="Enter starting point"
                value={fromQuery}
                onKeyUp={(e) => handleInputChange(e.target.value, setFromQuery, setFromSuggestions)}
              />
              <div className="suggestion-box">
                {fromSuggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {fromSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() =>
                          handleSuggestionClick(
                            setFromQuery,
                            setFromSuggestions,
                            suggestion,
                            setFromCoordinates
                          )
                        }
                      >
                        {suggestion}
                      </div>
                    ))}
                  </ul>
                )}
              </div>
              <br />
              {/* To Input */}
              <HDSInput
                label="To"
                placeholder="Enter destination"
                value={toQuery}
                onKeyUp={(e) => handleInputChange(e.target.value, setToQuery, setToSuggestions)}
              />
              <div className="suggestion-box">
                {toSuggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {toSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() =>
                          handleSuggestionClick(
                            setToQuery,
                            setToSuggestions,
                            suggestion,
                            setToCoordinates
                          )
                        }
                      >
                        {suggestion}
                      </div>
                    ))}
                  </ul>
                )}
              </div>
              <br />
              {/* Select Vehicle */}
              <SelectVehicle 
              vehicleList={vehicleList}
              changeSelection={changeSelection}
              selectedVehicle={selectedVehicle}
              />
              <br/>

            <HDSButton
           icon=""
           iconRight=""
           label="Medium Button"
           onClick={handleFetchRouteDetails}>
   Get Route and Toll Cost
</HDSButton>

              
            

             
            </div>
          </HDSVerticalNavigation>
        }
        hideToggle={true}
      />
     
    </div>
  );
};

export default SideBar1;



