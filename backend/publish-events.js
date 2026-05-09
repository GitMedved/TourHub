const { Sequelize } = require('/Users/uncle_bear/TourHub/backend/node_modules/sequelize');

const sequelize = new Sequelize(
  'travel_aggregator',
  'postgres',
  'postgres',
  {
    host: 'localhost',
    port: 5435,
    dialect: 'postgres',
    logging: false
  }
);

async function publishAllEvents() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключено к базе данных');
    
    const [results] = await sequelize.query(
      'UPDATE "Events" SET "isPublished" = true, "moderationStatus" = \'approved\' WHERE "isPublished" = false'
    );
    
    console.log('✅ Все события опубликованы!');
    
    const events = await sequelize.query(
      'SELECT id, title, "isPublished", "moderationStatus" FROM "Events"'
    );
    
    console.log('\n📋 Обновлённые события:');
    events[0].forEach(e => {
      console.log(`  [${e.id}] ${e.title} — опубликовано: ${e.isPublished}, статус: ${e.moderationStatus}`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

publishAllEvents();
