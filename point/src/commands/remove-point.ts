import { StaffModel } from '@/models';
import { MemberManager, StaffManager } from '@/managers';
import { Colors, EmbedBuilder, TextChannel, bold, inlineCode } from 'discord.js';
import { ICommand } from '@/types';

const RemovePoint: ICommand = {
    usages: [
        'puançıkar',
        'pointremove',
        'removepoint',
        'çıkarpuan',
        'removepoints',
        'pointsremove',
        'çıkartpoint',
        'pointçıkar',
        'pç',
    ],
    description: 'Belirtilen kullanıcıya belirtilen puanı çıkarır.',
    usableAuth: ['1179030512573091930', '1179403561747095552', '1179554144130969713'],
    execute: async ({ client, message, args }) => {
        const member = await MemberManager.getMember(message.guild, args[0]);
        if (!member) return client.utils.sendTimedMessage(message, 'Geçerli bir kullanıcı belirt!');
        if (member.user.bot) return client.utils.sendTimedMessage(message, 'Belirttiğin kullanıcı bir bot!');
        if (!StaffManager.checkStaff(member)) {
            client.utils.sendTimedMessage(message, 'Belirttiğin kullanıcı yetkili değil!');
            return;
        }

        const count = parseInt(args[1]);
        if (!count || 0 >= count) return client.utils.sendTimedMessage(message, 'Geçerli bir puan belirt!');

        await StaffModel.updateOne(
            { id: member.id },
            { $inc: { totalPoints: -count, bonusPoints: -count } },
            { upsert: true },
        );

        const logChannel = message.guild.channels.cache.find((c) => c.name === 'bonus-log') as TextChannel;
        if (logChannel) {
            logChannel.send({
                embeds: [
                    new EmbedBuilder({
                        color: Colors.Red,
                        description: `${message.author} (${inlineCode(
                            message.author.id,
                        )}) adlı yetkili ${member} (${inlineCode(member.id)}) adlı yetkiliden ${bold(
                            count.toString(),
                        )} puan çıkardı.`,
                    }),
                ],
            });
        }

        message.channel.send(`${member} adlı yetkiliden ${bold(count.toString())} adet puan çıkardı.`);
    },
};

export default RemovePoint;
