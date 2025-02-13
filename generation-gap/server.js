const app = require('./server/index');
const path = require('path');
const express = require('express');

// Only serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
} else {
  // In development, only handle API requests
  app.get('/', (req, res) => {
    res.json({ message: 'API server is running' });
  });
}

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
}); 