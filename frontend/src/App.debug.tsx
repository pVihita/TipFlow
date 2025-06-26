// Debug version with inline styles - no Tailwind CSS
function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '1rem' 
        }}>
          🚀 FlowTip Debug Mode
        </h1>
        
        <div style={{ 
          backgroundColor: '#dbeafe', 
          color: '#1e40af', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem'
        }}>
          ✅ React is working correctly
        </div>
        
        <div style={{ 
          backgroundColor: '#fef3c7', 
          color: '#92400e', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem'
        }}>
          ⚠️ Testing without Tailwind CSS
        </div>
        
        <div style={{ 
          backgroundColor: '#f3e8ff', 
          color: '#7c3aed', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem'
        }}>
          🔧 Debugging Tailwind CSS issues
        </div>
        
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Environment ID Status: {import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID ? '✅ Loaded' : '❌ Missing'}
        </p>
        
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.8rem' }}>
          Debug Value: {import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || 'undefined'}
        </p>
        
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.8rem' }}>
          All env vars: {JSON.stringify(import.meta.env, null, 2)}
        </p>
        
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          If you can see this page, React is working. The issue is with Tailwind CSS configuration.
        </p>
        
        <button 
          onClick={() => alert('React event handling works!')}
          style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '8px', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          Test Button Click
        </button>
      </div>
    </div>
  );
}

export default App; 