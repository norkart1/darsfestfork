"use client";
import React, { useState, useEffect } from "react";
import Data from "../../data/FullData.json"; // Fallback data
import Link from "next/link";
import Headear from "@/components/Headear";

function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedZone, setSelectedZone] = useState("");
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // Load zone preference
  useEffect(() => {
    const zone = localStorage.getItem("zone");
    setSelectedZone(zone || "");
  }, []);

  // Fetch programs from dedicated API with fallback
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedZone) params.set('zone', selectedZone);
        
        const response = await fetch(`/api/public/programs?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.programs)) {
            setPrograms(data.programs);
            setUsingFallback(false);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.log('Database connection issue, using local data fallback');
      }
      
      // Fallback to JSON data
      const fallbackPrograms = processPrograms(Data);
      setPrograms(fallbackPrograms);
      setUsingFallback(true);
      setLoading(false);
    };

    fetchPrograms();
  }, [selectedZone]);

  const processPrograms = (candidateData) => {
    const programFields = [
      "offstage1", "offstage2", "offstage3",
      "stage1", "stage2", "stage3",
      "groupstage1", "groupstage2", "groupstage3",
      "groupoffstage",
    ];
    
    const allValues = candidateData.reduce((result, item) => {
      programFields.forEach((field) => {
        if (item[field]) {
          const programValue = item[field];
          const candidates = candidateData.filter((candidate) => {
            return programFields.some((fieldToCheck) => {
              return (
                candidate[fieldToCheck] === programValue && candidate.category === item.category
              );
            });
          }).map((candidate) => ({
            code: candidate.code,
            name: candidate.name,
            darsplace: candidate.darsplace,
          }));
          result.push({
            program: programValue,
            category: item.category,
            candidates,
          });
        }
      });
    
      return result;
    }, []);

    const uniqueValues = allValues.reduce((unique, current) => {
      const isDuplicate = unique.some(
        (item) =>
          item.program === current.program && item.category === current.category
      );
      if (!isDuplicate) {
        // Generate a slug based on the first letter of the category and the first two letters of program
        const slug = generateSlug(current.category, current.program);
        unique.push({
          program: current.program,
          category: current.category,
          candidates: current.candidates,
          slug, // Add the slug here
        });
      }
      return unique;
    }, []);

    return uniqueValues;
  };

  // Define a function to generate a slug based on category and program
  function generateSlug(category, program) {
    const categorySlug = category.charAt(0);
    const programSlug = program.slice(0, 2);
    return categorySlug + programSlug;
  }

  const filteredData = programs.filter((item) => {
    if (!searchTerm) return true;
    return item.program.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (<>
    <Headear selectedZone={selectedZone} setSelectedZone={setSelectedZone}/>
    <div className="p-12 pt-0 lg:p-20">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-center font-extrabold text-3xl text-primary mb-3">
          Program Search
        </h1>
        {usingFallback && (
          <div className="text-center text-sm text-amber-600 mb-2 bg-amber-50 px-3 py-1 rounded-lg">
            📋 Using local data (database connection being established)
          </div>
        )}
        <input
          type="text"
          placeholder="Search by Program Name..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-2/3 px-4 py-2 rounded-xl border-2 border-dashed border-primary"
        />
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-primary font-semibold">Loading programs...</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">No programs found. Try adjusting your search.</div>
            </div>
          ) : (
            filteredData.map((item, index) => (
              <Link key={index} href={`/program/${item.slug}`}>
                <div
                  className="w-72 bg-secondary p-6 rounded-xl flex flex-col gap-2 items-start cursor-pointer"
                >
                  <div className="flex justify-between items-center w-full">
                    <h1 className="px-2 py-1 bg-primary inline rounded-lg text-white font-semibold">
                      {item.category}
                    </h1>
                    <h1 className="text-primary font-semibold">
                      {item.candidateCount ?? item.count ?? item.candidates?.length ?? 0} Candidates
                    </h1>
                  </div>
                  <div className="line-clamp-2 border-2 h-16 p-3 my-2 border-primary flex items-center justify-center rounded-xl border-dashed w-full">
                    <p className="line-clamp-2 text-center">{item.program}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div></>
  );
}

export default Search;