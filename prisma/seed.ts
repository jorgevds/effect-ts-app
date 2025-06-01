import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
    {
        name: "Alice",
        email: "alice@prisma.io",
        posts: {
            create: [
                {
                    title: "Join the Prisma Discord",
                    content: "https://pris.ly/discord",
                    published: true,
                },
            ],
        },
    },
    {
        name: "Nilu",
        email: "nilu@prisma.io",
        posts: {
            create: [
                {
                    title: "Follow Prisma on Twitter",
                    content: "https://www.twitter.com/prisma",
                    published: true,
                },
            ],
        },
    },
    {
        name: "Mahmoud",
        email: "mahmoud@prisma.io",
        posts: {
            create: [
                {
                    title: "Ask a question about Prisma on GitHub",
                    content: "https://www.github.com/prisma/prisma/discussions",
                    published: true,
                },
                {
                    title: "Prisma on YouTube",
                    content: "https://pris.ly/youtube",
                },
            ],
        },
    },
];

async function main() {
    console.log(`Start seeding ...`);
    const chore = await prisma.chore.create({
        data: {
            name: "vacuum",
            location: { create: { name: "bathroom" } },
            timePerformed: new Date(),
            timeInvalid: new Date(),
            estimationMinutes: 30,
        },
    });
    console.log(`Created user with id: ${chore.id}`);
    console.log(`Seeding finished.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async e => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
