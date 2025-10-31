import app from "./src/app"; 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});