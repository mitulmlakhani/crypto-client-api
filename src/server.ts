import app from './bootstrap/app';

const PORT = 3001;

app.listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
})