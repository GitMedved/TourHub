const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');

const EVENTS = [
  { title: 'Восхождение на Эльбрус', shortDescription: 'Покорите высочайшую вершину Европы', fullDescription: 'Семидневный тур с профессиональными гидами. Включено проживание, питание, снаряжение.', price: 85000, priceInfo: '₽/чел', address: 'Приэльбрусье, Кабардино-Балкария', latitude: 43.3499, longitude: 42.4453, startDate: '2026-06-15', endDate: '2026-06-22', durationDays: 7, maxParticipants: 12, category: 'Приключения', season: 'Лето', region: 'Кабардино-Балкария' },
  { title: 'Золотое кольцо на велосипедах', shortDescription: 'Велотур по древним городам России', fullDescription: 'Пятидневный велотур с посещением Суздаля, Владимира, Плёса. Велосипеды в аренду.', price: 45000, priceInfo: '₽/чел', address: 'Суздаль, Владимирская область', latitude: 56.4213, longitude: 40.4488, startDate: '2026-07-10', endDate: '2026-07-15', durationDays: 5, maxParticipants: 20, category: 'Активный отдых', season: 'Лето', region: 'Владимирская область' },
  { title: 'Байкал: лёд и пламя', shortDescription: 'Зимняя сказка на Байкале', fullDescription: 'Катание на коньках по прозрачному льду, хивусах, бурятская кухня, бани.', price: 120000, priceInfo: '₽/чел', address: 'Остров Ольхон, Иркутская область', latitude: 53.1567, longitude: 107.3836, startDate: '2027-02-10', endDate: '2027-02-17', durationDays: 7, maxParticipants: 8, category: 'Приключения', season: 'Зима', region: 'Иркутская область' },
  { title: 'Выходные в Калининграде', shortDescription: 'Европейский уикенд в России', fullDescription: 'Экскурсии по Кёнигсбергу, Куршская коса, музей янтаря, дегустация сыров.', price: 35000, priceInfo: '₽/чел', address: 'Калининград, Калининградская область', latitude: 54.7104, longitude: 20.4522, startDate: '2026-08-01', endDate: '2026-08-04', durationDays: 3, maxParticipants: 15, category: 'Культура', season: 'Лето', region: 'Калининградская область' },
  { title: 'Алтай: сила гор', shortDescription: 'Треккинг по Алтайским горам', fullDescription: 'Маршрут к подножию Белухи, купание в горных озёрах, кемпинг.', price: 95000, priceInfo: '₽/чел', address: 'Усть-Кокса, Республика Алтай', latitude: 50.2736, longitude: 85.6112, startDate: '2026-07-20', endDate: '2026-07-30', durationDays: 10, maxParticipants: 10, category: 'Приключения', season: 'Лето', region: 'Республика Алтай' },
  { title: 'Камчатка: край вулканов', shortDescription: 'Хели-ски и вулканы', fullDescription: 'Вертолётные прогулки, спуски по нетронутому снегу, горячие источники.', price: 180000, priceInfo: '₽/чел', address: 'Петропавловск-Камчатский, Камчатский край', latitude: 53.0166, longitude: 158.6509, startDate: '2027-03-01', endDate: '2027-03-08', durationDays: 7, maxParticipants: 6, category: 'Активный отдых', season: 'Зима', region: 'Камчатский край' },
  { title: 'Сочи: отдых у моря', shortDescription: 'Пляжный отдых и горы', fullDescription: 'Проживание в отеле 4*, пляж, экскурсии в Красную Поляну, Олимпийский парк.', price: 65000, priceInfo: '₽/чел', address: 'Сочи, Краснодарский край', latitude: 43.5855, longitude: 39.7231, startDate: '2026-06-01', endDate: '2026-06-14', durationDays: 13, maxParticipants: 30, category: 'Пляжный отдых', season: 'Лето', region: 'Краснодарский край' },
  { title: 'Гастротур по Татарстану', shortDescription: 'Кулинарное путешествие', fullDescription: 'Эчпочмак, чак-чак, мастер-классы татарской кухни, осмотр Казанского Кремля.', price: 40000, priceInfo: '₽/чел', address: 'Казань, Республика Татарстан', latitude: 55.7961, longitude: 49.1064, startDate: '2026-09-05', endDate: '2026-09-09', durationDays: 4, maxParticipants: 16, category: 'Гастрономия', season: 'Осень', region: 'Республика Татарстан' },
  { title: 'Дагестан: страна гор', shortDescription: 'Древние аулы и каньоны', fullDescription: 'Сулакский каньон, Дербент, аул-призрак Гамсутль, бархан Сарыкум.', price: 55000, priceInfo: '₽/чел', address: 'Махачкала, Республика Дагестан', latitude: 42.9849, longitude: 47.5047, startDate: '2026-10-01', endDate: '2026-10-07', durationDays: 6, maxParticipants: 14, category: 'Культура', season: 'Осень', region: 'Республика Дагестан' },
  { title: 'Круиз по Волге', shortDescription: 'Речное путешествие', fullDescription: 'Маршрут Нижний Новгород — Астрахань, остановки в живописных городах.', price: 110000, priceInfo: '₽/чел', address: 'Нижний Новгород, Нижегородская область', latitude: 56.3269, longitude: 44.0059, startDate: '2026-06-20', endDate: '2026-06-30', durationDays: 10, maxParticipants: 50, category: 'Другое', season: 'Лето', region: 'Нижегородская область' },
  { title: 'Сафари в Крыму', shortDescription: 'Джип-тур по полуострову', fullDescription: 'Бездорожье, пещерные города, дегустация вин, морские прогулки.', price: 70000, priceInfo: '₽/чел', address: 'Севастополь, Республика Крым', latitude: 44.6166, longitude: 33.5254, startDate: '2026-08-15', endDate: '2026-08-22', durationDays: 7, maxParticipants: 8, category: 'Приключения', season: 'Лето', region: 'Республика Крым' },
  { title: 'Москва для своих', shortDescription: 'Эксклюзивный тур по столице', fullDescription: 'Крыши, бункеры, сталинские высотки, секретные бары.', price: 25000, priceInfo: '₽/чел', address: 'Москва', latitude: 55.7558, longitude: 37.6173, startDate: '2026-05-15', endDate: '2026-05-17', durationDays: 2, maxParticipants: 12, category: 'Культура', season: 'Весна', region: 'Москва' },
  { title: 'Карелия: сплав на байдарках', shortDescription: 'Водный поход по рекам', fullDescription: 'Сплав по Шуе, ночёвки в палатках, рыбалка, баня на берегу.', price: 38000, priceInfo: '₽/чел', address: 'Петрозаводск, Республика Карелия', latitude: 61.7890, longitude: 34.3597, startDate: '2026-07-05', endDate: '2026-07-11', durationDays: 6, maxParticipants: 16, category: 'Активный отдых', season: 'Лето', region: 'Республика Карелия' },
  { title: 'Экотур по Уралу', shortDescription: 'Природа и минералы', fullDescription: 'Ильменский заповедник, Аркаим, Таганай, мастер-класс по добыче самоцветов.', price: 48000, priceInfo: '₽/чел', address: 'Челябинск, Челябинская область', latitude: 55.1599, longitude: 61.4026, startDate: '2026-06-10', endDate: '2026-06-17', durationDays: 7, maxParticipants: 20, category: 'Образование', season: 'Лето', region: 'Челябинская область' },
  { title: 'Питерские выходные', shortDescription: 'Культурная столица', fullDescription: 'Эрмитаж, Петергоф, реки и каналы, ночная жизнь, бранчи.', price: 28000, priceInfo: '₽/чел', address: 'Санкт-Петербург', latitude: 59.9343, longitude: 30.3351, startDate: '2026-05-20', endDate: '2026-05-23', durationDays: 3, maxParticipants: 25, category: 'Культура', season: 'Весна', region: 'Санкт-Петербург' },
  { title: 'Шерегеш: горнолыжный рай', shortDescription: 'Лучший сноуборд в Сибири', fullDescription: 'Фрирайд, трассы всех уровней, бары и дискотеки, скипассы включены.', price: 62000, priceInfo: '₽/чел', address: 'Шерегеш, Кемеровская область', latitude: 52.9535, longitude: 87.9600, startDate: '2027-01-10', endDate: '2027-01-17', durationDays: 7, maxParticipants: 22, category: 'Активный отдых', season: 'Зима', region: 'Кемеровская область' },
  { title: 'Соловки: острова духа', shortDescription: 'Паломничество и история', fullDescription: 'Соловецкий монастырь, лабиринты, Белое море на катере.', price: 52000, priceInfo: '₽/чел', address: 'Соловецкие острова, Архангельская область', latitude: 65.0254, longitude: 35.7101, startDate: '2026-07-01', endDate: '2026-07-07', durationDays: 6, maxParticipants: 18, category: 'Культура', season: 'Лето', region: 'Архангельская область' },
  { title: 'Сплавы по Чусовой', shortDescription: 'Семейный водный поход', fullDescription: 'Лёгкий сплав для всей семьи, скалы-бойцы, купание, вечерние костры.', price: 32000, priceInfo: '₽/чел', address: 'Чусовой, Пермский край', latitude: 58.3015, longitude: 57.8125, startDate: '2026-06-25', endDate: '2026-06-30', durationDays: 5, maxParticipants: 24, category: 'Семейный', season: 'Лето', region: 'Пермский край' },
  { title: 'Мацеста и СПА', shortDescription: 'Оздоровительный тур', fullDescription: 'Сероводородные ванны, массажи, йога на берегу моря, диетическое питание.', price: 89000, priceInfo: '₽/чел', address: 'Сочи, Краснодарский край', latitude: 43.5489, longitude: 39.7910, startDate: '2026-10-15', endDate: '2026-10-25', durationDays: 10, maxParticipants: 15, category: 'Оздоровление', season: 'Осень', region: 'Краснодарский край' },
  { title: 'Якутия: полюс холода', shortDescription: 'Экспедиция в Оймякон', fullDescription: 'Самое холодное место России, оленеводы, северное сияние, традиционный быт.', price: 150000, priceInfo: '₽/чел', address: 'Якутск, Республика Саха (Якутия)', latitude: 62.0278, longitude: 129.7317, startDate: '2027-01-20', endDate: '2027-01-30', durationDays: 10, maxParticipants: 6, category: 'Приключения', season: 'Зима', region: 'Республика Саха (Якутия)' },
  { title: 'Новогодняя сказка в Великом Устюге', shortDescription: 'В гости к Деду Морозу', fullDescription: 'Вотчина Деда Мороза, мастер-классы, катание на санях, тропа сказок.', price: 42000, priceInfo: '₽/чел', address: 'Великий Устюг, Вологодская область', latitude: 60.7608, longitude: 46.3053, startDate: '2026-12-28', endDate: '2027-01-03', durationDays: 6, maxParticipants: 40, category: 'Семейный', season: 'Зима', region: 'Вологодская область' },
  { title: 'Тюмени — горячие источники', shortDescription: 'Термальный уикенд', fullDescription: 'Открытые бассейны с горячей водой зимой, спа-процедуры, прогулки по городу.', price: 35000, priceInfo: '₽/чел', address: 'Тюмень, Тюменская область', latitude: 57.1530, longitude: 65.5343, startDate: '2026-11-15', endDate: '2026-11-18', durationDays: 3, maxParticipants: 20, category: 'Оздоровление', season: 'Осень', region: 'Тюменская область' },
  { title: 'Дальний Восток: край китов', shortDescription: 'Морская экспедиция', fullDescription: 'Наблюдение за китами и касатками, Шантарские острова, рыбалка.', price: 200000, priceInfo: '₽/чел', address: 'Хабаровск, Хабаровский край', latitude: 48.4802, longitude: 135.0718, startDate: '2026-08-10', endDate: '2026-08-20', durationDays: 10, maxParticipants: 8, category: 'Приключения', season: 'Лето', region: 'Хабаровский край' },
  { title: 'Романтический тур по Золотому кольцу', shortDescription: 'Для двоих: уют и история', fullDescription: 'Ужины при свечах, прогулки на лошадях, спа-отель, фотосессия в Суздале.', price: 68000, priceInfo: '₽/пара', address: 'Владимир, Владимирская область', latitude: 56.1291, longitude: 40.4066, startDate: '2026-09-01', endDate: '2026-09-05', durationDays: 4, maxParticipants: 10, category: 'Романтика', season: 'Осень', region: 'Владимирская область' }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключено к БД');

    // Найдём продавца
    const [sellers] = await sequelize.query('SELECT id FROM "Sellers" LIMIT 1');
    const sellerId = sellers[0]?.id || 1;

    // Создаём события
    for (const eventData of EVENTS) {
      await sequelize.query(
        `INSERT INTO "Events" (title, "shortDescription", "fullDescription", price, "priceInfo", address, latitude, longitude, "startDate", "endDate", "durationDays", "maxParticipants", category, season, region, "sellerId", "isPublished", "moderationStatus", "createdAt", "updatedAt")
         VALUES (:title, :shortDescription, :fullDescription, :price, :priceInfo, :address, :latitude, :longitude, :startDate, :endDate, :durationDays, :maxParticipants, :category, :season, :region, :sellerId, true, 'approved', NOW(), NOW())`,
        {
          replacements: { ...eventData, sellerId },
          type: sequelize.QueryTypes.INSERT
        }
      );
      console.log(`✅ ${eventData.title}`);
    }

    console.log(`🎉 Добавлено ${EVENTS.length} событий`);
    process.exit(0);
  } catch (error) {
    console.error('❌', error.message);
    process.exit(1);
  }
}

seed();
