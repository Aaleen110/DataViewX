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

  const gridFields = {
    id: 'id',
    title: 'title',
    subtitle: 'jobDetails',
    body: 'description',
    date: 'createdAt',
    dateInfo: 'createdBy'
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%', backgroundColor: '#f1f5f9' }}>
      <h1>DataViewX Example</h1>
      <DataViewX<JobCategory>
        getApi={apiUrl}
        token={token}
        display="list"
        initialItemsPerPage={10}
        itemsPerPageOptions={[10, 25, 50, 100]}
        emptyStateComponent={<CustomEmptyState />}
        columns={columns}
        gridFields={gridFields}
        theme={{
          primary: "#47A7F4",
          primaryLight: "#E8F5FF",
          secondary: "red",
          background: "#FFFFFF",
          text: "#333333",
          accent: "#ff9800"

        }}
      />
    </div>
  );
}

export default App;
