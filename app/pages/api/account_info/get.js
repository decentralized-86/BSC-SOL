import prisma from '../../../lib/prisma';

export default async function handler(req, res) {

    try {
        const { wallet_address } = req.body;
        console.log("wallet_address", wallet_address)
        const response = await prisma.info.findUnique({
            where: { wallet_address: wallet_address },
            select: {
                free_image_amount: true,
                paid_image_amount: true,
                free_chat_time: true,
                paid_chat_time: true,
                expire_date: true,
            },
        });
        res.send(response);
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }

        res.status(500).json({
            success: false,
            message: "Something went wrong " + error.message,
        });
    }
};
