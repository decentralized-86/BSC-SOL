import { createOpenAiInstance } from "./createOpenAiInstance";

const key = process.env.PAID_OPENAI_API_KEY;
const openai = createOpenAiInstance(key);

// export default const generateImage = async (req, res) => {
//  export default const generateImage = async (req, res) => {
export default async function handler(req, res) {
    const { prompt } = req.body;

    // const imageSize =
    //     size === "large"
    //         ? "1024x1024"
    //         : size === "medium"
    //             ? "512x512"
    //             : "256x256";

    try {
        const response = await openai.createImage({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        const imageUrl = response.data.data[0].url;

        res.status(200).json({
            success: true,
            imageUrl: imageUrl,
        });
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }

        res.status(500).json({
            success: false,
            message: "Something went wrong, unable to generate image",
        });
    }
};
