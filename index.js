const express = require('express')

const app = express()
const port = 3000

const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.use('/test', express.static('test'));
app.use('/dist', express.static('dist'));
app.use('/src', express.static(path.join(__dirname, 'dist'), { extensions: ['js'] }));
app.use('/dist/render', express.static('dist/render'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
