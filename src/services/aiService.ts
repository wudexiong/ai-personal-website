import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

/**
 * AI服务配置接口
 */
interface AIServiceConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * AI服务类
 * @description 提供AI相关的功能，包括文本生成、内容分析等
 */
export class AIService {
  private static instance: AIService;
  private openai: OpenAI;
  private config: AIServiceConfig;

  /**
   * 私有构造函数，用于单例模式
   * @param config - AI服务配置
   */
  private constructor(config: AIServiceConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey
    });
  }

  /**
   * 获取AIService实例
   * @param config - AI服务配置
   * @returns AIService实例
   */
  public static getInstance(config: AIServiceConfig): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService(config);
    }
    return AIService.instance;
  }

  /**
   * 生成文章内容
   * @param prompt - 提示词
   * @returns 生成的文章内容
   */
  public async generateArticle(prompt: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: this.config.model,
      temperature: this.config.temperature ?? 0.7,
      max_tokens: this.config.maxTokens ?? 1000
    });

    return completion.choices[0]?.message?.content ?? '';
  }

  /**
   * 生成文章标题
   * @param content - 文章内容
   * @returns 生成的标题
   */
  public async generateTitle(content: string): Promise<string> {
    const prompt = `请为以下内容生成一个吸引人的标题：\n\n${content}`;
    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: this.config.model,
      temperature: 0.8,
      max_tokens: 50
    });

    return completion.choices[0]?.message?.content ?? '';
  }

  /**
   * 生成文章摘要
   * @param content - 文章内容
   * @returns 生成的摘要
   */
  public async generateExcerpt(content: string): Promise<string> {
    const prompt = `请为以下内容生成一个简短的摘要（不超过200字）：\n\n${content}`;
    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: this.config.model,
      temperature: 0.5,
      max_tokens: 200
    });

    return completion.choices[0]?.message?.content ?? '';
  }

  /**
   * 分析文章情感
   * @param content - 文章内容
   * @returns 情感分析结果
   */
  public async analyzeSentiment(content: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
  }> {
    const prompt = `请分析以下内容的情感倾向，并给出分数（-1到1之间）：\n\n${content}`;
    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: this.config.model,
      temperature: 0.2,
      max_tokens: 50
    });

    const response = completion.choices[0]?.message?.content ?? '';
    const score = parseFloat(response) || 0;

    return {
      sentiment: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
      score
    };
  }

  /**
   * 提取关键词
   * @param content - 文章内容
   * @returns 关键词列表
   */
  public async extractKeywords(content: string): Promise<string[]> {
    const prompt = `请从以下内容中提取5-10个关键词：\n\n${content}`;
    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: this.config.model,
      temperature: 0.3,
      max_tokens: 100
    });

    const response = completion.choices[0]?.message?.content ?? '';
    return response.split(',').map(keyword => keyword.trim());
  }

  /**
   * 生成流式响应
   * @param messages - 消息列表
   * @returns 流式响应
   */
  public async generateStream(messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }[]): Promise<StreamingTextResponse> {
    const response = await this.openai.chat.completions.create({
      messages,
      model: this.config.model,
      temperature: this.config.temperature ?? 0.7,
      max_tokens: this.config.maxTokens ?? 1000,
      stream: true
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  }

  /**
   * 生成图像描述
   * @param image - 图像URL或Base64
   * @returns 图像描述
   */
  public async generateImageDescription(image: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "请描述这张图片的内容：" },
            {
              type: "image_url",
              image_url: image,
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content ?? '';
  }
} 