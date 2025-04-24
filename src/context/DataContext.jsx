// src/context/DataContext.jsx
import React, { createContext, useContext } from 'react';

// Import your JSON files
import completionsByInstitution from '../data/completions_by_institution.json';
import completionsByAwardLevel from '../data/Regional_completions_by_award_level.json';
import employmentByCity from '../data/Top_Cities_Job_Posting.json';
import jobPostingsTopCompanies from '../data/Job_postings_top_companies.json';
import targetOccupations from '../data/Target_occupations.json';
import cityCoordinates from '../data/cityCoordinates.json';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  // Log data availability
  console.log('Data loaded:', {
    completionsByInstitution: !!completionsByInstitution,
    completionsByAwardLevel: !!completionsByAwardLevel,
    employmentByCity: !!employmentByCity,
    employmentByCompany: !!jobPostingsTopCompanies,
    targetOccupations: !!targetOccupations
  });

  // Create the context value
  const contextValue = {
    completionsByInstitution,
    completionsByAwardLevel,
    employmentByCity,
    employmentByCompany: jobPostingsTopCompanies,
    employmentByOccupation: targetOccupations,
    targetOccupations,
    cityCoordinates,
    loading: false,
    error: null
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};
