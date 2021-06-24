const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// curl http://localhost:3000/qa/questions
app.get('/questions', (req, res) => {
  res.send('Hello from get /questions')
});

// curl -X POST http://localhost:3000/qa/questions
app.post('/questions', (req, res) => {
  res.send('Hello from post /questions')
});


app.listen(PORT, () => {
  console.log(`API server listening on ${PORT}`);
})