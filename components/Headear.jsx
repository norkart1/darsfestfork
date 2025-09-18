"use client"
import Link from "next/link";
import Data from "../data/FullData.json"; // Fallback data
import React, { useEffect, useState } from 'react'

const Headear = ({
    selectedZone , setSelectedZone
}) => {
    const [zones, setZones] = useState([]);

    // Fetch zones from API with fallback
    useEffect(() => {
      const fetchZones = async () => {
        try {
          const response = await fetch('/api/public/candidates');
          if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.candidates)) {
              const uniqueZones = Array.from(new Set(data.candidates.map(item => item.zone)));
              setZones(uniqueZones);
              return;
            }
          }
        } catch (error) {
          console.log('Using fallback data for zones');
        }
        
        // Fallback to JSON data
        const fallbackZones = Array.from(new Set(Data.map(item => item.zone)));
        setZones(fallbackZones);
      };

      fetchZones();
    }, []);
  return (
    <div className="lg:fixed lg:right-20 lg:top-5 bg-white w-full lg:w-fit text-center rounded-full lg:p-4 px-4 p-10">
   

      
    <select
  value={selectedZone || ""}
  onChange={(e) => {
    localStorage.setItem("zone" ,e.target.value )
    setSelectedZone(e.target.value)
  }}
  className="w-2/3 px-4 py-2 rounded-xl border-2 border-dashed border-primary mt-3"
>
  <option value="">All Zones</option>
  {/* Assuming the zones are available in your data */}
  {zones.map((zone, index) => (
    <option key={index} value={zone}>
      {zone}
    </option>
  ))}
</select>

          
          <Link
            className="bg-white text-primary p-2 hover:bg-secondary font-bold rounded-2xl mx-1"
            href="/"
          >
            Candidates
          </Link>

          <Link
            className="bg-white text-primary p-2 hover:bg-secondary font-bold rounded-2xl mx-1"
            href="/program"
          >
            Programs
          </Link>
          <Link
            className="bg-white text-slate-800 p-2 hover:bg-secondary font-bold rounded-2xl mx-1"
            href="/dars/"
          >
            Dars List
          </Link>
        </div>
  )
}

export default Headear