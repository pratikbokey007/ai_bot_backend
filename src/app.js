const express = require('express');
const cors = require('cors');
const app = express();
const chatRoutes = require('./routes/chat.routes');

app.use(cors());
app.use(express.json());
app.use('/api', chatRoutes);

app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});