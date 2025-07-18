export default function Home() {
  return (
    <main style={{
      backgroundColor: '#111',
      color: '#fff',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1>Welcome to IGWT Platform</h1>
      <p style={{ marginTop: '10px' }}>
        <a href="/signup" style={{ color: '#0ff', marginRight: '10px' }}>Sign Up</a>
        <a href="/login" style={{ color: '#0ff' }}>Login</a>
      </p>
    </main>
  );
}
