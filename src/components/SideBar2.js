

import { HDSNavBarSide, HDSVerticalNavigation } from "@here/hds-react-components";

const SideBar2 = ({ tollCost }) => {
  // Convert baseTime (in seconds) to hours and minutes
  const baseTimeInSeconds = tollCost?.summary?.baseTime || 0;
  const hours = Math.floor(baseTimeInSeconds / 3600); // Total hours
  const minutes = Math.floor((baseTimeInSeconds % 3600) / 60); // Remaining minutes

  // Convert distance (in meters) to kilometers
  const distanceInMeters = tollCost?.summary?.distance || 0;
  const distanceInKm = (distanceInMeters / 1000).toFixed(2); // Convert to km and round to 2 decimals

  return (
    <div className="container1">
      <HDSNavBarSide
        main={
          <HDSVerticalNavigation>
            <div className="side-panel-content">
              <p>
                <b>Estimated Toll Cost: </b>
                {tollCost?.cost?.totalCost + " " + tollCost?.cost?.currency}
              </p>
              <p>
                <b> Estimated Travel Time: </b>
                {hours} hours, {minutes} minutes
              </p>
              <p>
               <b> Estimated Distance: </b>
               {distanceInKm} km</p>
            </div>
          </HDSVerticalNavigation>
        }
        hideToggle={true}
      />
    </div>
  );
};

export default SideBar2;
