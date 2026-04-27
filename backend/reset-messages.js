const sequelize = require('./src/config/database');

async function resetMessages() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключено к БД');
    
    // Удаляем таблицу Messages
    await sequelize.query('DROP TABLE IF EXISTS "Messages" CASCADE;');
    console.log('✅ Таблица Messages удалена');
    
    // Пересоздаём
    await sequelize.sync();
    console.log('✅ Таблицы синхронизированы');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

resetMessages();
