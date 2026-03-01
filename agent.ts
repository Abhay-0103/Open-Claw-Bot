import OpenAI from "openai";
import { execSync } from "node:child_process";
import { z } from 'zod';
import { zodTextFormat } from "openai/helpers/zod.mjs";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// Tools
function executeCommand(cmd = "") {
    const result = execSync(cmd);
    return result.toString();
}

const functionMapping = {
    executeCommand,
}

const SYSTEM_PROMPT = `You are a expert AI Assistant that is expert in controlling the user's machine. Analyise the user's query carefully and plan the steps on what needs to be done. Based on the user's query, you can create commands and then call the tool to run that command and execute on the user's machine. 

Available tools:
- executeCommand(command: string) : Output from the command.

You can use executeCommand tool to execute any command on user's machine.
`;

const outputschema = z.object({
    type: z.enum(['tool_call', 'text']).describe("What kind of response is this ?"),
    text_content: z.string().optional().describe("Text content if type is text"),
    tool_call: z.object({
        tool_name: z.string().describe("Name of the tool"),
        params: z.array(z.string()),
    }).optional().nullable().describe("The params to call the tool if type is tool_call")
});

const messages = [{
    "role": "system",
    "content": SYSTEM_PROMPT
}]

export async function run(query = "") {
    messages.push({ role: 'user', content: query });
    while (true) {
        const result = await openai.chat.completions.parse({
            model: "gemini-2.5-flash",
            text: {
                format: zodTextFormat(outputschema, 'output'),
            },
            input: messages
        });
        const parsedOutput = result.output_parsed
        switch (parsedOutput.type) {
            case 'tool_call': {
                if (parsedOutput.tool_call) {
                    const { params, tool_name } = parsedOutput.tool_call;
                    console.log(`Tool Call: ${tool_name}: ${params}`);
                    if (functionMapping[tool_name]) {
                        const toolOutput = functionMapping[tool_name](...params);
                        console.log(`Tool Output (${tool_name})`, toolOutput);
                        messages.push({
                            role: 'developer',
                            content: JSON.stringify({
                                tool_name,
                                params,
                                tool_Output : toolOutput
                            })
                        })
                    }
                }
            }
                break;
            case 'text': {

            }
                break;
            case 'text': {

            }
                break;
        }

        console.log(`Agent Says:`, JSON.stringify(result.output_parsed, null, 2));
    }
}



// run('Make a new folder named test');
console.log((executeCommand('ls')));