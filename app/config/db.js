const dbConfig = {
  local: 'mongodb://localhost/portfolio',
  online: `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@merramarie.2k0z3.mongodb.net/portfolio?retryWrites=true&w=majority`
};

export default dbConfig;