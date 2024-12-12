import React, { useState } from 'react'
import { HDSButton, HDSDropdown, HDSList, HDSListItem } from '@here/hds-react-components';



const SelectVehicle = ({vehicleList,changeSelection,selectedVehicle}) => {
   

  return (
    <div className='selection-box'>
    <p>
    Vehicle:
    </p>
    
    <HDSDropdown
    trigger={
      <HDSButton icon-right="chevron-down">{selectedVehicle ? selectedVehicle: "Choose a vehicle"}</HDSButton>
    }
    menu={
      <HDSList>
        {vehicleList.map((vehicle,index) => (    
            <HDSListItem
            key={index}
            >
              {vehicle.vehicle}
            </HDSListItem>
        ))}
      </HDSList>
    }
    onSelect={changeSelection}
></HDSDropdown>
</div>
  )
}

export default SelectVehicle