const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.saski' });

// Source database (saski-ai-website)
const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.saski_DATABASE_URL
    }
  }
});

async function checkMenuItemsData() {
  console.log('🔍 Checking Menu Items data in saski-ai-website database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Connected to saski-ai-website database\n');

    // Check Menu data
    const menusCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM menus
    `;
    console.log(`📋 Menus: ${menusCount[0].count} records`);

    // Check MenuItem data
    const menuItemsCount = await sourcePrisma.$queryRaw`
      SELECT COUNT(*) as count FROM menu_items
    `;
    console.log(`🔗 Menu Items: ${menuItemsCount[0].count} records`);

    if (menusCount[0].count > 0) {
      const menusData = await sourcePrisma.$queryRaw`
        SELECT * FROM menus
      `;
      
      console.log('\n📋 Menus Data:');
      menusData.forEach((menu, index) => {
        console.log(`\n   ${index + 1}. Menu ID: ${menu.id}`);
        console.log(`      Name: ${menu.name || 'No name'}`);
        console.log(`      Location: ${menu.location || 'No location'}`);
        console.log(`      Is Active: ${menu.isActive}`);
        console.log(`      Created At: ${menu.createdAt}`);
        console.log(`      Updated At: ${menu.updatedAt}`);
      });
    }

    if (menuItemsCount[0].count > 0) {
      const menuItemsData = await sourcePrisma.$queryRaw`
        SELECT * FROM menu_items
      `;
      
      console.log('\n🔗 Menu Items Data:');
      menuItemsData.forEach((item, index) => {
        console.log(`\n   ${index + 1}. Menu Item ID: ${item.id}`);
        console.log(`      Menu ID: ${item.menuId}`);
        console.log(`      Text: ${item.text || 'No text'}`);
        console.log(`      URL: ${item.url || 'No URL'}`);
        console.log(`      Order: ${item.order || 'No order'}`);
        console.log(`      Parent ID: ${item.parentId || 'No parent'}`);
        console.log(`      Is Active: ${item.isActive}`);
        console.log(`      Created At: ${item.createdAt}`);
        console.log(`      Updated At: ${item.updatedAt}`);
      });
    }

    // Check menu items grouped by menu
    console.log('\n📊 Menu Items by Menu:');
    console.log('─'.repeat(60));
    if (menusCount[0].count > 0 && menuItemsCount[0].count > 0) {
      const menuItemsByMenu = await sourcePrisma.$queryRaw`
        SELECT m.name as menu_name, m.id as menu_id, COUNT(mi.id) as item_count
        FROM menus m
        LEFT JOIN menu_items mi ON m.id = mi."menuId"
        GROUP BY m.id, m.name
        ORDER BY m.id
      `;
      
      menuItemsByMenu.forEach((menu) => {
        console.log(`   Menu: ${menu.menu_name} (ID: ${menu.menu_id}) - ${menu.item_count} items`);
      });
    }

    console.log('\n📊 Menu Data Summary:');
    console.log('─'.repeat(60));
    console.log(`Menus: ${menusCount[0].count}`);
    console.log(`Menu Items: ${menuItemsCount[0].count}`);
    
    if (menuItemsCount[0].count > 0) {
      console.log('\n✅ Menu items data found! This data needs to be copied.');
    } else {
      console.log('\n⚠️  No menu items data found in saski-ai-website database.');
    }

  } catch (error) {
    console.error('❌ Error checking menu items data:', error);
  } finally {
    await sourcePrisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

checkMenuItemsData().catch(console.error); 