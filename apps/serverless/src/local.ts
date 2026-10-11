import app from "./app";

const port = process.env.PORT || 3500;

app.listen(port, () => {
    console.log("Server running locally at http://localhost:" + port);
});
