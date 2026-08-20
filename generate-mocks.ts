import fs from 'fs';
import { generateUserReport } from './lib/report-generator';

(async () => {
  try {
    const a = JSON.parse(fs.readFileSync('user_a_critical.json', 'utf8'));
    const b = JSON.parse(fs.readFileSync('user_b_wellness.json', 'utf8'));

    const htmlA = await generateUserReport('testA', a);
    const htmlB = await generateUserReport('testB', b);

    fs.writeFileSync('user_a_critical.html', htmlA);
    fs.writeFileSync('user_b_wellness.html', htmlB);

    console.log('HTML Generated successfully');
  } catch (err) {
    console.error(err);
  }
})();
