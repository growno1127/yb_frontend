import React from 'react'

const LoadingModal = () => {
  return (
    <div style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }}>
        <div style={{ 
            padding: '20px', 
            background: 'white', 
            borderRadius: '5px', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <p>Loading...</p>
        </div>
    </div>
  )
}

export default LoadingModal