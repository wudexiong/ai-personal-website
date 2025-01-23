/**
 * AI服务单元测试
 * @jest-environment node
 */

import { AIService } from '../aiService'
import OpenAI from 'openai'
import { StreamingTextResponse } from 'ai'

// Mock OpenAI
const mockCreate = jest.fn()
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}))

// Mock StreamingTextResponse
jest.mock('ai', () => ({
  StreamingTextResponse: jest.fn(),
  OpenAIStream: jest.fn(),
}))

describe('AIService', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
  }

  let aiService: AIService

  beforeEach(() => {
    jest.clearAllMocks()
    aiService = AIService.getInstance(mockConfig)
  })

  describe('getInstance', () => {
    it('应该返回单例实例', () => {
      const instance1 = AIService.getInstance(mockConfig)
      const instance2 = AIService.getInstance(mockConfig)
      expect(instance1).toBe(instance2)
    })
  })

  describe('generateArticle', () => {
    const mockPrompt = '写一篇关于AI的文章'
    const mockResponse = '这是一篇AI文章的内容'

    it('应该生成文章内容', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: mockResponse } }],
      })

      const result = await aiService.generateArticle(mockPrompt)

      expect(mockCreate).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: mockPrompt }],
        model: mockConfig.model,
        temperature: mockConfig.temperature,
        max_tokens: mockConfig.maxTokens,
      })
      expect(result).toBe(mockResponse)
    })

    it('当API返回空内容时应该返回空字符串', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [],
      })

      const result = await aiService.generateArticle(mockPrompt)
      expect(result).toBe('')
    })
  })

  describe('generateTitle', () => {
    const mockContent = '文章内容'
    const mockTitle = '文章标题'

    it('应该生成标题', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: mockTitle } }],
      })

      const result = await aiService.generateTitle(mockContent)

      expect(mockCreate).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: expect.stringContaining(mockContent) }],
        model: mockConfig.model,
        temperature: 0.8,
        max_tokens: 50,
      })
      expect(result).toBe(mockTitle)
    })
  })

  describe('generateExcerpt', () => {
    const mockContent = '文章内容'
    const mockExcerpt = '文章摘要'

    it('应该生成摘要', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: mockExcerpt } }],
      })

      const result = await aiService.generateExcerpt(mockContent)

      expect(mockCreate).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: expect.stringContaining(mockContent) }],
        model: mockConfig.model,
        temperature: 0.5,
        max_tokens: 200,
      })
      expect(result).toBe(mockExcerpt)
    })
  })

  describe('analyzeSentiment', () => {
    const mockContent = '这是一段积极的文本'

    it('应该分析积极情感', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: '0.8' } }],
      })

      const result = await aiService.analyzeSentiment(mockContent)

      expect(mockCreate).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: expect.stringContaining(mockContent) }],
        model: mockConfig.model,
        temperature: 0.2,
        max_tokens: 50,
      })
      expect(result).toEqual({
        sentiment: 'positive',
        score: 0.8,
      })
    })

    it('应该分析消极情感', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: '-0.8' } }],
      })

      const result = await aiService.analyzeSentiment(mockContent)
      expect(result).toEqual({
        sentiment: 'negative',
        score: -0.8,
      })
    })

    it('应该分析中性情感', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: '0' } }],
      })

      const result = await aiService.analyzeSentiment(mockContent)
      expect(result).toEqual({
        sentiment: 'neutral',
        score: 0,
      })
    })
  })

  describe('extractKeywords', () => {
    const mockContent = '文章内容'
    const mockKeywords = ['AI', '机器学习', '深度学习']

    it('应该提取关键词', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: mockKeywords.join(', ') } }],
      })

      const result = await aiService.extractKeywords(mockContent)

      expect(mockCreate).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: expect.stringContaining(mockContent) }],
        model: mockConfig.model,
        temperature: 0.3,
        max_tokens: 100,
      })
      expect(result).toEqual(mockKeywords)
    })
  })

  describe('generateStream', () => {
    const mockMessages = [
      { role: 'user' as const, content: '你好' },
      { role: 'assistant' as const, content: '你好,我是AI助手' },
    ]

    it('应该生成流式响应', async () => {
      const mockStream = {} as any
      const mockResponse = { /* mock stream response */ } as any
      mockCreate.mockResolvedValueOnce(mockResponse)
      require('ai').OpenAIStream.mockReturnValue(mockStream)
      require('ai').StreamingTextResponse.mockImplementation((stream: any) => stream)

      const result = await aiService.generateStream(mockMessages)

      expect(mockCreate).toHaveBeenCalledWith({
        messages: mockMessages,
        model: mockConfig.model,
        temperature: mockConfig.temperature,
        max_tokens: mockConfig.maxTokens,
        stream: true,
      })
      expect(result).toBe(mockStream)
    })
  })

  describe('generateImageDescription', () => {
    const mockImage = 'https://example.com/image.jpg'
    const mockDescription = '这是一张图片的描述'

    it('应该生成图片描述', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: mockDescription } }],
      })

      const result = await aiService.generateImageDescription(mockImage)

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: '请描述这张图片的内容：' },
              {
                type: 'image_url',
                image_url: mockImage,
              },
            ],
          },
        ],
        max_tokens: 300,
      })
      expect(result).toBe(mockDescription)
    })
  })
}) 