import { symbolData } from "./mock";
export async function GET() {
    return new Response(JSON.stringify(symbolData), {
        headers: { "Content-Type": "application/json" },
    });
}