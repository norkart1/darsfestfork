"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Headear from "@/components/Headear";

function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedZone, setSelectedZone] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load zone preference
  useEffect(() => {
    const zone = localStorage.getItem("zone");
    setSelectedZone(zone || "");
  }, []);

  // Fetch candidates from database API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedZone) params.append('zone', selectedZone);
        
        const response = await fetch(`/api/public/candidates?${params}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.candidates)) {
            setCandidates(data.candidates);
          } else {
            throw new Error('Invalid API response format');
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch candidates');
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setError(error.message);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [searchTerm, selectedZone]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openPopup = (item) => {
    setSelectedItem(item);
  };

  const closePopup = () => {
    setSelectedItem(null);
  };

  return (<>
    <Headear selectedZone={selectedZone} setSelectedZone={setSelectedZone} />
    <div className="p-12 pt-0 lg:p-20">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-center font-extrabold text-3xl text-primary mb-3">
          Candidate Search
        </h1>
        
        {error && (
          <div className="text-center text-sm text-red-600 mb-2 bg-red-50 px-3 py-1 rounded-lg">
            ⚠️ {error}. Please contact admin if the issue persists.
          </div>
        )}

        <input
          type="text"
          placeholder="Search by CODE, Name, Dars Name, etc."
          value={searchTerm}
          onChange={handleSearch}
          className="w-2/3 px-4 py-2 rounded-xl border-2 border-dashed border-primary"
        />

        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-primary font-semibold flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                Loading candidates...
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-gray-500 text-center">
                <div className="text-2xl mb-2">🔍</div>
                <div className="font-medium">Unable to load candidates</div>
                <div className="text-sm">Database connection error</div>
              </div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-gray-500 text-center">
                <div className="text-2xl mb-2">📋</div>
                <div className="font-medium">No candidates found</div>
                <div className="text-sm">Try adjusting your search or zone filter</div>
              </div>
            </div>
          ) : (
            candidates.map((item, index) => (
              <div
                className="w-72 bg-secondary p-6 rounded-xl flex flex-col gap-2 items-start cursor-pointer hover:shadow-lg transition-shadow"
                key={item.id || index}
                onClick={() => openPopup(item)}
              >
                <h1 className="px-2 py-1 bg-primary inline rounded-lg text-white font-semibold">
                  {item.code}
                </h1>
                <p className="line-clamp-2 h-12 font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">{item.darsname}</p>
                <div className="flex gap-1 mt-1">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.zone}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.category === 'JUNIOR' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results count */}
        {!loading && !error && (
          <div className="text-sm text-gray-600 mt-4">
            {candidates.length > 0 && (
              <>
                Showing {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedZone && ` in ${selectedZone}`}
              </>
            )}
          </div>
        )}

        {selectedItem && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-10 rounded-xl flex flex-col items-center max-w-[400px] text-center max-h-[90vh] overflow-y-auto">
              <p className="px-2 py-1 bg-primary inline rounded-lg text-white font-semibold">
                {selectedItem.code}
              </p>
              <p className="font-bold text-xl text-primary mt-2">
                {selectedItem.name}
              </p>
              <p className="font-bold -mt-1 text-sm ">
                {selectedItem.category} Category
              </p>

              <p className="text-sm mt-3 font-bold text-primary">Dars Name</p>
              <p className="font-bold -mt-1 mb-4">{selectedItem.darsname}</p>

              {(selectedItem.stage1 ||
              selectedItem.stage2 ||
              selectedItem.stage3 ||
              selectedItem.groupstage1 ||
              selectedItem.groupstage2 ||
              selectedItem.groupstage3) && (
                <>
                  <p className="bg-primary text-sm text-white px-2 py-1 -mb-2 rounded-lg">
                    stage programs
                  </p>
                  <div className="border-2 border-dashed border-primary p-3 mb-2 rounded-xl text-center w-full">
                    {selectedItem.stage1 && <p className="mb-1">{selectedItem.stage1}</p>}
                    {selectedItem.stage2 && <p className="mb-1">{selectedItem.stage2}</p>}
                    {selectedItem.stage3 && <p className="mb-1">{selectedItem.stage3}</p>}
                    {selectedItem.groupstage1 && <p className="mb-1">{selectedItem.groupstage1}</p>}
                    {selectedItem.groupstage2 && <p className="mb-1">{selectedItem.groupstage2}</p>}
                    {selectedItem.groupstage3 && <p>{selectedItem.groupstage3}</p>}
                  </div>
                </>
              )}

              {(selectedItem.offstage1 ||
              selectedItem.offstage2 ||
              selectedItem.offstage3 ||
              selectedItem.groupoffstage) && (
                <>
                  <p className="bg-primary text-sm text-white px-2 py-1 -mb-2 rounded-lg">
                    off stage programs
                  </p>
                  <div className="border-2 border-dashed border-primary p-3 mb-2 rounded-xl text-center w-full">
                    {selectedItem.offstage1 && <p className="mb-1">{selectedItem.offstage1}</p>}
                    {selectedItem.offstage2 && <p className="mb-1">{selectedItem.offstage2}</p>}
                    {selectedItem.offstage3 && <p className="mb-1">{selectedItem.offstage3}</p>}
                    {selectedItem.groupoffstage && <p>{selectedItem.groupoffstage}</p>}
                  </div>
                </>
              )}
              
              <p className="my-3 text-sm text-gray-600">For enquiries contact admin</p>
              <button
                className="bg-red-700 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-800 transition-colors"
                onClick={closePopup}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div></>
  );
}

export default Search;