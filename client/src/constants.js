const prod = {
    url: {
        API_URL: "https://slacktoplaylist.herokuapp.com",
        API_URL_USERS: "https://myapp.herokuapp.com/users"
    },
    client_id: "1316992117988.1323435218849"
};
const dev = {
    url: {
        API_URL: "http://localhost:3000"
    },
    client_id: "1316992117988.1323435218849"

};

const config = process.env.NODE_ENV === "development" ? dev : prod;

export default config