const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, 'fonts');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const dest = path.join(dir, 'NotoSansRunic-Regular.ttf');
const file = fs.createWriteStream(dest);

const url = 'https://cdn.flexmonster.com/fonts/NotoSansRunic-Regular.ttf';

console.log(`Downloading ${url}...`);

https.get(url, function(response) {
  if (response.statusCode !== 200) {
    console.error(`Failed to download font: Status Code ${response.statusCode}`);
    process.exit(1);
  }
  response.pipe(file);
  file.on('finish', function() {
    file.close(() => {
      console.log('Font downloaded successfully to public/fonts/NotoSansRunic-Regular.ttf');
      process.exit(0);
    });
  });
}).on('error', function(err) {
  fs.unlink(dest, () => {}); // Delete the file async if error
  console.error(`Error downloading font: ${err.message}`);
  process.exit(1);
});
