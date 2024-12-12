


import { useState } from "react";
import Map from "@/components/Map";

import '@here/hds-components/base/hds-styles.css';
import '@here/hds-base/build/hds-styles.css';
import SideBar1 from "@/components/SideBar1";
import SideBar2 from "@/components/SideBar2";

export default function Home() {
  const [polyline, setPolyline] = useState(null); // State to store the polyline
  const [tollLoader,setTollLoader] = useState(false); 
  const [tollCost,setTollCost] = useState({});

  const settingTollLoader = (tollLoaderPayload) =>{
    setTollLoader(tollLoaderPayload)
  }
  const settingTollCost = (tollCostPayload) =>{
    setTollCost(tollCostPayload)
  }


  // Callback to handle polyline fetched by SideBar
  const handlePolylineFetched = (fetchedPolyline) => {
    setPolyline(fetchedPolyline); // Update the polyline state
  };

  return (
    <div id="root" data-theme="hds-web-product-light-theme" data-styles="hds" style={{ display: "flex", height: "100vh" }}>
     

      <SideBar1 
      onPolylineFetched={handlePolylineFetched} 
      settingTollLoader={settingTollLoader}
      settingTollCost={settingTollCost}
      />



      {tollCost?.cost ?
      <>
      <SideBar2
      
      tollCost={tollCost}
      />
      </>
      :
      tollLoader ? 
      <div className="loader-box">
      <hds-progress-indicator color="accent" size="large" variant="indeterminate"
                        indicator-type="circular">
</hds-progress-indicator>
      </div>
      :
      <>
      
      </>

      }
      

      <Map polyline={polyline} />
    </div>
  );
}
