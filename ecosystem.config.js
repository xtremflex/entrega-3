module.exports = {
  apps: [
    {
      name: "backend",
      script: "./backend/app.js",
      env: {
        PORT: 80,
        MONGO_URI: "mongodb+srv://oscar:oroplata@betanito.l9jibyf.mongodb.net/?appName=Betanito",
      }
    }
  ]
};

