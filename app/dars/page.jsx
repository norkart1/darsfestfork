"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Data from "../../data/FullData.json"; // Fallback data
import Headear from "@/components/Headear";

function DarsWise() {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [darsData, setDarsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // Load zone preference
  useEffect(() => {
    const zone = localStorage.getItem("zone");
    setSelectedZone(zone || "");
  }, []);

  // Fetch dars data from dedicated API with fallback
  useEffect(() => {
    const fetchDarsData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedZone) params.set('zone', selectedZone);
        if (searchText) params.set('search', searchText);
        
        const response = await fetch(`/api/public/dars?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.dars)) {
            setDarsData(data.dars);
            setUsingFallback(false);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.log('Database connection issue, using local data fallback');
      }
      
      // Fallback to JSON data
      const fallbackDars = getUniqueDars(Data);
      setDarsData(fallbackDars);
      setUsingFallback(true);
      setLoading(false);
    };

    fetchDarsData();
  }, [selectedZone, searchText]);

  const getUniqueDars = (candidateData) => {
    return Array.from(new Set(candidateData.map((item) => item.darsname))).map(
      (darsname) => {
        return candidateData.find((item) => item.darsname === darsname);
      }
    );
  };

  // Since filtering is now done server-side for API data, just set filtered data
  useEffect(() => {
    setFilteredData(darsData);
  }, [darsData]);


  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Display filtered data or all data if no search/filter
  const displayData = filteredData.length > 0 ? filteredData : darsData;


  return (<>
    <Headear selectedZone={selectedZone} setSelectedZone={setSelectedZone}/>
    <div className="p-12 pt-0 lg:p-20 flex flex-col">
            
      <h1 className="text-center font-extrabold text-3xl text-primary mb-3">
        Dars Wise Program List
      </h1>
      {usingFallback && (
        <div className="text-center text-sm text-amber-600 mb-2 bg-amber-50 px-3 py-1 rounded-lg">
          📋 Using local data (database connection being established)
        </div>
      )}
      <input
        type="text"
        placeholder="Search by Dars Name"
        value={searchText}
        onChange={handleSearch}
        className="w-full px-4 py-2 rounded-xl border-2 border-dashed border-primary"
      />
      <div className="flex flex-wrap gap-2 justify-center mt-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-primary font-semibold">Loading dars...</div>
          </div>
        ) : displayData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">No dars found. Try adjusting your search or zone filter.</div>
          </div>
        ) : (
          displayData.map((item, index) => (
            <div key={index} className="w-72 bg-secondary p-6 rounded-xl">
              <h1 className="font-bold line-clamp-2 h-12">{item.darsname}</h1>
              <div className="flex gap-2 mt-1">
                <Link href={`/dars/jr/${item.slug}`}>
                  <button className="px-2 py-1 bg-primary hover:bg-primaryDark rounded-lg text-white font-semibold">
                    Junior
                  </button>
                </Link>
                <Link href={`/dars/sr/${item.slug}`}>
                  <button className="px-2 py-1 bg-primary hover:bg-primaryDark rounded-lg text-white font-semibold">
                    Senior
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div></>
  );
}

export default DarsWise;
