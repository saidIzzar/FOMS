const { User } = require('./models');

async function checkUsers() {
  const users = await User.findAll();
  console.log('Total users:', users.length);
  users.forEach(u => {
    console.log(`- ${u.username} (${u.role})`);
  });
}

checkUsers().catch(console.error);
