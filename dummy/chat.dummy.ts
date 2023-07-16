
// async function test() {
//     for (let i = 0; i < 10; i++) {
//         const targetUserId = 1
//         const nicknames = ['근', '임주년', '곽튜브', '앙기머', '링']
//         await prisma.user.createMany({
//             data: nicknames.map(nickname => ({
//                 nickname,
//                 phone: `010${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
//             })),
//             skipDuplicates: true,
//         })

//         const users = await prisma.user.findMany()
//         await prisma.post.createMany({
//             data: users.map((user, i) => ({
//                 // id: i + 1,
//                 authorId: user.id,
//                 type: 'sell',
//                 status: 'default',
//                 title: `${user.nickname}의 게시글`,
//                 content: `${user.nickname}의 게시글 내용`,
//                 price: Math.floor(Math.random() * 1000000),
//                 sellMethod: 'direct',
//             })),
//             // skipDuplicates: true,
//         })

//         for (let post of await prisma.post.findMany()) {
//             await prisma.chat.create({
//                 data: {
//                     post: { connect: { id: post.id } },
//                     participants: {
//                         create: [
//                             { userId: targetUserId, lastReadAt: new Date() },
//                             { userId: post.authorId, lastReadAt: new Date() },
//                         ]
//                     },
//                 },
//             })
//         }

//         for (let chat of await prisma.chat.findMany({
//             include: {
//                 participants: {
//                     include: {
//                         user: true,
//                     }
//                 }
//             }
//         })) {
//             for (let i = 0; i < 10; i++) {
//                 await prisma.message.create({
//                     data: {
//                         chatId: chat.id,
//                         senderId: chat.participants[i % 2].userId,
//                         content: `${i}번째 메시지`,
//                         type: 'text',
//                     }
//                 })
//             }
//         }
//     }
// }

// test()