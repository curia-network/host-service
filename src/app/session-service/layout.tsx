export default function SessionServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden',
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {children}
    </div>
  );
} 