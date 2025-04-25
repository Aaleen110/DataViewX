import React from 'react';
import { DataViewX } from './lib'; // Import from the library entry point
import './lib/styles/global.css'; // Import global styles if you have them

// Example usage of DataViewX
function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = import.meta.env.VITE_API_TOKEN;

  // Define a type for the specific data structure of this API
  interface JobCategory {
    id: number;
    category: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    clientId?: number | null; // Optional or nullable fields
  }

  // Optional: Custom empty state component
  const CustomEmptyState = () => (
    <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
      <h2>No Data Found</h2>
      <p>Try adjusting your search or filters.</p>
    </div>
  );

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'title', header: 'Title' },
    { key: 'experience', header: 'Experience' },
    { key: 'location', header: 'Location' },
    { key: 'createdBy', header: 'Created By' },
    { key: 'createdAt', header: 'Created At' }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>DataViewX Example</h1>
      <DataViewX<JobCategory>
        getApi={apiUrl}
        token={token}
        display="list"
        initialItemsPerPage={10}
        itemsPerPageOptions={[5, 10, 15]}
        emptyStateComponent={<CustomEmptyState />}
        columns={columns}
        theme={{
          primary: "#000000",
          secondary: "#e3f2fd",
          background: "#f8f9fa",
          text: "#212529",
          accent: "#ff9800"
        }}
        // The following props are optional if using the default API structure and param names
        // dataPath="data.list"
        // totalPath="data.total"
        // pagePath="data.page"
        // totalPagesPath="data.totalPages"
        // searchParamKey="search"
        // pageParamKey="page"
        // limitParamKey="limit"
        // sortParamKey="sort"
      />
    </div>
  );
}

export default App;
