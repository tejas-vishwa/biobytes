import { seedDatabase } from './lib/seed-db';

seedDatabase()
  .then(res => console.log(res))
  .catch(err => console.error(err));
