/** LLM / STT provider abstraction (Phase 3). */
export interface LlmProvider {
  complete(prompt: string): Promise<string>
}
