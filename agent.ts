import OpenAI from "openai";
import { exec, execSync } from "node:child_process";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// Tools
function executeCommand(cmd = "") {
    const result = execSync(cmd);
    return result.toString();
}

const SYSTEM_PROMPT = `You are a expert AI Assistant that is expert in controlling the user's machine. Analyise the user's query carefully and plan the steps on what needs to be done. Based on the user's query, you can create commands and then call the tool to run that command and execute on the user's machine. `

export async function run(query = "") {
const result = await openai.chat.completions.create({
    model: "gemini-2.5-flash",
    messages : [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": query
        }
    ]
});
console.log(`Agent Says:`, result.output);
}

// run('Make a new folder named test');
console.log((executeCommand('ls')));