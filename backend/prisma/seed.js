const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const games = [
  {
    name: 'Neon Drift',
    description: 'High-speed neon racing through cyberpunk megacities. Drift corners, chain combos, and climb the global board.',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc8b6ca8124?w=800&q=80',
  },
  {
    name: 'Orbital Siege',
    description: 'Defend orbital stations against swarm assaults. Precision targeting and wave survival score multipliers.',
    coverImage: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&q=80',
  },
  {
    name: 'Pulse Arena',
    description: 'Competitive arena battler with rhythm-synced power-ups. Land perfect pulses for massive score bursts.',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
  },
];

async function main() {
  const existing = await prisma.game.count();
  if (existing > 0) {
    console.log(`Seed skipped: ${existing} game(s) already present.`);
    return;
  }

  await prisma.game.createMany({ data: games });
  console.log(`Seeded ${games.length} games.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
