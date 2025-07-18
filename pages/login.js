export default function Login() {
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
      <h1>Login to IGWT</h1>
      <form style={{ display: 'flex', flexDirection: 'column', width: '250px' }}>
        <input type="email" placeholder="Email" style={inputStyle} />
        <input type="password" placeholder="Password" style={inputStyle} />
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
    </main>
  );
}

const inputStyle = {
  marginBottom: '10px',
  padding: '10px',
  borderRadius: '4px',
  border: 'none'
};

const buttonStyle = {
  backgroundColor: '#0ff',
  color: '#000',
  padding: '10px',
  borderRadius: '4px',
  border: 'none'
};
